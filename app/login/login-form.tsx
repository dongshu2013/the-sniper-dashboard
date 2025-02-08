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
import { Spinner } from 'theme-ui';

export function LoginForm() {
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [account, setAccount] = useState('');
  const token = getJwt();

  useEffect(() => {
    if (token && pathname === '/login') {
      router.push('/dashboard/overview');
    }
  }, [pathname]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const handleLogin = async () => {
    if (!account || !code) {
      return toast.error('Please input valid email and code');
    }
    // if (account !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    //   return toast.error('Only admin can login with email');
    // }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email: account,
          code
        })
      });
      const data = await res.json();
      console.log('🚀 ~ handleLogin ~ data', data);
      if (data.code === 0) {
        await saveJwt(data?.data?.token);
        setUser(data?.data?.user);
        router.push('/dashboard/overview');
      } else {
        return toast.error(data?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      return toast.error('Please input valid email and password');
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

  const handleSendCode = async () => {
    if (!account) {
      return toast.error('Please input valid email and code');
    }
    // if (account !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    //   return toast.error('Only admin can login with email');
    // }
    setIsSending(true);
    const res = await fetch(`/api/auth/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: account
      })
    });

    console.log('🚀 ~ handleSendCode ~ res', res);
    const data = await res.json();
    if (data.code === 0) {
      setCountdown(60);
      setCode('');
      setIsSending(false);
    } else {
      setIsSending(false);
      return toast.error(data?.message || 'Send failed');
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access the dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@gmail.com"
              required
              onChange={(e) => setAccount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Code</Label>
            {/* <Input id="password" name="password" type="password" required /> */}
            <div className="flex flex-row gap-2">
              <Input
                placeholder="Verification Code"
                value={code}
                onChange={(e: any) => setCode(e.target.value)}
              />
              <Button
                disabled={countdown > 0}
                className={`
                  ${countdown > 0 ? 'gray text-gray-600' : 'primary text-white'} 
                  flex-shrink-0 rounded-[7px]
                   flex justify-center items-center
                   ${!account ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={handleSendCode}
              >
                {countdown > 0 ? (
                  `${countdown}s`
                ) : isSending ? (
                  <Spinner
                    size={20}
                    sx={{ color: 'white', textAlign: 'center', mr: 3 }}
                  />
                ) : (
                  'Send'
                )}
              </Button>
            </div>
          </div>
          <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
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
