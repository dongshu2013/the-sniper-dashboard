import { getChatMetadataById } from '@/lib/actions/chat';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ChatMetadata } from '@/lib/types';
import { GroupAvatar } from '@/components/ui/avatar';
import { AiIcon } from '@/components/icons/ai-icon';
import { MemecoinIcon } from '@/components/icons/memecoin-icon';
import { getQualityBadgeProps } from '@/lib/utils';

type Params = Promise<{ chatId: string }>;

export default async function GroupDetailsPage(props: { params: Params }) {
  const { chatId } = await props.params;
  const chat = await getChatMetadataById(chatId);

  if (!chat) {
    notFound();
  }

  const typedChat = chat as unknown as ChatMetadata;

  const { score, variant, label } = getQualityBadgeProps(
    typedChat.qualityScore
  );

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-none">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <GroupAvatar
                    photo={typedChat.photo}
                    name={typedChat.name || ''}
                    size={48}
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{typedChat.name}</h2>
                    <Badge
                      variant="outline"
                      className={`mt-1 ${typedChat.isBlocked ? 'bg-[#FFE8E8] text-[#F43F5E] border-[#FFE8E8]' : 'bg-[#E8FFF3] text-[#16B364] border-[#E8FFF3]'} rounded-full px-2 py-0.5 text-xs font-medium`}
                    >
                      {typedChat.isBlocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-y-6">
                <div>
                  <div className="text-sm text-muted-foreground">ID</div>
                  <div className="mt-1">{typedChat.chatId}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Members</div>
                  <div className="mt-1">{typedChat.participantsCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Category</div>
                  <div className="mt-1">{typedChat.category}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Created At
                  </div>
                  <div className="mt-1">
                    {formatDateTime(typedChat.createdAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    Last Updated
                  </div>
                  <div className="mt-1">
                    {formatDateTime(typedChat.updatedAt)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Quality</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="tabular-nums">{score}</span>
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="text-sm text-muted-foreground mb-2">
                  Introduce
                </div>
                <div className="text-sm bg-muted rounded-md p-3">
                  {typedChat.about || typedChat.aiAbout || 'No info'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entity Card */}
      <Card className="border-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Entity</CardTitle>
            <AiIcon className="h-4 w-7" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Name</div>
                <div className="mt-1">{typedChat.entity?.name}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="flex items-center gap-1.5">
                  <MemecoinIcon className="h-4 w-4" />
                  <div className="mt-1">{typedChat.entity?.type}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Chain</div>
                <div className="mt-1">{typedChat.entity?.chain}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Address</div>
                <div className="mt-1 font-mono text-sm">
                  {typedChat.entity?.address}
                </div>
              </div>
            </div>
            {typedChat.entity?.website && (
              <div>
                <div className="text-sm text-muted-foreground">Website</div>
                <div className="mt-1 break-all">
                  {typedChat.entity?.website}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
