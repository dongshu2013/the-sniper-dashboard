import {
  getChatMetadataById,
  getChatMetadataWithAccountsByChatId
} from '@/lib/actions/chat';
import { PinnedMessagesCard } from './pinned-messages-card';
import { notFound } from 'next/navigation';
import { ChatMetadata } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GroupAvatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDateTime, getQualityBadgeProps } from '@/lib/utils';
import { AiIcon } from '@/components/icons/ai-icon';
import { MemecoinIcon } from '@/components/icons/memecoin-icon';
import { LatestMessagesCard } from './latest-messages-card';
import { EntityCard } from './entity-card';
import { AccountsCard } from './accounts-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type Params = Promise<{ chatId: string }>;

export default async function GroupDetailsPage(props: { params: Params }) {
  const { chatId } = await props.params;
  const chat = await getChatMetadataWithAccountsByChatId(chatId);

  if (!chat) {
    notFound();
  }

  const typedChat = chat as unknown as ChatMetadata;

  // console.log('---typedChat', typedChat);

  const { score, variant, label } = getQualityBadgeProps(
    typedChat.qualityScore
  );

  return (
    <div className="space-y-2 sm:space-y-4">
      {/* Back Button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/dashboard/groups">
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Link>
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-none">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <GroupAvatar
                    photo={typedChat.photo}
                    name={typedChat.name || ''}
                    size={48}
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{typedChat.name}</h2>
                    <Badge
                      variant="outline"
                      className={`mt-1 ${typedChat.isBlocked ? 'bg-[#FFE8E8] text-[#F43F5E] border-[#FFE8E8]' : 'bg-[#E8FFF3] text-[#16B364] border-[#E8FFF3]'} rounded-full px-2 py-0.5 text-xs font-medium`}
                    >
                      {typedChat.isBlocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-y-6">
                <div>
                  <div className="text-sm text-muted-foreground">ID</div>
                  <div className="mt-1">{typedChat.chatId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Members</div>
                  <div className="mt-1">{typedChat.participantsCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="mt-1">{typedChat.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Created At
                  </div>
                  <div className="mt-1">
                    {formatDateTime(typedChat.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Last Updated
                  </div>
                  <div className="mt-1">
                    {formatDateTime(typedChat.updatedAt)}
                  </div>
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
                <div className="text-sm text-muted-foreground mb-2">
                  Introduce
                </div>
                <div className="text-sm bg-muted rounded-md p-3 whitespace-pre-line break-words">
                  {typedChat.about || typedChat.aiAbout || 'No info'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AccountsCard accountTgIds={typedChat.accountTgIds} />

      <PinnedMessagesCard messageIds={typedChat.pinnedMessages} />

      <LatestMessagesCard chatId={chatId} />

      <EntityCard chat={typedChat} />
    </div>
  );
}
