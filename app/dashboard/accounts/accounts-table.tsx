'use client';

import * as React from 'react';
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
import { Account } from '@/lib/db';
import { AccountTableColumn } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';
import { formatDateTime } from '@/lib/utils';

interface AccountsTableProps {
  accounts: Account[];
  offset: number;
  totalAccounts: number;
  pageSize: number;
  columns: AccountTableColumn[];
  currentTab: 'active' | 'inactive' | 'archived';
}

export function AccountsTable({
  accounts,
  offset,
  totalAccounts,
  pageSize = 20,
  columns,
  currentTab
}: AccountsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', newOffset.toString());
    router.push(`/dashboard/accounts?${params.toString()}`);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', newPageSize.toString());
    params.set('offset', '0');
    router.push(`/dashboard/accounts?${params.toString()}`);
  };

  const totalPages = Math.ceil(totalAccounts / pageSize);
  const currentPage = Math.floor(offset / pageSize) + 1;

  const renderTableCell = (account: Account, column: AccountTableColumn) => {
    switch (column) {
      case 'username':
        return <TableCell>{account.username || 'N/A'}</TableCell>;
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
        return <TableCell>{account.fullname || 'N/A'}</TableCell>;
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
                <TableHead key={column} className="capitalize">
                  {column.replace(/([A-Z])/g, ' $1').trim()}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
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
