'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function ViewStateHandler({ basePath = '/dashboard/groups' }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 检查是否为移动设备
    const isMobile = window.innerWidth <= 768;

    // 只在没有明确设置 view 参数时执行
    if (!searchParams.has('view')) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('view', isMobile ? 'grid' : 'list');
      router.replace(`${basePath}?${params.toString()}`);
    }

    // 监听窗口大小变化
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (!searchParams.has('view')) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', isMobile ? 'grid' : 'list');
        router.replace(`${basePath}?${params.toString()}`);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [router, searchParams, basePath]);

  return null;
}
