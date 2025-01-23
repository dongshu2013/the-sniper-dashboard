import 'server-only';

import { pgTable, timestamp, varchar, unique } from 'drizzle-orm/pg-core';
import { db, users } from '../schema';

interface UserType {
  id: string;
  username?: string;
  first_name?: string;
  photo_url?: string;
}

export async function createAndUpdateUsers({
  id,
  username,
  photo_url,
  first_name
}: UserType) {
  try {
    const result = await db
      .insert(users)
      .values({
        userId: id,
        username,
        photoUrl: photo_url,
        displayName: first_name,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      })
      .onConflictDoUpdate({
        target: users.userId, // 组合唯一索引
        set: {
          username,
          photoUrl: photo_url,
          displayName: first_name,
          updatedAt: new Date(),
          lastLoginAt: new Date()
        }
      })
      .returning();

    return result.length > 0 ? result[0] : null; // 确保返回单个用户或 null
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw new Error('Failed to create or update user.');
  }
}
