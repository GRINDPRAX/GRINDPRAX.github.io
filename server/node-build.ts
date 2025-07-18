import path from "path";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = process.env.PORT || 8080;

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://0.0.0.0:${port}`);
  console.log(`🔧 API: http://0.0.0.0:${port}/api`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");

  // Stop Telegram bot
  try {
    const { TelegramService } = await import("./telegramService");
    TelegramService.stopBot();
    console.log("🤖 Telegram bot stopped");
  } catch (error) {
    console.log("⚠️ Error stopping Telegram bot:", error);
  }

  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");

  // Stop Telegram bot
  try {
    const { TelegramService } = await import("./telegramService");
    TelegramService.stopBot();
    console.log("🤖 Telegram bot stopped");
  } catch (error) {
    console.log("⚠️ Error stopping Telegram bot:", error);
  }

  process.exit(0);
});
