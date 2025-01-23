import 'server-only';

import { pgTable, timestamp, varchar, unique } from 'drizzle-orm/pg-core';
import { db, users } from '../schema';

export async function createAndUpdateUsers(params: {
  userKey: string;
  userKeyType?: string;
  username?: string;
  phone: string;
  lastName?: string;
  firstName?: string;
}) {
  const {
    userKey,
    userKeyType = 'tgId',
    username,
    phone,
    lastName,
    firstName
  } = params;

  try {
    console.log('....params', params);
    const result = await db
      .insert(users)
      .values({
        userKey,
        userKeyType,
        username,
        phone,
        lastName,
        firstName,
        updatedAt: new Date() // 确保更新时间
      })
      .onConflictDoUpdate({
        target: [users.userKey, users.userKeyType], // 组合唯一索引
        set: {
          username,
          phone,
          lastName,
          firstName,
          updatedAt: new Date()
        }
      })
      .returning();

    return result;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw new Error('Failed to create or update user.');
  }
}
