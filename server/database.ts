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
