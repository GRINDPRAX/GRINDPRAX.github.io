import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { UserProfile } from "@shared/user";
import { History } from "lucide-react";

interface TopNavigationProps {
  user: UserProfile | null;
  onLogout?: () => void;
}

export default function TopNavigation({ user, onLogout }: TopNavigationProps) {
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Left side navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              <Button
                variant={isActive("/") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/")
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                }
                onClick={() => navigate("/")}
              >
                🏠 Главная
              </Button>
              <Button
                variant={isActive("/top") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/top")
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                }
                onClick={() => navigate("/top")}
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
                variant={isActive("/statistics") ? "default" : "ghost"}
                size="sm"
                className={
                  isActive("/statistics")
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                }
                onClick={() => navigate("/statistics")}
              >
                📊 Статистика
              </Button>
              {user && (
                <Button
                  variant={isActive("/match-history") ? "default" : "ghost"}
                  size="sm"
                  className={
                    isActive("/match-history")
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  }
                  onClick={() => navigate("/match-history")}
                >
                  <History className="h-4 w-4 mr-1" />
                  История матчей
                </Button>
              )}
              {user?.status === "Администратор" && (
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  size="sm"
                  className={
                    isActive("/admin")
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  }
                  onClick={() => navigate("/admin")}
                >
                  🛡️ Администрация
                </Button>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Badge
                  variant="secondary"
                  className="bg-primary text-primary-foreground rounded-md px-2 py-1 cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => navigate("/profile")}
                >
                  {user.nickname.slice(0, 2).toUpperCase()}
                </Badge>
                {location.pathname === "/profile" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onLogout || handleLogout}
                    className="text-foreground/70 hover:text-foreground"
                  >
                    Выйти
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/auth")}
                className="text-foreground hover:bg-muted/50"
              >
                Войти
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
