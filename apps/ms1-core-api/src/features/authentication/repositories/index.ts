import { db } from "../../../db";
import { users, profiles } from "../../../db/schemas";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

type InsertUser = InferInsertModel<typeof users>;
type InsertProfile = InferInsertModel<typeof profiles>;

export async function createUser(data: Omit<InsertUser, "id" | "createdAt" | "updatedAt">) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  });
}

export async function getUserById(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

export async function updateUserLastLogin(userId: string) {
  await db.update(users).set({ lastLogin: new Date(), updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function createProfile(data: Omit<InsertProfile, "id" | "createdAt" | "updatedAt">) {
  const [profile] = await db.insert(profiles).values(data).returning();
  return profile;
}

export async function getProfileByUserId(userId: string) {
  return db.query.profiles.findFirst({
    where: eq(profiles.userId, userId),
  });
}

export async function updateProfileStage(userId: string, stage: string) {
  const [profile] = await db
    .update(profiles)
    .set({ currentStage: stage, updatedAt: new Date() })
    .where(eq(profiles.userId, userId))
    .returning();
  return profile;
}
