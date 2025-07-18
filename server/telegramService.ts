// Telegram Bot API service for sending notifications

interface TelegramConfig {
  botToken: string;
  chatId: string; // Channel or group chat ID
}

// You'll need to set these environment variables or update with actual values
const config: TelegramConfig = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN_HERE",
  chatId: process.env.TELEGRAM_CHAT_ID || "@your_channel_name", // or numeric chat ID
};

export class TelegramService {
  private static async sendMessage(
    text: string,
    parseMode?: string,
  ): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: config.chatId,
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

  static async notifyGameStarted(
    matchName: string,
    players: string[],
    teamSize: number,
  ): Promise<boolean> {
    const playersText = players.length > 0 ? players.join(", ") : "Нет игроков";

    const message = `
🎮 <b>Игра началась!</b>

📋 <b>Матч:</b> ${matchName}
👥 <b>Формат:</b> ${teamSize}v${teamSize}
🎯 <b>Игроки:</b> ${playersText}
⏰ <b>Время:</b> ${new Date().toLocaleString("ru-RU")}

🔴 Матч сейчас в процессе!`;

    return await this.sendMessage(message);
  }

  static async notifyGameFinished(
    matchName: string,
    teamAScore: number,
    teamBScore: number,
    teamA: string[],
    teamB: string[],
  ): Promise<boolean> {
    const winner =
      teamAScore > teamBScore
        ? "Команда А"
        : teamBScore > teamAScore
          ? "Команда ��"
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

    return await this.sendMessage(message);
  }

  static async notifyPlayerJoined(
    matchName: string,
    playerName: string,
    currentPlayers: number,
    maxPlayers: number,
  ): Promise<boolean> {
    const message = `
👤 <b>Новый игрок присоединился!</b>

📋 <b>Матч:</b> ${matchName}
🎮 <b>Игрок:</b> ${playerName}
👥 <b>Игроков:</b> ${currentPlayers}/${maxPlayers}

${currentPlayers >= maxPlayers ? "✅ <b>Матч заполнен! Игра может начаться!</b>" : "⏳ Ожидаем еще игроков..."}`;

    return await this.sendMessage(message);
  }

  static async testConnection(): Promise<boolean> {
    const message = `
🔧 <b>Тест уведомлений</b>

✅ Telegram бот успешно подключен!
⏰ ${new Date().toLocaleString("ru-RU")}`;

    return await this.sendMessage(message);
  }
}
