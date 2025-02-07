'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SortDirection } from '@/components/ui/filterable-table-header';

const SORT_OPTIONS = [
  { label: 'Members', value: 'participantsCount' },
  { label: 'Quality', value: 'qualityScore' },
  { label: 'Created At', value: 'createdAt' }
];

export function GeneralSort({
  basePath = '/dashboard/groups'
}: {
  basePath?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get('sortColumn');
  const currentDirection = searchParams.get('sortDirection') as SortDirection;

  const handleSort = (column: string, direction: SortDirection) => {
    const params = new URLSearchParams(searchParams.toString());

    if (direction) {
      params.set('sortColumn', column);
      params.set('sortDirection', direction);
    } else {
      params.delete('sortColumn');
      params.delete('sortDirection');
    }

    params.set('offset', '0');
    router.push(`${basePath}?${params.toString()}`);
  };

  const getCurrentLabel = () => {
    const option = SORT_OPTIONS.find((opt) => opt.value === currentSort);
    return option ? option.label : 'Sort by';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[130px] justify-between"
        >
          <div className="flex items-center gap-2">
            <span>{getCurrentLabel()}</span>
            {currentDirection === 'asc' && <ArrowUp className="h-4 w-4" />}
            {currentDirection === 'desc' && <ArrowDown className="h-4 w-4" />}
            {!currentDirection && (
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            )}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {SORT_OPTIONS.map((option) => (
          <React.Fragment key={option.value}>
            <DropdownMenuItem
              onClick={() => handleSort(option.value, 'asc')}
              className={cn(
                currentSort === option.value &&
                  currentDirection === 'asc' &&
                  'bg-accent'
              )}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              {option.label} (Ascending)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleSort(option.value, 'desc')}
              className={cn(
                currentSort === option.value &&
                  currentDirection === 'desc' &&
                  'bg-accent'
              )}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              {option.label} (Descending)
            </DropdownMenuItem>
          </React.Fragment>
        ))}
        {currentSort && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleSort('', null)}
              className={cn(!currentSort && 'bg-accent')}
            >
              <ChevronsUpDown className="mr-2 h-4 w-4" />
              Reset Sort
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
