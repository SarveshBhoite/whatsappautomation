import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import webhookRouter from "./routes/webhook";
import messagesRouter from "./routes/messages";
import adminRouter from "./routes/admin";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production to match Next.js origin
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for base64 file uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Webhook Router
app.use("/api/webhook", webhookRouter);

// Messages Router (Manual chat & toggles)
app.use("/api/messages", messagesRouter);

// Admin / Client Portal Router
app.use("/api/admin", adminRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Socket.io Connection Logic
io.on("connection", (socket) => {
  console.log(`Agent connected: ${socket.id}`);

  // Join a client-specific room so agents only get updates for their company
  socket.on("join-org", (organizationId: string) => {
    socket.join(organizationId);
    console.log(`Socket ${socket.id} joined organization room: ${organizationId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Agent disconnected: ${socket.id}`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export { io };
