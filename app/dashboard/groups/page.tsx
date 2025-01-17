import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getChatMetadata } from '@/lib/db';
import { GroupsTable } from './groups-table';
import { GROUP_TAB_COLUMNS } from '@/lib/types';
import { TabWrapper } from '@/components/shared/tab-wrapper';
import { Search } from './search';

export default async function GroupsPage(props: {
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

  const { chats, totalChats } = await getChatMetadata(
    search,
    offset,
    currentTab === 'blocked',
    pageSize
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
