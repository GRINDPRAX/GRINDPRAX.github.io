import { TelegramBotConfig } from "../telegramBot";

export interface AppTelegramConfig extends TelegramBotConfig {
  // Дополнительные настройки приложения
  botUsername?: string;
  welcomeMessage?: string;
  errorMessages: {
    userNotFound: string;
    loginFailed: string;
    serverError: string;
    unauthorized: string;
  };
  features: {
    autoRegistration: boolean;
    profileManagement: boolean;
    matchNotifications: boolean;
    adminCommands: boolean;
    statistics: boolean;
  };
  limits: {
    messageLength: number;
    commandCooldown: number;
    maxRetries: number;
  };
  channels: {
    general?: string;
    announcements?: string;
    matches?: string;
    admin?: string;
  };
}

// Конфигурация по умолчанию
export const defaultTelegramConfig: AppTelegramConfig = {
  token: process.env.TELEGRAM_BOT_TOKEN || "",
  notificationChatId: process.env.TELEGRAM_CHAT_ID || "",
  adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || "",
  webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
  enableNotifications: true,
  enableAuth: true,
  autoCreateUsers: true,

  botUsername: process.env.TELEGRAM_BOT_USERNAME || "",
  welcomeMessage: `
🎮 <b>Добро пожаловать в систему матчмейкинга!</b>

Я помогу вам:
• 🔐 Войти в систему
• 📊 Следить за вашими матчами  
• 🏆 Получать уведомления о играх
• ⚙️ Управлять настройками

Для начала используйте /login для входа в систему!`,

  errorMessages: {
    userNotFound: "❌ Пользователь не найден. Используйте /login для входа.",
    loginFailed: "❌ Ошибка при входе в систему. Попробуйте позже.",
    serverError: "❌ Внутренняя ошибка сервера. Попробуйте позже.",
    unauthorized: "❌ У вас нет прав для выполнения этой команды.",
  },

  features: {
    autoRegistration: process.env.TELEGRAM_AUTO_REGISTRATION === "true",
    profileManagement: true,
    matchNotifications: true,
    adminCommands: process.env.TELEGRAM_ADMIN_COMMANDS === "true",
    statistics: true,
  },

  limits: {
    messageLength: 4096,
    commandCooldown: 1000, // мс
    maxRetries: 3,
  },

  channels: {
    general: process.env.TELEGRAM_GENERAL_CHANNEL,
    announcements: process.env.TELEGRAM_ANNOUNCEMENTS_CHANNEL,
    matches:
      process.env.TELEGRAM_MATCHES_CHANNEL || process.env.TELEGRAM_CHAT_ID,
    admin: process.env.TELEGRAM_ADMIN_CHANNEL,
  },
};

// Функция загрузки конфигурации из переменных окружения
export function loadTelegramConfig(): AppTelegramConfig {
  return {
    ...defaultTelegramConfig,
    // Переопределяем значения из environment variables если они есть
    token: process.env.TELEGRAM_BOT_TOKEN || defaultTelegramConfig.token,
    notificationChatId:
      process.env.TELEGRAM_CHAT_ID || defaultTelegramConfig.notificationChatId,
    adminChatId:
      process.env.TELEGRAM_ADMIN_CHAT_ID || defaultTelegramConfig.adminChatId,
    webhookUrl:
      process.env.TELEGRAM_WEBHOOK_URL || defaultTelegramConfig.webhookUrl,
    enableNotifications:
      process.env.NODE_ENV === "production"
        ? process.env.TELEGRAM_NOTIFICATIONS !== "false"
        : process.env.TELEGRAM_NOTIFICATIONS === "true",
    enableAuth: process.env.TELEGRAM_AUTH !== "false",
    autoCreateUsers: process.env.TELEGRAM_AUTO_CREATE_USERS !== "false",
  };
}

// Функция валидации конфигурации
export function validateTelegramConfig(config: AppTelegramConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.token || config.token.length < 10) {
    errors.push("Отсутствует или некорректный TELEGRAM_BOT_TOKEN");
  }

  if (
    config.enableNotifications &&
    (!config.notificationChatId || config.notificationChatId.trim() === "")
  ) {
    errors.push(
      "Уведомления включены, но не указан TELEGRAM_CHAT_ID или TELEGRAM_NOTIFICATION_CHAT_ID",
    );
  }

  if (config.limits.messageLength > 4096) {
    errors.push(
      "Максимальная длина сообщения не может превышать 4096 символов",
    );
  }

  if (config.limits.commandCooldown < 100) {
    errors.push("Кулдаун команд не может быть меньше 100мс");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Функция получения настроек для определенного окружения
export function getTelegramConfigForEnvironment(
  env: "development" | "production" | "test",
): Partial<AppTelegramConfig> {
  const baseConfig = loadTelegramConfig();

  switch (env) {
    case "development":
      return {
        enableNotifications: baseConfig.enableNotifications,
        limits: {
          ...defaultTelegramConfig.limits,
          commandCooldown: 500,
        },
      };
    case "production":
      return {
        enableNotifications: true,
        limits: {
          ...defaultTelegramConfig.limits,
          commandCooldown: 2000,
        },
      };
    case "test":
      return {
        enableNotifications: false,
        enableAuth: false,
        autoCreateUsers: false,
      };
    default:
      return {};
  }
}

// Экспорт типов для использования в других модулях
export type TelegramFeatures = AppTelegramConfig["features"];
export type TelegramLimits = AppTelegramConfig["limits"];
export type TelegramChannels = AppTelegramConfig["channels"];
export type TelegramErrorMessages = AppTelegramConfig["errorMessages"];
