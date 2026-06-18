import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
