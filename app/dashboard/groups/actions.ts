'use server';

import { revalidatePath } from 'next/cache';
import { updateChatBlockStatus } from '@/lib/actions/chat';
import { chatMetadata, db } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function updateBlockStatus(ids: number[], isBlocked: boolean) {
  await updateChatBlockStatus(ids, isBlocked);
  revalidatePath('/groups');
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
