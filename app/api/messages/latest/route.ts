import { chatMessages, db } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');
  const limit = parseInt(searchParams.get('limit') || '10');

  if (!chatId) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await db
    .select({
      id: chatMessages.id,
      messageId: chatMessages.messageId,
      messageText: chatMessages.messageText,
      senderId: chatMessages.senderId,
      messageTimestamp: chatMessages.messageTimestamp
    })
    .from(chatMessages)
    .where(eq(chatMessages.chatId, chatId))
    .orderBy(desc(chatMessages.messageTimestamp))
    .limit(limit);

  return NextResponse.json({ messages });
}
