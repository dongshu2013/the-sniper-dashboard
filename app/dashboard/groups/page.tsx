import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chatMetadata, getChatMetadataWithAccounts } from '@/lib/db';
import { GroupsTable } from './groups-table';
import { GROUP_TAB_COLUMNS } from '@/lib/types';
import { TabWrapper } from '@/components/shared/tab-wrapper';
import { Search } from './search';
import { asc, SQL } from 'drizzle-orm';

export default async function GroupsPage(props: {
  searchParams: Promise<{
    q?: string;
    offset?: string;
    tab?: string;
    pageSize?: string;
    orderBy?: string;
    direction?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = parseInt(searchParams.offset ?? '0');
  const pageSize = parseInt(searchParams.pageSize ?? '20');
  const currentTab = searchParams.tab ?? 'active';
  const orderBy = searchParams.orderBy ?? 'createdAt';
  const orderByDirection = searchParams.direction ?? 'asc';

  const { chats, totalChats } = await getChatMetadataWithAccounts(
    search,
    offset,
    currentTab === 'blocked',
    pageSize,
    orderBy as 'participantsCount' | 'qualityReports' | 'updatedAt',
    orderByDirection
  );

  return (
    <TabWrapper basePath="/dashboard/groups" defaultTab="active">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
        </TabsList>
        <Search />
      </div>
      <TabsContent value="active" className="mt-4">
        <GroupsTable
          chats={chats}
          offset={offset}
          totalChats={totalChats}
          pageSize={pageSize}
          showCheckboxes={true}
          columns={GROUP_TAB_COLUMNS.active}
        />
      </TabsContent>
      <TabsContent value="blocked" className="mt-4">
        <GroupsTable
          chats={chats}
          offset={offset}
          totalChats={totalChats}
          pageSize={pageSize}
          showCheckboxes={false}
          columns={GROUP_TAB_COLUMNS.blocked}
        />
      </TabsContent>
    </TabWrapper>
  );
}
