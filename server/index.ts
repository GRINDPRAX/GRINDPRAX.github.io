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
import { appConfig, displayConfigStatus, validateAppConfig } from "./config";

export function createServer() {
  const app = express();

  // Отображение конфигурации при запуске
  displayConfigStatus(appConfig);

  // Валидация конфигурации
  const validation = validateAppConfig(appConfig);
  if (!validation.isValid) {
    console.error("❌ Критические ошибки в конфигурации:");
    validation.errors.forEach((error) => console.error(`   - ${error}`));
    console.error(
      "\n🛑 Сервер не может быть запущен с некорректной конфигурацией",
    );
    process.exit(1);
  }

  // Инициализация Telegram бота при запуске сервера
  if (appConfig.features.enableTelegram) {
    console.log("🚀 Initializing Telegram bot...");
    if (TelegramService.isConnected()) {
      console.log("✅ Telegram bot started successfully");
    } else {
      console.log("⚠️ Telegram bot not connected - check configuration");
    }
  } else {
    console.log("⏭️ Telegram bot disabled - skipping initialization");
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

  // Telegram management endpoints
  app.post("/api/telegram/test", async (req, res) => {
    try {
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

  // Get bot status
  app.get("/api/telegram/status", (req, res) => {
    try {
      const isConnected = TelegramService.isConnected();
      const config = TelegramService.getConfig();
      const validation = validateAppConfig(appConfig);

      res.json({
        success: true,
        connected: isConnected,
        enabled: appConfig.features.enableTelegram,
        config: {
          enableNotifications: config.enableNotifications,
          enableAuth: config.enableAuth,
          autoCreateUsers: config.autoCreateUsers,
          hasToken: !!config.token && config.token !== "YOUR_BOT_TOKEN_HERE",
          hasNotificationChannel: !!config.notificationChatId,
          features: config.features,
        },
        validation: {
          isValid: validation.isValid,
          errors: validation.errors,
          warnings: validation.warnings,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error getting bot status",
      });
    }
  });

  // Update bot configuration
  app.put("/api/telegram/config", (req, res) => {
    try {
      const updates = req.body;
      TelegramService.updateConfig(updates);

      res.json({
        success: true,
        message: "Configuration updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error updating configuration",
      });
    }
  });

  // Restart bot
  app.post("/api/telegram/restart", (req, res) => {
    try {
      TelegramService.restartBot();

      res.json({
        success: true,
        message: "Bot restarted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error restarting bot",
      });
    }
  });

  // Send custom notification
  app.post("/api/telegram/notify", async (req, res) => {
    try {
      const { message, channel } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: "Message is required",
        });
      }

      const success = await TelegramService.sendCustomNotification(
        message,
        channel,
      );

      res.json({
        success,
        message: success
          ? "Notification sent successfully"
          : "Failed to send notification",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error sending notification",
      });
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
