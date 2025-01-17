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
  varchar,
  jsonb,
  boolean
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, inArray, or, and } from 'drizzle-orm';
import { z } from 'zod';
import { TgLinkStatus } from './types';

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

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
  createdAt: timestamp('created_at').defaultNow()
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
  const baseQuery = db.select().from(tgLinks);
  const conditions = [];

  if (search) {
    conditions.push(ilike(tgLinks.tgLink, `%${search}%`));
  }

  if (statuses && statuses.length > 0) {
    conditions.push(inArray(tgLinks.status, statuses));
  }

  let totalLinks = await db
    .select({ count: count() })
    .from(tgLinks)
    .where(conditions[0]);

  let links = await baseQuery
    .where(conditions[0])
    .limit(pageSize)
    .offset(offset);

  return {
    links,
    totalLinks: totalLinks[0].count
  };
}

export async function updateTgLinkStatus(ids: number[], status: string) {
  await db
    .update(tgLinks)
    .set({
      status,
      processedAt: status === 'processed' ? new Date() : null
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
  entity: jsonb('entity'),
  qualityReports: jsonb('quality_reports').default('[]'),
  isBlocked: boolean('is_blocked').default(false),
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
