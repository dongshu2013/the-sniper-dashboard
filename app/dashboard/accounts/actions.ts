'use server';

import { revalidatePath } from 'next/cache';
import { createAccount as dbCreateAccount } from '@/lib/actions/account';

export async function createAccount(data: {
  tgId: string;
  username?: string;
  apiId: string;
  apiHash: string;
  phone: string;
  fullname?: string;
}) {
  await dbCreateAccount(data);
  revalidatePath('/accounts');
}
