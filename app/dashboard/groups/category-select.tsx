'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  'PORTAL_GROUP',
  'CRYPTO_PROJECT',
  'KOL',
  'VIRTUAL_CAPITAL',
  'EVENT',
  'TECH_DISCUSSION',
  'FOUNDER',
  'OTHERS'
] as const;

interface CategorySelectProps {
  basePath?: string;
}

export function CategorySelect({
  basePath = '/dashboard/groups'
}: CategorySelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const categoriesParam = searchParams.get('categories');
    if (categoriesParam) {
      const categoryArray = categoriesParam.split(',').filter(Boolean);
      setSelected(categoryArray);
    } else {
      setSelected([]);
    }
  }, [searchParams]);

  const updateUrlParams = (newSelected: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSelected.length > 0) {
      params.set('categories', newSelected.join(','));
    } else {
      params.delete('categories');
    }
    router.push(`${basePath}?${params.toString()}`);
  };

  const handleSelect = (value: string) => {
    setSelected((current) => {
      const newSelected = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      updateUrlParams(newSelected);
      return newSelected;
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selected.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(category);
                  }}
                >
                  {category}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          ) : (
            'Select category'
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {CATEGORIES.map((category) => (
                <CommandItem
                  key={category}
                  onSelect={() => handleSelect(category)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(category) ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {category}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          {selected.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setSelected([]);
                    updateUrlParams([]);
                  }}
                  className="justify-start text-sm"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear all
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
