'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

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

export function CategorySelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = React.useState<string[]>([]);

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
    router.push(`/dashboard/groups?${params.toString()}`);
  };

  const handleSelect = (value: string) => {
    if (!value) return;

    setSelected((current) => {
      const newSelected = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      updateUrlParams(newSelected);
      return newSelected;
    });
  };

  const removeCategory = (categoryToRemove: string) => {
    setSelected((current) => {
      const newSelected = current.filter(
        (category) => category !== categoryToRemove
      );
      updateUrlParams(newSelected);
      return newSelected;
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {selected.map((category) => (
          <Badge
            key={category}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {category}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 px-0.5 hover:bg-transparent"
              onClick={() => removeCategory(category)}
            >
              <X className="h-3 w-3" />
              <span className="sr-only">Remove {category}</span>
            </Button>
          </Badge>
        ))}
      </div>
      <Select onValueChange={handleSelect}>
        <SelectTrigger className="h-8 w-auto min-w-[180px]">
          <SelectValue placeholder="Add category..." />
        </SelectTrigger>
        <SelectContent className="min-w-[180px]">
          {CATEGORIES.map((category) => (
            <SelectItem
              key={category}
              value={category}
              disabled={selected.includes(category)}
            >
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
