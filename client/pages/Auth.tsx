import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthResponse, LoginRequest, RegisterRequest } from "@shared/user";
import { Eye, EyeOff, Mail, Lock, User, MessageCircle } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState<RegisterRequest>({
    email: "",
    nickname: "",
    password: "",
  });

  // Telegram auth
  const handleTelegramAuth = async () => {
    setLoading(true);
    setError("");

    try {
      // Check if Telegram WebApp API is available
      if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
        const tg = (window as any).Telegram.WebApp;
        const initData = tg.initData;

        if (initData) {
          const response = await fetch("/api/auth/telegram", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ initData }),
          });

          const data: AuthResponse = await response.json();

          if (data.success && data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            navigate("/");
          } else {
            setError(data.message || "Ошибка авторизации через Telegram");
          }
        } else {
          setError("Не удалось получить данные из Telegram");
        }
      } else {
        // Fallback: Open Telegram bot link
        const botUsername = "YOUR_BOT_USERNAME"; // Replace with actual bot username
        const authUrl = `https://t.me/${botUsername}?start=auth`;
        window.open(authUrl, "_blank");
        setError("Перейдите в Telegram бота для авторизации");
      }
    } catch (err) {
      setError("Ошибка авторизации через Telegram");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.message || "Ошибка входа");
      }
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (registerForm.password.length < 6) {
      setError("Пароль должен содержать минимум 6 символов");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerForm),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError(data.message || "Ошибка регистрации");
      }
    } catch (err) {
      setError("Ошибка сети");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">FaceIt</h1>
          <p className="text-foreground/60">
            {isLogin ? "Войдите в свой аккаунт" : "Создайте новый аккаунт"}
          </p>
        </div>

        <Card className="p-6 bg-card border-border/50 rounded-xl">
          {/* Toggle Buttons */}
          <div className="flex mb-6 bg-muted rounded-lg p-1">
            <Button
              variant={isLogin ? "default" : "ghost"}
              className={`flex-1 h-9 ${
                isLogin
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60"
              }`}
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
            >
              Вход
            </Button>
            <Button
              variant={!isLogin ? "default" : "ghost"}
              className={`flex-1 h-9 ${
                !isLogin
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/60"
              }`}
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
            >
              Регистрация
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    className="pl-10 bg-muted/30 border-border/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    className="pl-10 pr-10 bg-muted/30 border-border/50"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-foreground/40 hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Вход..." : "Войти"}
              </Button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        email: e.target.value,
                      })
                    }
                    className="pl-10 bg-muted/30 border-border/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname" className="text-sm font-medium">
                  Никнейм
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <Input
                    id="nickname"
                    type="text"
                    placeholder="Ваш никнейм"
                    value={registerForm.nickname}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        nickname: e.target.value,
                      })
                    }
                    className="pl-10 bg-muted/30 border-border/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm font-medium">
                  Пароль
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Минимум 6 символов"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm({
                        ...registerForm,
                        password: e.target.value,
                      })
                    }
                    className="pl-10 pr-10 bg-muted/30 border-border/50"
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-foreground/40 hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Регистрация..." : "Зарегистрироваться"}
              </Button>
            </form>
          )}
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-foreground/60 hover:text-foreground"
          >
            ← Вернуться на главную
          </Button>
        </div>
      </div>
    </div>
  );
}
