import { loadTelegramConfig, validateTelegramConfig } from "./telegramConfig";

export interface AppConfig {
  server: {
    port: number;
    host: string;
    environment: "development" | "production" | "test";
  };
  telegram: ReturnType<typeof loadTelegramConfig>;
  features: {
    enableTelegram: boolean;
    enableAuth: boolean;
    enableMatchNotifications: boolean;
  };
}

// Загрузка конфигурации из переменных окружения
export function loadAppConfig(): AppConfig {
  const telegramConfig = loadTelegramConfig();

  return {
    server: {
      port: parseInt(process.env.PORT || "8080"),
      host: process.env.HOST || "0.0.0.0",
      environment: (process.env.NODE_ENV as any) || "development",
    },

    telegram: telegramConfig,

    features: {
      enableTelegram:
        !!telegramConfig.token &&
        telegramConfig.token !== "YOUR_BOT_TOKEN_HERE",
      enableAuth: process.env.TELEGRAM_AUTH !== "false",
      enableMatchNotifications: process.env.TELEGRAM_NOTIFICATIONS !== "false",
    },
  };
}

// Валидация конфигурации
export function validateAppConfig(config: AppConfig): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Валидация сервера
  if (config.server.port < 1 || config.server.port > 65535) {
    errors.push("Некорректный порт сервера");
  }

  // Валидация Telegram
  if (config.features.enableTelegram) {
    const telegramValidation = validateTelegramConfig(config.telegram);
    if (!telegramValidation.isValid) {
      errors.push(...telegramValidation.errors);
    }
  } else {
    warnings.push("Telegram бот отключен - отсутствует токен");
  }

  // Проверка переменных окружения
  if (!process.env.NODE_ENV) {
    warnings.push("NODE_ENV не у��тановлен, используется 'development'");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Отображение статуса конфигурации
export function displayConfigStatus(config: AppConfig): void {
  console.log("📋 Конфигурация приложения:");
  console.log(`   🌍 Окружение: ${config.server.environment}`);
  console.log(`   🚪 Порт: ${config.server.port}`);
  console.log(`   📡 Хост: ${config.server.host}`);

  console.log("\n🤖 Telegram бот:");
  console.log(
    `   ✅ Включен: ${config.features.enableTelegram ? "Да" : "Нет"}`,
  );
  console.log(
    `   🔐 Авторизация: ${config.features.enableAuth ? "Да" : "Нет"}`,
  );
  console.log(
    `   📢 Уведомления: ${config.features.enableMatchNotifications ? "Да" : "Нет"}`,
  );

  if (config.features.enableTelegram) {
    console.log(
      `   🔑 Токен: ${config.telegram.token ? "Настроен" : "Отсутствует"}`,
    );
    console.log(
      `   📺 Канал уведомлений: ${config.telegram.notificationChatId || "Не настроен"}`,
    );
    console.log(
      `   🛡️ Админ канал: ${config.telegram.adminChatId || "Не настроен"}`,
    );
  }

  // Валидация и предупреждения
  const validation = validateAppConfig(config);

  if (validation.warnings.length > 0) {
    console.log("\n⚠️ Предупреждения:");
    validation.warnings.forEach((warning) => console.log(`   - ${warning}`));
  }

  if (validation.errors.length > 0) {
    console.log("\n❌ Ошибки конфигурации:");
    validation.errors.forEach((error) => console.log(`   - ${error}`));
  }

  console.log("");
}

// Получение переменных окружения для отладки
export function getEnvDebugInfo(): Record<string, string> {
  const debugVars = [
    "NODE_ENV",
    "PORT",
    "HOST",
    "TELEGRAM_BOT_TOKEN",
    "TELEGRAM_CHAT_ID",
    "TELEGRAM_ADMIN_CHAT_ID",
    "TELEGRAM_BOT_USERNAME",
    "TELEGRAM_NOTIFICATIONS",
    "TELEGRAM_AUTH",
    "TELEGRAM_AUTO_CREATE_USERS",
  ];

  const debugInfo: Record<string, string> = {};

  debugVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      // Маскируем токены для безопасности
      if (varName.includes("TOKEN") && value.length > 10) {
        debugInfo[varName] =
          `${value.substring(0, 8)}...${value.substring(value.length - 4)}`;
      } else {
        debugInfo[varName] = value;
      }
    } else {
      debugInfo[varName] = "Не установлено";
    }
  });

  return debugInfo;
}

// Экспорт готовой конфигурации
export const appConfig = loadAppConfig();
export default appConfig;
