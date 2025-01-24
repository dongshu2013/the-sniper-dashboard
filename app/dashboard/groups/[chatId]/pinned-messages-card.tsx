'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageIcon } from '@/components/icons/message-icon';
import { PinnedMessageDialog } from './pinned-message-dialog';

interface PinnedMessagesCardProps {
  messageIds: string[];
}

export function PinnedMessagesCard({ messageIds }: PinnedMessagesCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!messageIds?.length) {
    return (
      <Card className="border-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Pinned Messages</CardTitle>
            <MessageIcon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No pinned messages
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Pinned Messages</CardTitle>
          <MessageIcon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          View Pinned Messages ({messageIds.length})
        </Button>
      </CardContent>

      <PinnedMessageDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        messageIds={messageIds}
      />
    </Card>
  );
}
