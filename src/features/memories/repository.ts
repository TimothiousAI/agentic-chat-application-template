import { desc, eq } from "drizzle-orm";

import { db } from "@/core/database/client";

import type { Memory, NewMemory } from "./models";
import { memories } from "./models";

export async function createMemory(data: NewMemory): Promise<Memory> {
  const results = await db.insert(memories).values(data).returning();
  const memory = results[0];
  if (!memory) {
    throw new Error("Failed to create memory");
  }
  return memory;
}

export async function findAllMemories(): Promise<Memory[]> {
  return db.select().from(memories).orderBy(desc(memories.createdAt));
}

export async function findMemoriesByCategory(category: string): Promise<Memory[]> {
  return db
    .select()
    .from(memories)
    .where(eq(memories.category, category))
    .orderBy(desc(memories.createdAt));
}

export async function deleteMemory(id: string): Promise<boolean> {
  const results = await db.delete(memories).where(eq(memories.id, id)).returning();
  return results.length > 0;
}
