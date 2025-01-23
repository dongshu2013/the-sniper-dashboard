'use server';

import { revalidatePath } from 'next/cache';
import { updateChatBlockStatus } from '@/lib/schema';

export async function updateBlockStatus(ids: number[], isBlocked: boolean) {
  await updateChatBlockStatus(ids, isBlocked);
  revalidatePath('/groups');
}
