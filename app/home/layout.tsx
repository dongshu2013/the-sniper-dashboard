'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import React from 'react';

export default function HomeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/60">
        <div className="flex flex-col gap-2 p-2 sm:gap-4 sm:p-4">
          <main className="grid flex-1 items-start gap-2 sm:gap-4">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
