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
import TopNavigation from "@/components/TopNavigation";
import {
  Loader2,
  Plus,
  Trash2,
  Upload,
  Users,
  Settings,
  MessageSquare,
} from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Create match form
  const [matchName, setMatchName] = useState("");
  const [teamSize, setTeamSize] = useState<number>(2);
  const [adminId, setAdminId] = useState("");
  const [creating, setCreating] = useState(false);

  // Upload results form
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [teamAScore, setTeamAScore] = useState<number>(0);
  const [teamBScore, setTeamBScore] = useState<number>(0);
  const [playerStats, setPlayerStats] = useState<
    Array<{ userId: string; kills: number; deaths: number }>
  >([]);
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
        setAdminId(userObj.id);

        // Load matches
        const response = await fetch("/api/matches");
        if (response.ok) {
          const matchesData = await response.json();
          setMatches(matchesData);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Auto-refresh matches every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleCreateMatch = async () => {
    if (!matchName.trim() || !user || !adminId.trim()) return;

    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("/api/matches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: matchName,
          teamSize: teamSize,
          adminId: adminId,
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
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/matches/${matchId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setScreenshot(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPlayerStat = () => {
    setPlayerStats([...playerStats, { userId: "", kills: 0, deaths: 0 }]);
  };

  const handleRemovePlayerStat = (index: number) => {
    const newStats = playerStats.filter((_, i) => i !== index);
    setPlayerStats(newStats);
  };

  const handlePlayerStatChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newStats = [...playerStats];
    newStats[index] = { ...newStats[index], [field]: value };
    setPlayerStats(newStats);
  };

  const handleUploadResults = async () => {
    if (!selectedMatch || !user) return;

    setUploading(true);
    try {
      const match = matches.find((m) => m.id === selectedMatch);
      if (!match) return;

      // Split players into teams for results
      const teamA = match.currentPlayers.slice(0, match.teamSize);
      const teamB = match.currentPlayers.slice(match.teamSize);

      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`/api/matches/${selectedMatch}/results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          screenshot: screenshot,
          teamAScore: teamAScore,
          teamBScore: teamBScore,
          teamA: teamA,
          teamB: teamB,
          playerStats: playerStats,
        }),
      });

      if (response.ok) {
        // Reset form
        setSelectedMatch("");
        setScreenshot("");
        setTeamAScore(0);
        setTeamBScore(0);
        setPlayerStats([]);

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
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Загрузка панели администратора...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <TopNavigation user={user} />

      {/* Secondary Navigation */}
      <div className="border-b border-border/50 bg-background/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 items-center space-x-6">
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
            >
              🛡️ Матчи
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
              onClick={() => navigate("/admin/users")}
            >
              👥 Пользователи
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
            >
              <Settings className="h-4 w-4 mr-1" />
              Настройки
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
              onClick={async () => {
                try {
                  const response = await fetch("/api/telegram/test", {
                    method: "POST",
                  });
                  const result = await response.json();
                  alert(result.message);
                } catch (error) {
                  alert("Ошибка тестирования Telegram");
                }
              }}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Тест Телеграм
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-primary">
              🛡️ Управление матчами
            </h1>
            <p className="text-muted-foreground">
              Создание и управление игровыми матчами
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create Match */}
            <Card className="p-6 bg-card border-border/50 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Создать матч
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="matchName">Название матча</Label>
                  <Input
                    id="matchName"
                    value={matchName}
                    onChange={(e) => setMatchName(e.target.value)}
                    placeholder="Введите название матча"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="teamSize">Размер команды</Label>
                  <Select
                    value={teamSize.toString()}
                    onValueChange={(value) => setTeamSize(parseInt(value))}
                  >
                    <SelectTrigger className="mt-1">
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
                <div>
                  <Label htmlFor="adminId">ID Администратора в игре</Label>
                  <Input
                    id="adminId"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Введите ID админа в игре"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleCreateMatch}
                  disabled={creating || !matchName.trim() || !adminId.trim()}
                  className="w-full"
                >
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать матч
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Upload Results */}
            <Card className="p-6 bg-card border-border/50 rounded-xl">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Загрузить результаты
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="selectMatch">Выберите матч</Label>
                  <Select
                    value={selectedMatch}
                    onValueChange={setSelectedMatch}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Выберите матч" />
                    </SelectTrigger>
                    <SelectContent>
                      {matches
                        .filter((match) => match.status === "in_progress")
                        .map((match) => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teamAScore">Счет команды А</Label>
                    <Input
                      id="teamAScore"
                      type="number"
                      value={teamAScore}
                      onChange={(e) =>
                        setTeamAScore(parseInt(e.target.value) || 0)
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamBScore">Счет команды Б</Label>
                    <Input
                      id="teamBScore"
                      type="number"
                      value={teamBScore}
                      onChange={(e) =>
                        setTeamBScore(parseInt(e.target.value) || 0)
                      }
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="screenshot">Скриншот результатов</Label>
                  <Input
                    id="screenshot"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Статистика игроков</Label>
                    <Button
                      type="button"
                      onClick={handleAddPlayerStat}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Добавить
                    </Button>
                  </div>
                  {playerStats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 mb-2"
                    >
                      <Input
                        placeholder="ID игрока"
                        value={stat.userId}
                        onChange={(e) =>
                          handlePlayerStatChange(
                            index,
                            "userId",
                            e.target.value,
                          )
                        }
                        className="flex-1"
                      />
                      <Input
                        placeholder="Убийства"
                        type="number"
                        value={stat.kills}
                        onChange={(e) =>
                          handlePlayerStatChange(
                            index,
                            "kills",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-24"
                      />
                      <Input
                        placeholder="Смерти"
                        type="number"
                        value={stat.deaths}
                        onChange={(e) =>
                          handlePlayerStatChange(
                            index,
                            "deaths",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-24"
                      />
                      <Button
                        type="button"
                        onClick={() => handleRemovePlayerStat(index)}
                        size="sm"
                        variant="outline"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleUploadResults}
                  disabled={uploading || !selectedMatch}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Загрузить результаты
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          {/* Active Matches */}
          <Card className="p-6 bg-card border-border/50 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Активные матчи
            </h2>
            <div className="space-y-4">
              {matches.length > 0 ? (
                matches.map((match) => (
                  <Card
                    key={match.id}
                    className="p-4 border-border/50 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{match.name}</h3>
                        <div className="text-sm text-muted-foreground">
                          {match.teamSize}v{match.teamSize} •{" "}
                          {match.currentPlayers.length}/{match.maxPlayers}{" "}
                          игроков
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Создан:{" "}
                          {new Date(match.createdAt).toLocaleString("ru-RU")}
                        </div>
                        {match.createdBy && (
                          <div className="text-xs text-muted-foreground">
                            Админ в игре: {match.createdBy}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            match.status === "waiting"
                              ? "default"
                              : match.status === "in_progress"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {match.status === "waiting"
                            ? "Ожидание"
                            : match.status === "in_progress"
                              ? "В процессе"
                              : "Завершен"}
                        </Badge>
                        <Button
                          onClick={() => handleDeleteMatch(match.id)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
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
