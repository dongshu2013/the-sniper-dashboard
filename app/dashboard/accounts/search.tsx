'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    params.set('offset', '0');
    router.push(`/dashboard/accounts?${params.toString()}`);
  }, 300);

  const handleSearch = useCallback(
    (term: string) => {
      setValue(term);
      debouncedSearch(term);
    },
    [debouncedSearch]
  );

  useEffect(() => {
    setValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search accounts..."
        className="pl-8"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
