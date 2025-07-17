import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  login,
  register,
  getProfile,
  updateProfile,
  logout,
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

export function createServer() {
  const app = express();

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
  app.get("/api/auth/profile", getProfile);
  app.put("/api/auth/profile", updateProfile);
  app.post("/api/auth/logout", logout);

  // Statistics routes
  app.get("/api/statistics/user/:userId", getUserStatistics);
  app.get("/api/statistics/top", getTopPlayers);
  app.get("/api/statistics/all", getAllPlayersStatistics);

  return app;
}
