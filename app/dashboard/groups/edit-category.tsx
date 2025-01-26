'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
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
  const router = useRouter();

  const handleSelect = async (category: string) => {
    if (category === currentCategory) {
      setIsOpen(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await updateCategory(chatId, category);
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
            onClick={() => handleSelect(category)}
            className={cn(
              'flex items-center justify-between',
              currentCategory === category && 'bg-accent'
            )}
          >
            {category}
            {currentCategory === category && (
              <Check className="h-4 w-4 opacity-50" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
