import { inArray } from 'drizzle-orm';
import { chatMessages, db } from '../schema';

export async function getPinnedMessages(messageIds: string[]) {
  const numericIds = messageIds.map((id) => parseInt(id, 10));
  return db
    .select({
      id: chatMessages.id,
      messageId: chatMessages.messageId,
      messageText: chatMessages.messageText,
      senderId: chatMessages.senderId,
      messageTimestamp: chatMessages.messageTimestamp
    })
    .from(chatMessages)
    .where(inArray(chatMessages.id, numericIds));
}
