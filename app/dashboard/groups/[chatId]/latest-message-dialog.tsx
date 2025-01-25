'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { formatDateTime } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: number;
  messageText: string;
  messageTimestamp: number;
  buttons: any[];
  reactions: any[];
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

  const renderButtons = (buttons: any[]) => {
    if (!buttons?.length) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {buttons.map((button, index) => (
          <button
            key={index}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
          >
            {button.text}
          </button>
        ))}
      </div>
    );
  };

  const renderReactions = (reactions: any[]) => {
    if (!reactions?.length) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {reactions.map((reaction, index) => (
          <div
            key={index}
            className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm"
          >
            <span>{reaction.emoji}</span>
            <span className="text-xs text-gray-600">{reaction.count}</span>
          </div>
        ))}
      </div>
    );
  };

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
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  <div className="flex items-start gap-2">
                    <div className="flex-1">
                      <div className="bg-blue-50 rounded-2xl rounded-bl-none px-4 py-2 inline-block">
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>{message.messageText}</ReactMarkdown>
                        </div>

                        {renderButtons(message.buttons)}

                        {renderReactions(message.reactions)}

                        <div className="text-xs text-gray-500 mt-1">
                          {formatDateTime(
                            new Date(message.messageTimestamp * 1000)
                          )}
                        </div>
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
