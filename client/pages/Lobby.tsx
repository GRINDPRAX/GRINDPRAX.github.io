import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { UserProfile } from "@shared/user";
import { Match, ChatMessage } from "@shared/match";

export default function Lobby() {
  const navigate = useNavigate();
  const { matchId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is logged in
        const userData = localStorage.getItem("user");
        if (!userData) {
          navigate("/auth");
          return;
        }

        const userObj = JSON.parse(userData);
        setUser(userObj);

        // Load match data
        const matchResponse = await fetch(`/api/matches/${matchId}`);
        if (!matchResponse.ok) {
          navigate("/");
          return;
        }

        const matchData = await matchResponse.json();
        setMatch(matchData);

        // Check if user is in this match
        if (!matchData.currentPlayers.includes(userObj.id)) {
          navigate("/");
          return;
        }

        // Load players data
        const playersData = await Promise.all(
          matchData.currentPlayers.map(async (playerId: string) => {
            const playerResponse = await fetch(
              `/api/statistics/user/${playerId}`,
            );
            if (playerResponse.ok) {
              return await playerResponse.json();
            }
            return null;
          }),
        );

        setPlayers(playersData.filter(Boolean));

        // Load chat messages
        await loadMessages();
      } catch (err) {
        console.error("Error loading lobby data:", err);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/matches/${matchId}/chat`);
        if (response.ok) {
          const messagesData = await response.json();
          setMessages(messagesData);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    };

    loadData();

    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      loadData();
      loadMessages();
    }, 2000);

    return () => clearInterval(interval);
  }, [matchId, navigate]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !matchId) return;

    try {
      const response = await fetch(`/api/matches/${matchId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          message: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage("");
        // Messages will be updated by the polling
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleLeaveMatch = async () => {
    if (!user || !matchId) return;

    try {
      const response = await fetch(`/api/matches/${matchId}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (response.ok) {
        navigate("/");
      }
    } catch (err) {
      console.error("Error leaving match:", err);
    }
  };

  const getTeamA = () => players.slice(0, match?.teamSize || 0);
  const getTeamB = () =>
    players.slice(match?.teamSize || 0, (match?.teamSize || 0) * 2);

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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-foreground/60 hover:text-foreground hover:bg-muted/50"
              >
                ← Назад
              </Button>
              <div className="text-lg font-semibold text-primary">
                🎮 {match?.name}
              </div>
              <Badge variant="outline">
                {match?.currentPlayers.length}/{match?.maxPlayers}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLeaveMatch}
              >
                Покинуть матч
              </Button>
              {user && (
                <Badge
                  variant="secondary"
                  className="bg-primary text-primary-foreground rounded-md px-2 py-1"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Teams */}
          <div className="lg:col-span-2 space-y-6">
            {/* Match Info */}
            <Card className="p-6 bg-card border-border/50 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {match?.name}
                </h2>
                <Badge
                  variant={
                    match?.status === "waiting"
                      ? "secondary"
                      : match?.status === "in_progress"
                        ? "default"
                        : "outline"
                  }
                >
                  {match?.status === "waiting"
                    ? "Ожидание игроков"
                    : match?.status === "in_progress"
                      ? "В процессе"
                      : "Завершен"}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                Формат: {match?.teamSize}x{match?.teamSize} •{" "}
                {match?.currentPlayers.length}/{match?.maxPlayers} игроков
              </div>
            </Card>

            {/* Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Team A */}
              <Card className="p-6 bg-card border-border/50 rounded-xl">
                <h3 className="text-lg font-semibold text-blue-400 mb-4">
                  Команда A
                </h3>
                <div className="space-y-3">
                  {getTeamA().map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-muted/20"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {player.nickname.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {player.nickname}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Рейтинг: {player.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                  {Array.from({
                    length: (match?.teamSize || 0) - getTeamA().length,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-muted/10 border-2 border-dashed border-muted-foreground/30"
                    >
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm">
                        ?
                      </div>
                      <div className="text-muted-foreground">
                        Ожидание игрока...
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Team B */}
              <Card className="p-6 bg-card border-border/50 rounded-xl">
                <h3 className="text-lg font-semibold text-red-400 mb-4">
                  Команда B
                </h3>
                <div className="space-y-3">
                  {getTeamB().map((player, index) => (
                    <div
                      key={player.id}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-muted/20"
                    >
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {player.nickname.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {player.nickname}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Рейтинг: {player.rating}
                        </div>
                      </div>
                    </div>
                  ))}
                  {Array.from({
                    length: (match?.teamSize || 0) - getTeamB().length,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 rounded-lg bg-muted/10 border-2 border-dashed border-muted-foreground/30"
                    >
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-sm">
                        ?
                      </div>
                      <div className="text-muted-foreground">
                        Ожидание игрока...
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-card border-border/50 rounded-xl h-[600px] flex flex-col">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                💬 Чат лобби
              </h3>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-2 rounded-lg ${
                      message.userId === user?.id
                        ? "bg-primary/20 ml-4"
                        : "bg-muted/20 mr-4"
                    }`}
                  >
                    <div className="text-xs text-muted-foreground mb-1">
                      {message.userName} •{" "}
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-foreground">
                      {message.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Отправить
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
