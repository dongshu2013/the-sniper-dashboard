import { chatMessages, db } from '@/lib/schema';
import { inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids')?.split(',') || [];

  if (!ids.length) {
    return NextResponse.json({ messages: [] });
  }

  const numericIds = ids.map((id) => parseInt(id, 10));
  const messages = await db
    .select({
      id: chatMessages.id,
      messageId: chatMessages.messageId,
      messageText: chatMessages.messageText,
      senderId: chatMessages.senderId,
      messageTimestamp: chatMessages.messageTimestamp
    })
    .from(chatMessages)
    .where(inArray(chatMessages.id, numericIds));

  return NextResponse.json({ messages });
}
