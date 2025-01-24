'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TelegramLoginButton from '@/components/ui/TelegramLoginButton';
import { emailLogin } from '@/lib/actions/user';
import { saveJwt, getJwt } from '@/components/lib/networkUtils';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const jwt = getJwt();
    console.log('🚀🚀', jwt, pathname);

    if (jwt && pathname === '/login') {
      router.push('/dashboard/overview');
    }
  }, [usePathname]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (
        email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
        password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
      ) {
        const res = await emailLogin({
          email,
          password
        });
        if (res.code === 0) {
          console.log('🌽🌽', res);
          await saveJwt(res?.data?.token);
          router.push('/dashboard/overview');
        } else {
          toast.error('Login failed!');
        }
      } else {
        toast.error(
          'Invalid email or password(Only admin can login with email).'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@gmail.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <div className="mt-8 flex items-center justify-center w-full">
          <div className="border-t border-[#ABAFB3] flex-grow" />
          <div className="text-[#202020] text-[14px] text-center font-semibold mx-2 text-nowrap">
            Or sigin with
          </div>
          <div className="border-t border-[#ABAFB3] flex-grow" />
        </div>
        <div className="justify-center flex p-8">
          <TelegramLoginButton />
        </div>
      </CardContent>
    </Card>
  );
}
