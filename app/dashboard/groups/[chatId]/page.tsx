import { getChatMetadataWithAccountsByChatId } from '@/lib/actions/chat';
import { notFound } from 'next/navigation';
import { ChatMetadata } from '@/lib/types';
import { GroupDetails } from './group-details';

export default async function GroupDetailsPage({
  params
}: {
  params: { chatId: string };
}) {
  const chat = await getChatMetadataWithAccountsByChatId(params.chatId);

  if (!chat) {
    notFound();
  }

  return (
    <GroupDetails
      chat={chat as unknown as ChatMetadata}
      backLink="/dashboard/groups"
      backLabel="Back to Groups"
    />
  );
}
