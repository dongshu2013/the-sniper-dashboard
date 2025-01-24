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
  const idsString = Array.isArray(accountTgIds) ? accountTgIds.join(',') : '';
  const response = await fetch(`/api/accounts/batch?ids=${idsString}`);
  const data = await response.json();
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
                <div
                  key={account.tgId}
                  className="flex flex-col space-y-1 p-4 rounded-lg border"
                >
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">ID:</span>
                      <span className="ml-2">{account.tgId}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Username:
                      </span>
                      <span className="ml-2">{account.username || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Phone:
                      </span>
                      <span className="ml-2">
                        {account.phoneNumber || 'N/A'}
                      </span>
                    </div>
                  </div>
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
