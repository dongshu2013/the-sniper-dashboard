'use server';

import { revalidatePath } from 'next/cache';
import { updateTgLinkStatus, importTgLinks } from '@/lib/actions/tgLink';

export async function updateLinkStatus(ids: number[], status: string) {
  await updateTgLinkStatus(ids, status);
  revalidatePath('/links');
}

export async function importLinks(links: string[], source: string) {
  await importTgLinks(links, source);
  revalidatePath('/links');
}
