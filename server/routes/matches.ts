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
import { getUserById, updateUser } from "../database";
import {
  CreateMatchRequest,
  JoinMatchRequest,
  UploadResultsRequest,
} from "@shared/match";
import { requireAuth, requireAdmin } from "../middleware";
import { TelegramService } from "../telegramService";

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
export const createNewMatch: RequestHandler[] = [
  requireAuth,
  requireAdmin,
  (req, res) => {
    const {
      name,
      teamSize,
      adminId: customAdminId,
    } = req.body as CreateMatchRequest;
    const defaultAdminId = (req as any).userId;
    const adminId = customAdminId || defaultAdminId;

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
  },
];

// Присоединиться к матчу
export const joinMatchHandler: RequestHandler = async (req, res) => {
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

  // Send Telegram notification when player joins
  try {
    await TelegramService.notifyPlayerJoined(
      updatedMatch.name,
      user.nickname,
      updatedMatch.currentPlayers.length,
      updatedMatch.maxPlayers,
    );

    // If match is full, start the game and send start notification
    if (updatedMatch.currentPlayers.length >= updatedMatch.maxPlayers) {
      const playerNames = updatedMatch.currentPlayers
        .map((playerId) => getUserById(playerId)?.nickname || playerId)
        .filter(Boolean);

      await TelegramService.notifyGameStarted(
        updatedMatch.name,
        playerNames,
        updatedMatch.teamSize,
      );
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
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
export const uploadResults: RequestHandler[] = [
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { matchId } = req.params;
    const { screenshot, teamAScore, teamBScore, teamA, teamB, playerStats } =
      req.body as UploadResultsRequest;
    const adminId = (req as any).userId;

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
        playerStats,
        uploadedBy: adminId,
        uploadedAt: new Date().toISOString(),
      };

      // Определяем команду-победителя
      const teamAWon = teamAScore > teamBScore;
      const teamBWon = teamBScore > teamAScore;

      // Обновляем статистику игроков
      for (const playerId of match.currentPlayers) {
        const user = getUserById(playerId);
        if (!user) continue;

        const playerStat = playerStats.find((stat) => stat.userId === playerId);
        const kills = playerStat?.kills || 0;
        const deaths = playerStat?.deaths || 0;

        // Определяем, выиграл ли игрок
        const playerWon = teamA.includes(playerId) ? teamAWon : teamBWon;

        // Обно��ляем статистику
        const newRating = playerWon ? user.rating + 30 : user.rating - 20;
        const newKills = kills;
        const newDeaths = deaths;
        const newKd = newDeaths > 0 ? newKills / newDeaths : newKills;
        const newWins = playerWon ? user.wins + 1 : user.wins;
        const newLosses = !playerWon ? user.losses + 1 : user.losses;
        const newTotalMatches = user.totalMatches + 1;

        // Обновляем пользователя в базе данных
        updateUser(playerId, {
          rating: Math.max(0, newRating), // рейтинг не может быть отрицательным
          kd: newKd,
          wins: newWins,
          losses: newLosses,
          totalMatches: newTotalMatches,
        });
      }

      const updatedMatch = uploadMatchResults(matchId, results);
      res.json(updatedMatch);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload results" });
    }
  },
];

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
export const deleteMatchHandler: RequestHandler[] = [
  requireAuth,
  requireAdmin,
  (req, res) => {
    const { matchId } = req.params;

    const success = deleteMatch(matchId);
    if (!success) {
      return res.status(404).json({ error: "Match not found" });
    }

    res.json({ success: true });
  },
];
