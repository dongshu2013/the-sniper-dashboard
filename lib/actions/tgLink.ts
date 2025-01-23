import 'server-only';

import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  serial,
  varchar
} from 'drizzle-orm/pg-core';
import { count, ilike, inArray, or, and } from 'drizzle-orm';
import { z } from 'zod';
import { TgLinkStatus, Entity, QualityReport } from '../types';
import { customAlphabet } from 'nanoid';
import { db, tgLinks } from '../schema';

export const tgLinkStatusEnum = pgEnum(
  'tg_link_status',
  Object.values(TgLinkStatus) as [string, ...string[]]
);

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
