import 'server-only';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  pgTable,
  text,
  integer,
  timestamp,
  pgEnum,
  serial,
  jsonb,
  boolean,
  varchar,
  unique
} from 'drizzle-orm/pg-core';
import {
  count,
  eq,
  ilike,
  inArray,
  or,
  and,
  desc,
  sql,
  asc
} from 'drizzle-orm';
import { z } from 'zod';
import { TgLinkStatus, Entity, QualityReport } from './types';
import { customAlphabet } from 'nanoid';
import { SortDirection } from '@/components/ui/filterable-table-header';

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

export const tgLinkStatusEnum = pgEnum(
  'tg_link_status',
  Object.values(TgLinkStatus) as [string, ...string[]]
);

export const tgLinks = pgTable('tg_link_status', {
  id: serial('id').primaryKey(),
  tgLink: text('tg_link').notNull(),
  source: text('source'),
  chatId: varchar('chat_id', { length: 255 }),
  chatName: varchar('chat_name', { length: 255 }),
  status: varchar('status', { length: 255 }).default('pending_pre_processing'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  markName: varchar('mark_name', { length: 255 })
});

export type TgLink = typeof tgLinks.$inferSelect;

export const importLinkSchema = z.object({
  tgLink: z.string().url()
});

export async function getTgLinks(
  search: string,
  offset: number,
  statuses?: string[],
  pageSize: number = 20
): Promise<{
  links: TgLink[];
  totalLinks: number;
}> {
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(tgLinks.tgLink, `%${search}%`),
        ilike(tgLinks.chatName, `%${search}%`)
      )
    );
  }

  if (statuses && statuses.length > 0) {
    conditions.push(inArray(tgLinks.status, statuses));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const totalLinks = await db
    .select({ count: count() })
    .from(tgLinks)
    .where(whereClause);

  const links = await db
    .select()
    .from(tgLinks)
    .where(whereClause)
    .limit(pageSize)
    .offset(offset);

  return {
    links,
    totalLinks: totalLinks[0].count
  };
}

// Create a generator that uses readable characters to generate a 4-digit random string
const generateMarkName = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 4);

export async function updateTgLinkStatus(ids: number[], status: string) {
  await db
    .update(tgLinks)
    .set({
      status,
      processedAt: status === TgLinkStatus.PROCESSED ? new Date() : null,
      markName: status === TgLinkStatus.PROCESSING ? generateMarkName() : null
    })
    .where(inArray(tgLinks.id, ids));
}

export async function importTgLinks(
  links: string[],
  source: string = 'manual'
) {
  const values = links.map((link) => ({
    tgLink: link,
    source,
    status: TgLinkStatus.PENDING_PRE_PROCESSING
  }));

  await db
    .insert(tgLinks)
    .values(values)
    .onConflictDoNothing({ target: tgLinks.tgLink });
}

export const chatMetadata = pgTable('chat_metadata', {
  id: serial('id').primaryKey(),
  chatId: varchar('chat_id', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).default(''),
  about: text('about').default(''),
  username: varchar('username', { length: 255 }).default(''),
  participantsCount: integer('participants_count').default(0),
  entity: jsonb('entity').$type<Entity | null>(),
  qualityReports: jsonb('quality_reports')
    .$type<QualityReport[]>()
    .default(sql`'[]'::jsonb`),
  isBlocked: boolean('is_blocked').default(false),
  photo: jsonb('photo').default('{}'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type ChatMetadata = typeof chatMetadata.$inferSelect;

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

// accounts table

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  tgId: varchar('tg_id', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }),
  apiId: varchar('api_id', { length: 255 }).notNull(),
  apiHash: varchar('api_hash', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 255 }).notNull(),
  status: varchar('status', { length: 255 }).default('active'),
  fullname: varchar('fullname', { length: 255 }),
  lastActiveAt: timestamp('last_active_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type Account = typeof accounts.$inferSelect;

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

export async function getChatMetadataWithAccounts(
  search: string,
  offset: number,
  isBlocked?: boolean,
  pageSize: number = 20,
  sortColumn?: string,
  sortDirection?: SortDirection
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
      qualityReports: chatMetadata.qualityReports,
      isBlocked: chatMetadata.isBlocked,
      photo: chatMetadata.photo,
      createdAt: chatMetadata.createdAt,
      updatedAt: chatMetadata.updatedAt,
      accounts: sql<{ username: string | null }[]>`
        COALESCE(
          json_agg(
            json_build_object(
              'username', ${accounts.username}
            )
          ) FILTER (WHERE ${accounts.username} IS NOT NULL),
          '[]'
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
      // TODO fix: if lose score, result is 0
      qualityReports: sql`(
        SELECT COALESCE(
          AVG((value->>'score')::numeric),
          0
        )
        FROM jsonb_array_elements(${chatMetadata.qualityReports})
      )`,
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

export const accountChat = pgTable('account_chat', {
  id: serial('id').primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  chatId: varchar('chat_id', { length: 255 }).notNull(),
  status: varchar('status', { length: 255 }).default('watching'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }),
  photoUrl: varchar('photo_url', { length: 255 }).notNull(),
  displayName: varchar('display_name', { length: 255 }),
  isAdmin: varchar('is_admin', { length: 255 }),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type User = typeof users.$inferSelect;

export async function createAndUpdateUsers(params: {
  userKey: string;
  userKeyType?: string;
  username?: string;
  phone: string;
  lastName?: string;
  firstName?: string;
}) {
  const {
    userKey,
    userKeyType = 'tgId',
    username,
    phone,
    lastName,
    firstName
  } = params;

  try {
    console.log('....params', params);
    const result = await db
      .insert(users)
      .values({
        userKey,
        userKeyType,
        username,
        phone,
        lastName,
        firstName,
        updatedAt: new Date() // 确保更新时间
      })
      .onConflictDoUpdate({
        target: [users.userKey, users.userKeyType], // 组合唯一索引
        set: {
          username,
          phone,
          lastName,
          firstName,
          updatedAt: new Date()
        }
      })
      .returning();

    return result;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw new Error('Failed to create or update user.');
  }
}
