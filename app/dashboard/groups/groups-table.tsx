'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChatMetadata } from '@/lib/db';
import { updateBlockStatus } from './actions';
import { GroupTableColumn } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';
import { formatDateTime } from '@/lib/utils';
import { TruncatedCell } from '@/components/ui/truncated-cell';
import { ExpandableCell } from '@/components/ui/expandable-cell';

export function GroupsTable({
  chats,
  offset,
  totalChats,
  pageSize = 20,
  showCheckboxes = true,
  columns
}: {
  chats: ChatMetadata[];
  offset: number;
  totalChats: number;
  pageSize?: number;
  showCheckboxes?: boolean;
  columns: GroupTableColumn[];
}) {
  const [selectedChats, setSelectedChats] = useState<number[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBlockStatusChange = async (isBlocked: boolean) => {
    if (selectedChats.length === 0) return;
    await updateBlockStatus(selectedChats, isBlocked);
    setSelectedChats([]);
    router.refresh();
  };

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', newOffset.toString());
    router.push(`/dashboard/groups?${params.toString()}`);
  };

  const renderTableCell = (chat: ChatMetadata, column: GroupTableColumn) => {
    switch (column) {
      case 'name':
        return (
          <TruncatedCell content={chat.name ?? ''} maxWidth="max-w-[200px]" />
        );
      case 'username':
        return <TableCell>@{chat.username}</TableCell>;
      case 'participants':
        return <TableCell>{chat.participantsCount}</TableCell>;
      case 'entity':
        return (
          <TruncatedCell
            content={JSON.stringify(chat.entity, null, 2)}
            maxWidth="max-w-[300px]"
          />
        );
      case 'reports':
        return (
          <TruncatedCell
            content={JSON.stringify(chat.qualityReports, null, 2)}
          />
        );
      case 'status':
        return (
          <TableCell>
            <Badge
              variant={chat.isBlocked ? 'destructive' : 'outline'}
              className="capitalize"
            >
              {chat.isBlocked ? 'Blocked' : 'Active'}
            </Badge>
          </TableCell>
        );
      case 'createdAt':
        return <TableCell>{formatDateTime(chat.createdAt)}</TableCell>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Groups</CardTitle>
        {showCheckboxes && selectedChats.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedChats.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBlockStatusChange(true)}
            >
              Block Selected
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckboxes && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedChats.length === chats.length}
                    onCheckedChange={(checked) => {
                      setSelectedChats(
                        checked ? chats.map((chat) => chat.id) : []
                      );
                    }}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead key={column} className="capitalize">
                  {column.replace(/([A-Z])/g, ' $1').trim()}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {chats.map((chat) => (
              <TableRow key={chat.id}>
                {showCheckboxes && (
                  <TableCell>
                    <Checkbox
                      checked={selectedChats.includes(chat.id)}
                      onCheckedChange={(checked) => {
                        setSelectedChats(
                          checked
                            ? [...selectedChats, chat.id]
                            : selectedChats.filter((id) => id !== chat.id)
                        );
                      }}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <React.Fragment key={`${chat.id}-${column}`}>
                    {renderTableCell(chat, column)}
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
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
            router.push(`/dashboard/groups?${params.toString()}`);
          }}
        />
      </CardFooter>
    </Card>
  );
}
