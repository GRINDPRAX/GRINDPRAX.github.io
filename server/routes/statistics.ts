import { RequestHandler } from "express";
import { getAllUsers, getUserById, userToProfile } from "../database";
import { UserProfile } from "@shared/user";

export const getUserStatistics: RequestHandler = (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const profile = userToProfile(user);
  res.json(profile);
};

export const getTopPlayers: RequestHandler = (req, res) => {
  const users = getAllUsers();

  // Сортируем по рейтингу в убывающем порядке и берем топ 10
  const topPlayers = users
    .map(userToProfile)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 10);

  res.json(topPlayers);
};

export const getAllPlayersStatistics: RequestHandler = (req, res) => {
  const users = getAllUsers();
  const profiles = users.map(userToProfile);

  // Подсчитаем общую статистику
  const totalStats = {
    totalPlayers: profiles.length,
    totalMatches: profiles.reduce((sum, user) => sum + user.totalMatches, 0),
    totalWins: profiles.reduce((sum, user) => sum + user.wins, 0),
    totalLosses: profiles.reduce((sum, user) => sum + user.losses, 0),
    averageRating:
      profiles.reduce((sum, user) => sum + user.rating, 0) / profiles.length,
    averageKD:
      profiles.reduce((sum, user) => sum + user.kd, 0) / profiles.length,
  };

  res.json({
    players: profiles,
    stats: totalStats,
  });
};
