import 'server-only';
import { drizzle } from 'drizzle-orm/postgres-js';
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  uuid
} from 'drizzle-orm/pg-core';
import postgres from 'postgres';
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

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

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

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom().notNull(),
  userId: varchar('user_id', { length: 255 }).notNull().unique(),
  photoUrl: varchar('photo_url', { length: 25 }).notNull().default(''),
  username: varchar('username', { length: 255 }).notNull().default(''),
  displayName: varchar('display_name', { length: 255 }).notNull().default(''),
  isAdmin: boolean('is_admin').notNull().default(false),
  lastLoginAt: timestamp('last_login_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type User = typeof users.$inferSelect;
