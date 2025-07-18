import fs from "fs";
import path from "path";
import { Match, MatchResults, ChatMessage } from "@shared/match";

const MATCHES_FILE = path.join(process.cwd(), "matches.json");
const CHAT_FILE = path.join(process.cwd(), "chat.json");

interface MatchDatabase {
  matches: Match[];
}

interface ChatDatabase {
  messages: ChatMessage[];
}

// Инициализация БД матчей
function initMatchDatabase(): MatchDatabase {
  if (!fs.existsSync(MATCHES_FILE)) {
    const initialDb: MatchDatabase = {
      matches: [],
    };
    fs.writeFileSync(MATCHES_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }

  const data = fs.readFileSync(MATCHES_FILE, "utf8");
  return JSON.parse(data);
}

// Инициализация БД чата
function initChatDatabase(): ChatDatabase {
  if (!fs.existsSync(CHAT_FILE)) {
    const initialDb: ChatDatabase = {
      messages: [],
    };
    fs.writeFileSync(CHAT_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }

  const data = fs.readFileSync(CHAT_FILE, "utf8");
  return JSON.parse(data);
}

function saveMatchDatabase(db: MatchDatabase): void {
  fs.writeFileSync(MATCHES_FILE, JSON.stringify(db, null, 2));
}

function saveChatDatabase(db: ChatDatabase): void {
  fs.writeFileSync(CHAT_FILE, JSON.stringify(db, null, 2));
}

// Функции для работы с матчами
export function getAllMatches(): Match[] {
  const db = initMatchDatabase();
  return db.matches;
}

export function getMatchById(id: string): Match | null {
  const db = initMatchDatabase();
  return db.matches.find((match) => match.id === id) || null;
}

export function createMatch(matchData: Omit<Match, "id" | "createdAt">): Match {
  const db = initMatchDatabase();

  const newMatch: Match = {
    ...matchData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    createdAt: new Date().toISOString(),
  };

  db.matches.push(newMatch);
  saveMatchDatabase(db);

  return newMatch;
}

export function updateMatch(id: string, updates: Partial<Match>): Match | null {
  const db = initMatchDatabase();
  const matchIndex = db.matches.findIndex((match) => match.id === id);

  if (matchIndex === -1) {
    return null;
  }

  db.matches[matchIndex] = { ...db.matches[matchIndex], ...updates };
  saveMatchDatabase(db);

  return db.matches[matchIndex];
}

export function joinMatch(matchId: string, userId: string): Match | null {
  const match = getMatchById(matchId);
  if (!match) return null;

  if (match.currentPlayers.includes(userId)) {
    return match; // Игрок уже в матче
  }

  if (match.currentPlayers.length >= match.maxPlayers) {
    return null; // Матч полный
  }

  const updatedPlayers = [...match.currentPlayers, userId];
  return updateMatch(matchId, { currentPlayers: updatedPlayers });
}

export function leaveMatch(matchId: string, userId: string): Match | null {
  const match = getMatchById(matchId);
  if (!match) return null;

  const updatedPlayers = match.currentPlayers.filter((id) => id !== userId);
  return updateMatch(matchId, { currentPlayers: updatedPlayers });
}

export function uploadMatchResults(
  matchId: string,
  results: MatchResults,
): Match | null {
  return updateMatch(matchId, {
    results,
    status: "completed",
    completedAt: new Date().toISOString(),
  });
}

// Функции для работы с чатом
export function getMatchMessages(matchId: string): ChatMessage[] {
  const db = initChatDatabase();
  return db.messages.filter((message) => message.matchId === matchId);
}

export function addChatMessage(
  messageData: Omit<ChatMessage, "id" | "timestamp">,
): ChatMessage {
  const db = initChatDatabase();

  const newMessage: ChatMessage = {
    ...messageData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
    timestamp: new Date().toISOString(),
  };

  db.messages.push(newMessage);
  saveChatDatabase(db);

  return newMessage;
}

export function deleteMatch(id: string): boolean {
  const db = initMatchDatabase();
  const matchIndex = db.matches.findIndex((match) => match.id === id);

  if (matchIndex === -1) {
    return false;
  }

  db.matches.splice(matchIndex, 1);
  saveMatchDatabase(db);

  // Удаляем сообщения чата для этого матча
  const chatDb = initChatDatabase();
  chatDb.messages = chatDb.messages.filter((msg) => msg.matchId !== id);
  saveChatDatabase(chatDb);

  return true;
}
