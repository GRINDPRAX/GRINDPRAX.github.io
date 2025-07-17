export interface Match {
  id: string;
  name: string;
  teamSize: number; // от 2 до 5
  maxPlayers: number; // teamSize * 2
  currentPlayers: string[]; // массив ID игроков
  status: "waiting" | "in_progress" | "completed";
  createdBy: string; // ID админа
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  results?: MatchResults;
}

export interface PlayerStats {
  userId: string;
  kills: number;
  deaths: number;
}

export interface MatchResults {
  screenshot?: string; // base64 или URL скриншота
  teamAScore: number;
  teamBScore: number;
  teamA: string[]; // ID игроков команды A
  teamB: string[]; // ID игроков команды B
  playerStats: PlayerStats[]; // статистика игроков
  uploadedBy: string; // ID админа, который загрузил результаты
  uploadedAt: string;
}

export interface CreateMatchRequest {
  name: string;
  teamSize: number;
}

export interface JoinMatchRequest {
  matchId: string;
  userId: string;
}

export interface UploadResultsRequest {
  matchId: string;
  screenshot: string;
  teamAScore: number;
  teamBScore: number;
  teamA: string[];
  teamB: string[];
  playerStats: PlayerStats[];
}

export interface ChatMessage {
  id: string;
  matchId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}
