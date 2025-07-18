import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserProfile, AuthResponse } from "@shared/user";
import { Match } from "@shared/match";
import {
  Loader2,
  Calendar,
  Trophy,
  Target,
  Users,
  History,
  ArrowLeft,
  Clock,
} from "lucide-react";
import TopNavigation from "@/components/TopNavigation";

export default function MatchHistory() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadUserAndMatches();
  }, []);

  const loadUserAndMatches = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/auth");
        return;
      }

      // Load user profile
      const profileResponse = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const profileData: AuthResponse = await profileResponse.json();

      if (!profileData.success || !profileData.user) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth");
        return;
      }

      setUser(profileData.user);

      // Load matches
      const matchesResponse = await fetch("/api/matches", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (matchesResponse.ok) {
        const matchesData = await matchesResponse.json();
        // Filter matches where user participated
        const userMatches = matchesData.filter((match: Match) =>
          match.currentPlayers.includes(profileData.user!.id),
        );
        setMatches(userMatches);
      }
    } catch (err) {
      setError("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMatchResult = (match: Match, userId: string) => {
    if (!match.results) return "Не завершен";

    const { teamA, teamB, teamAScore, teamBScore } = match.results;
    const isInTeamA = teamA.includes(userId);
    const isInTeamB = teamB.includes(userId);

    if (isInTeamA) {
      return teamAScore > teamBScore ? "Победа" : "Поражение";
    } else if (isInTeamB) {
      return teamBScore > teamAScore ? "Победа" : "Поражение";
    }

    return "Не участвовал";
  };

  const getPlayerStats = (match: Match, userId: string) => {
    if (!match.results) return null;
    return match.results.playerStats.find((stats) => stats.userId === userId);
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка истории матчей...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Пользователь не найден</p>
          <Button onClick={() => navigate("/auth")}>Войти</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <TopNavigation user={user} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <History className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">
              История матчей
            </h1>
          </div>
          <div className="text-sm text-foreground/60">
            Найдено матчей: {matches.length}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Match List */}
        <div className="space-y-4">
          {matches.length === 0 ? (
            <Card className="p-8 bg-card border-border/50 rounded-xl text-center">
              <History className="h-12 w-12 mx-auto mb-4 text-foreground/40" />
              <h3 className="text-lg font-medium mb-2">Нет матчей</h3>
              <p className="text-foreground/60">
                Вы еще не участвовали ни в одном матче
              </p>
              <Button
                onClick={() => navigate("/")}
                className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Найти матч
              </Button>
            </Card>
          ) : (
            matches.map((match) => {
              const result = getMatchResult(match, user.id);
              const playerStats = getPlayerStats(match, user.id);
              const isWin = result === "Победа";
              const isCompleted = match.status === "completed";

              return (
                <Card
                  key={match.id}
                  className="p-4 bg-card border-border/50 rounded-xl hover:bg-card/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Trophy
                          className={`h-5 w-5 ${
                            isWin
                              ? "text-green-500"
                              : result === "Поражение"
                                ? "text-red-500"
                                : "text-foreground/60"
                          }`}
                        />
                        <div>
                          <h3 className="font-medium">{match.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-foreground/60">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>
                                {match.teamSize}v{match.teamSize}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(match.createdAt)}</span>
                            </div>
                            {match.completedAt && (
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  Завершен: {formatDate(match.completedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Match Result */}
                      <div className="text-center">
                        <Badge
                          variant={
                            isWin
                              ? "default"
                              : result === "Поражение"
                                ? "destructive"
                                : "secondary"
                          }
                          className={
                            isWin
                              ? "bg-green-500 hover:bg-green-600"
                              : result === "Поражение"
                                ? "bg-red-500 hover:bg-red-600"
                                : ""
                          }
                        >
                          {result}
                        </Badge>
                        {isCompleted && match.results && (
                          <div className="text-xs text-foreground/60 mt-1">
                            {match.results.teamAScore} :{" "}
                            {match.results.teamBScore}
                          </div>
                        )}
                      </div>

                      {/* Player Stats */}
                      {playerStats && (
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <Target className="h-4 w-4 text-green-500" />
                              <span className="font-medium text-green-500">
                                {playerStats.kills}
                              </span>
                            </div>
                            <div className="text-xs text-foreground/60">
                              Убийства
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <span className="font-medium text-red-500">
                                {playerStats.deaths}
                              </span>
                            </div>
                            <div className="text-xs text-foreground/60">
                              Смерти
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="font-medium">
                              {playerStats.deaths > 0
                                ? (
                                    playerStats.kills / playerStats.deaths
                                  ).toFixed(2)
                                : playerStats.kills.toFixed(2)}
                            </div>
                            <div className="text-xs text-foreground/60">
                              K/D
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Status */}
                      <div className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            match.status === "completed"
                              ? "border-green-500/50 text-green-500"
                              : match.status === "in_progress"
                                ? "border-orange-500/50 text-orange-500"
                                : "border-foreground/30 text-foreground/60"
                          }
                        >
                          {match.status === "completed"
                            ? "Завершен"
                            : match.status === "in_progress"
                              ? "В процессе"
                              : "Ожидание"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
