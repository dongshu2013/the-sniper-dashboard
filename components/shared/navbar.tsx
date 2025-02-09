'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useUserStore } from 'stores/userStore';
import { deleteJwt, getJwt } from '../lib/networkUtils';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LoginDialog } from './login-dialog';
import { LogoIcon } from '../icons/logo-icon';
import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const pathname = usePathname();
  const router = useRouter();
  const token = getJwt();

  const handleLogout = async () => {
    await deleteJwt();
    if (user?.userKeyType === 'tgId') {
      const botId = process.env.NEXT_PUBLIC_BOT_ID;
      const origin = process.env.NEXT_PUBLIC_LOGIN_URL;

      if (botId && origin) {
        const encodedOrigin = encodeURIComponent(origin);
        window.location.href = `https://oauth.telegram.org/auth/revoke?bot_id=${botId}&origin=${encodedOrigin}`;
      }
    }

    setUser(null as any);
    router.push('/');
  };

  const isLinkActive = (href: string) => {
    return pathname?.startsWith(href);
  };

  const navLinks = [
    {
      href: '/home',
      label: 'Home',
      show: true
    },
    {
      href: '/dashboard/links',
      label: 'Links',
      show: user?.isAdmin
    },
    {
      href: '/dashboard/groups',
      label: 'Groups',
      show: true
    },
    {
      href: '/dashboard/accounts',
      label: 'Accounts',
      show: user?.isAdmin
    }
  ];

  const currentNav = navLinks.find(
    (link) => link.show && isLinkActive(link.href)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-12">
          <Link href="/home" className="flex items-center space-x-2">
            <LogoIcon className="w-8 h-8" />
            <span className="font-bold">Curifi</span>
          </Link>

          {user && (
            <>
              {/* 桌面端导航 */}
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map(
                  (link) =>
                    link.show && (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          'text-sm font-medium transition-colors',
                          isLinkActive(link.href)
                            ? 'text-primary font-semibold'
                            : 'text-muted-foreground hover:text-primary'
                        )}
                      >
                        {link.label}
                      </Link>
                    )
                )}
              </nav>

              {/* 移动端导航 */}
              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-9"
                    >
                      <span className="text-sm font-medium">
                        {currentNav?.label || 'Home'}
                      </span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[160px]">
                    {navLinks.map(
                      (link) =>
                        link.show && (
                          <DropdownMenuItem key={link.href} asChild>
                            <Link
                              href={link.href}
                              className={cn(
                                'w-full',
                                isLinkActive(link.href)
                                  ? 'text-primary font-semibold'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {link.label}
                            </Link>
                          </DropdownMenuItem>
                        )
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              {/* <span className="text-sm text-muted-foreground">
                {user.userId}
              </span> */}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          ) : (
            <LoginDialog />
          )}
        </div>
      </div>
    </header>
  );
}
