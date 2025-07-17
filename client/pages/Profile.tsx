import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile, AuthResponse, UpdateProfileRequest } from "@shared/user";
import { Loader2, Camera, Trophy, Target, Calendar, Clock } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setNickname(data.user.nickname);
        setStatus(data.user.status);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
      }
    } catch (err) {
      setError("Ошибка загрузки профиля");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      const updates: UpdateProfileRequest = {
        nickname: nickname !== user.nickname ? nickname : undefined,
        status: status !== user.status ? status : undefined,
      };

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        setError("Ошибка сохранения");
      }
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (err) {
      // Игнорируем ошибки при выходе
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/auth");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatLastLogin = (dateString: string) => {
    return new Date(dateString).toLocaleString("ru-RU", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка профиля...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Профиль не найден</p>
          <Button onClick={() => navigate("/auth")}>Войти</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left side navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/80 hover:text-foreground hover:bg-muted/50"
                  onClick={() => navigate("/")}
                >
                  🏠 Главная
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                >
                  ⚡ Топ
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                >
                  🛒 Магазин
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  onClick={() => navigate("/statistics")}
                >
                  📊 Статистика
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  onClick={() => navigate("/statistics")}
                >
                  🛡️ Администрация
                </Button>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className="bg-primary text-primary-foreground rounded-md px-2 py-1 cursor-pointer hover:bg-primary/90 transition-colors"
              >
                {user.nickname.slice(0, 2).toUpperCase()}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-foreground/70 hover:text-foreground"
              >
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="border-b border-border/50 bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center space-x-6">
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            >
              👤 Основное
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
            >
              ⚙️ Безопасность
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
            >
              🔔 Соцсети
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
            >
              📱 Устройства
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Профиль</h1>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>💾 Сохранить</>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-card border-border/50 rounded-xl">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : (
                    <span className="text-4xl">👤</span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50 text-foreground/70 hover:text-foreground hover:bg-muted/50 mb-4 rounded-lg text-xs"
                >
                  <Camera className="h-3 w-3 mr-1" />
                  Изменить
                  <br />
                  аватар
                </Button>
              </div>

              <div className="space-y-3 mt-4">
                <div>
                  <label className="text-xs text-foreground/60 mb-1 block">
                    Никнейм
                  </label>
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="bg-muted/30 border-border/50 text-foreground text-sm h-8 rounded-lg"
                    placeholder="Введите ваш никнейм"
                  />
                </div>

                <div>
                  <label className="text-xs text-foreground/60 mb-1 block">
                    Email
                  </label>
                  <Input
                    value={user.email}
                    disabled
                    className="bg-muted/20 border-border/30 text-foreground/60 text-sm h-8 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="mt-4 p-4 bg-card border-border/50 rounded-xl">
              <h3 className="text-sm font-medium mb-3">Статистика</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="text-sm">Рейтинг</span>
                  </div>
                  <span className="font-bold text-primary">{user.rating}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm">K/D</span>
                  </div>
                  <span className="font-bold text-green-500">
                    {user.kd.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Уровень</span>
                  <span className="font-bold">{user.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-500">Побед</span>
                  <span className="font-bold text-green-500">{user.wins}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-500">Поражений</span>
                  <span className="font-bold text-red-500">{user.losses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Всего матчей</span>
                  <span className="font-bold">{user.totalMatches}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-3">
            {/* Banner Card */}
            <Card className="mb-4 overflow-hidden border-border/50 rounded-xl">
              <div className="relative h-36 bg-gradient-to-r from-orange-600 via-orange-500 to-orange-400">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/95 via-orange-500/90 to-orange-400/85"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-sm font-medium">Изменить банер</h3>
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20 h-8 w-8 rounded-lg"
                  >
                    ➡️
                  </Button>
                </div>
              </div>
            </Card>

            {/* Status and Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-foreground/60 mb-1 block">
                  Статус
                </label>
                <Input
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-muted/30 border-border/50 text-foreground text-sm h-8 rounded-lg"
                  placeholder="Введите ваш статус"
                />
              </div>
            </div>

            {/* Account Info */}
            <Card className="p-4 bg-card border-border/50 rounded-xl">
              <h3 className="text-lg font-medium mb-4">
                Информация об аккаунте
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-foreground/60" />
                  <div>
                    <p className="text-sm text-foreground/60">
                      Дата регистрации
                    </p>
                    <p className="font-medium">
                      {formatDate(user.registrationDate)}
                    </p>
                  </div>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-foreground/60" />
                    <div>
                      <p className="text-sm text-foreground/60">
                        Последний вход
                      </p>
                      <p className="font-medium">
                        {formatLastLogin(user.lastLogin)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
