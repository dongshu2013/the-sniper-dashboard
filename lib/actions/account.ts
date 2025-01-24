import 'server-only';

import { count, eq, ilike, inArray, or, and, desc } from 'drizzle-orm';
import { db, accounts, Account, ChatMetadata, userAccounts } from '../schema';

export async function getAccounts({
  search,
  offset,
  status,
  pageSize
}:
  {
    search: string | undefined,
    offset: number,
    status: string,
    pageSize: number
  }
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

  if (status && status.trim().length > 0) {
    conditions.push(eq(accounts.status, status));
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
  userId: string
}) {
  const [newAccount] = await db
    .insert(accounts)
    .values({
      ...data,
      status: 'active',
      lastActiveAt: new Date(),
      updatedAt: new Date()
    })
    .returning({ accountId: accounts.id });

  if (!newAccount) {
    throw new Error('Failed to create account');
  }

  await db.insert(userAccounts).values({
    userId: data.userId.toString(),
    accountId: newAccount.accountId.toString(),
    status: 'active',
    updatedAt: new Date(),
    createdAt: new Date()
  });

  return newAccount;
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
