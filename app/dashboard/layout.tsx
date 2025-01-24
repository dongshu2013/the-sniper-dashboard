'use client';

import Link from 'next/link';
import { Home, Link2, LogOut, MessageCircle, User } from 'lucide-react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { NavItem } from './nav-item';
import { useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { deleteJwt, getJwt } from '@/components/lib/networkUtils';
import { verifyJWT } from '@/lib/jwt';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await deleteJwt();
    router.push('/login');
  };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav onLogout={handleLogout} />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav onLogout={handleLogout} />
            <DashboardBreadcrumb />
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

function DesktopNav({ onLogout }: { onLogout: () => void }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const token = await getJwt();
      if (!token) {
        return;
      }
      const jwtSub = await verifyJWT(token);
      setIsAdmin(jwtSub?.isAdmin || false);
    })();
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavItem href="/dashboard/overview" label="Dashboard">
          <Home className="h-5 w-5" />
        </NavItem>

        {isAdmin && (
          <NavItem href="/dashboard/links" label="Telegram Links">
            <Link2 className="h-5 w-5" />
          </NavItem>
        )}

        <NavItem href="/dashboard/groups" label="Groups">
          <MessageCircle className="h-5 w-5" />
        </NavItem>

        <NavItem href="/dashboard/accounts" label="Accounts">
          <User className="h-5 w-5" />
        </NavItem>
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Logout</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

function MobileNav({ onLogout }: { onLogout: () => void }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="px-2 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 sm:hidden"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72">
        <nav className="flex flex-col gap-4">
          <Link href="/dashboard/overview" className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/links" className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            <span>Telegram Links</span>
          </Link>
          <Link href="/dashboard/groups" className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>Groups</span>
          </Link>
          <Link href="/dashboard/accounts" className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <span>Accounts</span>
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function DashboardBreadcrumb() {
  const pathname = usePathname();

  const breadcrumbItems = getBreadcrumbItems(pathname);

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const pathMap: Record<string, string> = {
  dashboard: 'Dashboard',
  overview: 'Overview',
  links: 'Telegram Links',
  groups: 'Groups',
  accounts: 'Accounts'
};

function getBreadcrumbItems(pathname: string) {
  const paths = pathname.split('/').filter(Boolean);

  return paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join('/')}`;
    const label = pathMap[path] || path;

    return {
      href,
      label
    };
  });
}
