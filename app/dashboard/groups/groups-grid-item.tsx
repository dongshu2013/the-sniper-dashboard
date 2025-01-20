'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { ChatWithAccounts } from '@/lib/db';
import { GroupAvatar } from '@/components/ui/avatar';
import { formatDateTime, getQualityBadgeProps } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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

  return (
    <Card className="flex flex-col p-4 h-full">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <GroupAvatar
            photo={chat.photo as { path?: string }}
            name={chat.name || ''}
          />
          <div>
            <h3 className="font-semibold leading-none">{chat.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {chat.participantsCount} members
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!chat.isBlocked && (
            <div className="flex items-center gap-1">
              <span className="text-sm tabular-nums">
                {isNaN(score) ? '0' : score.toFixed(1)}
              </span>
              <Badge variant={variant}>{label}</Badge>
            </div>
          )}
          {chat.isBlocked && <Badge variant="destructive">Blocked</Badge>}
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground">
        Created {formatDateTime(chat.createdAt)}
      </div>

      {chat.entity && (
        <div className="mt-2">
          <Badge variant="outline">{chat.entity.name}</Badge>
        </div>
      )}

      <div className="mt-auto pt-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/groups/${chat.chatId}`)}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          View Details
        </Button>
      </div>
    </Card>
  );
}
