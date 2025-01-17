'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs } from '@/components/ui/tabs';

export function TabWrapper({
  children,
  basePath,
  defaultTab
}: {
  children: React.ReactNode;
  basePath: string;
  defaultTab: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') ?? defaultTab;

  return (
    <Tabs
      value={currentTab}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams);
        params.set('tab', value);
        params.set('offset', '0');
        router.push(`${basePath}?${params.toString()}`);
      }}
    >
      {children}
    </Tabs>
  );
}
