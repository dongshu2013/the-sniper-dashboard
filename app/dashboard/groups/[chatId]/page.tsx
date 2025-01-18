import { getChatMetadataById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChatMetadata } from '@/lib/types';
import { GroupAvatar } from '@/components/ui/avatar';

type Params = Promise<{ chatId: string }>;

export default async function GroupDetailsPage(props: { params: Params }) {
  const { chatId } = await props.params;
  const chat = await getChatMetadataById(chatId);

  if (!chat) {
    notFound();
  }

  const typedChat = chat as unknown as ChatMetadata;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <GroupAvatar
              photo={typedChat.photo}
              name={typedChat.name || ''}
              size={48}
            />
            <CardTitle>Group Details</CardTitle>
          </div>
          <Badge variant={typedChat.isBlocked ? 'destructive' : 'outline'}>
            {typedChat.isBlocked ? 'Blocked' : 'Active'}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Name
                </div>
                <div>{typedChat.name || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Username
                </div>
                <div>{typedChat.username}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Participants
                </div>
                <div>{typedChat.participantsCount}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  ID
                </div>
                <div className="font-mono text-sm">{typedChat.chatId}</div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Created At
                </div>
                <div>{formatDateTime(typedChat.createdAt)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </div>
                <div>{formatDateTime(typedChat.updatedAt)}</div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                About
              </div>
              <div className="whitespace-pre-wrap rounded-md bg-muted p-4">
                {typedChat.about || 'No description available'}
              </div>
            </div>

            {/* Entity Data */}
            {typedChat.entity && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Entity Data
                </div>
                <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                  {JSON.stringify(typedChat.entity, null, 2)}
                </pre>
              </div>
            )}

            {/* Quality Reports */}
            {typedChat.qualityReports &&
              typedChat.qualityReports.length > 0 && (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground">
                    Quality Reports
                  </div>
                  <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                    {JSON.stringify(typedChat.qualityReports, null, 2)}
                  </pre>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
