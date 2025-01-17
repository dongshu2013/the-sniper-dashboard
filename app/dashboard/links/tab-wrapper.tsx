'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs } from '@/components/ui/tabs';

export function TabWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') ?? 'todo';

  return (
    <Tabs
      value={currentTab}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', value);
        params.set('offset', '0'); // Reset offset when changing tabs
        router.push(`/dashboard/links?${params.toString()}`);
      }}
    >
      {children}
    </Tabs>
  );
}
