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
import { TgLink } from '@/lib/db';
import { updateLinkStatus } from './actions';
import { TgLinkStatus, LinkTableColumn, LINK_TAB_COLUMNS } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';
import { formatDateTime } from '@/lib/utils';

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
            <a
              href={`/dashboard/groups/${link.chatId}`}
              className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
            >
              {link.chatName}
            </a>
          </TableCell>
        );
      case 'status':
        return (
          <TableCell>
            <Badge variant="outline" className="capitalize">
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
                    checked={selectedLinks.length === links.length}
                    onCheckedChange={(checked) => {
                      setSelectedLinks(
                        checked ? links.map((link) => link.id) : []
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
            {links.map((link) => (
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
