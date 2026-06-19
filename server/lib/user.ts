import { randomUUID } from "node:crypto";

export interface User {
  id: string;
  email: string;
  password: string;
  roles: string[];
}

interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
  firstAttempt: number;
}

const users: User[] = [
  {
    id: "41dbc5f7-9a4e-42e6-832b-1d3dd8c7c4b6",
    email: "admin@gmail.com",
    password: "$argon2id$v=19$m=19456,t=2,p=1$d39TKJ2+/qO+d5zjUfpp+A$z/ZBaHVbCfYQT/fSrpz8dc3Kz/rox7oEB7hLGeZzVLU",
    roles: ["ADMIN"],
  },
  {
    id: "d0065700-1707-4ad9-811b-8bbed0364318",
    email: "user@gmail.com",
    password: "$argon2id$v=19$m=19456,t=2,p=1$d39TKJ2+/qO+d5zjUfpp+A$z/ZBaHVbCfYQT/fSrpz8dc3Kz/rox7oEB7hLGeZzVLU",
    roles: ["USER"],
  },
];

const loginAttempts = new Map<string, LoginAttempt>();

export const activeSessions = new Map<string, Set<string>>();

export async function findAllUsers() {
  return users;
}

export async function findUserByEmail(email: string) {
  return users.find((user) => user.email === email);
}

export async function findUserById(id: string) {
  return users.find((user) => user.id === id);
}

export function isAdmin(user?: User) {
  return !!(user && user.roles.includes("ADMIN"));
}

export async function createUser(email: string, password: string) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return null;
  }

  const newUser: User = {
    id: randomUUID(),
    email,
    password,
    roles: ["USER"],
  };

  users.push(newUser);
  return newUser;
}

export async function deleteUserById(id: string) {
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) {
    return false;
  }

  users.splice(index, 1);

  activeSessions.delete(id);

  return true;
}

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function recordFailedLogin(email: string) {
  const now = Date.now();
  const existing = loginAttempts.get(email);

  if (!existing || now - existing.firstAttempt > FIVE_MINUTES_MS) {
    loginAttempts.set(email, {
      count: 1,
      lockedUntil: null,
      firstAttempt: now,
    });
    return { locked: false };
  }

  existing.count += 1;

  if (existing.count >= MAX_ATTEMPTS) {
    existing.lockedUntil = now + FIVE_MINUTES_MS;
    return { locked: true };
  }

  return { locked: false };
}

export async function isAccountLocked(email: string) {
  const attempt = loginAttempts.get(email);
  if (!attempt || !attempt.lockedUntil) {
    return false;
  }

  if (Date.now() > attempt.lockedUntil) {
    loginAttempts.delete(email);
    return false;
  }

  return true;
}

export async function resetLoginAttempts(email: string) {
  loginAttempts.delete(email);
}
