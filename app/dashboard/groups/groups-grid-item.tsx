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
      className="flex flex-col p-4 h-full hover:shadow-md transition-shadow cursor-pointer bg-card"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <GroupAvatar
            photo={chat.photo as { path?: string }}
            name={chat.name || ''}
            size={48}
          />
          <div>
            <h3 className="font-semibold leading-none">{chat.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {chat.participantsCount} members
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground line-clamp-2">
        {chat.about || 'No description available'}
      </div>

      {/* AI Analysis Section */}
      <div className="relative mt-4 rounded-xl border border-border">
        {/* AI Icon at top center */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-background px-2">
          <AiIcon className="h-4 w-7" />
        </div>

        {/* Content container */}
        <div className="grid grid-cols-2 divide-x divide-border">
          {/* Entity section */}
          <div className="py-2 px-4 flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground mb-1">Entity</div>
            <div className="flex items-center gap-2">
              <MemecoinIcon className="h-5 w-5" />
              <span className="font-medium">
                {chat.entity?.name || 'Unknown'}
              </span>
            </div>
          </div>

          {/* Quality section */}
          <div className="py-3 px-4 flex flex-col items-center justify-center">
            <div className="text-sm text-muted-foreground mb-1">Quality</div>
            <div className="flex items-center gap-2">
              <span className="text-[#FFB800] font-semibold text-lg">
                {score.toFixed(1)}
              </span>
              <Badge variant={variant}>{label}</Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
