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
import toast from 'react-hot-toast';
import { useUserStore } from 'stores/userStore';

export function LoginForm() {
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const token = getJwt();

  useEffect(() => {
    if (token && pathname === '/login') {
      router.push('/dashboard/overview');
    }
  }, [pathname]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return toast.error('Please input valid email and password');
    }

    if (
      email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    ) {
      return toast.error('only support admin login');
    }

    try {
      const res = await emailLogin({
        email,
        password
      });
      if (res.code === 0) {
        await saveJwt(res?.data?.token);
        setUser(res?.data?.user);
        router.push('/dashboard/overview');
      } else {
        return toast.error('Login failed!');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Enter email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter password"
              required
            />
          </div>
          <Button className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
        <div className="mt-8 flex items-center justify-center w-full">
          <div className="border-t border-[#ABAFB3] flex-grow" />
          <div className="text-[#202020] text-[14px] text-center font-semibold mx-2 text-nowrap">
            Sign in with
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
