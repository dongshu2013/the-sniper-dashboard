'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { SearchIcon } from 'lucide-react';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') ?? '');

  // Debounce the search to avoid too many requests
  const debouncedSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    params.set('offset', '0'); // Reset pagination when searching
    router.push(`/dashboard/groups?${params.toString()}`);
  }, 300);

  const handleSearch = useCallback(
    (term: string) => {
      setValue(term);
      debouncedSearch(term);
    },
    [debouncedSearch]
  );

  // Sync URL search param with input value
  useEffect(() => {
    setValue(searchParams.get('q') ?? '');
  }, [searchParams]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="relative w-full max-w-sm">
        <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search groups by name..."
          className="pl-8"
          value={value}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
    </Suspense>
  );
}
