import { RequestHandler } from "express";
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UpdateProfileRequest,
} from "@shared/user";
import {
  getUserByEmail,
  getUserByTelegramId,
  createUser,
  updateUser,
  getUserById,
  userToProfile,
} from "../database";
import {
  createSession,
  getSessionUserId,
  deleteSession,
  hasSession,
} from "../middleware";

export const login: RequestHandler = (req, res) => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      const response: AuthResponse = {
        success: false,
        message: "Email и пароль обязательны",
      };
      return res.status(400).json(response);
    }

    const user = getUserByEmail(email);

    if (!user || user.password !== password) {
      const response: AuthResponse = {
        success: false,
        message: "Неверный email или пароль",
      };
      return res.status(401).json(response);
    }

    // Обновляем время последнего входа
    updateUser(user.id, { lastLogin: new Date().toISOString() });

    const token = createSession(user.id);

    const response: AuthResponse = {
      success: true,
      user: userToProfile(user),
      token,
    };

    res.json(response);
  } catch (error) {
    const response: AuthResponse = {
      success: false,
      message: "Внутренняя ошибка сервера",
    };
    res.status(500).json(response);
  }
};

export const register: RequestHandler = (req, res) => {
  try {
    const { email, nickname, password }: RegisterRequest = req.body;

    if (!email || !nickname || !password) {
      const response: AuthResponse = {
        success: false,
        message: "Все поля обязательны",
      };
      return res.status(400).json(response);
    }

    if (password.length < 6) {
      const response: AuthResponse = {
        success: false,
        message: "Пароль должен содержать минимум 6 символов",
      };
      return res.status(400).json(response);
    }

    if (getUserByEmail(email)) {
      const response: AuthResponse = {
        success: false,
        message: "Пользователь с таким email уже существует",
      };
      return res.status(409).json(response);
    }

    const newUser = createUser({
      email,
      nickname,
      password,
      avatar: "",
      banner: "",
      rating: 1000,
      kd: 0,
      registrationDate: new Date().toISOString(),
      status: "Новичок",
      level: 1,
      wins: 0,
      losses: 0,
      totalMatches: 0,
      lastLogin: new Date().toISOString(),
    });

    const token = createSession(newUser.id);

    const response: AuthResponse = {
      success: true,
      user: userToProfile(newUser),
      token,
    };

    res.json(response);
  } catch (error) {
    const response: AuthResponse = {
      success: false,
      message:
        error instanceof Error ? error.message : "Внутренняя ошибка сервера",
    };
    res.status(500).json(response);
  }
};

export const getProfile: RequestHandler = (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token || !hasSession(token)) {
      const response: AuthResponse = {
        success: false,
        message: "Токен недействителен",
      };
      return res.status(401).json(response);
    }

    const userId = getSessionUserId(token);
    if (!userId) {
      const response: AuthResponse = {
        success: false,
        message: "Токен недействителен",
      };
      return res.status(401).json(response);
    }

    const user = getUserById(userId);

    if (!user) {
      const response: AuthResponse = {
        success: false,
        message: "Пользователь не найден",
      };
      return res.status(404).json(response);
    }

    const response: AuthResponse = {
      success: true,
      user: userToProfile(user),
    };

    res.json(response);
  } catch (error) {
    const response: AuthResponse = {
      success: false,
      message: "Внутренняя ошибка сервера",
    };
    res.status(500).json(response);
  }
};

export const updateProfile: RequestHandler = (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token || !hasSession(token)) {
      const response: AuthResponse = {
        success: false,
        message: "Токен недействителен",
      };
      return res.status(401).json(response);
    }

    const userId = getSessionUserId(token);
    if (!userId) {
      const response: AuthResponse = {
        success: false,
        message: "Токен недействителен",
      };
      return res.status(401).json(response);
    }

    const updates: UpdateProfileRequest = req.body;

    const updatedUser = updateUser(userId, updates);

    if (!updatedUser) {
      const response: AuthResponse = {
        success: false,
        message: "Пользователь не найден",
      };
      return res.status(404).json(response);
    }

    const response: AuthResponse = {
      success: true,
      user: userToProfile(updatedUser),
    };

    res.json(response);
  } catch (error) {
    const response: AuthResponse = {
      success: false,
      message: "Внутренняя ошибка сервера",
    };
    res.status(500).json(response);
  }
};

export const logout: RequestHandler = (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token && hasSession(token)) {
      deleteSession(token);
    }

    const response: AuthResponse = {
      success: true,
      message: "Выход выполнен успешно",
    };

    res.json(response);
  } catch (error) {
    const response: AuthResponse = {
      success: false,
      message: "Внутренняя ошибка сервера",
    };
    res.status(500).json(response);
  }
};

export const telegramAuth: RequestHandler = (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      const response: AuthResponse = {
        success: false,
        message: "Данные Telegram не предоставлены",
      };
      return res.status(400).json(response);
    }

    // Parse Telegram init data
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get("user");

    if (!userParam) {
      const response: AuthResponse = {
        success: false,
        message: "Данные пользователя Telegram не найдены",
      };
      return res.status(400).json(response);
    }

    const telegramUser = JSON.parse(userParam);
    const telegramId = telegramUser.id.toString();

    // Check if user exists by Telegram ID
    let user = getUserByTelegramId(telegramId);

    if (!user) {
      // Create new user with Telegram data
      const newUser = createUser({
        email: `telegram_${telegramId}@telegram.user`,
        nickname:
          telegramUser.first_name +
          (telegramUser.last_name ? ` ${telegramUser.last_name}` : ""),
        password: "telegram_auth", // Placeholder password for Telegram users
        avatar: telegramUser.photo_url || "",
        banner: "",
        telegramId: telegramId,
        rating: 1000,
        kills: 0,
        deaths: 0,
        kd: 0,
        registrationDate: new Date().toISOString(),
        status: "Игрок",
        level: 1,
        wins: 0,
        losses: 0,
        totalMatches: 0,
        lastLogin: new Date().toISOString(),
      });
      user = newUser;
    } else {
      // Update last login
      updateUser(user.id, { lastLogin: new Date().toISOString() });
    }

    const token = createSession(user.id);

    const response: AuthResponse = {
      success: true,
      user: userToProfile(user),
      token,
    };

    res.json(response);
  } catch (error) {
    const response: AuthResponse = {
      success: false,
      message: "Ошибка авторизации через Telegram",
    };
    res.status(500).json(response);
  }
};
