'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { TgLink } from '@/lib/db';
import { updateLinkStatus } from './actions';
import { TgLinkStatus, LinkTableColumn, LINK_TAB_COLUMNS } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';
import { formatDateTime } from '@/lib/utils';
import { useTableSort } from '@/lib/hooks/use-table-sort';
import {
  FilterableTableHeader,
  SortDirection
} from '@/components/ui/filterable-table-header';
import { useTableFilter } from '@/lib/hooks/use-table-filter';

interface LinksTableProps {
  links: TgLink[];
  offset: number;
  totalLinks: number;
  pageSize: number;
  showCheckboxes: boolean;
  showStatus: boolean;
  columns: LinkTableColumn[];
  currentTab: 'todo' | 'processing' | 'queued' | 'processed';
}

const COLUMN_MAP: Record<string, string> = {
  link: 'tgLink',
  chatName: 'chatName',
  status: 'status',
  markName: 'markName',
  createdAt: 'createdAt',
  processedAt: 'processedAt'
};

const getBadgeVariant = (status: string | null) => {
  if (!status) return 'outline' as const;
  switch (status) {
    case TgLinkStatus.PROCESSED:
      return 'secondary' as const; // Success status - green
    case TgLinkStatus.ERROR:
      return 'destructive' as const; // Error status - red
    case TgLinkStatus.IGNORED:
      return 'outline' as const; // Ignored status - gray outline
    case TgLinkStatus.PROCESSING:
      return 'default' as const; // Processing status - blue
    case TgLinkStatus.PENDING_PROCESSING:
    case TgLinkStatus.PENDING_PRE_PROCESSING:
      return 'outline' as const; // Pending status - gray outline
    default:
      return 'outline' as const;
  }
};

export function LinksTable({
  links,
  offset,
  totalLinks,
  pageSize = 20,
  showCheckboxes = true,
  showStatus = false,
  columns,
  currentTab
}: LinksTableProps) {
  const [selectedLinks, setSelectedLinks] = useState<number[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sortConfig, handleSort } = useTableSort(links);
  const { filterConfig, handleFilter, updateFilter } = useTableFilter(links);
  const [localLinks, setLocalLinks] = useState<TgLink[]>(links);

  useEffect(() => {
    setLocalLinks(links);
  }, [links]);

  const handleStatusChange = async (status: string) => {
    if (selectedLinks.length === 0) return;
    await updateLinkStatus(selectedLinks, status);
    setSelectedLinks([]);
    router.refresh();
  };

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', newOffset.toString());
    router.push(`/dashboard/links?${params.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', newPageSize.toString());
    params.set('offset', '0'); // Reset to first page
    router.push(`/dashboard/links?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalLinks / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const handleSortChange = (column: string, direction: SortDirection) => {
    const mappedColumn = COLUMN_MAP[column] || column;
    const sortedData = handleSort(links, mappedColumn, direction);
    setLocalLinks(sortedData);
  };

  const renderTableCell = (link: TgLink, column: LinkTableColumn) => {
    switch (column) {
      case 'link':
        return (
          <TableCell className="font-medium">
            <a
              href={link.tgLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 hover:underline"
            >
              {link.tgLink}
            </a>
          </TableCell>
        );
      case 'chatName':
        return (
          <TableCell className="font-medium">
            {currentTab === 'processed' ? (
              <a
                href={`/dashboard/groups/${link.chatId}`}
                className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
              >
                {link.chatName}
              </a>
            ) : (
              <span>{link.chatName}</span>
            )}
          </TableCell>
        );
      case 'status':
        return (
          <TableCell>
            <Badge
              variant={getBadgeVariant(link.status)}
              className="capitalize"
            >
              {link.status}
            </Badge>
          </TableCell>
        );
      case 'markName':
        return <TableCell>{link.markName}</TableCell>;
      case 'createdAt':
        return <TableCell>{formatDateTime(link.createdAt)}</TableCell>;
      case 'processedAt':
        return <TableCell>{formatDateTime(link.processedAt)}</TableCell>;
      default:
        return null;
    }
  };

  const filteredLinks = handleFilter(localLinks, filterConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Links</CardTitle>
        {showCheckboxes && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedLinks.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleStatusChange(
                  currentTab === 'todo'
                    ? TgLinkStatus.PROCESSING
                    : TgLinkStatus.PROCESSED
                )
              }
              disabled={selectedLinks.length === 0}
            >
              {currentTab === 'todo'
                ? 'Mark as Processing'
                : 'Mark as Processed'}
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
                    checked={selectedLinks.length === localLinks.length}
                    onCheckedChange={(checked) => {
                      setSelectedLinks(
                        checked ? localLinks.map((link) => link.id) : []
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
                  onFilterChange={updateFilter}
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
            {filteredLinks.map((link) => (
              <TableRow key={link.id}>
                {showCheckboxes && (
                  <TableCell>
                    <Checkbox
                      checked={selectedLinks.includes(link.id)}
                      onCheckedChange={(checked) => {
                        setSelectedLinks(
                          checked
                            ? [...selectedLinks, link.id]
                            : selectedLinks.filter((id) => id !== link.id)
                        );
                      }}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <React.Fragment key={`${link.id}-${column}`}>
                    {renderTableCell(link, column)}
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {offset + 1}-{Math.min(offset + pageSize, totalLinks)} of{' '}
          {totalLinks} links
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={(page) => {
            const newOffset = (page - 1) * pageSize;
            handlePageChange(newOffset);
          }}
          onPageSizeChange={handlePageSizeChange}
        />
      </CardFooter>
    </Card>
  );
}
