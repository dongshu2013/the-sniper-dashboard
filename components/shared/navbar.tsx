'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useUserStore } from 'stores/userStore';
import { deleteJwt } from '../lib/networkUtils';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LoginDialog } from './login-dialog';

export function Navbar() {
  const user = useUserStore((state) => state.user);
  const pathname = usePathname();

  const router = useRouter();

  const handleLogout = async () => {
    await deleteJwt();
    router.push('/login');
  };

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/overview';
    }
    return pathname?.startsWith(href);
  };

  const navLinks = [
    {
      href: '/dashboard',
      label: 'Dashboard',
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Logo />
            <span className="font-bold">Curifi</span>
          </Link>

          {user && (
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
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {user.userId}
              </span>
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
