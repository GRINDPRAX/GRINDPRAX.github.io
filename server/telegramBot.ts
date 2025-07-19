import TelegramBot from "node-telegram-bot-api";
import {
  getUserByTelegramId,
  createUser,
  updateUser,
  getAllUsers,
} from "./database";
import { userToProfile } from "./database";
import { createSession } from "./middleware";
import { generateTelegramLoginToken } from "./routes/auth";

export interface TelegramBotConfig {
  token: string;
  notificationChatId?: string;
  adminChatId?: string;
  webhookUrl?: string;
  enableNotifications: boolean;
  enableAuth: boolean;
  autoCreateUsers: boolean;
}

export class TelegramBotService {
  private bot: TelegramBot | null = null;
  private config: TelegramBotConfig;
  private authSessions: Map<number, { code: string; expires: number }> =
    new Map();

  constructor(config: TelegramBotConfig) {
    this.config = config;
    if (config.token && config.token !== "YOUR_BOT_TOKEN_HERE") {
      this.initializeBot();
    }
  }

  private initializeBot() {
    try {
      this.bot = new TelegramBot(this.config.token, { polling: true });
      this.setupCommands();
      this.setupHandlers();
      console.log("✅ Telegram bot initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Telegram bot:", error);
    }
  }

  private setupCommands() {
    if (!this.bot) return;

    // Установка команд бота
    this.bot.setMyCommands([
      { command: "start", description: "Начать работу с ботом" },
      { command: "login", description: "Войти в систему" },
      { command: "profile", description: "Посмотреть профиль" },
      { command: "matches", description: "Активные матчи" },
      { command: "help", description: "Помощь" },
      { command: "settings", description: "Настройки аккаунта" },
    ]);
  }

  private setupHandlers() {
    if (!this.bot) return;

    // Обработчик команды /start
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;

      if (!userId) return;

      const welcomeMessage = `
🎮 <b>Добро пожаловать в систему матчмейкинга!</b>

Я помогу вам:
• 🔐 Войти в систему
• 📊 Следить за вашими матчами
• 🏆 Получать уведом��ения о играх
• ⚙️ Управлять настройками

<b>Доступные команды:</b>
/login - Войти в систему
/profile - Ваш профиль
/matches - Активные матчи
/settings - Настройки
/help - Помощь

Для начала используйте /login для входа в систему!`;

      await this.sendMessage(chatId, welcomeMessage);
    });

    // Обработчик команды /login
    this.bot.onText(/\/login/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      const username = msg.from?.username;
      const firstName = msg.from?.first_name || "";
      const lastName = msg.from?.last_name || "";

      if (!userId) return;

      try {
        // Проверяем, существует ли пользователь
        let user = getUserByTelegramId(userId.toString());

        if (!user && this.config.autoCreateUsers) {
          // Создаем нового пользователя автоматически
          const nickname =
            username || `${firstName} ${lastName}`.trim() || `User${userId}`;

          user = createUser({
            email: `telegram_${userId}@telegram.user`,
            nickname,
            password: "telegram_auth",
            avatar: "",
            banner: "",
            telegramId: userId.toString(),
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

          await this.sendMessage(
            chatId,
            `
✅ <b>Аккаунт создан!</b>

🎮 <b>Никнейм:</b> ${user.nickname}
⭐ <b>Рейтинг:</b> ${user.rating}
📅 <b>Регистрация:</b> ${new Date().toLocaleDateString("ru-RU")}

Для входа в веб-версию используйте команду /link`,
          );
        } else if (!user) {
          await this.sendMessage(
            chatId,
            `
❌ <b>Аккаунт не найден</b>

Автоматическое создание аккаунтов отключено. Обратитесь к администратору для создания аккаунта.`,
          );
          return;
        }

        // Генерируем временную ссылку для входа
        const loginToken = generateTelegramLoginToken(userId.toString());
        const loginUrl = `http://evo-faceit.ru/auth?loginToken=${loginToken}`;

        const keyboard = {
          inline_keyboard: [
            [{ text: "🌐 Войти в веб-версию", url: loginUrl }],
            [{ text: "📊 Показать статистику", callback_data: "show_stats" }],
          ],
        };

        await this.sendMessage(
          chatId,
          `
🔐 <b>Временная ссылка для входа</b>

👋 Привет, ${user.nickname}!

🔗 <b>Ссылка действительна 5 минут</b>
Нажмите кнопку ниже для входа в веб-версию:

⚠️ <i>Не передавайте эту ссылку другим людям!</i>`,
          keyboard,
        );
      } catch (error) {
        console.error("Login error:", error);
        await this.sendMessage(
          chatId,
          "❌ Ошибка при входе в систему. Попробуйте позже.",
        );
      }
    });

    // Обработчик команды /profile
    this.bot.onText(/\/profile/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;

      if (!userId) return;

      const user = getUserByTelegramId(userId.toString());

      if (!user) {
        await this.sendMessage(
          chatId,
          "❌ Пользователь не найден. Используйте /login для входа.",
        );
        return;
      }

      const profileMessage = `
👤 <b>Профиль: ${user.nickname}</b>

📊 <b>Статистика:</b>
⭐ Рейтинг: ${user.rating}
🏆 Побед: ${user.wins}
😔 Поражений: ${user.losses}
🎯 K/D: ${user.kd.toFixed(2)}
💀 Убийств: ${user.kills}
☠️ Смертей: ${user.deaths}
🎮 Всего матчей: ${user.totalMatches}
📅 Регистрация: ${new Date(user.registrationDate).toLocaleDateString("ru-RU")}
🔄 Последний вход: ${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("ru-RU") : "Неизвестно"}

🎪 <b>Статус:</b> ${user.status}
🏅 <b>Уровень:</b> ${user.level}`;

      await this.sendMessage(chatId, profileMessage);
    });

    // Обработчик команды /matches (будем интегрировать с системой матчей)
    this.bot.onText(/\/matches/, async (msg) => {
      const chatId = msg.chat.id;

      // Здесь бу��ет интеграция с системой матчей
      await this.sendMessage(
        chatId,
        `
🎮 <b>Активные матчи</b>

🔄 <i>Интеграция с системой матчей в разработке...</i>

Пока вы можете посетить веб-сайт для просмотра и участия в матчах.`,
      );
    });

    // Обработчик команды /settings
    this.bot.onText(/\/settings/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;

      if (!userId) return;

      const user = getUserByTelegramId(userId.toString());

      if (!user) {
        await this.sendMessage(
          chatId,
          "❌ Пользователь не найден. Используйте /login для входа.",
        );
        return;
      }

      const keyboard = {
        inline_keyboard: [
          [
            { text: "🔔 Уведомления", callback_data: "settings_notifications" },
            { text: "👤 Профиль", callback_data: "settings_profile" },
          ],
          [
            { text: "🎮 Игровые настройки", callback_data: "settings_game" },
            { text: "❌ Закрыть", callback_data: "settings_close" },
          ],
        ],
      };

      await this.sendMessage(
        chatId,
        `
⚙️ <b>Настройки аккаунта</b>

Выберите категорию настроек:`,
        keyboard,
      );
    });

    // Обработчик команды /help
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;

      const helpMessage = `
📖 <b>Справка по командам</b>

<b>Основные команды:</b>
/start - Начать работу с ботом
/login - Войти в систему
/profile - Посмотреть свой профиль
/matches - Активные матчи
/settings - Настройки аккаунта
/help - Эта справка

<b>Возможности бота:</b>
• 🔐 Авторизация через Telegram
• 📊 Просмотр статистики игрока
• 🔔 Уведомления о матчах
• ⚙️ Гибкие настройки
• 🎮 Интеграция с системой матчей

<b>Поддержка:</b>
Если у вас возникли проблемы, обратитесь к администратору системы.`;

      await this.sendMessage(chatId, helpMessage);
    });

    // Обработч��к callback-кнопок
    this.bot.on("callback_query", async (callbackQuery) => {
      const msg = callbackQuery.message;
      const data = callbackQuery.data;
      const chatId = msg?.chat.id;

      if (!chatId || !data) return;

      try {
        await this.bot!.answerCallbackQuery(callbackQuery.id);

        switch (data) {
          case "settings_notifications":
            await this.sendMessage(
              chatId,
              `
🔔 <b>Настройки уведомлений</b>

В разработке:
• Уведомления о новых матчах
• Уведомления о приглашениях
• Уведомления о результатах игр
• Уведомления о достижениях`,
            );
            break;

          case "settings_profile":
            await this.sendMessage(
              chatId,
              `
👤 <b>Настройки профиля</b>

Для изменения профиля используйте веб-интерфейс.
В будущем здесь будет возможность изменять:
• Никнейм
• Статус
• Аватар`,
            );
            break;

          case "settings_game":
            await this.sendMessage(
              chatId,
              `
🎮 <b>Игровые настройки</b>

В разработке:
• Предпочитаемые режимы игры
• Настройки приватности
• А��томатическое участие в матчах`,
            );
            break;

          case "settings_close":
            await this.bot!.deleteMessage(chatId, msg!.message_id);
            break;
        }
      } catch (error) {
        console.error("Callback query error:", error);
      }
    });

    // Обработчик ошибок
    this.bot.on("error", (error) => {
      console.error("Telegram bot error:", error);
    });

    // Обработчик обновлений опроса
    this.bot.on("polling_error", (error) => {
      console.error("Telegram polling error:", error);
    });
  }

  private async sendMessage(
    chatId: number,
    text: string,
    replyMarkup?: any,
  ): Promise<boolean> {
    if (!this.bot) return false;

    try {
      await this.bot.sendMessage(chatId, text, {
        parse_mode: "HTML",
        reply_markup: replyMarkup,
      });
      return true;
    } catch (error) {
      console.error("Failed to send message:", error);
      return false;
    }
  }

  // Публичные методы для уведомлений
  async notifyGameStarted(
    matchName: string,
    players: string[],
    teamSize: number,
  ): Promise<boolean> {
    if (!this.config.enableNotifications || !this.config.notificationChatId)
      return false;

    const playersText = players.length > 0 ? players.join(", ") : "Нет игроков";
    const message = `
🎮 <b>Игра началась!</b>

📋 <b>Матч:</b> ${matchName}
👥 <b>Формат:</b> ${teamSize}v${teamSize}
🎯 <b>Игроки:</b> ${playersText}
⏰ <b>Время:</b> ${new Date().toLocaleString("ru-RU")}

🔴 Матч сейчас в процессе!`;

    return await this.sendNotification(message);
  }

  async notifyGameFinished(
    matchName: string,
    teamAScore: number,
    teamBScore: number,
    teamA: string[],
    teamB: string[],
  ): Promise<boolean> {
    if (!this.config.enableNotifications || !this.config.notificationChatId)
      return false;

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

    return await this.sendNotification(message);
  }

  async notifyPlayerJoined(
    matchName: string,
    playerName: string,
    currentPlayers: number,
    maxPlayers: number,
  ): Promise<boolean> {
    if (!this.config.enableNotifications || !this.config.notificationChatId)
      return false;

    const message = `
👤 <b>Новый игрок присоединился!</b>

📋 <b>Матч:</b> ${matchName}
🎮 <b>Игрок:</b> ${playerName}
👥 <b>Игроков:</b> ${currentPlayers}/${maxPlayers}

${currentPlayers >= maxPlayers ? "✅ <b>Матч заполнен! Игра может начаться!</b>" : "⏳ Ожидаем еще игроков..."}`;

    return await this.sendNotification(message);
  }

  async sendNotification(message: string): Promise<boolean> {
    if (!this.bot || !this.config.notificationChatId) return false;

    try {
      const chatId = this.config.notificationChatId.startsWith("@")
        ? this.config.notificationChatId
        : parseInt(this.config.notificationChatId);

      await this.bot.sendMessage(chatId, message, { parse_mode: "HTML" });
      return true;
    } catch (error) {
      console.error("Failed to send notification:", error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    const message = `
🔧 <b>Тест уведомлений</b>

✅ Telegram бот успешно подключен!
⏰ ${new Date().toLocaleString("ru-RU")}`;

    return await this.sendNotification(message);
  }

  // Методы для управления ботом
  isConnected(): boolean {
    return this.bot !== null;
  }

  updateConfig(newConfig: Partial<TelegramBotConfig>) {
    this.config = { ...this.config, ...newConfig };

    // Если изменился токен, переинициализируем бота
    if (newConfig.token && newConfig.token !== this.config.token) {
      this.stop();
      this.config.token = newConfig.token;
      this.initializeBot();
    }
  }

  stop() {
    if (this.bot) {
      this.bot.stopPolling();
      this.bot = null;
      console.log("🛑 Telegram bot stopped");
    }
  }

  // Метод для получения URL для авторизации через WebApp
  getWebAppAuthUrl(): string {
    return `https://t.me/${this.bot?.options.username || "your_bot"}?start=auth`;
  }

  // Генерация ��дноразового кода для авторизации
  generateAuthCode(telegramUserId: number): string {
    const code = Math.random().toString(36).substring(2, 15);
    const expires = Date.now() + 5 * 60 * 1000; // 5 минут

    this.authSessions.set(telegramUserId, { code, expires });

    // Очистка истекших сессий
    setTimeout(
      () => {
        this.authSessions.delete(telegramUserId);
      },
      5 * 60 * 1000,
    );

    return code;
  }

  // Проверка кода авторизации
  validateAuthCode(telegramUserId: number, code: string): boolean {
    const session = this.authSessions.get(telegramUserId);

    if (!session || session.expires < Date.now()) {
      this.authSessions.delete(telegramUserId);
      return false;
    }

    if (session.code === code) {
      this.authSessions.delete(telegramUserId);
      return true;
    }

    return false;
  }
}
