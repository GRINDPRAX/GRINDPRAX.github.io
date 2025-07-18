import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserProfile } from "@shared/user";
import TopNavigation from "@/components/TopNavigation";

export default function Statistics() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserStatistics = async () => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem("user");
        if (userData) {
          const userObj = JSON.parse(userData);

          // Fetch fresh statistics from the server
          const response = await fetch(`/api/statistics/user/${userObj.id}`);
          if (response.ok) {
            const freshUserData = await response.json();
            setUser(freshUserData);
            // Update localStorage with fresh data
            localStorage.setItem("user", JSON.stringify(freshUserData));
          } else {
            setUser(userObj);
          }
        }
      } catch (err) {
        console.error("Error loading user statistics:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    loadUserStatistics();
  }, []);

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <TopNavigation user={user} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border-border/50 rounded-xl">
              {/* Large UP Logo */}
              <div className="text-center mb-6">
                <div className="inline-block">
                  <div className="text-6xl font-bold text-primary mb-2">UP</div>
                  <div className="text-xs text-primary bg-primary/20 px-2 py-1 rounded">
                    UP
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center text-muted-foreground">
                    Загрузка...
                  </div>
                ) : user ? (
                  <>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">
                        {user.nickname}
                      </h3>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                          <span>Рейтинг: {user.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <div className="text-sm text-muted-foreground mb-2">
                        Статус
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        <span className="text-sm">{user.status}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <Button onClick={() => navigate("/auth")}>
                      Войти в аккаунт
                    </Button>
                  </div>
                )}

                <div className="pt-4">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
                    Подробная статистика
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Statistics and Information */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Statistics Section */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="text-lg font-semibold">📊 Статистика</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <Card className="p-4 bg-card border-border/50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {user?.wins || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Победы</div>
                  </Card>
                  <Card className="p-4 bg-card border-border/50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {user?.losses || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Поражения
                    </div>
                  </Card>
                  <Card className="p-4 bg-card border-border/50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {user?.totalMatches || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Всего игр
                    </div>
                  </Card>
                  <Card className="p-4 bg-card border-border/50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-green-400 mb-1">
                      {user?.kills || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Убийства
                    </div>
                  </Card>
                  <Card className="p-4 bg-card border-border/50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-red-400 mb-1">
                      {user?.deaths || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Смерти</div>
                  </Card>
                  <Card className="p-4 bg-card border-border/50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      {user?.kd.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-xs text-muted-foreground">K/D</div>
                  </Card>
                </div>
              </div>

              {/* Information Section */}
              <div>
                <div className="flex items-center mb-4">
                  <span className="text-lg font-semibold">📋 Информация</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 bg-card border-border/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">📧</div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {user?.email || "Не указано"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Электронная почта
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-card border-border/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">📅</div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {user?.registrationDate
                            ? new Date(
                                user.registrationDate,
                              ).toLocaleDateString("ru-RU")
                            : "Не указано"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Дата регистрации
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-card border-border/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">🏆</div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {user?.level || 1}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Уровень
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-card border-border/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">⚙️</div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {user?.status || "Игрок"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Тип аккаунта
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
