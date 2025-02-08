'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ChatWithAccounts } from '@/lib/actions/chat';
import { GroupAvatar } from '@/components/ui/avatar';
import { formatDateTime, getQualityBadgeProps } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { MemecoinIcon } from '@/components/icons/memecoin-icon';
import { AiIcon } from '@/components/icons/ai-icon';

interface GroupsGridProps {
  chat: ChatWithAccounts;
  showCheckboxes?: boolean;
  onCheckChange?: (checked: boolean) => void;
  isChecked?: boolean;
  basePath?: string;
  onItemClick?: (chatId: string) => string;
  hideAccountInfo?: boolean;
}

export function GroupsGrid({
  chat,
  showCheckboxes = false,
  onCheckChange,
  isChecked = false,
  basePath = '/dashboard/groups',
  onItemClick,
  hideAccountInfo = false
}: GroupsGridProps) {
  const router = useRouter();
  const { score, variant, label } = getQualityBadgeProps(chat.qualityScore);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const path = onItemClick
      ? onItemClick(chat.chatId)
      : `${basePath}/${chat.chatId}`;
    router.push(path);
  };

  return (
    <Card
      className="border-0 flex flex-col p-3 h-full hover:shadow-md transition-shadow cursor-pointer bg-card"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <GroupAvatar
            photo={chat.photo as { path?: string }}
            name={chat.name || ''}
            size={32}
          />
          <div>
            <h3 className="font-medium leading-none text-sm line-clamp-1">
              {chat.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {chat.participantsCount} members
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
        {chat.about || 'No info'}
      </div>

      {/* AI Analysis Section */}
      <div className="relative mt-2 rounded-xl border border-border">
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-background px-2">
          <AiIcon className="h-3 w-6" />
        </div>

        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="py-2 px-2 flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground mb-1">Entity</div>
            <div className="flex items-center gap-1">
              <MemecoinIcon className="h-3 w-3" />
              <span className="font-medium text-xs line-clamp-1">
                {chat.entity?.name || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="py-2 px-2 flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground mb-1">Quality</div>
            <div className="flex items-center gap-1">
              <span className="text-[#FFB800] font-semibold text-xs">
                {score}
              </span>
              <Badge variant={variant} className="text-xs px-1 py-0.5 h-auto">
                {label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
