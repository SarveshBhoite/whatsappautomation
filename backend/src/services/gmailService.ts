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

    let query = "";
    const upperLabel = label.toUpperCase();
    if (upperLabel === "STARRED") {
      query = "is:starred";
    } else if (upperLabel === "SPAM") {
      query = "in:spam";
    } else if (upperLabel === "TRASH") {
      query = "in:trash";
    } else if (upperLabel === "SENT") {
      query = "in:sent";
    } else if (upperLabel === "ALL") {
      query = "";
    } else {
      // INBOX: fetch actual inbox emails
      query = "in:inbox";
    }

    // When syncing STARRED folder specifically, reset isStarred flag first so unstarred emails are pruned
    if (upperLabel === "STARRED") {
      await prisma.gmailThread.updateMany({
        where: { organizationId: orgId },
        data: { isStarred: false }
      });
    }

    let listRes;
    try {
      listRes = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/threads", {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          maxResults: 30, 
          ...(query ? { q: query } : {}),
          includeSpamTrash: true
        },
        timeout: 15000
      });
    } catch (err: any) {
      if (err?.response?.status === 401) {
        console.log(`[GMAIL SERVICE] 401 Unauthorized encountered. Forcing access token refresh...`);
        token = await getGmailAccessToken(orgId, true);
        listRes = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/threads", {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            maxResults: 30, 
            ...(query ? { q: query } : {}),
            includeSpamTrash: true
          },
          timeout: 15000
        });
      } else {
        throw err;
      }
    }

    const threads = listRes.data.threads || [];
    let syncedCount = 0;
    console.log(`[GMAIL SERVICE] Fetched ${threads.length} threads for label '${label}'. Processing...`);

    const config = await prisma.gmailConfig.findUnique({
      where: { organizationId: orgId }
    });
    const userEmail = config?.emailAddress?.toLowerCase() || "";
    const activeRules = (config && config.autoReplyEnabled)
      ? await prisma.gmailAutoReplyRule.findMany({ where: { organizationId: orgId, isActive: true } })
      : [];

    for (const t of threads) {
      const threadId = t.id;

      // Fetch full thread details
      let threadRes;
      try {
        threadRes = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000
        });
      } catch (threadErr: any) {
        console.warn(`[GMAIL SERVICE] Could not fetch thread ${threadId}:`, threadErr.message);
        continue;
      }

      const threadData = threadRes.data;
      const gmailMessages = threadData.messages || [];
      if (gmailMessages.length === 0) continue;

      // Get headers to populate thread info
      const firstMsg = gmailMessages[0];
      const lastMsg = gmailMessages[gmailMessages.length - 1];
      
      const headers = firstMsg.payload?.headers || [];
      const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "No Subject";
      const sender = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
      const snippet = threadData.snippet || firstMsg.snippet || "";

      // Extract actual email date from last message internalDate or Date header
      const lastMsgHeaders = lastMsg.payload?.headers || [];
      const dateHeader = lastMsgHeaders.find((h: any) => h.name.toLowerCase() === "date")?.value;
      let actualEmailDate = new Date();

      if (lastMsg.internalDate) {
        actualEmailDate = new Date(parseInt(lastMsg.internalDate, 10));
      } else if (dateHeader) {
        actualEmailDate = new Date(dateHeader);
      }

      // Determine label IDs
      const allLabelIds: string[] = Array.from(new Set(gmailMessages.flatMap((m: any) => m.labelIds || [])));
      const isStarred = (upperLabel === "STARRED") || (lastMsg.labelIds || []).includes("STARRED") || gmailMessages.some((m: any) => (m.labelIds || []).includes("STARRED"));
      const isSpam = allLabelIds.includes("SPAM");
      const isTrash = allLabelIds.includes("TRASH");
      const isSent = allLabelIds.includes("SENT") && !allLabelIds.includes("INBOX");
      
      let effectiveLabel = label;
      if (isTrash) effectiveLabel = "TRASH";
      else if (isSpam) effectiveLabel = "SPAM";
      else if (isSent) effectiveLabel = "SENT";
      else if (allLabelIds.includes("INBOX")) effectiveLabel = "INBOX";

      // Upsert thread locally with exact email timestamp and flags
      const localThread = await prisma.gmailThread.upsert({
        where: { threadId },
        update: {
          subject,
          sender,
          snippet,
          label: effectiveLabel,
          isStarred,
          isSpam,
          updatedAt: actualEmailDate,
        },
        create: {
          threadId,
          organizationId: orgId,
          subject,
          sender,
          snippet,
          label: effectiveLabel,
          isStarred,
          isSpam,
          status: "UNREPLIED",
          createdAt: actualEmailDate,
          updatedAt: actualEmailDate,
        }
      });

      // Save new messages in this thread
      for (const msg of gmailMessages) {
        const messageId = msg.id;

        // Extract message timestamp from internalDate or Date header
        const msgHeaders = msg.payload?.headers || [];
        const msgDateHeader = msgHeaders.find((h: any) => h.name.toLowerCase() === "date")?.value;
        let msgDate = new Date();

        if (msg.internalDate) {
          msgDate = new Date(parseInt(msg.internalDate, 10));
        } else if (msgDateHeader) {
          msgDate = new Date(msgDateHeader);
        }

        // Check if message is already stored
        const existingMsg = await prisma.gmailMessage.findUnique({
          where: { messageId }
        });

        if (!existingMsg) {
          const parsed = parseGmailMessage(msg.payload);
          const body = parsed.text || parsed.html || msg.snippet || "";

          const msgFrom = msgHeaders.find((h: any) => h.name.toLowerCase() === "from")?.value || "";
          const isInbound = userEmail ? !msgFrom.toLowerCase().includes(userEmail) : true;
          const direction = isInbound ? "inbound" : "outbound";

          // Save the message with exact email sent date using localThread.id (UUID)
          const savedMessage = await prisma.gmailMessage.create({
            data: {
              threadId: localThread.id,
              messageId,
              direction,
              content: body,
              bodyText: parsed.text || null,
              bodyHtml: parsed.html || null,
              htmlContent: parsed.html || null,
              sender: msgFrom,
              createdAt: msgDate,
              internalDate: msgDate,
              organizationId: orgId,
            }
          });

          // Save attachments using savedMessage.id (UUID)
          if (parsed.attachments && parsed.attachments.length > 0) {
            for (const att of parsed.attachments) {
              await prisma.gmailAttachment.create({
                data: {
                  messageId: savedMessage.id,
                  attachmentId: att.attachmentId,
                  filename: att.filename,
                  mimeType: att.mimeType,
                  size: att.size,
                }
              });
            }
          }

          // Only auto-reply if autoReplyEnabled is explicitly turned ON
          if (isInbound && activeRules.length > 0) {
            try {
              const lowerContent = body.toLowerCase();
              const lowerSubject = subject.toLowerCase();
              
              const matchedRule = activeRules.find(rule => {
                const kw = rule.keyword.trim().toLowerCase();
                if (!kw) return false;
                
                // Match full phrase OR any space-separated token in the phrase
                if (lowerContent.includes(kw) || lowerSubject.includes(kw)) return true;
                const tokens = kw.split(/\s+/).filter(t => t.length > 2);
                return tokens.some(token => lowerContent.includes(token) || lowerSubject.includes(token));
              });

              if (matchedRule) {
                const replyText = matchedRule.replyText;
                const ruleAny = matchedRule as any;
                const attachment = ruleAny.fileUrl && ruleAny.fileName ? {
                  fileUrl: ruleAny.fileUrl,
                  fileName: ruleAny.fileName,
                  mimeType: ruleAny.mimeType || undefined
                } : undefined;
                
                await sendGmailReply(orgId, threadId, replyText || "", attachment);
                
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
      }

      syncedCount++;
    }

    // Broadcast update via WebSocket
    if (io) {
      io.to(`org:${orgId}`).emit("gmail-threads-synced", {
        organizationId: orgId,
        syncedCount,
        label,
      });
    }

    return { syncedCount, total: threads.length };
  } catch (err: any) {
    console.error("[GMAIL SERVICE] Error syncing threads:", err?.response?.data || err.message);
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
        model: "openai/gpt-oss-120b",
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
 * Sends a reply message within an existing Gmail thread with optional file attachment.
 */
export async function sendGmailReply(
  orgId: string, 
  threadId: string, 
  replyContent: string,
  attachment?: { fileUrl?: string; fileName?: string; mimeType?: string }
): Promise<any> {
  try {
    const token = await getGmailAccessToken(orgId);

    // Fetch the thread messages to retrieve headers
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

    const subject = subjectHeader.toLowerCase().startsWith("re:") ? subjectHeader : `Re: ${subjectHeader}`;

    let emailParts: string[] = [];

    if (attachment && attachment.fileUrl && attachment.fileName) {
      const boundary = "====_Boundary_Gmail_AutoReply_" + Date.now().toString(16);
      let base64Data = "";
      if (attachment.fileUrl.startsWith("data:")) {
        base64Data = attachment.fileUrl.split(";base64,")[1] || "";
      } else {
        base64Data = Buffer.from(attachment.fileUrl).toString("base64");
      }

      const mimeType = attachment.mimeType || "application/octet-stream";

      emailParts = [
        `To: ${fromHeader}`,
        `Subject: ${subject}`,
        `In-Reply-To: ${msgIdHeader}`,
        `References: ${msgIdHeader}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        `Content-Transfer-Encoding: 7bit`,
        "",
        replyContent,
        "",
        `--${boundary}`,
        `Content-Type: ${mimeType}; name="${attachment.fileName}"`,
        `Content-Disposition: attachment; filename="${attachment.fileName}"`,
        `Content-Transfer-Encoding: base64`,
        "",
        base64Data,
        "",
        `--${boundary}--`
      ];
    } else {
      emailParts = [
        `To: ${fromHeader}`,
        `Subject: ${subject}`,
        `In-Reply-To: ${msgIdHeader}`,
        `References: ${msgIdHeader}`,
        `Content-Type: text/plain; charset="UTF-8"`,
        `MIME-Version: 1.0`,
        "",
        replyContent
      ];
    }

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
    const targetThread = await prisma.gmailThread.findUnique({
      where: { threadId }
    });

    if (targetThread) {
      await prisma.gmailMessage.create({
        data: {
          threadId: targetThread.id,
          messageId: sendRes.data.id,
          direction: "outbound",
          content: attachment?.fileName ? `${replyContent}\n\n[Attachment: ${attachment.fileName}]` : replyContent,
          bodyText: replyContent,
          sender: "Me (CRM Auto-Reply)",
          organizationId: orgId,
          createdAt: new Date(),
          internalDate: new Date(),
        }
      });
    }

    return sendRes.data;
  } catch (err: any) {
    console.error("[GMAIL SERVICE] Send reply failed:", err?.response?.data || err.message);
    throw err;
  }
}

/**
 * Modifies labels for a thread in Gmail API (Add/Remove labels like STARRED, SPAM, TRASH, INBOX).
 */
export async function updateGmailThreadLabels(
  orgId: string, 
  threadId: string, 
  addLabelIds: string[], 
  removeLabelIds: string[]
): Promise<any> {
  try {
    const token = await getGmailAccessToken(orgId);

    const response = await axios.post(
      `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}/modify`,
      {
        addLabelIds,
        removeLabelIds
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  } catch (err: any) {
    console.error(`[GMAIL SERVICE] Failed to modify labels on Gmail API for thread ${threadId}:`, err?.response?.data || err.message);
    throw err;
  }
}

/**
 * Moves thread to Trash or permanently deletes it in Gmail API.
 */
export async function deleteGmailThreadViaApi(orgId: string, threadId: string, permanent = false): Promise<any> {
  try {
    const token = await getGmailAccessToken(orgId);

    if (permanent) {
      // Permanently delete thread from Gmail
      const response = await axios.delete(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } else {
      // Move thread to Trash in Gmail
      const response = await axios.post(
        `https://gmail.googleapis.com/gmail/v1/users/me/threads/${threadId}/trash`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    }
  } catch (err: any) {
    console.error(`[GMAIL SERVICE] Delete failed on Gmail API for thread ${threadId}:`, err?.response?.data || err.message);
    throw err;
  }
}

/**
 * Sends an outbound bulk campaign email via Gmail API with custom RFC 2822 raw payload.
 */
export async function sendSingleBulkEmail(
  orgId: string, 
  toEmail: string, 
  subject: string, 
  bodyText: string
): Promise<any> {
  const token = await getGmailAccessToken(orgId);

  const emailParts = [
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    `Content-Type: text/html; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    "",
    bodyText.replace(/\n/g, "<br/>")
  ];

  const rawEmail = Buffer.from(emailParts.join("\r\n"))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const response = await axios.post(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    { raw: rawEmail },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );

  const sentMessage = response.data;
  const sentMessageId = sentMessage.id;
  const sentThreadId = sentMessage.threadId || sentMessageId;

  // Store thread locally so it appears inside the dashboard Inbox / Sent section
  try {
    const upsertedThread = await prisma.gmailThread.upsert({
      where: { threadId: sentThreadId },
      update: {
        subject,
        sender: `To: ${toEmail}`,
        snippet: bodyText.substring(0, 100),
        label: "SENT",
        updatedAt: new Date()
      },
      create: {
        threadId: sentThreadId,
        organizationId: orgId,
        subject,
        sender: `To: ${toEmail}`,
        snippet: bodyText.substring(0, 100),
        label: "SENT",
        status: "REPLIED"
      }
    });

    await prisma.gmailMessage.create({
      data: {
        threadId: upsertedThread.id,
        messageId: sentMessageId,
        direction: "outbound",
        content: bodyText,
        bodyText: bodyText,
        sender: "Me (Bulk Campaign)",
        organizationId: orgId,
        createdAt: new Date(),
        internalDate: new Date(),
      }
    });
  } catch (dbErr: any) {
    console.warn(`[GMAIL SERVICE] Failed to store outbound bulk message locally: ${dbErr.message}`);
  }

  return response.data;
}
