import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Textarea } from "./ui/textarea";
import {
  Bot,
  Settings,
  Play,
  Square,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface TelegramConfig {
  enableNotifications: boolean;
  enableAuth: boolean;
  autoCreateUsers: boolean;
  hasToken: boolean;
  hasNotificationChannel: boolean;
  features: {
    autoRegistration: boolean;
    profileManagement: boolean;
    matchNotifications: boolean;
    adminCommands: boolean;
    statistics: boolean;
  };
}

interface BotStatus {
  connected: boolean;
  config: TelegramConfig;
}

export function TelegramBotManager() {
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [restartLoading, setRestartLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Загрузка статуса бота
  const loadBotStatus = async () => {
    try {
      const response = await fetch("/api/telegram/status");
      const data = await response.json();

      if (data.success) {
        setBotStatus({ connected: data.connected, config: data.config });
      } else {
        setMessage({ type: "error", text: "Ошибка загрузки статуса бота" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Ошибка подключения к серверу" });
    } finally {
      setLoading(false);
    }
  };

  // Тест соединения
  const testConnection = async () => {
    setTestLoading(true);
    try {
      const response = await fetch("/api/telegram/test", { method: "POST" });
      const data = await response.json();

      setMessage({
        type: data.success ? "success" : "error",
        text: data.message,
      });
    } catch (error) {
      setMessage({ type: "error", text: "Ошибка тестирования соединения" });
    } finally {
      setTestLoading(false);
    }
  };

  // Перезапуск бота
  const restartBot = async () => {
    setRestartLoading(true);
    try {
      const response = await fetch("/api/telegram/restart", { method: "POST" });
      const data = await response.json();

      setMessage({
        type: data.success ? "success" : "error",
        text: data.message,
      });

      if (data.success) {
        // Обновляем статус через 2 секунды
        setTimeout(loadBotStatus, 2000);
      }
    } catch (error) {
      setMessage({ type: "error", text: "Ошибка перезапуска бота" });
    } finally {
      setRestartLoading(false);
    }
  };

  // Отправка кастомного уведомления
  const sendCustomNotification = async () => {
    if (!customMessage.trim()) {
      setMessage({ type: "error", text: "Введите сообщение" });
      return;
    }

    setNotificationLoading(true);
    try {
      const response = await fetch("/api/telegram/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: customMessage }),
      });
      const data = await response.json();

      setMessage({
        type: data.success ? "success" : "error",
        text: data.message,
      });

      if (data.success) {
        setCustomMessage("");
      }
    } catch (error) {
      setMessage({ type: "error", text: "Ошибка отправки уведомления" });
    } finally {
      setNotificationLoading(false);
    }
  };

  // Обновление конфигурации
  const updateConfig = async (updates: Partial<TelegramConfig>) => {
    try {
      const response = await fetch("/api/telegram/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Конфигурация обновлена" });
        loadBotStatus();
      } else {
        setMessage({ type: "error", text: "Ошибка обновления конфигурации" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Ошибка подключения к серверу" });
    }
  };

  useEffect(() => {
    loadBotStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Загрузка...</span>
        </CardContent>
      </Card>
    );
  }

  if (!botStatus) {
    return (
      <Card>
        <CardContent className="p-8">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Не удалось загрузить статус Telegram бота
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Сообщения */}
      {message && (
        <Alert
          className={
            message.type === "error" ? "border-red-500" : "border-green-500"
          }
        >
          {message.type === "error" ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Статус бота */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Статус Telegram Бота
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Соединение:</span>
            <Badge variant={botStatus.connected ? "default" : "destructive"}>
              {botStatus.connected ? "Подключен" : "Отключен"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span>Токен настроен:</span>
            <Badge
              variant={botStatus.config.hasToken ? "default" : "secondary"}
            >
              {botStatus.config.hasToken ? "Да" : "Нет"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span>Канал уведомлений:</span>
            <Badge
              variant={
                botStatus.config.hasNotificationChannel
                  ? "default"
                  : "secondary"
              }
            >
              {botStatus.config.hasNotificationChannel
                ? "Настроен"
                : "Не настроен"}
            </Badge>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={testConnection}
              disabled={testLoading || !botStatus.connected}
              size="sm"
            >
              {testLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Тест соединения
            </Button>

            <Button
              onClick={restartBot}
              disabled={restartLoading}
              variant="outline"
              size="sm"
            >
              {restartLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Перезапустить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Основные настройки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Основные настройки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Уведомления</Label>
              <p className="text-sm text-muted-foreground">
                Отправка уведомлений о матчах в канал
              </p>
            </div>
            <Switch
              id="notifications"
              checked={botStatus.config.enableNotifications}
              onCheckedChange={(checked) =>
                updateConfig({ enableNotifications: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auth">Авторизация</Label>
              <p className="text-sm text-muted-foreground">
                Вход через Telegram бота
              </p>
            </div>
            <Switch
              id="auth"
              checked={botStatus.config.enableAuth}
              onCheckedChange={(checked) =>
                updateConfig({ enableAuth: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autocreate">Автосоздание пользователей</Label>
              <p className="text-sm text-muted-foreground">
                Автоматическое создание аккаунтов при входе через Telegram
              </p>
            </div>
            <Switch
              id="autocreate"
              checked={botStatus.config.autoCreateUsers}
              onCheckedChange={(checked) =>
                updateConfig({ autoCreateUsers: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Функции бота */}
      <Card>
        <CardHeader>
          <CardTitle>Возможности бота</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Авторегистрация</span>
              <Badge
                variant={
                  botStatus.config.features.autoRegistration
                    ? "default"
                    : "secondary"
                }
              >
                {botStatus.config.features.autoRegistration ? "Вкл" : "Выкл"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Управление профилем</span>
              <Badge
                variant={
                  botStatus.config.features.profileManagement
                    ? "default"
                    : "secondary"
                }
              >
                {botStatus.config.features.profileManagement ? "Вкл" : "Выкл"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Уведомления о матчах</span>
              <Badge
                variant={
                  botStatus.config.features.matchNotifications
                    ? "default"
                    : "secondary"
                }
              >
                {botStatus.config.features.matchNotifications ? "Вкл" : "Выкл"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Админ команды</span>
              <Badge
                variant={
                  botStatus.config.features.adminCommands
                    ? "default"
                    : "secondary"
                }
              >
                {botStatus.config.features.adminCommands ? "Вкл" : "Выкл"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Статистика</span>
              <Badge
                variant={
                  botStatus.config.features.statistics ? "default" : "secondary"
                }
              >
                {botStatus.config.features.statistics ? "Вкл" : "Выкл"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Отправка уведомлений */}
      <Card>
        <CardHeader>
          <CardTitle>Отправить уведомление</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="message">Сообщение</Label>
            <Textarea
              id="message"
              placeholder="Введите сообщение для отправки в канал..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
            />
          </div>

          <Button
            onClick={sendCustomNotification}
            disabled={
              notificationLoading ||
              !botStatus.connected ||
              !customMessage.trim()
            }
            className="w-full"
          >
            {notificationLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Отправить уведомление
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
