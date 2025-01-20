'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ChatWithAccounts } from '@/lib/db';
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
}

export function GroupsGrid({
  chat,
  showCheckboxes = false,
  onCheckChange,
  isChecked = false
}: GroupsGridProps) {
  const router = useRouter();
  const { score, variant, label } = getQualityBadgeProps(chat.qualityReports);

  const handleClick = () => {
    router.push(`/dashboard/groups/${chat.chatId}`);
  };

  return (
    <Card
      className="border-0 flex flex-col p-3 h-full hover:shadow-md transition-shadow cursor-pointer bg-card"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <GroupAvatar
            photo={chat.photo as { path?: string }}
            name={chat.name || ''}
            size={40}
          />
          <div>
            <h3 className="font-medium leading-none text-sm">{chat.name}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {chat.participantsCount} members
            </p>
          </div>
        </div>
      </div>

      <div className="mt-2.5 text-xs text-muted-foreground line-clamp-1">
        {chat.about || 'No description available'}
      </div>

      {/* AI Analysis Section */}
      <div className="relative mt-3 rounded-xl border border-border">
        {/* AI Icon at top center */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 bg-background px-2">
          <AiIcon className="h-4 w-8" />
        </div>

        {/* Content container */}
        <div className="grid grid-cols-2 divide-x divide-border">
          {/* Entity section */}
          <div className="py-2 px-3 flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground mb-1">Entity</div>
            <div className="flex items-center gap-1.5">
              <MemecoinIcon className="h-4 w-4" />
              <span className="font-medium text-xs">
                {chat.entity?.name || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Quality section */}
          <div className="py-2 px-3 flex flex-col items-center justify-center">
            <div className="text-xs text-muted-foreground mb-1">Quality</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#FFB800] font-semibold text-sm">
                {isNaN(score) ? '0.0' : score.toFixed(1)}
              </span>
              <Badge variant={variant} className="text-xs px-1.5 py-0.5 h-auto">
                {label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
