import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAccounts } from '@/lib/actions/account';
import { AccountsTable } from './accounts-table';
import { ACCOUNT_TAB_COLUMNS } from '@/lib/types';
import { TabWrapper } from '@/components/shared/tab-wrapper';
import { CreateAccountDialog } from './create-dialog';
import { Search } from './search';
import { AccountStatus } from '@/lib/types';

export default async function AccountsPage(props: {
  searchParams: Promise<{
    q?: string;
    offset?: string;
    tab?: string;
    pageSize?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = parseInt(searchParams.offset ?? '0');
  const pageSize = parseInt(searchParams.pageSize ?? '20');
  const currentTab = searchParams.tab ?? 'active';

  const statusMap = {
    active: [AccountStatus.ACTIVE],
    banned: [AccountStatus.BANNED],
    suspended: [AccountStatus.SUSPENDED]
  };

  const { accounts, totalAccounts } = await getAccounts(
    search,
    offset,
    statusMap[currentTab as keyof typeof statusMap],
    pageSize
  );

  return (
    <TabWrapper basePath="/dashboard/accounts" defaultTab="active">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="banned">Banned</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-4">
          <CreateAccountDialog />
        </div>
      </div>
      <TabsContent value="active" className="mt-4">
        <AccountsTable
          accounts={accounts}
          offset={offset}
          totalAccounts={totalAccounts}
          pageSize={pageSize}
          columns={ACCOUNT_TAB_COLUMNS.active}
          currentTab="active"
        />
      </TabsContent>
      <TabsContent value="banned" className="mt-4">
        <AccountsTable
          accounts={accounts}
          offset={offset}
          totalAccounts={totalAccounts}
          pageSize={pageSize}
          columns={ACCOUNT_TAB_COLUMNS.banned}
          currentTab="banned"
        />
      </TabsContent>
      <TabsContent value="suspended" className="mt-4">
        <AccountsTable
          accounts={accounts}
          offset={offset}
          totalAccounts={totalAccounts}
          pageSize={pageSize}
          columns={ACCOUNT_TAB_COLUMNS.suspended}
          currentTab="suspended"
        />
      </TabsContent>
    </TabWrapper>
  );
}
