'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = getJWT();
    if (isLoggedIn) {
      router.push('/dashboard/overview');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
