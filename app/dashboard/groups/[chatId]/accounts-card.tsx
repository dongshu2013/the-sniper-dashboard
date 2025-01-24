'use client';

import { AccountIcon } from '@/components/icons/account-icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { AccountsDialog } from './account-dialog';

interface AccountsCardProps {
  accountTgIds: string[];
}

export function AccountsCard({ accountTgIds }: AccountsCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!accountTgIds?.length) {
    return (
      <Card className="border-none">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Accounts</CardTitle>
            <AccountIcon className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No pinned messages
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Accounts</CardTitle>
          <AccountIcon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          View Accounts ({accountTgIds.length})
        </Button>
      </CardContent>

      <AccountsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        accountTgIds={accountTgIds}
      />
    </Card>
  );
}
