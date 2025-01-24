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
      photo: chatMetadata.photo,
      createdAt: chatMetadata.createdAt,
      updatedAt: chatMetadata.updatedAt,
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
  categories?: string[]
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

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // const orderByClause =
  //   orderBy === 'qualityReports'
  //     ? orderByDirection === 'asc'
  //       ? asc(
  //           sql`(SELECT ROUND(AVG((report->>'score')::numeric)) FROM jsonb_array_elements(quality_reports) AS report WHERE report->>'score' IS NOT NULL)`
  //         )
  //       : desc(
  //           sql`(SELECT ROUND(AVG((report->>'score')::numeric)) FROM jsonb_array_elements(quality_reports) AS report WHERE report->>'score' IS NOT NULL)`
  //         )
  //     : orderBy
  //       ? orderByDirection === 'asc'
  //         ? asc(chatMetadata[orderBy])
  //         : desc(chatMetadata[orderBy])
  //       : asc(chatMetadata.createdAt);

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
      entity: chatMetadata.entity,
      qualityScore: chatMetadata.qualityScore,
      isBlocked: chatMetadata.isBlocked,
      photo: chatMetadata.photo,
      createdAt: chatMetadata.createdAt,
      updatedAt: chatMetadata.updatedAt,
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

  // Default or no sort column case
  const chatsWithAccounts = await query
    .orderBy(asc(chatMetadata.createdAt))
    .limit(pageSize)
    .offset(offset);
  return {
    chats: chatsWithAccounts as ChatWithAccounts[],
    totalChats: totalChats[0].count
  };
}
