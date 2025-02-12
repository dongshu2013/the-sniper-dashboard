'use client';

import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ChatWithAccounts } from '@/lib/actions/chat';
import { GroupsGrid } from './groups-grid-item';
import { Pagination } from '@/components/ui/pagination';
import { useRouter, useSearchParams } from 'next/navigation';

interface GroupsGridViewProps {
  chats: ChatWithAccounts[];
  offset: number;
  totalChats: number;
  pageSize?: number;
  showCheckboxes?: boolean;
  hideAccountInfo?: boolean;
  basePath?: string;
  onItemClick?: (chatId: string) => string;
}

export function GroupsGridView({
  chats,
  offset,
  totalChats,
  pageSize = 20,
  showCheckboxes = false,
  hideAccountInfo = false,
  basePath = '/dashboard/groups',
  onItemClick
}: GroupsGridViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', newOffset.toString());
    router.push(`${basePath}?${params.toString()}`);
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {chats.map((chat) => (
            <GroupsGrid
              key={chat.id}
              chat={chat}
              showCheckboxes={showCheckboxes}
              basePath={basePath}
              onItemClick={onItemClick}
              hideAccountInfo={hideAccountInfo}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between p-0 mt-4">
        <div className="text-sm text-muted-foreground">
          Showing {offset + 1}-{Math.min(offset + pageSize, totalChats)} of{' '}
          {totalChats} groups
        </div>
        <Pagination
          currentPage={Math.floor(offset / pageSize) + 1}
          totalPages={Math.ceil(totalChats / pageSize)}
          pageSize={pageSize}
          onPageChange={(page) => {
            const newOffset = (page - 1) * pageSize;
            handlePageChange(newOffset);
          }}
          onPageSizeChange={(newPageSize) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('pageSize', newPageSize.toString());
            params.set('offset', '0');
            router.push(`${basePath}?${params.toString()}`);
          }}
        />
      </CardFooter>
    </Card>
  );
}
