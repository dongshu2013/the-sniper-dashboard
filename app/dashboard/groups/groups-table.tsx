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
import { updateBlockStatus, updatePrivateStatus } from './actions';
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
import { EditCategory } from './edit-category';
import { useUserStore } from 'stores/userStore';

const COLUMN_MAP: Record<string, string> = {
  Name: 'name',
  Intro: 'about',
  Members: 'participantsCount',
  Account: 'accountUsername',
  Category: 'category',
  Entity: 'entity.name',
  Quality: 'qualityScore',
  Status: 'isBlocked',
  'Created At': 'createdAt'
};

interface GroupsTableProps {
  chats: ChatWithAccounts[];
  offset: number;
  totalChats: number;
  pageSize?: number;
  showCheckboxes?: boolean;
  columns: GroupTableColumn[];
  hideAccountInfo?: boolean;
  basePath?: string;
  onItemClick?: (chatId: string) => string;
  privacyAction?: 'make-private' | 'make-public';
  privacyButtonText?: string;
  showBlockAction?: boolean;
  privacyActions?: ('make-private' | 'make-public')[];
}

export function GroupsTable({
  chats,
  offset,
  totalChats,
  pageSize = 20,
  showCheckboxes = true,
  columns,
  hideAccountInfo = false,
  basePath = '/dashboard/groups',
  onItemClick,
  privacyAction,
  privacyButtonText,
  showBlockAction = false,
  privacyActions = []
}: GroupsTableProps) {
  const user = useUserStore((state) => state.user);
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

    params.set('offset', '0');
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleBlockSelected = async () => {
    if (selectedChats.length === 0) return;
    await updateBlockStatus(selectedChats, true);
    setSelectedChats([]);
    router.refresh();
  };

  const handlePrivacyChange = async (
    action: 'make-private' | 'make-public'
  ) => {
    if (selectedChats.length === 0) return;
    await updatePrivateStatus(selectedChats, action === 'make-private');
    setSelectedChats([]);
    router.refresh();
  };

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', newOffset.toString());
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleSortChange = (column: string, direction: SortDirection) => {
    const params = new URLSearchParams(searchParams.toString());
    const mappedColumn = COLUMN_MAP[column] || column;
    params.set('sortColumn', mappedColumn);
    params.set('sortDirection', direction || '');
    params.set('offset', '0');
    router.push(`${basePath}?${params.toString()}`);
  };

  const renderTableCell = (
    chat: ChatWithAccounts,
    column: GroupTableColumn
  ) => {
    switch (column) {
      case 'Name':
        return (
          <TableCell className="text-left">
            <div className="flex items-center gap-2">
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
          <TableCell className="text-left">
            <TruncatedCell
              content={chat.about ?? ''}
              maxWidth="max-w-[100px]"
            />
          </TableCell>
        );
      case 'Members':
        return (
          <TableCell className="text-left">{chat.participantsCount}</TableCell>
        );
      case 'Account':
        return (
          <TableCell className="text-left">{chat.accountUsername}</TableCell>
        );
      case 'Category':
        return (
          <TableCell className="text-left">
            {user ? (
              <EditCategory
                chatId={chat.id}
                currentCategory={chat.category || ''}
              />
            ) : (
              <span>{chat.category || ''}</span>
            )}
          </TableCell>
        );
      case 'Entity':
        return (
          <TableCell className="text-left">
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
          <TableCell className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm tabular-nums">{score}</span>
              <Badge variant={variant}>{label}</Badge>
            </div>
          </TableCell>
        );
      case 'Status':
        return (
          <TableCell className="text-left">
            <Badge
              variant={chat.isBlocked ? 'destructive' : 'outline'}
              className="capitalize"
            >
              {chat.isBlocked ? 'Blocked' : 'Active'}
            </Badge>
          </TableCell>
        );
      case 'Created At':
        return (
          <TableCell className="text-left">
            {formatDateTime(chat.createdAt)}
          </TableCell>
        );
      default:
        return null;
    }
  };

  const filteredChats = handleFilter(localChats, filterConfig);

  return (
    <Card className="border border-gray-200/50 rounded-xl bg-muted/60">
      {showCheckboxes && selectedChats.length > 0 && (
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedChats.length} selected
            </span>
            {showBlockAction && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleBlockSelected}
                disabled={selectedChats.length === 0}
              >
                Block Selected
              </Button>
            )}
            {privacyActions.includes('make-public') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrivacyChange('make-public')}
                disabled={selectedChats.length === 0}
              >
                Make Public
              </Button>
            )}
            {privacyActions.includes('make-private') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrivacyChange('make-private')}
                disabled={selectedChats.length === 0}
              >
                Make Private
              </Button>
            )}
          </div>
        </CardHeader>
      )}
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
                    column === 'Category' ||
                    column === 'Entity' ||
                    column === 'Quality' ? (
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
                    onClick={() => {
                      const path = onItemClick
                        ? onItemClick(chat.chatId)
                        : `${basePath}/${chat.chatId}`;
                      router.push(path);
                    }}
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
            router.push(`${basePath}?${params.toString()}`);
          }}
        />
      </CardFooter>
    </Card>
  );
}
