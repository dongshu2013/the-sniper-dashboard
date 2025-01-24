'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';

interface Message {
  id: number;
  messageId: string;
  messageText: string;
  senderId: string | null;
  messageTimestamp: number;
}

interface LatestMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
}

async function fetchLatestMessages(chatId: string) {
  const response = await fetch(
    `/api/messages/latest?chatId=${chatId}&limit=10`
  );
  const data = await response.json();
  return data.messages;
}

export function LatestMessageDialog({
  open,
  onOpenChange,
  chatId
}: LatestMessageDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadMessages() {
      if (open) {
        setLoading(true);
        try {
          const data = await fetchLatestMessages(chatId);
          setMessages(data);
        } catch (error) {
          console.error('Failed to load messages:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadMessages();
  }, [open, chatId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Latest Messages ({messages.length})</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div className="text-sm text-muted-foreground">Message</div>
                  <div className="text-sm bg-muted rounded-md p-3 break-words">
                    {message.messageText}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Message ID
                      </div>
                      <div className="mt-1 text-sm font-mono">
                        {message.messageId}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Sender ID
                      </div>
                      <div className="mt-1 text-sm font-mono">
                        {message.senderId || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Time</div>
                      <div className="mt-1 text-sm">
                        {formatDateTime(
                          new Date(message.messageTimestamp * 1000)
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
