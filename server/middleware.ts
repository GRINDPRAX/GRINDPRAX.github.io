import { RequestHandler } from "express";
import { getUserById } from "./database";

// Простая система сессий (в реальном проекте использовать JWT)
const sessions = new Map<string, string>(); // token -> userId

export function generateToken(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function createSession(userId: string): string {
  const token = generateToken();
  sessions.set(token, userId);
  return token;
}

export function getSessionUserId(token: string): string | null {
  return sessions.get(token) || null;
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}

export function hasSession(token: string): boolean {
  return sessions.has(token);
}

// Middleware для проверки аутентификации
export const requireAuth: RequestHandler = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token || !hasSession(token)) {
    return res.status(401).json({ error: "Authorization required" });
  }

  const userId = getSessionUserId(token);
  if (!userId) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const user = getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  // Добавляем пользователя к запросу
  (req as any).user = user;
  (req as any).userId = userId;
  next();
};

// Middleware для проверки админских прав
export const requireAdmin: RequestHandler = (req, res, next) => {
  const user = (req as any).user;

  if (!user || user.status !== "Администратор") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};
