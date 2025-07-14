import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Statistics() {
  const navigate = useNavigate();
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
                  className="text-foreground/80 hover:text-foreground hover:bg-muted/50"
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
              <Badge
                variant="secondary"
                className="bg-primary text-primary-foreground rounded-md px-2 py-1"
              >
                MT
              </Badge>
            </div>
          </div>
        </div>
      </nav>

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
                <div>
                  <h3 className="font-semibold text-foreground mb-2">
                    SkyWorker
                  </h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span>#4 Аарон в зайте Тамада MR</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Статус
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                    <span className="text-sm">Игрок</span>
                  </div>
                </div>

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

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 bg-card border-border/50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      0
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Убийства
                    </div>
                  </Card>
                  <Card className="p-4 bg-card border-border/50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      0
                    </div>
                    <div className="text-xs text-muted-foreground">Смерти</div>
                  </Card>
                  <Card className="p-4 bg-card border-border/50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      0
                    </div>
                    <div className="text-xs text-muted-foreground">Очки</div>
                  </Card>
                  <Card className="p-4 bg-card border-border/50 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary mb-1">
                      0
                    </div>
                    <div className="text-xs text-muted-foreground">Опыт</div>
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
                          durno2007@yandex.ru
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
                          2025-06-08
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Дата регистрации
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-card border-border/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">🌍</div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Russia
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Страна
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4 bg-card border-border/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-400">⚙️</div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          default
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
