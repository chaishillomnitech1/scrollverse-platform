/**
 * Database module stub
 * In production, this would connect to the actual database.
 * For now, we provide stub implementations that satisfy the OAuth flow.
 */

import type { User, InsertUser } from "../drizzle/schema";

// In-memory user store for development
const userStore = new Map<string, User>();
let nextUserId = 1;

/**
 * Upsert user (create or update)
 * This is called during OAuth callback
 */
export async function upsertUser(
  data: Partial<InsertUser> & { openId: string }
): Promise<User> {
  const existing = userStore.get(data.openId);

  if (existing) {
    // Update existing user
    const updated: User = {
      ...existing,
      name: data.name ?? existing.name,
      email: data.email ?? existing.email,
      loginMethod: data.loginMethod ?? existing.loginMethod,
      lastSignedIn: data.lastSignedIn ?? existing.lastSignedIn,
      updatedAt: new Date(),
    };
    userStore.set(data.openId, updated);
    return updated;
  } else {
    // Create new user
    const newUser: User = {
      id: nextUserId++,
      openId: data.openId,
      name: data.name || null,
      email: data.email || null,
      loginMethod: data.loginMethod || null,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: data.lastSignedIn || new Date(),
    };
    userStore.set(data.openId, newUser);
    return newUser;
  }
}

/**
 * Get user by OpenID
 */
export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  return userStore.get(openId);
}
