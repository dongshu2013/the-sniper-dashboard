'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
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
import { ChatWithAccounts } from '@/lib/actions/chat';
import { updateBlockStatus } from './actions';
import { GroupTableColumn } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';
import { formatDateTime } from '@/lib/utils';
import { TruncatedCell } from '@/components/ui/truncated-cell';
import { Eye } from 'lucide-react';
import { GroupAvatar } from '@/components/ui/avatar';
import { useTableSort } from '@/lib/hooks/use-table-sort';
import { useTableFilter } from '@/lib/hooks/use-table-filter';
import {
  FilterableTableHeader,
  SortDirection
} from '@/components/ui/filterable-table-header';
import { getQualityBadgeProps } from '@/lib/utils';
import { AiIcon } from '@/components/icons/ai-icon';
import { MemecoinIcon } from '@/components/icons/memecoin-icon';

const COLUMN_MAP: Record<string, string> = {
  Name: 'name',
  Intro: 'about',
  Members: 'participantsCount',
  Category: 'category',
  Entity: 'entity.name',
  Quality: 'qualityScore',
  Status: 'isBlocked',
  'Created At': 'createdAt'
};

export function GroupsTable({
  chats,
  offset,
  totalChats,
  pageSize = 20,
  showCheckboxes = true,
  columns
}: {
  chats: ChatWithAccounts[];
  offset: number;
  totalChats: number;
  pageSize?: number;
  showCheckboxes?: boolean;
  columns: GroupTableColumn[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sortConfig, handleSort, resetSort } = useTableSort(chats);
  const { filterConfig, handleFilter, updateFilter, resetFilter } =
    useTableFilter(chats);
  const [selectedChats, setSelectedChats] = useState<number[]>([]);
  const [localChats, setLocalChats] = useState<ChatWithAccounts[]>(chats);

  useEffect(() => {
    setLocalChats(chats);
  }, [chats]);

  const handleFilterChange = (column: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const mappedColumn = COLUMN_MAP[column] || column;

    if (value) {
      params.set(`filter_${mappedColumn}`, value);
    } else {
      params.delete(`filter_${mappedColumn}`);
    }

    params.set('offset', '0'); // 重置到第一页
    router.push(`/dashboard/groups?${params.toString()}`);
  };

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
    const params = new URLSearchParams(searchParams.toString());
    const mappedColumn = COLUMN_MAP[column] || column;
    params.set('sortColumn', mappedColumn);
    params.set('sortDirection', direction || '');
    params.set('offset', '0');
    router.push(`/dashboard/groups?${params.toString()}`);
  };

  const renderTableCell = (
    chat: ChatWithAccounts,
    column: GroupTableColumn
  ) => {
    switch (column) {
      case 'Name':
        return (
          <TableCell>
            <div className="flex items-center gap-1">
              <GroupAvatar
                photo={chat.photo as { path?: string }}
                name={chat.name || ''}
              />
              <TruncatedCell
                content={chat.name ?? ''}
                maxWidth="max-w-[100px]"
              />
            </div>
          </TableCell>
        );
      case 'Intro':
        return (
          <TableCell>
            <TruncatedCell
              content={chat.about ?? ''}
              maxWidth="max-w-[200px]"
            />
          </TableCell>
        );
      case 'Members':
        return <TableCell>{chat.participantsCount}</TableCell>;
      case 'Category':
        return <TableCell>{chat.category}</TableCell>;
      case 'Entity':
        return (
          <TableCell>
            <div className="flex items-center gap-1.5">
              {chat.entity?.type === 'memecoin' && (
                <MemecoinIcon className="h-6 w-6" />
              )}
              <span>{chat.entity?.name}</span>
            </div>
          </TableCell>
        );
      case 'Quality':
        const { score, variant, label } = getQualityBadgeProps(
          chat.qualityScore
        );
        return (
          <TableCell>
            <div className="flex items-center gap-2">
              <span className="text-sm tabular-nums">{score}</span>
              <Badge variant={variant}>{label}</Badge>
            </div>
          </TableCell>
        );
      case 'Status':
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
      case 'Created At':
        return <TableCell>{formatDateTime(chat.createdAt)}</TableCell>;
      default:
        return null;
    }
  };

  const filteredChats = handleFilter(localChats, filterConfig);

  return (
    <Card className="border-0">
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
                    checked={selectedChats.length === filteredChats.length}
                    onCheckedChange={(checked) => {
                      setSelectedChats(
                        checked ? filteredChats.map((chat) => chat.id) : []
                      );
                    }}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <FilterableTableHeader
                  key={`header-${column}`}
                  column={column}
                  label={
                    column === 'Entity' || column === 'Quality' ? (
                      <div className="flex items-center gap-1.5">
                        <AiIcon className="h-6 w-6" />
                        <span>{column}</span>
                      </div>
                    ) : (
                      column.replace(/([A-Z])/g, ' $1').trim()
                    )
                  }
                  filterValue={
                    searchParams.get(`filter_${COLUMN_MAP[column]}`) || ''
                  }
                  onFilterChange={handleFilterChange}
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
            {filteredChats.map((chat, index) => (
              <TableRow key={`row-${chat.id}-${index}`}>
                {showCheckboxes && (
                  <TableCell key={`checkbox-${chat.id}`}>
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
                  <TableCell key={`cell-${chat.id}-${column}-${index}`}>
                    {renderTableCell(chat, column)}
                  </TableCell>
                ))}
                <TableCell key={`actions-${chat.id}`}>
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
