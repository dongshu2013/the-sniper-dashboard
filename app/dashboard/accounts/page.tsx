import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAccounts } from '@/lib/db';
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
          <Search />
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
      <TabsContent value="inactive" className="mt-4">
        <AccountsTable
          accounts={accounts}
          offset={offset}
          totalAccounts={totalAccounts}
          pageSize={pageSize}
          columns={ACCOUNT_TAB_COLUMNS.inactive}
          currentTab="inactive"
        />
      </TabsContent>
      <TabsContent value="archived" className="mt-4">
        <AccountsTable
          accounts={accounts}
          offset={offset}
          totalAccounts={totalAccounts}
          pageSize={pageSize}
          columns={ACCOUNT_TAB_COLUMNS.archived}
          currentTab="archived"
        />
      </TabsContent>
    </TabWrapper>
  );
}
