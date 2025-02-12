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
import {
  formatIncompletePhoneNumber,
  isValidPhoneNumber
} from 'libphonenumber-js';
import toast from 'react-hot-toast';
import { getJwt } from '@/components/lib/networkUtils';
import PhoneInput, { formatPhoneNumberIntl } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

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
  const [password, setPassword] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const normalizePhone = () => {
    try {
      if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
        return null;
      }

      return formatIncompletePhoneNumber(phoneNumber);
    } catch (error) {
      console.error('🌽🌽🌽 error', error);
      return null;
    }
  };

  const handleGetCode = async () => {
    const normalizedPhone = normalizePhone();
    console.log('🌽🌽🌽 handleGetCode', normalizedPhone);
    if (!normalizedPhone) {
      toast.error('Please enter a valid phone number with country code');
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

      const data = await response.json();
      if (data.code === 1) {
        toast.error(data.message);
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
    if (status === '2fa' && !password) {
      toast.error('Please enter the password');
      return;
    }

    setIsLoading(true);
    try {
      // Step 2: Set phone code in Redis
      const response = await fetch('/api/accounts/confirm-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          phone: phoneNumber,
          code: phoneCode,
          password
        })
      });
      if (!response.ok) {
        toast.error('Failed to confirm code');
        return;
      }

      // Step 3: Poll for status with 60s timeout
      const startTime = Date.now();
      const timeout = 60000 * 15; // 60 seconds

      const checkStatus = async () => {
        if (Date.now() - startTime > timeout) {
          toast.error('Operation timed out');
          setIsLoading(false);
          return;
        }
        try {
          const response = await fetch(
            `/api/accounts/status?phone=${encodeURIComponent(phoneNumber)}`,
            {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              }
            }
          );
          let timer: any;
          const { status, message } = await response.json();
          console.log('🚀🚀🚀', status, message);
          if (status === 'success') {
            setStatus('success');
            toast.success('Account created successfully');
            setOpen(false);
            clearTimeout(timer);
            router.refresh();
          }
          if (status === 'error') {
            toast.error(message);
            clearTimeout(timer);
          }
          if (status === '2fa') {
            setStatus('2fa');
            toast.error(message);
            timer = setTimeout(checkStatus, 6000);
          }
          if (status === 'pending') {
            timer = setTimeout(checkStatus, 6000);
          }
        } catch (error) {
          toast.error('Failed to get status');
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
            <PhoneInput
              value={phoneNumber}
              defaultCountry={'CN'}
              autoFormat={true}
              onChange={(value: any) => setPhoneNumber(value || '')}
              placeholder="+861234567890"
              style={{
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                borderRadius: '4px',
                border: '1px solid #e0e0e0'
              }}
            />
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
          {status === '2fa' && (
            <div className="grid gap-2">
              <Label htmlFor="password">Password*</Label>
              <Input
                id="password"
                type="password"
                value={password || ''}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>
          )}

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
