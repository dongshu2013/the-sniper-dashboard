import { getChatMetadataWithAccountsByChatId } from '@/lib/actions/chat';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { GroupAvatar } from '@/components/ui/avatar';
import { formatDateTime, getQualityBadgeProps } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { EntityCard } from '../../dashboard/groups/[chatId]/entity-card';
import { PinnedMessagesCard } from '../../dashboard/groups/[chatId]/pinned-messages-card';
import { LatestMessagesCard } from '../../dashboard/groups/[chatId]/latest-messages-card';
import { ChatMetadata } from '@/lib/types';

interface Params {
  chatId: string;
}

export default async function PublicGroupDetailsPage(props: {
  params: Params;
}) {
  const { chatId } = props.params;
  const chat = await getChatMetadataWithAccountsByChatId(chatId);

  if (!chat) {
    notFound();
  }

  const typedChat = chat as unknown as ChatMetadata;

  const { score, variant, label } = getQualityBadgeProps(
    typedChat.qualityScore
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Info Card */}
      <Card className="border-none">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <GroupAvatar
                    photo={chat.photo as { path?: string }}
                    name={chat.name || ''}
                    size={48}
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{chat.name}</h2>
                    <Badge
                      variant="outline"
                      className="mt-1 bg-[#E8FFF3] text-[#16B364] border-[#E8FFF3] rounded-full px-2 py-0.5 text-xs font-medium w-fit"
                    >
                      Public Group
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-y-6">
                <div>
                  <div className="text-sm text-muted-foreground">Members</div>
                  <div className="mt-1">{chat.participantsCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="mt-1">{chat.category || 'Uncategorized'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Quality</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="tabular-nums">{score}</span>
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm text-muted-foreground mb-2">About</div>
                <div className="text-sm bg-muted rounded-md p-3">
                  {typedChat.about ||
                    typedChat.aiAbout ||
                    'No description available'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Information */}
      {typedChat.entity && <EntityCard chat={typedChat} />}

      {/* Pinned Messages */}
      {typedChat.pinnedMessages?.length > 0 && (
        <PinnedMessagesCard messageIds={typedChat.pinnedMessages} />
      )}

      {/* Latest Messages */}
      <LatestMessagesCard chatId={chatId} />
    </div>
  );
}
