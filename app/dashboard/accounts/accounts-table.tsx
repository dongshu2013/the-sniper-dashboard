'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
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
import { Account } from '@/lib/db';
import { AccountTableColumn } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';
import { formatDateTime } from '@/lib/utils';
import {
  SortableTableHeader,
  SortDirection
} from '@/components/ui/sortable-table-header';
import { useTableSort } from '@/lib/hooks/use-table-sort';

// 列名映射
const COLUMN_MAP: Record<string, string> = {
  username: 'username',
  tgId: 'tgId',
  phone: 'phone',
  status: 'status',
  fullname: 'fullname',
  lastActiveAt: 'lastActiveAt',
  createdAt: 'createdAt'
};

interface AccountsTableProps {
  accounts: Account[];
  offset: number;
  totalAccounts: number;
  pageSize: number;
  columns: AccountTableColumn[];
  currentTab: 'active' | 'banned' | 'suspended';
}

export function AccountsTable({
  accounts,
  offset,
  totalAccounts,
  pageSize = 20,
  columns,
  currentTab
}: AccountsTableProps) {
  const [localAccounts, setLocalAccounts] = useState(accounts);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sortConfig, handleSort } = useTableSort(accounts);

  useEffect(() => {
    setLocalAccounts(accounts);
  }, [accounts]);

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', newOffset.toString());
    router.push(`/dashboard/accounts?${params.toString()}`);
  };

  const handleSortChange = (column: string, direction: SortDirection) => {
    const mappedColumn = COLUMN_MAP[column] || column;
    const sortedData = handleSort(accounts, mappedColumn, direction);
    setLocalAccounts(sortedData);
  };

  const renderTableCell = (account: Account, column: AccountTableColumn) => {
    switch (column) {
      case 'username':
        return <TableCell>{account.username}</TableCell>;
      case 'tgId':
        return <TableCell>{account.tgId}</TableCell>;
      case 'phone':
        return <TableCell>{account.phone}</TableCell>;
      case 'status':
        return (
          <TableCell>
            <Badge variant="outline" className="capitalize">
              {account.status}
            </Badge>
          </TableCell>
        );
      case 'fullname':
        return <TableCell>{account.fullname}</TableCell>;
      case 'lastActiveAt':
        return <TableCell>{formatDateTime(account.lastActiveAt)}</TableCell>;
      case 'createdAt':
        return <TableCell>{formatDateTime(account.createdAt)}</TableCell>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <SortableTableHeader
                  key={column}
                  column={column}
                  label={column.replace(/([A-Z])/g, ' $1').trim()}
                  sortDirection={
                    sortConfig.column === COLUMN_MAP[column]
                      ? sortConfig.direction
                      : null
                  }
                  onSort={handleSortChange}
                />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {localAccounts.map((account) => (
              <TableRow key={account.id}>
                {columns.map((column) => (
                  <React.Fragment key={`${account.id}-${column}`}>
                    {renderTableCell(account, column)}
                  </React.Fragment>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {offset + 1}-{Math.min(offset + pageSize, totalAccounts)} of{' '}
          {totalAccounts} accounts
        </div>
        <Pagination
          currentPage={Math.floor(offset / pageSize) + 1}
          totalPages={Math.ceil(totalAccounts / pageSize)}
          pageSize={pageSize}
          onPageChange={(page) => {
            const newOffset = (page - 1) * pageSize;
            handlePageChange(newOffset);
          }}
          onPageSizeChange={(newPageSize) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('pageSize', newPageSize.toString());
            params.set('offset', '0');
            router.push(`/dashboard/accounts?${params.toString()}`);
          }}
        />
      </CardFooter>
    </Card>
  );
}
