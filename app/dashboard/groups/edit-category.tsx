'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateCategory } from './actions';
import { useRouter } from 'next/navigation';

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

interface EditCategoryProps {
  chatId: number;
  currentCategory: string;
}

export function EditCategory({ chatId, currentCategory }: EditCategoryProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState(currentCategory);
  const router = useRouter();

  const handleSelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleUpdate = async () => {
    if (selectedCategory === currentCategory) {
      setIsOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await updateCategory(chatId, selectedCategory);
      if (result.success) {
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to update category:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 h-8 w-full justify-between"
          disabled={isLoading}
        >
          {currentCategory}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {CATEGORIES.map((category) => (
          <DropdownMenuItem
            key={category}
            onSelect={(e) => {
              // 阻止默认的选择行为，防止下拉菜单关闭
              e.preventDefault();
              handleSelect(category);
            }}
            className={cn(
              'flex items-center justify-between',
              selectedCategory === category && 'bg-accent'
            )}
          >
            {category}
            {selectedCategory === category && (
              <Check className="h-4 w-4 opacity-50" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="p-2">
          <Button
            size="sm"
            className="w-full"
            disabled={selectedCategory === currentCategory || isLoading}
            onClick={handleUpdate}
          >
            Update Category
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
