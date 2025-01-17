import 'server-only';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial,
  varchar
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, inArray } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});

export type SelectProduct = typeof products.$inferSelect;
export const insertProductSchema = createInsertSchema(products);

export async function getProducts(
  search: string,
  offset: number
): Promise<{
  products: SelectProduct[];
  newOffset: number | null;
  totalProducts: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      products: await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  let totalProducts = await db.select({ count: count() }).from(products);
  let moreProducts = await db.select().from(products).limit(5).offset(offset);
  let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts: totalProducts[0].count
  };
}

export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));
}

export const tgLinkStatusEnum = pgEnum('tg_link_status', [
  'pending',
  'processed',
  'error',
  'ignored'
]);

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
  offset: number
): Promise<{
  links: TgLink[];
  newOffset: number | null;
  totalLinks: number;
}> {
  if (search) {
    return {
      links: await db
        .select()
        .from(tgLinks)
        .where(ilike(tgLinks.tgLink, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalLinks: 0
    };
  }

  let totalLinks = await db.select({ count: count() }).from(tgLinks);
  let moreLinks = await db.select().from(tgLinks).limit(10).offset(offset);
  let newOffset = moreLinks.length >= 10 ? offset + 10 : null;

  return {
    links: moreLinks,
    newOffset,
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
    status: 'pending_pre_processing'
  }));

  await db.insert(tgLinks).values(values);
}
