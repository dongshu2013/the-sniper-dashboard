import { getChatMetadataWithAccountsByChatId } from '@/lib/actions/chat';
import { notFound } from 'next/navigation';
import { ChatMetadata } from '@/lib/types';
import { GroupDetails } from './group-details';

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
      backLink="/dashboard/groups"
      backLabel="Back to Groups"
    />
  );
}
