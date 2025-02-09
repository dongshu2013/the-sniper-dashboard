import { Badge } from '@/components/ui/badge';
import { GroupAvatar } from '@/components/ui/avatar';
import { getQualityBadgeProps } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { EntityCard } from './entity-card';
import { PinnedMessagesCard } from './pinned-messages-card';
import { LatestMessagesCard } from './latest-messages-card';
import { ChatMetadata } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface GroupDetailsProps {
  chat: ChatMetadata;
  backLink: string;
  backLabel: string;
}

export function GroupDetails({ chat, backLink, backLabel }: GroupDetailsProps) {
  const { score, variant, label } = getQualityBadgeProps(chat.qualityScore);

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
          <Link href={backLink}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      </div>

      {/* Info Card */}
      <Card className="border-none">
        <CardContent className="py-6">
          <div className="flex flex-col gap-4">
            {/* 头部信息 */}
            <div className="flex items-center gap-3">
              <GroupAvatar
                photo={chat.photo as { path?: string }}
                name={chat.name || ''}
                size={48}
              />
              <div className="min-w-0">
                <h2 className="text-lg font-semibold truncate">{chat.name}</h2>
                <Badge
                  variant="outline"
                  className={`mt-1 ${chat.isBlocked ? 'bg-[#FFE8E8] text-[#F43F5E] border-[#FFE8E8]' : 'bg-[#E8FFF3] text-[#16B364] border-[#E8FFF3]'} rounded-full px-2 py-0.5 text-xs font-medium w-fit`}
                >
                  {chat.isBlocked ? 'Blocked' : 'Public Group'}
                </Badge>
              </div>
            </div>

            {/* 信息网格 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Members</div>
                <div className="text-sm">{chat.participantsCount}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Category</div>
                <div className="text-sm truncate">
                  {chat.category || 'Uncategorized'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Quality</div>
                <div className="text-sm flex items-center gap-2">
                  <span className="tabular-nums">{score}</span>
                  <Badge variant={variant}>{label}</Badge>
                </div>
              </div>
            </div>

            {/* 介绍信息 */}
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Introduce</div>
              <div className="text-sm bg-muted rounded-md p-3 whitespace-pre-line break-words">
                {chat.about || chat.aiAbout || 'No info'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Information */}
      {chat.entity && <EntityCard chat={chat} />}

      {/* Pinned Messages */}
      {chat.pinnedMessages?.length > 0 && (
        <PinnedMessagesCard messageIds={chat.pinnedMessages} />
      )}

      {/* Latest Messages */}
      <LatestMessagesCard chatId={chat.chatId} />
    </div>
  );
}
