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
import { ChatMetadata, ChatWithAccount } from '@/lib/db';
import { updateBlockStatus } from './actions';
import { GroupTableColumn } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';
import { formatDateTime } from '@/lib/utils';
import { TruncatedCell } from '@/components/ui/truncated-cell';
import { Eye } from 'lucide-react';
import { GroupAvatar } from '@/components/ui/avatar';
import {
  SortableTableHeader,
  SortDirection
} from '@/components/ui/sortable-table-header';
import { useTableSort } from '@/lib/hooks/use-table-sort';
import { useTableFilter } from '@/lib/hooks/use-table-filter';
import { FilterableTableHeader } from '@/components/ui/filterable-table-header';
import { getQualityBadgeProps } from '@/lib/utils';

const COLUMN_MAP: Record<string, string> = {
  participants: 'participantsCount',
  name: 'name',
  username: 'username',
  createdAt: 'createdAt',
  entity: 'entity.name',
  quality: 'qualityReports',
  account: 'account.username'
};

export function GroupsTable({
  chats,
  offset,
  totalChats,
  pageSize = 20,
  showCheckboxes = true,
  columns
}: {
  chats: ChatWithAccount[];
  offset: number;
  totalChats: number;
  pageSize?: number;
  showCheckboxes?: boolean;
  columns: GroupTableColumn[];
}) {
  const [selectedChats, setSelectedChats] = useState<number[]>([]);
  const [localChats, setLocalChats] = useState(chats);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sortConfig, handleSort } = useTableSort(chats);
  const { filterConfig, handleFilter, updateFilter } = useTableFilter(chats);

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

  const handleSortChange = (column: string, direction: SortDirection) => {
    const mappedColumn = COLUMN_MAP[column] || column;
    const sortedData = handleSort(chats, mappedColumn, direction);
    setLocalChats(sortedData);
  };

  const renderTableCell = (chat: ChatWithAccount, column: GroupTableColumn) => {
    switch (column) {
      case 'name':
        return (
          <TableCell>
            <div className="flex items-center gap-1">
              <GroupAvatar
                photo={chat.photo as { path?: string }}
                name={chat.name || ''}
              />
              <TruncatedCell
                content={chat.name ?? ''}
                maxWidth="max-w-[200px]"
              />
            </div>
          </TableCell>
        );
      case 'account':
        return (
          <TableCell>
            {chat.account?.username ? (
              <Badge variant="secondary" className="font-mono">
                {chat.account.username}
              </Badge>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </TableCell>
        );
      case 'participants':
        return <TableCell>{chat.participantsCount}</TableCell>;
      case 'entity':
        return <TableCell>{chat.entity?.name}</TableCell>;
      case 'quality':
        const { score, variant, label } = getQualityBadgeProps(
          chat.qualityReports
        );
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <span className="text-sm tabular-nums">
                {isNaN(score) ? '0' : score.toFixed(1)}
              </span>
              <Badge variant={variant}>{label}</Badge>
            </div>
          </TableCell>
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

  const filteredChats = handleFilter(localChats, filterConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Groups</CardTitle>
        {showCheckboxes && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedChats.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBlockStatusChange(true)}
              disabled={selectedChats.length === 0}
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
                <FilterableTableHeader
                  key={column}
                  column={column}
                  label={column.replace(/([A-Z])/g, ' $1').trim()}
                  filterValue={filterConfig[COLUMN_MAP[column] || column] || ''}
                  onFilterChange={(column, value) => {
                    const mappedColumn = COLUMN_MAP[column] || column;
                    updateFilter(mappedColumn, value);
                  }}
                  sortDirection={
                    sortConfig.column === (COLUMN_MAP[column] || column)
                      ? sortConfig.direction
                      : null
                  }
                  onSort={handleSortChange}
                />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChats.map((chat) => (
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
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      router.push(`/dashboard/groups/${chat.chatId}`)
                    }
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
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
