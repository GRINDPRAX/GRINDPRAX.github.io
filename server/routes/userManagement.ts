import { RequestHandler } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  userToProfile,
} from "../database";
import { UpdateProfileRequest } from "@shared/user";

// Получить всех пользователей (только для админов)
export const getAllUsersHandler: RequestHandler = (req, res) => {
  const adminId = req.headers.authorization?.replace("Bearer ", "");

  if (!adminId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const admin = getUserById(adminId);
  if (!admin || admin.status !== "Администратор") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const users = getAllUsers();
  const profiles = users.map(userToProfile);

  res.json(profiles);
};

// Получить пользователя по ID (только для админов)
export const getUserByIdHandler: RequestHandler = (req, res) => {
  const { userId } = req.params;
  const adminId = req.headers.authorization?.replace("Bearer ", "");

  if (!adminId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const admin = getUserById(adminId);
  if (!admin || admin.status !== "Администратор") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const profile = userToProfile(user);
  res.json(profile);
};

// Обновить пользователя (только для админов)
export const updateUserHandler: RequestHandler = (req, res) => {
  const { userId } = req.params;
  const adminId = req.headers.authorization?.replace("Bearer ", "");
  const updates = req.body;

  if (!adminId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const admin = getUserById(adminId);
  if (!admin || admin.status !== "Администратор") {
    return res.status(403).json({ error: "Admin access required" });
  }

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
};

// Удалить пользователя (только для админов)
export const deleteUserHandler: RequestHandler = (req, res) => {
  const { userId } = req.params;
  const adminId = req.headers.authorization?.replace("Bearer ", "");

  if (!adminId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const admin = getUserById(adminId);
  if (!admin || admin.status !== "Администратор") {
    return res.status(403).json({ error: "Admin access required" });
  }

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
};

// Выдать/убрать админские права (только для админов)
export const toggleAdminStatus: RequestHandler = (req, res) => {
  const { userId } = req.params;
  const { makeAdmin } = req.body; // boolean
  const adminId = req.headers.authorization?.replace("Bearer ", "");

  if (!adminId) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const admin = getUserById(adminId);
  if (!admin || admin.status !== "Администратор") {
    return res.status(403).json({ error: "Admin access required" });
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
};
