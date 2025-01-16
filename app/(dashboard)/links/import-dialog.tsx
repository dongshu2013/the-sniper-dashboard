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
import { Textarea } from '@/components/ui/textarea';
import { importLinks } from './actions';

export function ImportLinksDialog() {
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState('');
  const router = useRouter();

  const handleImport = async () => {
    const linkList = links
      .split('\n')
      .map((link) => link.trim())
      .filter(Boolean);

    await importLinks(linkList);
    setLinks('');
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Import Links</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Telegram Links</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Textarea
            placeholder="Paste links (one per line)"
            value={links}
            onChange={(e) => setLinks(e.target.value)}
            rows={10}
          />
          <Button onClick={handleImport}>Import</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
