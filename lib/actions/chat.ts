import 'server-only';

import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  jsonb,
  boolean,
  varchar
} from 'drizzle-orm/pg-core';
import {
  count,
  eq,
  ilike,
  inArray,
  or,
  and,
  sql,
  asc,
  desc
} from 'drizzle-orm';
import {
  db,
  chatMetadata,
  ChatMetadata,
  accounts,
  accountChat
} from '../schema';
import { SortDirection } from '@/components/ui/filterable-table-header';

export type ChatWithAccounts = ChatMetadata & {
  accountTgIds: string[];
  accountUsername: string | null;
};

export async function getChatMetadata(
  search: string,
  offset: number,
  isBlocked?: boolean,
  pageSize: number = 20
): Promise<{
  chats: ChatMetadata[];
  totalChats: number;
}> {
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(chatMetadata.name, `%${search}%`),
        ilike(chatMetadata.username, `%${search}%`)
      )
    );
  }

  if (isBlocked !== undefined) {
    conditions.push(eq(chatMetadata.isBlocked, isBlocked));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalChats = await db
    .select({ count: count() })
    .from(chatMetadata)
    .where(whereClause);

  const chats = await db
    .select()
    .from(chatMetadata)
    .where(whereClause)
    .limit(pageSize)
    .offset(offset);

  return {
    chats,
    totalChats: totalChats[0].count
  };
}

export async function updateChatBlockStatus(ids: number[], isBlocked: boolean) {
  await db
    .update(chatMetadata)
    .set({
      isBlocked,
      updatedAt: new Date()
    })
    .where(inArray(chatMetadata.id, ids));
}

export async function getChatMetadataById(
  chatId: string
): Promise<ChatMetadata | null> {
  const result = await db
    .select()
    .from(chatMetadata)
    .where(eq(chatMetadata.chatId, chatId))
    .limit(1);

  return result[0] || null;
}

export async function getChatMetadataWithAccountsByChatId(
  chatId: string
): Promise<ChatWithAccounts | null> {
  const result = await db
    .select({
      id: chatMetadata.id,
      chatId: chatMetadata.chatId,
      name: chatMetadata.name,
      about: chatMetadata.about,
      username: chatMetadata.username,
      participantsCount: chatMetadata.participantsCount,
      pinnedMessages: chatMetadata.pinnedMessages,
      initialMessages: chatMetadata.initialMessages,
      category: chatMetadata.category,
      entity: chatMetadata.entity,
      qualityScore: chatMetadata.qualityScore,
      isBlocked: chatMetadata.isBlocked,
      isPrivate: chatMetadata.isPrivate,
      photo: chatMetadata.photo,
      createdAt: chatMetadata.createdAt,
      updatedAt: chatMetadata.updatedAt,
      accountUsername: sql<string | null>`(array_agg(${accounts.username}))[1]`,
      accountTgIds: sql<string[]>`
        COALESCE(
          array_agg(${accounts.tgId}) FILTER (WHERE ${accounts.tgId} IS NOT NULL),
          ARRAY[]::text[]
        )
      `
    })
    .from(chatMetadata)
    .leftJoin(accountChat, eq(chatMetadata.chatId, accountChat.chatId))
    .leftJoin(accounts, eq(accountChat.accountId, accounts.tgId))
    .where(eq(chatMetadata.chatId, chatId))
    .groupBy(chatMetadata.id)
    .limit(1);

  return result[0] || null;
}

export async function getChatMetadataWithAccounts(
  search: string,
  offset: number,
  isBlocked?: boolean,
  pageSize: number = 20,
  sortColumn?: string,
  sortDirection?: SortDirection,
  categories?: string[],
  filters?: Record<string, string>,
  accountTgIds?: string[],
  isPrivate?: boolean
): Promise<{
  chats: ChatWithAccounts[];
  totalChats: number;
}> {
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(chatMetadata.name, `%${search}%`),
        ilike(chatMetadata.username, `%${search}%`)
      )
    );
  }

  if (categories && categories.length > 0) {
    conditions.push(inArray(chatMetadata.category, categories));
  }

  if (isBlocked !== undefined) {
    conditions.push(eq(chatMetadata.isBlocked, isBlocked));
  }

  if (isPrivate !== undefined) {
    conditions.push(eq(chatMetadata.isPrivate, isPrivate));
  }

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;

      if (key.includes('.')) {
        const [parent, child] = key.split('.');
        if (parent in chatMetadata) {
          conditions.push(
            sql`${chatMetadata[parent as keyof typeof chatMetadata]}->>'${child}' ILIKE ${`%${value}%`}`
          );
        }
      } else if (key in chatMetadata) {
        const column = chatMetadata[key as keyof typeof chatMetadata];
        conditions.push(sql`${column}::text ILIKE ${`%${value}%`}`);
      }
    });
  }

  if (accountTgIds && accountTgIds.length > 0) {
    conditions.push(
      sql`EXISTS (
        SELECT 1 FROM ${accountChat}
        WHERE ${accountChat.chatId} = ${chatMetadata.chatId}
        AND ${accountChat.accountId} IN (${sql.join(accountTgIds, ',')})
      )`
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalChats = await db
    .select({ count: count() })
    .from(chatMetadata)
    .where(whereClause);

  let query = db
    .select({
      id: chatMetadata.id,
      chatId: chatMetadata.chatId,
      name: chatMetadata.name,
      about: chatMetadata.about,
      username: chatMetadata.username,
      participantsCount: chatMetadata.participantsCount,
      category: chatMetadata.category,
      entity: chatMetadata.entity,
      qualityScore: chatMetadata.qualityScore,
      isBlocked: chatMetadata.isBlocked,
      photo: chatMetadata.photo,
      createdAt: chatMetadata.createdAt,
      updatedAt: chatMetadata.updatedAt,
      accountUsername: sql<string | null>`(array_agg(${accounts.username}))[1]`,
      accountTgIds: sql<string[]>`
        COALESCE(
          array_agg(${accounts.tgId}) FILTER (WHERE ${accounts.tgId} IS NOT NULL),
          ARRAY[]::text[]
        )
      `
    })
    .from(chatMetadata)
    .leftJoin(accountChat, eq(chatMetadata.chatId, accountChat.chatId))
    .leftJoin(accounts, eq(accountChat.accountId, accounts.tgId))
    .where(whereClause)
    .groupBy(chatMetadata.id);

  if (sortColumn && sortDirection) {
    const sortColumnMap: Record<string, any> = {
      name: chatMetadata.name,
      about: chatMetadata.about,
      participantsCount: chatMetadata.participantsCount,
      category: chatMetadata.category,
      'entity.name': sql`${chatMetadata.entity}->>'name'`,
      qualityScore: chatMetadata.qualityScore,
      isBlocked: chatMetadata.isBlocked,
      createdAt: chatMetadata.createdAt
    };

    const column = sortColumnMap[sortColumn];
    if (column) {
      const orderByConfig =
        sortDirection === 'asc' ? asc(column) : desc(column);
      const chatsWithAccounts = await query
        .orderBy(orderByConfig)
        .limit(pageSize)
        .offset(offset);
      return {
        chats: chatsWithAccounts as ChatWithAccounts[],
        totalChats: totalChats[0].count
      };
    }
  }

  const chatsWithAccounts = await query
    .orderBy(asc(chatMetadata.createdAt))
    .limit(pageSize)
    .offset(offset);
  return {
    chats: chatsWithAccounts as ChatWithAccounts[],
    totalChats: totalChats[0].count
  };
}
