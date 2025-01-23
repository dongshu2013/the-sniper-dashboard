import 'server-only';

import { pgTable, timestamp, serial, varchar } from 'drizzle-orm/pg-core';
import { count, eq, ilike, inArray, or, and, desc } from 'drizzle-orm';
import { db, accounts, Account, ChatMetadata } from '../schema';

export async function getAccounts(
  search: string,
  offset: number,
  status?: string[],
  pageSize: number = 20
): Promise<{
  accounts: Account[];
  totalAccounts: number;
}> {
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(accounts.username, `%${search}%`),
        ilike(accounts.tgId, `%${search}%`),
        ilike(accounts.phone, `%${search}%`)
      )
    );
  }

  if (status && status.length > 0) {
    conditions.push(inArray(accounts.status, status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalAccounts = await db
    .select({ count: count() })
    .from(accounts)
    .where(whereClause);

  const accountsList = await db
    .select()
    .from(accounts)
    .where(whereClause)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(accounts.lastActiveAt));

  return {
    accounts: accountsList,
    totalAccounts: totalAccounts[0].count
  };
}

export async function createAccount(data: {
  tgId: string;
  username?: string;
  apiId: string;
  apiHash: string;
  phone: string;
  fullname?: string;
}) {
  await db.insert(accounts).values({
    ...data,
    status: 'active',
    lastActiveAt: new Date(),
    updatedAt: new Date()
  });
}

export async function updateAccountStatus(ids: number[], status: string) {
  await db
    .update(accounts)
    .set({
      status,
      updatedAt: new Date()
    })
    .where(inArray(accounts.id, ids));
}

export async function getAccountById(id: number): Promise<Account | null> {
  const result = await db
    .select()
    .from(accounts)
    .where(eq(accounts.id, id))
    .limit(1);

  return result[0] || null;
}

export async function updateAccountLastActive(id: number) {
  await db
    .update(accounts)
    .set({
      lastActiveAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(accounts.id, id));
}

export type ChatWithAccounts = ChatMetadata & {
  accounts: { username: string | null }[];
};
