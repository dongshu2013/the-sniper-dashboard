'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { isValidPhoneNumber } from 'libphonenumber-js';
import toast from 'react-hot-toast';
import { getJwt } from '@/components/lib/networkUtils';

export function CreateAccountDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [apiId, setApiId] = useState('');
  const [apiHash, setApiHash] = useState('');
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();
  const token = getJwt();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Function to validate phone number format
  const normalizePhone = (phone: string): string | null => {
    try {
      if (!isValidPhoneNumber(phone)) {
        return null;
      }
      return phone; // Since input is already in E.164 format (+XX...)
    } catch (error) {
      return null;
    }
  };

  const handleGetCode = async () => {
    const normalizedPhone = normalizePhone(phoneNumber);
    if (!normalizedPhone) {
      toast.error(
        'Please enter a valid phone number with country code (e.g. +12223334455)'
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/accounts/request-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          apiId: apiId || undefined,
          apiHash: apiHash || undefined
        })
      });
      if (!response.ok) {
        toast.error('Failed to send confirmation code');
        return;
      }
      const data = await response.json();
      if (data.code === 1) {
        toast.error('Code already sent');
        return;
      }

      toast.success('Confirmation code sent to your Telegram');
      setCountdown(60);
    } catch (error) {
      toast.error('Failed to send confirmation code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCode = async () => {
    if (!phoneCode) {
      toast.error('Please enter the confirmation code');
      return;
    }

    setIsLoading(true);
    try {
      // Step 2: Set phone code in Redis
      await fetch('/api/accounts/confirm-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code: phoneCode
        })
      });

      // Step 3: Poll for status with 60s timeout
      const startTime = Date.now();
      const timeout = 60000 * 15; // 60 seconds

      const checkStatus = async () => {
        if (Date.now() - startTime > timeout) {
          toast.error('Operation timed out');
          setIsLoading(false);
          return;
        }
        const response = await fetch(
          `/api/accounts/status?phone=${encodeURIComponent(phoneNumber)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }
        );
        const data = await response.json();
        console.log('🚀🚀🚀', data);
        if (data.status === 'success') {
          toast.success('Account created successfully');
          setOpen(false);
          router.refresh();
        } else if (data.status === 'error') {
          toast.error('Failed to create account');
        } else if (data.status === 'pending') {
          // Continue polling
          setTimeout(checkStatus, 6000);
        }
      };
      checkStatus();
    } catch (error) {
      toast.error('Failed to confirm code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Account
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Account</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Phone Number*</Label>
            <div className="flex gap-2">
              <Input
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+12223334455"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apiId">API ID (Optional)</Label>
            <Input
              id="apiId"
              value={apiId}
              onChange={(e) => setApiId(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="apiHash">API Hash (Optional)</Label>
            <Input
              id="apiHash"
              value={apiHash}
              onChange={(e) => setApiHash(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phoneCode">Confirmation Code*</Label>
            <div className="flex gap-2">
              <Input
                id="phoneCode"
                value={phoneCode}
                onChange={(e) => setPhoneCode(e.target.value)}
                required
              />

              <Button
                onClick={handleGetCode}
                disabled={isLoading || !phoneNumber || countdown > 0}
              >
                {countdown > 0 ? `Wait ${countdown}s` : 'Get Code'}
              </Button>
            </div>
          </div>

          <Button
            onClick={handleConfirmCode}
            disabled={isLoading || !phoneCode}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
