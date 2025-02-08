'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TelegramLoginButton from '@/components/ui/TelegramLoginButton';
import { getJwt, saveJwt } from '@/components/lib/networkUtils';
import toast from 'react-hot-toast';
import { useUserStore } from 'stores/userStore';
import { Spinner } from 'theme-ui';

export function LoginDialog() {
  const setUser = useUserStore((state) => state.setUser);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [account, seAccount] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const token = getJwt();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

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
  // async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
  //   e.preventDefault();
  //   setError(null);
  //   setIsLoading(true);

  //   const formData = new FormData(e.currentTarget);
  //   const email = formData.get('email') as string;
  //   const password = formData.get('password') as string;

  //   try {
  //     if (
  //       email === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
  //       password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
  //     ) {
  //       const res = await emailLogin({
  //         email,
  //         password
  //       });
  //       if (res.code === 0) {
  //         await saveJwt(res?.data?.token);
  //         setUser(res?.data?.user);
  //         setOpen(false); // 关闭对话框
  //         router.push('/dashboard/overview');
  //       } else {
  //         toast.error('Login failed!');
  //       }
  //     } else {
  //       toast.error(
  //         'Invalid email or password(Only admin can login with email).'
  //       );
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Sign in
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Login</DialogTitle>
          <DialogDescription>
            Enter your credentials to access the dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@gmail.com"
              required
              onChange={(e) => seAccount(e.target.value)}
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
          {/* {error && <p className="text-sm text-red-500">{error}</p>} */}
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
        <div className="justify-center flex py-4">
          <TelegramLoginButton />
        </div>
      </DialogContent>
    </Dialog>
  );
}
