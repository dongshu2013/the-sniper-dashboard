'use server';

import { revalidatePath } from 'next/cache';
import { updateChatBlockStatus } from '@/lib/actions/chat';
import { chatMetadata, db } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';

export async function updateBlockStatus(ids: number[], isBlocked: boolean) {
  try {
    await db
      .update(chatMetadata)
      .set({
        isBlocked,
        updatedAt: new Date()
      })
      .where(inArray(chatMetadata.id, ids));
    return { success: true };
  } catch (error) {
    console.error('Failed to update block status:', error);
    return { success: false, error: 'Failed to update block status' };
  }
}

export async function updateCategory(chatId: number, category: string) {
  try {
    await db
      .update(chatMetadata)
      .set({ category })
      .where(eq(chatMetadata.id, chatId));
    return { success: true };
  } catch (error) {
    console.error('Failed to update category:', error);
    return { success: false, error: 'Failed to update category' };
  }
}

export async function updatePrivateStatus(ids: number[], isPrivate: boolean) {
  try {
    await db
      .update(chatMetadata)
      .set({
        isPrivate,
        updatedAt: new Date()
      })
      .where(inArray(chatMetadata.id, ids));
    return { success: true };
  } catch (error) {
    console.error('Failed to update private status:', error);
    return { success: false, error: 'Failed to update private status' };
  }
}
