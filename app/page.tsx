'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getJwt } from '@/components/lib/networkUtils';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const jwt = getJwt();

    if (jwt && (pathname === '/login' || pathname === '/')) {
      router.replace('/dashboard');
    }
    if (!jwt && pathname !== '/login') {
      router.replace('/login');
    }
  }, [router]);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
}
