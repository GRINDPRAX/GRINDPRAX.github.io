import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock, Users, Trophy } from "lucide-react";

interface Banner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  gradient: string;
}

interface Match {
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
    title: "Чемпионат мира 2024",
    description: "Самые захватывающие матчи сезона",
    imageUrl: "",
    link: "/tournament/world-championship",
    gradient: "from-orange-600 via-orange-500 to-orange-400",
  },
  {
    id: 2,
    title: "Новые герои",
    description: "Обновление игры с новыми возможностями",
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

const activeMatches: Match[] = [
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
  const navigate = useNavigate();

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

  const getStatusColor = (status: Match["status"]) => {
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

  const getStatusText = (status: Match["status"]) => {
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
                className="bg-primary text-primary-foreground rounded-md px-2 py-1 cursor-pointer hover:bg-primary/90 transition-colors"
                onClick={() => navigate("/statistics")}
              >
                FI
              </Badge>
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
            Активные матчи
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {activeMatches.map((match) => (
              <Card
                key={match.id}
                className="p-4 bg-card border-border/50 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    className={`text-xs px-2 py-1 rounded-full ${getStatusColor(match.status)}`}
                  >
                    {getStatusText(match.status)}
                  </Badge>
                  {match.viewers && (
                    <div className="flex items-center text-xs text-foreground/60">
                      <Users className="h-3 w-3 mr-1" />
                      {match.viewers.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{match.team1}</span>
                    <span className="font-bold text-lg">{match.score1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{match.team2}</span>
                    <span className="font-bold text-lg">{match.score2}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <div className="flex items-center">
                    {match.status === "live" ? (
                      <>
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                        <Clock className="h-3 w-3 mr-1" />
                        {match.time}
                      </>
                    ) : match.status === "upcoming" ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        {match.time}
                      </>
                    ) : (
                      <>
                        <Trophy className="h-3 w-3 mr-1" />
                        {match.time}
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
