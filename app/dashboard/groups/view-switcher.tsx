'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, List } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function ViewSwitcher({ currentView }: { currentView: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <Tabs
      value={currentView}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', value);
        router.push(`/dashboard/groups?${params.toString()}`);
      }}
    >
      <TabsList>
        <TabsTrigger value="list" className="px-3">
          <List className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="grid" className="px-3">
          <LayoutGrid className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
