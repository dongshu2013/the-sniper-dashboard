import * as React from 'react';
import { TableHead } from './table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './dropdown-menu';
import { Input } from './input';
import { Button } from './button';
import { Filter, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FilterConfig = {
  column: string;
  value: string;
};

interface FilterableTableHeaderProps {
  column: string;
  label: string;
  filterValue: string;
  onFilterChange: (column: string, value: string) => void;
  sortDirection?: 'asc' | 'desc' | null;
  onSort?: (column: string, direction: 'asc' | 'desc' | null) => void;
}

export function FilterableTableHeader({
  column,
  label,
  filterValue,
  onFilterChange,
  sortDirection,
  onSort
}: FilterableTableHeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <TableHead>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{label}</span>
            {filterValue && (
              <Filter className="ml-2 h-4 w-4 text-muted-foreground" />
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          <div className="flex items-center gap-2 p-2">
            <Input
              placeholder={`Filter ${label.toLowerCase()}...`}
              value={filterValue}
              onChange={(e) => onFilterChange(column, e.target.value)}
              className="h-8"
            />
            {filterValue && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onFilterChange(column, '')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {onSort && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onSort(column, 'asc')}
                className={cn(sortDirection === 'asc' && 'bg-accent')}
              >
                Sort Ascending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSort(column, 'desc')}
                className={cn(sortDirection === 'desc' && 'bg-accent')}
              >
                Sort Descending
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSort(column, null)}
                className={cn(!sortDirection && 'bg-accent')}
              >
                Remove Sort
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </TableHead>
  );
}
