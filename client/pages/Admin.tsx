import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserProfile } from "@shared/user";
import { Match } from "@shared/match";

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Create match form
  const [matchName, setMatchName] = useState("");
  const [teamSize, setTeamSize] = useState<number>(2);
  const [creating, setCreating] = useState(false);

  // Upload results form
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [teamAScore, setTeamAScore] = useState<number>(0);
  const [teamBScore, setTeamBScore] = useState<number>(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in and is admin
        const userData = localStorage.getItem("user");
        if (!userData) {
          navigate("/auth");
          return;
        }

        const userObj = JSON.parse(userData);
        if (userObj.status !== "Администратор") {
          navigate("/");
          return;
        }

        setUser(userObj);

        // Load matches
        const matchesResponse = await fetch("/api/matches");
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          setMatches(matchesData);
        }
      } catch (err) {
        console.error("Error loading admin data:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Poll for updates every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleCreateMatch = async () => {
    if (!matchName.trim() || !user) return;

    setCreating(true);
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          name: matchName,
          teamSize,
        }),
      });

      if (response.ok) {
        setMatchName("");
        setTeamSize(2);
        // Reload matches
        const matchesResponse = await fetch("/api/matches");
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          setMatches(matchesData);
        }
      }
    } catch (err) {
      console.error("Error creating match:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.id}`,
        },
      });

      if (response.ok) {
        // Reload matches
        const matchesResponse = await fetch("/api/matches");
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          setMatches(matchesData);
        }
      }
    } catch (err) {
      console.error("Error deleting match:", err);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshot(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadResults = async () => {
    if (!selectedMatch || !user) return;

    setUploading(true);
    try {
      const match = matches.find((m) => m.id === selectedMatch);
      if (!match) return;

      // Automatically split players into teams
      const teamA = match.currentPlayers.slice(0, match.teamSize);
      const teamB = match.currentPlayers.slice(match.teamSize);

      const response = await fetch(`/api/matches/${selectedMatch}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          screenshot,
          teamAScore,
          teamBScore,
          teamA,
          teamB,
        }),
      });

      if (response.ok) {
        setSelectedMatch("");
        setScreenshot("");
        setTeamAScore(0);
        setTeamBScore(0);
        // Reload matches
        const matchesResponse = await fetch("/api/matches");
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json();
          setMatches(matchesData);
        }
      }
    } catch (err) {
      console.error("Error uploading results:", err);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
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
                  className="text-foreground/80 hover:text-foreground hover:bg-muted/50"
                >
                  🛡️ Администрация
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <Badge
                  variant="secondary"
                  className="bg-primary text-primary-foreground rounded-md px-2 py-1 cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => navigate("/profile")}
                >
                  {user.nickname.slice(0, 2).toUpperCase()}
                </Badge>
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
            <h1 className="text-3xl font-bold text-primary">
              🛡️ Панель администратора
            </h1>
            <p className="text-muted-foreground">
              Управление матчами и результатами
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Match */}
            <Card className="p-6 bg-card border-border/50 rounded-xl">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                ➕ Создать матч
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="matchName">Название матча</Label>
                  <Input
                    id="matchName"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    placeholder="Введите название матча"
                  />
                </div>

                <div>
                  <Label htmlFor="teamSize">Размер команды</Label>
                  <Select
                    value={teamSize.toString()}
                    onValueChange={(value) => setTeamSize(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2v2</SelectItem>
                      <SelectItem value="3">3v3</SelectItem>
                      <SelectItem value="4">4v4</SelectItem>
                      <SelectItem value="5">5v5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleCreateMatch}
                  disabled={!matchName.trim() || creating}
                  className="w-full"
                >
                  {creating ? "Создание..." : "Создать матч"}
                </Button>
              </div>
            </Card>

            {/* Upload Results */}
            <Card className="p-6 bg-card border-border/50 rounded-xl">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                📸 Загрузить результаты
              </h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="selectMatch">Выберите матч</Label>
                  <Select
                    value={selectedMatch}
                    onValueChange={setSelectedMatch}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите матч" />
                    </SelectTrigger>
                    <SelectContent>
                      {matches
                        .filter((match) => match.status !== "completed")
                        .map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.name} ({match.currentPlayers.length}/
                            {match.maxPlayers})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamAScore">Счет команды A</Label>
                    <Input
                      id="teamAScore"
                      type="number"
                      value={teamAScore}
                      onChange={(e) => setTeamAScore(parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamBScore">Счет команды B</Label>
                    <Input
                      id="teamBScore"
                      type="number"
                      value={teamBScore}
                      onChange={(e) => setTeamBScore(parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="screenshot">Скриншот результатов</Label>
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  {screenshot && (
                    <div className="mt-2">
                      <img
                        src={screenshot}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleUploadResults}
                  disabled={!selectedMatch || uploading}
                  className="w-full"
                >
                  {uploading ? "Загрузка..." : "Загрузить результаты"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Matches List */}
          <Card className="p-6 bg-card border-border/50 rounded-xl">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              📋 Активные матчи
            </h2>

            <div className="space-y-4">
              {matches.length > 0 ? (
                matches.map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50"
                  >
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-semibold text-foreground">
                          {match.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {match.teamSize}x{match.teamSize} •{" "}
                          {match.currentPlayers.length}/{match.maxPlayers}{" "}
                          игроков
                        </div>
                      </div>
                      <Badge
                        variant={
                          match.status === "waiting"
                            ? "secondary"
                            : match.status === "in_progress"
                              ? "default"
                              : "outline"
                        }
                      >
                        {match.status === "waiting"
                          ? "Ожидание"
                          : match.status === "in_progress"
                            ? "В игре"
                            : "Завершен"}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/lobby/${match.id}`)}
                      >
                        Открыть лобби
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteMatch(match.id)}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Нет активных матчей
                </div>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
