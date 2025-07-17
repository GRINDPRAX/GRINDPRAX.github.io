import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, Users, Trophy } from "lucide-react";
import { UserProfile } from "@shared/user";
import { Match as GameMatch } from "@shared/match";

interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  gradient: string;
}

interface LocalMatch {
  id: number;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  status: "live" | "upcoming" | "finished";
  time: string;
  viewers?: number;
}

const banners: Banner[] = [
  {
    id: 1,
    title: "Телеграм канал",
    description: "Подпишитесь",
    imageUrl: "",
    link: "t.me/BOPUEM",
    gradient: "from-orange-600 via-orange-500 to-orange-400",
  },
  {
    id: 2,
    title: "Лучший FACEIT по PROJECT EVOLTION",
    description: "Реально лучший",
    imageUrl: "",
    link: "/updates/new-heroes",
    gradient: "from-blue-600 via-purple-500 to-pink-400",
  },
  {
    id: 3,
    title: "Премиум пропуск",
    description: "Получите эксклюзивные награды",
    imageUrl: "",
    link: "/shop/premium-pass",
    gradient: "from-green-600 via-teal-500 to-cyan-400",
  },
];

const activeMatches: LocalMatch[] = [
  {
    id: 1,
    team1: "Team Alpha",
    team2: "Team Beta",
    score1: 2,
    score2: 1,
    status: "live",
    time: "45:32",
    viewers: 15432,
  },
  {
    id: 2,
    team1: "Dragons",
    team2: "Phoenix",
    score1: 0,
    score2: 0,
    status: "upcoming",
    time: "19:30",
    viewers: 8200,
  },
  {
    id: 3,
    team1: "Warriors",
    team2: "Legends",
    score1: 3,
    score2: 2,
    status: "finished",
    time: "Завершен",
    viewers: 25600,
  },
  {
    id: 4,
    team1: "Thunder",
    team2: "Lightning",
    score1: 1,
    score2: 0,
    status: "live",
    time: "23:15",
    viewers: 12800,
  },
];

export default function Home() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [gameMatches, setGameMatches] = useState<GameMatch[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      // Check if user is logged in
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          setUser(JSON.parse(userData));
        } catch (err) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }

      // Load active matches
      try {
        const response = await fetch("/api/matches");
        if (response.ok) {
          const matches = await response.json();
          setGameMatches(
            matches.filter((match: GameMatch) => match.status === "waiting"),
          );
        }
      } catch (err) {
        console.error("Error loading matches:", err);
      }
    };

    loadData();

    // Poll for match updates every 10 seconds
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll banners every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleBannerClick = (link: string) => {
    window.open(link, "_blank");
  };

  const getStatusColor = (status: LocalMatch["status"]) => {
    switch (status) {
      case "live":
        return "bg-red-500 text-white";
      case "upcoming":
        return "bg-blue-500 text-white";
      case "finished":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusText = (status: LocalMatch["status"]) => {
    switch (status) {
      case "live":
        return "В эфире";
      case "upcoming":
        return "Скоро";
      case "finished":
        return "Завершен";
      default:
        return "Неизвестно";
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
                  variant="default"
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  🏠 Главная
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
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
        {/* Banner Carousel */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            Новости и события
          </h2>
          <div className="relative">
            <Card className="overflow-hidden border-border/50 rounded-xl">
              <div
                className={`relative h-64 bg-gradient-to-r ${banners[currentBanner].gradient} cursor-pointer transition-all duration-500`}
                onClick={() => handleBannerClick(banners[currentBanner].link)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white max-w-2xl px-6">
                    <h3 className="text-3xl font-bold mb-2">
                      {banners[currentBanner].title}
                    </h3>
                    <p className="text-lg opacity-90">
                      {banners[currentBanner].description}
                    </p>
                  </div>
                </div>

                {/* Navigation arrows */}
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevBanner();
                  }}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>

                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-10 w-10 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextBanner();
                  }}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>

                {/* Dots indicator */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentBanner ? "bg-white" : "bg-white/50"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentBanner(index);
                      }}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Active Matches */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-4">
            🎮 Доступные матчи
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {gameMatches.length > 0 ? (
              gameMatches.map((match) => (
                <Card
                  key={match.id}
                  className="p-4 bg-card border-border/50 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={async () => {
                    if (!user) {
                      navigate("/auth");
                      return;
                    }

                    // Join match
                    try {
                      const response = await fetch("/api/matches/join", {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          matchId: match.id,
                          userId: user.id,
                        }),
                      });

                      if (response.ok) {
                        navigate(`/lobby/${match.id}`);
                      }
                    } catch (err) {
                      console.error("Error joining match:", err);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                      Ожидание игроков
                    </Badge>
                    <div className="flex items-center text-xs text-foreground/60">
                      <Users className="h-3 w-3 mr-1" />
                      {match.currentPlayers.length}/{match.maxPlayers}
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="font-semibold text-lg text-center text-primary">
                      {match.name}
                    </div>
                    <div className="text-sm text-center text-muted-foreground">
                      {match.teamSize}v{match.teamSize}
                    </div>
                  </div>

                  <div className="text-xs text-center text-foreground/60">
                    <div className="flex items-center justify-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Создан {new Date(match.createdAt).toLocaleTimeString()}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {user
                      ? match.currentPlayers.length >= match.maxPlayers
                        ? "Матч полный"
                        : "Присоединиться"
                      : "Войти для участия"}
                  </Button>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <div className="text-lg mb-2">🎯 Нет доступных матчей</div>
                <div className="text-sm">
                  Администраторы могут создавать новые матчи
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
