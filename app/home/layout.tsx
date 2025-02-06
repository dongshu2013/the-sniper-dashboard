'use client';

import { TooltipProvider } from '@/components/ui/tooltip';

export default function HomeLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">{children}</div>
    </TooltipProvider>
  );
}
