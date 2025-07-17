import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserProfile } from "@shared/user";

export default function Top() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [topPlayers, setTopPlayers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }

        // Load top players
        const response = await fetch("/api/statistics/top");
        if (response.ok) {
          const topPlayersData = await response.json();
          setTopPlayers(topPlayersData);
        }
      } catch (err) {
        console.error("Error loading top players:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "🏅";
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-400";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-orange-600";
      default:
        return "text-muted-foreground";
    }
  };

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
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                  onClick={() => navigate("/")}
                >
                  🏠 Главная
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/80 hover:text-foreground hover:bg-muted/50"
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
                >
                  🛡️ Администрация
                </Button>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {user ? (
                <Badge
                  variant="secondary"
                  className="bg-primary text-primary-foreground rounded-md px-2 py-1 cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => navigate("/profile")}
                >
                  {user.nickname.slice(0, 2).toUpperCase()}
                </Badge>
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

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">⚡ Топ игроков</h1>
            <p className="text-muted-foreground">Лучшие игроки по рейтингу</p>
          </div>

          {/* Top Players List */}
          <div className="space-y-4">
            {loading ? (
              <Card className="p-6 text-center">
                <div className="text-muted-foreground">Загрузка...</div>
              </Card>
            ) : topPlayers.length > 0 ? (
              topPlayers.map((player, index) => {
                const rank = index + 1;
                return (
                  <Card
                    key={player.id}
                    className={`p-4 bg-card border-border/50 rounded-xl transition-all hover:border-primary/50 ${
                      rank <= 3 ? "border-primary/30" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                          <span className={`text-xl ${getRankColor(rank)}`}>
                            {getRankEmoji(rank)}
                          </span>
                        </div>

                        {/* Player Info */}
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-foreground">
                              {player.nickname}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {player.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Уровень {player.level} • K/D: {player.kd.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <div className="text-lg font-bold text-primary">
                            {player.rating}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Рейтинг
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-400">
                            {player.wins}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Победы
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-400">
                            {player.losses}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Поражения
                          </div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-400">
                            {player.totalMatches}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Всего игр
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-6 text-center">
                <div className="text-muted-foreground">Игроки не найдены</div>
              </Card>
            )}
          </div>

          {/* Your Position */}
          {user && (
            <Card className="p-4 bg-accent/20 border-accent/50">
              <div className="text-center">
                <h3 className="font-semibold text-foreground mb-2">
                  Ваша позиция
                </h3>
                <div className="flex items-center justify-center space-x-4">
                  <div>
                    <div className="text-lg font-bold text-primary">
                      {user.rating}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ваш рейтинг
                    </div>
                  </div>
                  <div className="text-muted-foreground">•</div>
                  <div>
                    <div className="text-lg font-bold text-foreground">
                      {topPlayers.findIndex((p) => p.id === user.id) + 1 ||
                        "Не в топе"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Место в рейтинге
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
