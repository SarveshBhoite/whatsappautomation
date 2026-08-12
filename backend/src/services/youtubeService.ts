import axios from "axios";
import prisma from "../utils/prisma";
import { processChatbotFlow } from "./flowEngine";

export class YouTubeService {
  private static isMock(accessToken: string): boolean {
    return !accessToken || accessToken.startsWith("mock") || accessToken.length < 20;
  }

  // Send reply to a YouTube comment thread
  public static async sendCommentReply(
    channelId: string,
    accessToken: string,
    parentCommentId: string,
    text: string
  ) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK YOUTUBE SEND REPLY] parent: ${parentCommentId}, text: "${text}"`);
      return { id: `mock_yt_reply_${Math.random().toString(36).substring(7)}`, snippet: { textOriginal: text } };
    }

    const url = "https://www.googleapis.com/youtube/v3/comments?part=snippet";
    const data = {
      snippet: {
        parentId: parentCommentId,
        textOriginal: text
      }
    };

    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    return response.data;
  }

  // Fetch comments threads for channel
  public static async listCommentThreads(
    channelId: string,
    accessToken: string
  ) {
    if (this.isMock(accessToken)) {
      console.log(`[MOCK YOUTUBE LIST THREADS] channelId: ${channelId}`);
      // Return a mock list of threads for sandbox testing
      return [
        {
          id: "mock_thread_1",
          snippet: {
            topLevelComment: {
              id: "mock_comment_1",
              snippet: {
                authorDisplayName: "Alice Miller",
                authorChannelId: { value: "alice_channel_1" },
                textOriginal: "Hi! Can you tell me more about pricing?",
                publishedAt: new Date().toISOString()
              }
            }
          }
        }
      ];
    }

    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&allThreadsRelatedToChannelId=${channelId}&maxResults=100`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    return response.data.items || [];
  }

  // Refresh access token using GMB's function logic to stay unified
  public static async refreshAccessToken(organizationId: string): Promise<string> {
    const config = await prisma.youTubeConfig.findUnique({
      where: { organizationId }
    });

    if (!config || !config.refreshToken) {
      throw new Error("YouTube configuration or refresh token not found");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

    if (!clientId || !clientSecret) {
      return config.accessToken || "mock_access_token";
    }

    try {
      const response = await axios.post("https://oauth2.googleapis.com/token", {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: config.refreshToken,
        grant_type: "refresh_token"
      });

      const newAccessToken = response.data.access_token;
      
      // Update in DB
      await prisma.youTubeConfig.update({
        where: { organizationId },
        data: { accessToken: newAccessToken }
      });

      return newAccessToken;
    } catch (err: any) {
      console.error(`Failed to refresh YouTube token for org ${organizationId}:`, err.message);
      return config.accessToken || "mock_access_token";
    }
  }

  // Poll for new comment threads and sync to database
  public static async syncComments(organizationId: string, io: any) {
    console.log(`[YOUTUBE SYNC] Starting comment sync for organization ${organizationId}...`);
    try {
      const config = await prisma.youTubeConfig.findUnique({
        where: { organizationId }
      });

      if (!config || !config.channelId) {
        console.log(`[YOUTUBE SYNC] YouTube not configured for organization ${organizationId}`);
        return;
      }

      // Refresh accessToken
      let token = config.accessToken || "";
      if (config.refreshToken) {
        try {
          token = await this.refreshAccessToken(organizationId);
        } catch (err: any) {
          console.warn(`[YOUTUBE SYNC] Token refresh warning: ${err.message}`);
        }
      }

      const threads = await this.listCommentThreads(config.channelId, token);
      console.log(`[YOUTUBE SYNC] Found ${threads.length} comment threads for channel ${config.channelId}`);

      for (const thread of threads) {
        const threadId = thread.id; // Maps to conversation.customerPhone
        const topComment = thread.snippet.topLevelComment;
        const authorName = topComment.snippet.authorDisplayName || "YouTube User";
        const authorChannelId = topComment.snippet.authorChannelId?.value || "unknown_author";
        const textContent = topComment.snippet.textOriginal || "";
        const timestamp = new Date(topComment.snippet.publishedAt || Date.now());

        // Skip comments made by the channel owner/bot itself to avoid infinite loops
        if (authorChannelId === config.channelId) {
          continue;
        }

        // Find or create conversation
        let conversation = await prisma.conversation.findUnique({
          where: {
            organizationId_platform_customerPhone: {
              organizationId,
              platform: "youtube",
              customerPhone: threadId
            }
          }
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              organizationId,
              platform: "youtube",
              customerPhone: threadId,
              customerName: authorName,
              isBotPaused: false
            }
          });
        }

        // Check if top comment exists as a message in the DB
        let topMessage = await prisma.message.findFirst({
          where: {
            conversationId: conversation.id,
            waMessageId: topComment.id
          }
        });

        let newInboundMessageId: string | null = null;

        if (!topMessage) {
          const savedMsg = await prisma.message.create({
            data: {
              conversationId: conversation.id,
              direction: "inbound",
              messageType: "text",
              content: textContent,
              waMessageId: topComment.id,
              status: "read",
              createdAt: timestamp
            }
          });
          topMessage = savedMsg;
          newInboundMessageId = savedMsg.id;

          // Broadcast real-time
          io.to(organizationId).emit("new-message", {
            conversationId: conversation.id,
            message: savedMsg
          });
        }

        // Sync replies from the thread item if any exist in the response
        const repliesList = thread.replies?.comments || [];
        for (const reply of repliesList) {
          const replyAuthorChannelId = reply.snippet.authorChannelId?.value;
          
          // Skip channel owner replies (our own replies) from being re-ingested as inbound
          const isOutbound = replyAuthorChannelId === config.channelId;
          const replyText = reply.snippet.textOriginal || "";
          const replyTimestamp = new Date(reply.snippet.publishedAt || Date.now());

          let replyMessage = await prisma.message.findFirst({
            where: {
              conversationId: conversation.id,
              waMessageId: reply.id
            }
          });

          if (!replyMessage) {
            const savedReply = await prisma.message.create({
              data: {
                conversationId: conversation.id,
                direction: isOutbound ? "outbound" : "inbound",
                messageType: "text",
                content: replyText,
                waMessageId: reply.id,
                status: "read",
                senderName: isOutbound ? "Agent" : null,
                createdAt: replyTimestamp
              }
            });
            replyMessage = savedReply;

            if (!isOutbound) {
              newInboundMessageId = savedReply.id;
            }

            // Broadcast real-time
            io.to(organizationId).emit("new-message", {
              conversationId: conversation.id,
              message: savedReply
            });
          }
        }

        // Trigger chatbot flow if there is a new inbound message and the bot is not paused
        if (newInboundMessageId && !conversation.isBotPaused) {
          console.log(`[YOUTUBE SYNC] Triggering flow engine for conversation: ${conversation.id}`);
          processChatbotFlow(conversation.id, newInboundMessageId).catch((err) => {
            console.error("Error executing YouTube chatbot flow engine:", err);
          });
        }
      }
    } catch (err: any) {
      console.error(`Error in YouTube sync Comments for org ${organizationId}:`, err.message);
    }
  }
}
