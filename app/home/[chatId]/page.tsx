import { getChatMetadataWithAccountsByChatId } from '@/lib/actions/chat';
import { notFound } from 'next/navigation';
import { ChatMetadata } from '@/lib/types';
import { GroupDetails } from 'app/dashboard/groups/[chatId]/group-details';

type Params = Promise<{ chatId: string }>;

export default async function GroupDetailsPage(props: { params: Params }) {
  const { chatId } = await props.params;
  const chat = await getChatMetadataWithAccountsByChatId(chatId);

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
