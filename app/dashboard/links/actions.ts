'use server';

import { revalidatePath } from 'next/cache';
import { updateTgLinkStatus, importTgLinks } from '@/lib/db';

export async function updateLinkStatus(ids: number[], status: string) {
  await updateTgLinkStatus(ids, status);
  revalidatePath('/links');
}

export async function importLinks(links: string[]) {
  await importTgLinks(links);
  revalidatePath('/links');
}
