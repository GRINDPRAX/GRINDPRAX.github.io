import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Профиль
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Зет
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Модуили
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Сноитгепс
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
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
                className="bg-primary text-primary-foreground"
              >
                MT
              </Badge>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="border-b border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center space-x-6">
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              <User className="mr-2 h-4 w-4" />
              Основное
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Search className="mr-2 h-4 w-4" />
              Безопасность
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Bell className="mr-2 h-4 w-4" />
              Соцеон
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Settings className="mr-2 h-4 w-4" />
              Устройства
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">Профиль</h1>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Сохранить
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border-border">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-lg bg-primary/20 flex items-center justify-center">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border text-muted-foreground hover:text-foreground mb-4"
                >
                  Изменить
                  <br />
                  аватар
                </Button>
              </div>

              <div className="space-y-4 mt-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">
                    Никнейм
                  </label>
                  <Input
                    value="SkyWorker"
                    className="bg-background border-border text-foreground"
                    readOnly
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Banner Card */}
            <Card className="mb-6 overflow-hidden border-border">
              <div className="relative h-48 bg-gradient-to-r from-primary/80 via-primary to-primary/60">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 via-orange-500 to-orange-400/90"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-lg font-semibold mb-2">
                      Изменить банер
                    </h3>
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-white/20"
                  >
                    →
                  </Button>
                </div>
              </div>
            </Card>

            {/* Status Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Статус
                </label>
                <Input
                  value="Hero"
                  className="bg-background border-border text-foreground"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
