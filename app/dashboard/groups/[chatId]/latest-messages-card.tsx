'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageIcon } from '@/components/icons/message-icon';
import { LatestMessageDialog } from './latest-message-dialog';

interface LatestMessagesCardProps {
  chatId: string;
}

export function LatestMessagesCard({ chatId }: LatestMessagesCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Latest Messages</CardTitle>
          <MessageIcon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          View Latest Messages
        </Button>
      </CardContent>

      <LatestMessageDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        chatId={chatId}
      />
    </Card>
  );
}
