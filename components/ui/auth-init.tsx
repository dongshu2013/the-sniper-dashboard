'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getJwt } from '@/components/lib/networkUtils';

export default function AuthInit() {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    (async () => {
      setIsClient(true);
      const jwt = getJwt();

      if (jwt && (pathname === '/login' || pathname === '/')) {
        router.replace('/dashboard');
      }
      if (!jwt && pathname !== '/login' && !pathname.startsWith('/home')) {
        router.replace('/login');
      }
    })();
  }, [router, pathname]);

  if (!isClient) {
    return null;
  }

  return null;
}
