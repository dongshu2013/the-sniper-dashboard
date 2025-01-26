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
import { Account } from '@/lib/schema';
import { getJwt } from '@/components/lib/networkUtils';

export function AccountSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [open, setOpen] = React.useState(false);
  const [accounts, setAccounts] = React.useState<Account[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  // 加载账户列表
  const loadAccounts = React.useCallback(async () => {
    try {
      const token = getJwt();
      const response = await fetch(`/api/accounts?status=active`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch accounts');

      const data = await response.json();
      setAccounts(data?.data?.accounts || []);
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  }, []);

  // 初始化加载账户
  React.useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // 从 URL 参数同步选中状态
  React.useEffect(() => {
    const accountsParam = searchParams.get('accounts');
    if (accountsParam) {
      const accountArray = accountsParam.split(',').filter(Boolean);
      setSelected(accountArray);
    } else {
      setSelected([]);
    }
  }, [searchParams]);

  // 更新 URL 参数
  const updateUrlParams = (newSelected: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSelected.length > 0) {
      params.set('accounts', newSelected.join(','));
    } else {
      params.delete('accounts');
    }
    router.push(`/dashboard/groups?${params.toString()}`);
  };

  // 处理选择/取消选择
  const handleSelect = (value: string) => {
    setSelected((current) => {
      const newSelected = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      updateUrlParams(newSelected);
      return newSelected;
    });
  };

  // 过滤账户列表
  const filteredAccounts = accounts.filter((account) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      account.username?.toLowerCase().includes(searchLower) ||
      account.phone?.toLowerCase().includes(searchLower) ||
      account.tgId?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selected.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selected.map((account) => (
                <Badge
                  key={account}
                  variant="secondary"
                  className="mr-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(account);
                  }}
                >
                  {account}
                  <X className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          ) : (
            'Select account'
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder="Search accounts..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>No account found.</CommandEmpty>
            <CommandGroup>
              {filteredAccounts.map((account) => (
                <CommandItem
                  key={account.tgId}
                  onSelect={() => handleSelect(account.tgId)}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected.includes(account.tgId)
                        ? 'opacity-100'
                        : 'opacity-0'
                    )}
                  />
                  {account.username || account.tgId}
                </CommandItem>
              ))}
            </CommandGroup>
            {selected.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelected([]);
                      updateUrlParams([]);
                    }}
                    className="justify-center text-sm"
                  >
                    Clear all
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
