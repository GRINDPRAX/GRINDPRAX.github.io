import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Home,
  Zap,
  Settings,
  BarChart3,
  Shield,
  User,
  Search,
  Bell,
} from "lucide-react";

export default function Index() {
  const [nickname, setNickname] = useState("Ник");
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
                >
                  <Home className="mr-2 h-4 w-4" />
                  Главная
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Топ
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                >
                  Магазин
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Статистика
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Администрация
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

      {/* Secondary Navigation */}
      <div className="border-b border-border/50 bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center space-x-6">
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            >
              <User className="mr-2 h-4 w-4" />
              Основное
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
            >
              <Settings className="mr-2 h-4 w-4" />
              Безопасность
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
            >
              <Bell className="mr-2 h-4 w-4" />
              Соцсети
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
            >
              <Settings className="mr-2 h-4 w-4" />
              Устройства
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Профиль</h1>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg">
            Сохранить
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-card border-border/50 rounded-xl">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50 text-foreground/70 hover:text-foreground hover:bg-muted/50 mb-4 rounded-lg text-xs"
                >
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
                    →
                  </Button>
                </div>
              </div>
            </Card>

            {/* Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-foreground/60 mb-1 block">
                  Статус
                </label>
                <Input
                  value="Игрок"
                  className="bg-muted/30 border-border/50 text-foreground text-sm h-8 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
