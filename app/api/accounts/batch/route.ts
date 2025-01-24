import { accounts, db } from '@/lib/schema';
import { inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids')?.split(',') || [];

  if (!ids.length) {
    return NextResponse.json({ accounts: [] });
  }

  const accountTgIds = ids.map((id) => id.trim());
  const accountResults = await db
    .select({
      tgId: accounts.tgId,
      username: accounts.username,
      phone: accounts.phone
    })
    .from(accounts)
    .where(inArray(accounts.tgId, accountTgIds));

  return NextResponse.json({ accounts: accountResults });
}
