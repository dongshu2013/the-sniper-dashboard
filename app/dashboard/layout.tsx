'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import React from 'react';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/60">
        <div className="flex flex-col gap-2 p-2 sm:gap-4 sm:p-4">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
