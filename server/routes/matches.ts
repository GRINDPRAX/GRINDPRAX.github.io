import { RequestHandler } from "express";
import {
  getAllMatches,
  getMatchById,
  createMatch,
  joinMatch,
  leaveMatch,
  uploadMatchResults,
  getMatchMessages,
  addChatMessage,
  deleteMatch,
} from "../matchDatabase";
import { getUserById } from "../database";
import {
  CreateMatchRequest,
  JoinMatchRequest,
  UploadResultsRequest,
} from "@shared/match";

// Получить все матчи
export const getMatches: RequestHandler = (req, res) => {
  const matches = getAllMatches();
  res.json(matches);
};

// Получить конкретный матч
export const getMatch: RequestHandler = (req, res) => {
  const { matchId } = req.params;
  const match = getMatchById(matchId);

  if (!match) {
    return res.status(404).json({ error: "Match not found" });
  }

  res.json(match);
};

// Создать новый матч (только для админов)
export const createNewMatch: RequestHandler = (req, res) => {
  const { name, teamSize } = req.body as CreateMatchRequest;
  const adminId = req.headers.authorization?.replace("Bearer ", "");

  if (!adminId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const admin = getUserById(adminId);
  if (!admin || admin.status !== "Администратор") {
    return res.status(403).json({ error: "Admin access required" });
  }

  if (!name || !teamSize || teamSize < 2 || teamSize > 5) {
    return res.status(400).json({ error: "Invalid match parameters" });
  }

  try {
    const newMatch = createMatch({
      name,
      teamSize,
      maxPlayers: teamSize * 2,
      currentPlayers: [],
      status: "waiting",
      createdBy: adminId,
    });

    res.json(newMatch);
  } catch (error) {
    res.status(500).json({ error: "Failed to create match" });
  }
};

// Присоединиться к матчу
export const joinMatchHandler: RequestHandler = (req, res) => {
  const { matchId, userId } = req.body as JoinMatchRequest;

  if (!matchId || !userId) {
    return res.status(400).json({ error: "Match ID and User ID required" });
  }

  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const updatedMatch = joinMatch(matchId, userId);
  if (!updatedMatch) {
    return res.status(400).json({ error: "Cannot join match" });
  }

  res.json(updatedMatch);
};

// Покинуть матч
export const leaveMatchHandler: RequestHandler = (req, res) => {
  const { matchId } = req.params;
  const { userId } = req.body;

  if (!matchId || !userId) {
    return res.status(400).json({ error: "Match ID and User ID required" });
  }

  const updatedMatch = leaveMatch(matchId, userId);
  if (!updatedMatch) {
    return res.status(404).json({ error: "Match not found" });
  }

  res.json(updatedMatch);
};

// Загрузить результаты матча (только для админов)
export const uploadResults: RequestHandler = (req, res) => {
  const { matchId } = req.params;
  const { screenshot, teamAScore, teamBScore, teamA, teamB } =
    req.body as UploadResultsRequest;
  const adminId = req.headers.authorization?.replace("Bearer ", "");

  if (!adminId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const admin = getUserById(adminId);
  if (!admin || admin.status !== "Администратор") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const match = getMatchById(matchId);
  if (!match) {
    return res.status(404).json({ error: "Match not found" });
  }

  try {
    const results = {
      screenshot,
      teamAScore,
      teamBScore,
      teamA,
      teamB,
      uploadedBy: adminId,
      uploadedAt: new Date().toISOString(),
    };

    const updatedMatch = uploadMatchResults(matchId, results);
    res.json(updatedMatch);
  } catch (error) {
    res.status(500).json({ error: "Failed to upload results" });
  }
};

// Получить сообщения чата матча
export const getMatchChat: RequestHandler = (req, res) => {
  const { matchId } = req.params;
  const messages = getMatchMessages(matchId);
  res.json(messages);
};

// Отправить сообщение в чат матча
export const sendChatMessage: RequestHandler = (req, res) => {
  const { matchId } = req.params;
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: "User ID and message required" });
  }

  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const match = getMatchById(matchId);
  if (!match) {
    return res.status(404).json({ error: "Match not found" });
  }

  // Проверяем, что пользователь в этом матче
  if (!match.currentPlayers.includes(userId)) {
    return res.status(403).json({ error: "User not in this match" });
  }

  try {
    const newMessage = addChatMessage({
      matchId,
      userId,
      userName: user.nickname,
      message,
    });

    res.json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Удалить матч (только для админов)
export const deleteMatchHandler: RequestHandler = (req, res) => {
  const { matchId } = req.params;
  const adminId = req.headers.authorization?.replace("Bearer ", "");

  if (!adminId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const admin = getUserById(adminId);
  if (!admin || admin.status !== "Администратор") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const success = deleteMatch(matchId);
  if (!success) {
    return res.status(404).json({ error: "Match not found" });
  }

  res.json({ success: true });
};
