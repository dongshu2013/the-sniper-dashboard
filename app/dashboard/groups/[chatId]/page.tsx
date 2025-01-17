import { getChatMetadataById } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default async function GroupDetailsPage({
  params
}: {
  params: Promise<{ chatId: string }> | { chatId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const chat = await getChatMetadataById(resolvedParams.chatId);

  if (!chat) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Group Details</CardTitle>
          <Badge variant={chat.isBlocked ? 'destructive' : 'outline'}>
            {chat.isBlocked ? 'Blocked' : 'Active'}
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
                <div>{chat.name || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Username
                </div>
                <div>{chat.username ? `@${chat.username}` : 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Participants
                </div>
                <div>{chat.participantsCount}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  ID
                </div>
                <div className="font-mono text-sm">{chat.chatId}</div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Created At
                </div>
                <div>{formatDateTime(chat.createdAt)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </div>
                <div>{formatDateTime(chat.updatedAt)}</div>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                About
              </div>
              <div className="whitespace-pre-wrap rounded-md bg-muted p-4">
                {chat.about || 'No description available'}
              </div>
            </div>

            {/* Entity Data */}
            {chat.entity && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Entity Data
                </div>
                <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                  {JSON.stringify(chat.entity, null, 2)}
                </pre>
              </div>
            )}

            {/* Quality Reports */}
            {chat.qualityReports && chat.qualityReports.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Quality Reports
                </div>
                <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
                  {JSON.stringify(chat.qualityReports, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
