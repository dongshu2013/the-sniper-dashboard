'use server';

import { db, users } from '../schema';
import { getJWT } from '../jwt';

interface UserType {
  id: string;
  username?: string;
  first_name?: string;
  photo_url?: string;
  isAdmin?: boolean;
}

export async function createAndUpdateUsers({
  id,
  username,
  photo_url,
  first_name,
  isAdmin
}: UserType) {
  try {
    const result = await db
      .insert(users)
      .values({
        userId: id,
        username,
        photoUrl: photo_url,
        displayName: first_name,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
        isAdmin: isAdmin
      })
      .onConflictDoUpdate({
        target: users.userId, // 组合唯一索引
        set: {
          username,
          photoUrl: photo_url,
          displayName: first_name,
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          isAdmin: isAdmin
        }
      })
      .returning();

    return result.length > 0 ? result[0] : null; // 确保返回单个用户或 null
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw new Error('Failed to create or update user.');
  }
}

type EmailLoginType = {
  email: string;
  password: string;
};

export async function emailLogin({ email }: EmailLoginType) {
  try {
    const emailRes = await createAndUpdateUsers({
      id: email,
      username: email,
      isAdmin: true
    });

    // 临时注释掉 getJWT 调用，使用模拟 token
    const token = await getJWT({
      isAdmin: true,
      userId: emailRes?.id!,
      userKey: emailRes?.userId!,
      userKeyType: 'email'
    });

    // const mockToken = 'mock_token_' + Date.now();

    return {
      code: 0,
      data: {
        token: token,
        user: {
          userId: emailRes?.id || '',
          userKey: emailRes?.userId || '',
          userKeyType: 'email',
          isAdmin: true
        }
      }
    };
  } catch (error) {
    console.error('Error email user:', error);
    throw new Error('Failed to create or update user.');
  }
}
