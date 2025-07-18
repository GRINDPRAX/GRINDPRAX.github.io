import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  login,
  register,
  getProfile,
  updateProfile,
  logout,
  telegramAuth,
} from "./routes/auth";
import {
  getUserStatistics,
  getTopPlayers,
  getAllPlayersStatistics,
} from "./routes/statistics";
import {
  getMatches,
  getMatch,
  createNewMatch,
  joinMatchHandler,
  leaveMatchHandler,
  uploadResults,
  getMatchChat,
  sendChatMessage,
  deleteMatchHandler,
} from "./routes/matches";
import {
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
  toggleAdminStatus,
} from "./routes/userManagement";
import { TelegramService } from "./telegramService";

export function createServer() {
  const app = express();

  // Инициализация Telegram бота при запуске сервера
  console.log("🚀 Initializing Telegram bot...");
  if (TelegramService.isConnected()) {
    console.log("✅ Telegram bot started successfully");
  } else {
    console.log("⚠️ Telegram bot not connected - check configuration");
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.post("/api/auth/telegram", telegramAuth);
  app.get("/api/auth/profile", getProfile);
  app.put("/api/auth/profile", updateProfile);
  app.post("/api/auth/logout", logout);

  // Telegram test endpoint (admin only)
  app.post("/api/telegram/test", async (req, res) => {
    try {
      const { TelegramService } = await import("./telegramService");
      const success = await TelegramService.testConnection();
      res.json({
        success,
        message: success
          ? "Telegram test sent!"
          : "Failed to send test message",
      });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Error testing Telegram" });
    }
  });

  // Statistics routes
  app.get("/api/statistics/user/:userId", getUserStatistics);
  app.get("/api/statistics/top", getTopPlayers);
  app.get("/api/statistics/all", getAllPlayersStatistics);

  // Match routes
  app.get("/api/matches", getMatches);
  app.get("/api/matches/:matchId", getMatch);
  app.post("/api/matches", createNewMatch);
  app.post("/api/matches/join", joinMatchHandler);
  app.post("/api/matches/:matchId/leave", leaveMatchHandler);
  app.post("/api/matches/:matchId/results", uploadResults);
  app.delete("/api/matches/:matchId", deleteMatchHandler);

  // Chat routes
  app.get("/api/matches/:matchId/chat", getMatchChat);
  app.post("/api/matches/:matchId/chat", sendChatMessage);

  // User management routes (admin only)
  app.get("/api/admin/users", getAllUsersHandler);
  app.get("/api/admin/users/:userId", getUserByIdHandler);
  app.put("/api/admin/users/:userId", updateUserHandler);
  app.delete("/api/admin/users/:userId", deleteUserHandler);
  app.post("/api/admin/users/:userId/toggle-admin", toggleAdminStatus);

  return app;
}
