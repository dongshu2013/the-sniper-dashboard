'use client';
import React, { useState, useEffect, useCallback } from 'react';
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
import { Account } from '@/lib/schema';
import { AccountTableColumn } from '@/lib/types';
import { Pagination } from '@/components/ui/pagination';
import { formatDateTime } from '@/lib/utils';
import { useTableSort } from '@/lib/hooks/use-table-sort';
import {
  FilterableTableHeader,
  SortDirection
} from '@/components/ui/filterable-table-header';
import { useTableFilter } from '@/lib/hooks/use-table-filter';
import { getJwt } from '@/components/lib/networkUtils';
import toast from 'react-hot-toast';

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

export type TabType = 'active' | 'banned' | 'suspended';

interface AccountsTableProps {
  columns: AccountTableColumn[];
  currentTab: TabType;
}

export function AccountsTable({ columns, currentTab }: AccountsTableProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { sortConfig, handleSort } = useTableSort(accounts);
  const { filterConfig, handleFilter, updateFilter } = useTableFilter(accounts);
  const [localAccounts, setLocalAccounts] = useState<Account[]>(accounts);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [curPage, setCurPage] = useState(1); // 当前页码
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLocalAccounts(accounts);
  }, [accounts]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getJwt();
      const offset = (curPage - 1) * pageSize;
      const query = new URLSearchParams({
        search,
        offset: offset.toString(),
        pageSize: pageSize.toString(),
        status: currentTab
      });

      const res = await fetch(`/api/accounts?${query.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch accounts');
      }

      const data = await res.json();
      console.log('~~~~~🚀', data);
      setAccounts(data?.data?.accounts ?? []);
      setTotalAccounts(data?.data?.totalAccounts ?? 0);
    } catch (error) {
      toast.error('get account failed');
    } finally {
      setLoading(false);
    }
  }, [curPage, pageSize, currentTab, search]);

  useEffect(() => {
    loadData();
  }, [pageSize, curPage, currentTab]);

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

  const filteredAccounts = handleFilter(localAccounts, filterConfig);

  return (
    <Card className="border-0">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
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
            {filteredAccounts?.map((account) => (
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
          Showing {(curPage - 1) * pageSize + 1}-
          {Math.min((curPage - 1) * pageSize + pageSize, totalAccounts)} of{' '}
          {totalAccounts} accounts
        </div>
        <Pagination
          currentPage={curPage}
          totalPages={Math.ceil(totalAccounts / pageSize)}
          pageSize={pageSize}
          onPageChange={(page) => {
            setCurPage(page);
          }}
          onPageSizeChange={(newPageSize) => {
            setPageSize(newPageSize);
            setCurPage(1);
          }}
        />
      </CardFooter>
    </Card>
  );
}
