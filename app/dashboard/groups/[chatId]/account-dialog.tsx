import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: { username: string | null }[];
}

export function AccountsDialog({
  open,
  onOpenChange,
  accounts
}: AccountDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Accounts</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto pr-6 -mr-6">
          {accounts.map((account) => (
            <div key={account.username}>{account.username}</div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
