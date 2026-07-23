import axios from "axios";
import prisma from "../utils/prisma";
import { Server } from "socket.io";

const DEFAULT_ORG_ID = "demo-org-123";

/**
 * Returns a valid access token for Gmail API.
 * If expired, it automatically refreshes it using the Google OAuth refresh token.
 */
export async function getGmailAccessToken(orgId: string, forceRefresh = false): Promise<string> {
  const config = await prisma.gmailConfig.findUnique({
    where: { organizationId: orgId },
  });

  if (!config || (!config.accessToken && !config.refreshToken)) {
    throw new Error("Gmail configuration or access token not found. Please connect your Gmail account.");
  }

  const timeSinceUpdate = Date.now() - new Date(config.updatedAt).getTime();
  const tokenDuration = 45 * 60 * 1000; // 45 minutes

  if ((forceRefresh || timeSinceUpdate > tokenDuration) && config.refreshToken) {
    console.log(`[GMAIL SERVICE] Refreshing Google OAuth token for Org ${orgId}...`);
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("Google OAuth Credentials missing in backend .env");
      }

      const response = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: config.refreshToken,
        grant_type: "refresh_token",
      });

      const { access_token, refresh_token } = response.data;

      const updated = await prisma.gmailConfig.update({
        where: { organizationId: orgId },
        data: {
          accessToken: access_token,
          refreshToken: refresh_token || undefined,
          updatedAt: new Date(),
        },
      });

      return updated.accessToken || "";
    } catch (err: any) {
      console.error("[GMAIL SERVICE] Failed to refresh access token:", err?.response?.data || err.message);
      throw new Error(`Failed to refresh Gmail API credentials: ${err.message}`);
    }
  }

  return config.accessToken || "";
}

interface ParsedMessageParts {
  text: string;
  html: string;
  attachments: Array<{
    attachmentId: string;
    filename: string;
    mimeType: string;
    size: number;
  }>;
}

function traverseParts(parts: any[], result: ParsedMessageParts) {
  for (const part of parts) {
    const mimeType = part.mimeType;
    const filename = part.filename;
    const attachmentId = part.body?.attachmentId;

    if (filename && attachmentId) {
      result.attachments.push({
        attachmentId,
        filename,
        mimeType: mimeType || "application/octet-stream",
        size: part.body.size || 0,
      });
    } else if (mimeType === "text/plain" && part.body?.data) {
      result.text += Buffer.from(part.body.data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    } else if (mimeType === "text/html" && part.body?.data) {
      result.html += Buffer.from(part.body.data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    }

    if (part.parts) {
      traverseParts(part.parts, result);
    }
  }
}

export function parseGmailMessage(payload: any): ParsedMessageParts {
  const result: ParsedMessageParts = { text: "", html: "", attachments: [] };
  if (!payload) return result;

  const rootMimeType = payload.mimeType;
  const rootBodyData = payload.body?.data;

  if (rootBodyData) {
    const decoded = Buffer.from(rootBodyData.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    if (rootMimeType === "text/plain") {
      result.text = decoded;
    } else if (rootMimeType === "text/html") {
      result.html = decoded;
    }
  }

  if (payload.parts) {
    traverseParts(payload.parts, result);
  }

  return result;
}

/**
 * Syncs recent email threads from Gmail API.
 */
export async function syncGmailThreads(orgId: string, io?: Server, label: string = "INBOX") {
  try {
    let token = await getGmailAccessToken(orgId);

    let query = `in:${label.toLowerCase()}`;
    if (label.toUpperCase() === "STARRED") {
      query = "is:starred";
    }

    let listRes;
    try {
      listRes = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/threads", {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          maxResults: 50, 
          q: query,
          includeSpamTrash: true
        }
      });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        console.log(`[GMAIL SERVICE] 401 Unauthorized encountered. Forcing access token refresh...`);
        token = await getGmailAccessToken(orgId, true);
        listRes = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/threads", {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            maxResults: 50, 
            q: query,
            includeSpamTrash: true
          }
        });
      } else {
        throw err;
      }
    }

    const threads = listRes.data.threads || [];
    let syncedCount = 0;

    for (const t of threads) {
      const threadId = t.id;

      // Fetch full thread details
      const threadRes = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const threadData = threadRes.data;
      const gmailMessages = threadData.messages || [];
      if (gmailMessages.length === 0) continue;

      // Get first message headers to populate thread info
      const firstMsg = gmailMessages[0];
      const headers = firstMsg.payload?.headers || [];
      const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "No Subject";
      const sender = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
      const snippet = threadData.snippet || firstMsg.snippet || "";

      // Upsert thread locally
      const localThread = await prisma.gmailThread.upsert({
        where: { threadId },
        update: {
          subject,
          sender,
          snippet,
          label,
          updatedAt: new Date(),
        },
        create: {
          threadId,
          organizationId: orgId,
          subject,
          sender,
          snippet,
          label,
          status: "UNREPLIED",
        }
      });

      // Save new messages in this thread
      for (const msg of gmailMessages) {
        const messageId = msg.id;

        // Check if message is already stored
        const existingMsg = await prisma.gmailMessage.findUnique({
          where: { messageId }
        });

        if (!existingMsg) {
          const parsed = parseGmailMessage(msg.payload);
          const body = parsed.text || parsed.html || msg.snippet || "";

          // Determine direction by checking if sender matches user's connected Gmail address
          const config = await prisma.gmailConfig.findUnique({
            where: { organizationId: orgId }
          });
          const userEmail = config?.emailAddress?.toLowerCase() || "";
          
          const msgHeaders = msg.payload?.headers || [];
          const msgFrom = msgHeaders.find((h: any) => h.name.toLowerCase() === "from")?.value || "";
          const isInbound = userEmail ? !msgFrom.toLowerCase().includes(userEmail) : true;
          const direction = isInbound ? "inbound" : "outbound";

          // Save the message
          await prisma.gmailMessage.create({
            data: {
              threadId,
              messageId,
              direction,
              content: body,
              htmlContent: parsed.html || null,
              sender: msgFrom,
            }
          });

          // Save attachments
          if (parsed.attachments && parsed.attachments.length > 0) {
            for (const att of parsed.attachments) {
              await prisma.gmailAttachment.create({
                data: {
                  messageId,
                  attachmentId: att.attachmentId,
                  filename: att.filename,
                  mimeType: att.mimeType,
                  size: att.size,
                }
              });
            }
          }

          // Only auto-reply if autoReplyEnabled is explicitly turned ON
          if (isInbound) {
            if (config && config.autoReplyEnabled) {
              try {
                // Fetch active rules for the organization
                const rules = await prisma.gmailAutoReplyRule.findMany({
                  where: { organizationId: orgId, isActive: true }
                });

                // Check if any rule keyword matches the email body or subject
                const lowerContent = body.toLowerCase();
                const lowerSubject = subject.toLowerCase();
                
                const matchedRule = rules.find(rule => {
                  const kw = rule.keyword.trim().toLowerCase();
                  if (!kw) return false;
                  
                  // Match full phrase OR any space-separated token in the phrase
                  if (lowerContent.includes(kw) || lowerSubject.includes(kw)) return true;
                  const tokens = kw.split(/\s+/).filter(t => t.length > 2);
                  return tokens.some(token => lowerContent.includes(token) || lowerSubject.includes(token));
                });

                if (matchedRule) {
                  // We have a match! We send the static automated reply set by the admin
                  const replyText = matchedRule.replyText;
                  
                  await sendGmailReply(orgId, threadId, replyText);
                  
                  await prisma.gmailThread.update({
                    where: { threadId },
                    data: { status: "REPLIED" }
                  });
                }
              } catch (aiErr: any) {
                console.error(`[GMAIL SERVICE] Auto-reply failed for message ${messageId}:`, aiErr.message);
              }
            }
          }

          syncedCount++;
        }
      }
    }

    if (syncedCount > 0 && io) {
      // Notify client app over WebSockets of new emails/replies
      io.to(orgId).emit("gmail-updated", { syncedCount });
    }

    return { syncedCount };
  } catch (err: any) {
    console.error("[GMAIL SERVICE] Error syncing threads:", err.message);
    throw err;
  }
}

/**
 * Generate an AI email response draft using Groq Llama 3
 */
export async function generateGmailAiDraft(
  orgId: string, 
  emailContent: string, 
  subject: string, 
  sender: string
): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY || process.env.GROQ_KEY;
  if (!groqApiKey) {
    console.warn("[GMAIL SERVICE] AI Draft generation skipped: No Groq API Key set.");
    return "";
  }

  const config = await prisma.gmailConfig.findUnique({
    where: { organizationId: orgId }
  });

  const customTemplate = config?.autoReplyTemplate || 
    "You are a helpful customer support agent. Answer questions politely and offer solutions.";

  const prompt = `
    You are an AI customer success manager. Draft a professional, polite, and contextual reply email to the following incoming email.
    
    Sender: ${sender}
    Subject: ${subject}
    Email Body:
    """
    ${emailContent}
    """
    
    Instructions for draft behavior:
    ${customTemplate}
    
    Requirements:
    - Address the sender politely.
    - Write in a natural email tone, including proper opening and closing greetings.
    - Max 4-6 sentences. Keep it clear, concise, and helpful.
    - Output the email content ONLY. Do not write subject line, do not include meta comments, quote symbols, or greeting prefixes.
  `;

  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a professional email responder. You draft complete, direct email body replies."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 400
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqApiKey}`
        },
        timeout: 12000
      }
    );

    return res.data.choices?.[0]?.message?.content?.trim() || "";
  } catch (err: any) {
    console.error("[GMAIL SERVICE] AI api request error:", err?.response?.data || err.message);
    return "";
  }
}

/**
 * Sends a reply message within an existing Gmail thread.
 */
export async function sendGmailReply(orgId: string, threadId: string, replyContent: string): Promise<any> {
  try {
    const token = await getGmailAccessToken(orgId);

    // Fetch the thread messages to retrieve headers (specifically to set Subject, Message-ID, and In-Reply-To correctly)
    const threadRes = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const messages = threadRes.data.messages || [];
    if (messages.length === 0) {
      throw new Error(`Gmail Thread ${threadId} has no messages, cannot reply.`);
    }

    const lastMsg = messages[messages.length - 1];
    const lastMsgHeaders = lastMsg.payload?.headers || [];

    const fromHeader = lastMsgHeaders.find((h: any) => h.name.toLowerCase() === "from")?.value || "";
    const subjectHeader = lastMsgHeaders.find((h: any) => h.name.toLowerCase() === "subject")?.value || "";
    const msgIdHeader = lastMsgHeaders.find((h: any) => h.name.toLowerCase() === "message-id")?.value || "";

    // Set correct subject (prefixed by Re: if not already present)
    const subject = subjectHeader.toLowerCase().startsWith("re:") ? subjectHeader : `Re: ${subjectHeader}`;

    // Format RFC 2822 email raw payload to preserve thread structure
    const emailParts = [
      `To: ${fromHeader}`,
      `Subject: ${subject}`,
      `In-Reply-To: ${msgIdHeader}`,
      `References: ${msgIdHeader}`,
      `Content-Type: text/plain; charset="UTF-8"`,
      `MIME-Version: 1.0`,
      "",
      replyContent
    ];

    const rawEmail = Buffer.from(emailParts.join("\r\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // Send using Gmail Send API
    const sendRes = await axios.post(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        raw: rawEmail,
        threadId: threadId
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Store the reply message locally
    await prisma.gmailMessage.create({
      data: {
        threadId,
        messageId: sendRes.data.id,
        direction: "outbound",
        content: replyContent,
        sender: "Me (CRM Auto-Reply)",
      }
    });

    return sendRes.data;
  } catch (err: any) {
    console.error("[GMAIL SERVICE] Send reply failed:", err?.response?.data || err.message);
    throw err;
  }
}
