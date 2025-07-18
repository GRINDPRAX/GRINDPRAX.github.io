// Telegram Bot API service for sending notifications
import { TelegramBotService } from "./telegramBot";
import {
  loadTelegramConfig,
  validateTelegramConfig,
  AppTelegramConfig,
} from "./config/telegramConfig";

interface TelegramConfig {
  botToken: string;
  chatId: string; // Channel or group chat ID
}

// Старая конфигурация для обратной совместимости
const legacyConfig: TelegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN_HERE",
  chatId: process.env.TELEGRAM_CHAT_ID || "@your_channel_name",
};

class TelegramServiceClass {
  private botService: TelegramBotService | null = null;
  private config: AppTelegramConfig;

  constructor() {
    this.config = loadTelegramConfig();
    this.initializeBot();
  }

  private initializeBot() {
    const validation = validateTelegramConfig(this.config);

    if (!validation.isValid) {
      console.warn("⚠️ Telegram bot configuration errors:");
      validation.errors.forEach((error) => console.warn(`  - ${error}`));

      if (this.config.token) {
        console.log(
          "🔄 Attempting to initialize bot with available configuration...",
        );
      } else {
        console.log("❌ Cannot initialize bot without token");
        return;
      }
    }

    try {
      this.botService = new TelegramBotService(this.config);
      console.log("✅ TelegramService initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize TelegramService:", error);
    }
  }

  // Методы для обратной совместимости с старым API
  private static async sendLegacyMessage(
    text: string,
    parseMode?: string,
  ): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${legacyConfig.botToken}/sendMessage`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: legacyConfig.chatId,
          text: text,
          parse_mode: parseMode || "HTML",
        }),
      });

      const result = await response.json();
      return result.ok === true;
    } catch (error) {
      console.error("Telegram notification error:", error);
      return false;
    }
  }

  // Новые методы через бота
  async notifyGameStarted(
    matchName: string,
    players: string[],
    teamSize: number,
  ): Promise<boolean> {
    if (this.botService) {
      return await this.botService.notifyGameStarted(
        matchName,
        players,
        teamSize,
      );
    }

    // Fallback к старому методу
    const playersText = players.length > 0 ? players.join(", ") : "Нет игроков";
    const message = `
🎮 <b>Игра началась!</b>

📋 <b>Матч:</b> ${matchName}
👥 <b>Формат:</b> ${teamSize}v${teamSize}
🎯 <b>Игроки:</b> ${playersText}
⏰ <b>Время:</b> ${new Date().toLocaleString("ru-RU")}

🔴 Матч сейчас в процессе!`;

    return await TelegramServiceClass.sendLegacyMessage(message);
  }

  async notifyGameFinished(
    matchName: string,
    teamAScore: number,
    teamBScore: number,
    teamA: string[],
    teamB: string[],
  ): Promise<boolean> {
    if (this.botService) {
      return await this.botService.notifyGameFinished(
        matchName,
        teamAScore,
        teamBScore,
        teamA,
        teamB,
      );
    }

    // Fallback к старому методу
    const winner =
      teamAScore > teamBScore
        ? "Команда А"
        : teamBScore > teamAScore
          ? "Команда Б"
          : "Ничья";
    const teamAText = teamA.length > 0 ? teamA.join(", ") : "Пустая команда";
    const teamBText = teamB.length > 0 ? teamB.join(", ") : "Пустая команда";

    const message = `
🏆 <b>Игра завершена!</b>

📋 <b>Матч:</b> ${matchName}
📊 <b>Счет:</b> ${teamAScore} : ${teamBScore}
👑 <b>Победитель:</b> ${winner}

👥 <b>Команда А:</b> ${teamAText}
👥 <b>Команда Б:</b> ${teamBText}

⏰ <b>Завершено:</b> ${new Date().toLocaleString("ru-RU")}`;

    return await TelegramServiceClass.sendLegacyMessage(message);
  }

  async notifyPlayerJoined(
    matchName: string,
    playerName: string,
    currentPlayers: number,
    maxPlayers: number,
  ): Promise<boolean> {
    if (this.botService) {
      return await this.botService.notifyPlayerJoined(
        matchName,
        playerName,
        currentPlayers,
        maxPlayers,
      );
    }

    // Fallback к старому методу
    const message = `
👤 <b>Новый игрок присоединился!</b>

📋 <b>Матч:</b> ${matchName}
🎮 <b>Игрок:</b> ${playerName}
👥 <b>Игроков:</b> ${currentPlayers}/${maxPlayers}

${currentPlayers >= maxPlayers ? "✅ <b>Матч заполнен! Игра может начаться!</b>" : "⏳ Ожидаем еще игроков..."}`;

    return await TelegramServiceClass.sendLegacyMessage(message);
  }

  async testConnection(): Promise<boolean> {
    if (this.botService) {
      return await this.botService.testConnection();
    }

    // Fallback к старому методу
    const message = `
🔧 <b>Тест уведомлений</b>

✅ Telegram бот успешно подключен!
⏰ ${new Date().toLocaleString("ru-RU")}`;

    return await TelegramServiceClass.sendLegacyMessage(message);
  }

  // Новые методы для управления ботом
  getBotService(): TelegramBotService | null {
    return this.botService;
  }

  isConnected(): boolean {
    return this.botService?.isConnected() || false;
  }

  updateConfig(newConfig: Partial<AppTelegramConfig>) {
    this.config = { ...this.config, ...newConfig };

    if (this.botService) {
      this.botService.updateConfig(newConfig);
    } else {
      this.initializeBot();
    }
  }

  stopBot() {
    if (this.botService) {
      this.botService.stop();
      this.botService = null;
    }
  }

  restartBot() {
    this.stopBot();
    this.initializeBot();
  }

  getConfig(): AppTelegramConfig {
    return { ...this.config };
  }

  // Методы для авторизации через бота
  getWebAppAuthUrl(): string {
    return this.botService?.getWebAppAuthUrl() || "";
  }

  generateAuthCode(telegramUserId: number): string {
    return this.botService?.generateAuthCode(telegramUserId) || "";
  }

  validateAuthCode(telegramUserId: number, code: string): boolean {
    return this.botService?.validateAuthCode(telegramUserId, code) || false;
  }

  // Отправка кастомных уведомлений
  async sendCustomNotification(
    message: string,
    channel?: "general" | "announcements" | "matches" | "admin",
  ): Promise<boolean> {
    if (this.botService) {
      return await this.botService.sendNotification(message);
    }

    return await TelegramServiceClass.sendLegacyMessage(message);
  }

  // Статические методы для обратной совместимости
  static async notifyGameStarted(
    matchName: string,
    players: string[],
    teamSize: number,
  ): Promise<boolean> {
    return await telegramServiceInstance.notifyGameStarted(
      matchName,
      players,
      teamSize,
    );
  }

  static async notifyGameFinished(
    matchName: string,
    teamAScore: number,
    teamBScore: number,
    teamA: string[],
    teamB: string[],
  ): Promise<boolean> {
    return await telegramServiceInstance.notifyGameFinished(
      matchName,
      teamAScore,
      teamBScore,
      teamA,
      teamB,
    );
  }

  static async notifyPlayerJoined(
    matchName: string,
    playerName: string,
    currentPlayers: number,
    maxPlayers: number,
  ): Promise<boolean> {
    return await telegramServiceInstance.notifyPlayerJoined(
      matchName,
      playerName,
      currentPlayers,
      maxPlayers,
    );
  }

  static async testConnection(): Promise<boolean> {
    return await telegramServiceInstance.testConnection();
  }
}

// Создаем singleton instance
const telegramServiceInstance = new TelegramServiceClass();

// Экспортируем singleton как TelegramService для обратной совместимости
export const TelegramService = telegramServiceInstance;

// Также экспортируем класс для создания новых экземпляров если нужно
export { TelegramServiceClass };

// Экспорт дополнительных утилит
export { loadTelegramConfig, validateTelegramConfig };
export type { AppTelegramConfig };
