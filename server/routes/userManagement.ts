import { RequestHandler } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  userToProfile,
} from "../database";
import { UpdateProfileRequest } from "@shared/user";
import { requireAuth, requireAdmin } from "../middleware";

// Получить всех пользователей (только для админов)
export const getAllUsersHandler: RequestHandler[] = [
  requireAuth,
  requireAdmin,
  (req, res) => {
    const users = getAllUsers();
    const profiles = users.map(userToProfile);
    res.json(profiles);
  },
];

// Получить пользователя по ID (только для админов)
export const getUserByIdHandler: RequestHandler[] = [
  requireAuth,
  requireAdmin,
  (req, res) => {
    const { userId } = req.params;

    const user = getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const profile = userToProfile(user);
    res.json(profile);
  },
];

// Обновить пользователя (только для админов)
export const updateUserHandler: RequestHandler[] = [
  requireAuth,
  requireAdmin,
  (req, res) => {
    const { userId } = req.params;
    const updates = req.body;

    try {
      const updatedUser = updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const profile = userToProfile(updatedUser);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  },
];

// Удалить пользователя (только для админов)
export const deleteUserHandler: RequestHandler[] = [
  requireAuth,
  requireAdmin,
  (req, res) => {
    const { userId } = req.params;
    const adminId = (req as any).userId;

    // Проверяем, что админ не удаляет сам себя
    if (userId === adminId) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    try {
      const success = deleteUser(userId);
      if (!success) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  },
];

// Выдать/убрать админские права (только для супер-админов)
export const toggleAdminStatus: RequestHandler[] = [
  requireAuth,
  requireAdmin,
  (req, res) => {
    const { userId } = req.params;
    const { makeAdmin } = req.body; // boolean
    const adminId = (req as any).userId;

    // Проверяем, что текущий пользователь - супер админ
    const currentAdmin = getUserById(adminId);
    if (!currentAdmin || currentAdmin.status !== "Супер Администратор") {
      return res
        .status(403)
        .json({ error: "Only super administrators can grant admin rights" });
    }

    const targetUser = getUserById(userId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    try {
      const newStatus = makeAdmin ? "Администратор" : "Игрок";
      const updatedUser = updateUser(userId, { status: newStatus });

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      const profile = userToProfile(updatedUser);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update admin status" });
    }
  },
];
