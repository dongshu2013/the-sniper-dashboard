'use client';

import { useState } from 'react';
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
import { createAccount } from './actions';
import { PlusCircle } from 'lucide-react';

export function CreateAccountDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await createAccount({
      tgId: formData.get('tgId') as string,
      username: formData.get('username') as string,
      apiId: formData.get('apiId') as string,
      apiHash: formData.get('apiHash') as string,
      phone: formData.get('phone') as string,
      fullname: formData.get('fullname') as string
    });

    setOpen(false);
    router.refresh();
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
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tgId">Telegram ID</Label>
            <Input id="tgId" name="tgId" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiId">API ID</Label>
            <Input id="apiId" name="apiId" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiHash">API Hash</Label>
            <Input id="apiHash" name="apiHash" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fullname">Full Name</Label>
            <Input id="fullname" name="fullname" />
          </div>
          <Button type="submit">Create Account</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
