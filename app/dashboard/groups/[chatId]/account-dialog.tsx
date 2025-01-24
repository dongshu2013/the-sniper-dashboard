import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useEffect, useState } from 'react';

interface Account {
  tgId: string;
  username: string;
  phoneNumber: string;
}

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountTgIds: string[];
}

async function fetchAccounts(accountTgIds: string[]) {
  const response = await fetch(`/api/accounts?ids=${accountTgIds.join(',')}`);
  const data = await response.json();
  // console.log('---accountTgIds', accountTgIds);
  // console.log('---data', data);
  return data.accounts;
}

export function AccountsDialog({
  open,
  onOpenChange,
  accountTgIds
}: AccountDialogProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadAccounts() {
      if (open && accountTgIds.length > 0) {
        setLoading(true);
        try {
          const data = await fetchAccounts(accountTgIds);
          setAccounts(data);
        } catch (error) {
          console.error('Failed to load accounts:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadAccounts();
  }, [open, accountTgIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Accounts</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : accounts && accounts.length > 0 ? (
            <div className="space-y-6">
              {accounts.map((account) => (
                <div key={account.tgId}>
                  {account.tgId} - {account.username} - {account.phoneNumber}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              No accounts found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
