import fs from "fs";
import path from "path";
import { User, UserProfile } from "@shared/user";

const DB_FILE = path.join(process.cwd(), "users.json");

interface Database {
  users: User[];
}

// Инициализация БД
function initDatabase(): Database {
  if (!fs.existsSync(DB_FILE)) {
    const initialDb: Database = {
      users: [
        {
          id: "1",
          email: "demo@example.com",
          nickname: "DemoUser",
          password: "demo123", // В реальном проекте должен быть хэширован
          avatar: "",
          rating: 1250,
          kd: 1.35,
          registrationDate: "2024-01-15T10:30:00Z",
          status: "Игрок",
          level: 15,
          wins: 45,
          losses: 33,
          totalMatches: 78,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "2",
          email: "pro@example.com",
          nickname: "ProGamer",
          password: "pro123",
          avatar: "",
          rating: 2100,
          kd: 2.8,
          registrationDate: "2023-12-01T08:00:00Z",
          status: "Элитный игрок",
          level: 35,
          wins: 150,
          losses: 45,
          totalMatches: 195,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "3",
          email: "newbie@example.com",
          nickname: "Новичок123",
          password: "newbie123",
          avatar: "",
          rating: 800,
          kd: 0.7,
          registrationDate: "2024-02-10T14:20:00Z",
          status: "Новичок",
          level: 5,
          wins: 12,
          losses: 18,
          totalMatches: 30,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "4",
          email: "veteran@example.com",
          nickname: "Ветеран",
          password: "veteran123",
          avatar: "",
          rating: 1800,
          kd: 2.1,
          registrationDate: "2023-06-15T09:15:00Z",
          status: "Ветеран",
          level: 28,
          wins: 89,
          losses: 42,
          totalMatches: 131,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "5",
          email: "legend@example.com",
          nickname: "Легенда",
          password: "legend123",
          avatar: "",
          rating: 2500,
          kd: 3.2,
          registrationDate: "2023-01-01T00:00:00Z",
          status: "Легенда",
          level: 50,
          wins: 200,
          losses: 25,
          totalMatches: 225,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "6",
          email: "casual@example.com",
          nickname: "КасуалПлеер",
          password: "casual123",
          avatar: "",
          rating: 1100,
          kd: 1.1,
          registrationDate: "2024-01-20T16:45:00Z",
          status: "Игрок",
          level: 12,
          wins: 25,
          losses: 23,
          totalMatches: 48,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "7",
          email: "skilled@example.com",
          nickname: "СкилледШутер",
          password: "skilled123",
          avatar: "",
          rating: 1650,
          kd: 1.9,
          registrationDate: "2023-11-05T12:30:00Z",
          status: "Опытный игрок",
          level: 22,
          wins: 68,
          losses: 35,
          totalMatches: 103,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "8",
          email: "expert@example.com",
          nickname: "ЭкспертПро",
          password: "expert123",
          avatar: "",
          rating: 1950,
          kd: 2.4,
          registrationDate: "2023-08-12T07:20:00Z",
          status: "Эксперт",
          level: 31,
          wins: 120,
          losses: 50,
          totalMatches: 170,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "9",
          email: "rookie@example.com",
          nickname: "РукиНоги",
          password: "rookie123",
          avatar: "",
          rating: 600,
          kd: 0.5,
          registrationDate: "2024-02-25T18:10:00Z",
          status: "Новичок",
          level: 3,
          wins: 5,
          losses: 15,
          totalMatches: 20,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "10",
          email: "champion@example.com",
          nickname: "Чемпион2024",
          password: "champion123",
          avatar: "",
          rating: 2800,
          kd: 4.1,
          registrationDate: "2022-12-01T10:00:00Z",
          status: "Чемпион",
          level: 60,
          wins: 300,
          losses: 15,
          totalMatches: 315,
          lastLogin: new Date().toISOString(),
        },
        {
          id: "admin1",
          email: "admin@example.com",
          nickname: "Администратор",
          password: "admin123",
          avatar: "",
          rating: 9999,
          kd: 999.9,
          registrationDate: "2022-01-01T00:00:00Z",
          status: "Адм��нистратор",
          level: 99,
          wins: 0,
          losses: 0,
          totalMatches: 0,
          lastLogin: new Date().toISOString(),
        },
      ],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }

  const data = fs.readFileSync(DB_FILE, "utf8");
  return JSON.parse(data);
}

function saveDatabase(db: Database): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function getAllUsers(): User[] {
  const db = initDatabase();
  return db.users;
}

export function getUserById(id: string): User | null {
  const db = initDatabase();
  return db.users.find((user) => user.id === id) || null;
}

export function getUserByEmail(email: string): User | null {
  const db = initDatabase();
  return db.users.find((user) => user.email === email) || null;
}

export function createUser(userData: Omit<User, "id">): User {
  const db = initDatabase();

  // Проверяем, что пользователь с таким email не существует
  if (getUserByEmail(userData.email)) {
    throw new Error("Пользователь с таким email уже существует");
  }

  const newUser: User = {
    ...userData,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
  };

  db.users.push(newUser);
  saveDatabase(db);

  return newUser;
}

export function updateUser(id: string, updates: Partial<User>): User | null {
  const db = initDatabase();
  const userIndex = db.users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return null;
  }

  db.users[userIndex] = { ...db.users[userIndex], ...updates };
  saveDatabase(db);

  return db.users[userIndex];
}

export function deleteUser(id: string): boolean {
  const db = initDatabase();
  const userIndex = db.users.findIndex((user) => user.id === id);

  if (userIndex === -1) {
    return false;
  }

  db.users.splice(userIndex, 1);
  saveDatabase(db);

  return true;
}

export function userToProfile(user: User): UserProfile {
  const { password, ...profile } = user;
  return profile;
}
