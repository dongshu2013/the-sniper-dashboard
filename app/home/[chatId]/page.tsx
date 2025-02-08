import { getChatMetadataWithAccountsByChatId } from '@/lib/actions/chat';
import { notFound } from 'next/navigation';
import { ChatMetadata } from '@/lib/types';
import { GroupDetails } from 'app/dashboard/groups/[chatId]/group-details';

export default async function PublicGroupDetailsPage({
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
      backLink="/home"
      backLabel="Back to Groups"
    />
  );
}
