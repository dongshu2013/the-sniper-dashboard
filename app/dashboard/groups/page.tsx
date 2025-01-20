import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getChatMetadataWithAccounts } from '@/lib/db';
import { GroupsTable } from './groups-table';
import { GroupsCard } from './groups-card';
import { GROUP_TAB_COLUMNS } from '@/lib/types';
import { TabWrapper } from '@/components/shared/tab-wrapper';
import { Search } from './search';
import { ViewSwitcher } from './view-switcher';

export default async function GroupsPage(props: {
  searchParams: Promise<{
    q?: string;
    offset?: string;
    tab?: string;
    pageSize?: string;
    view?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = parseInt(searchParams.offset ?? '0');
  const pageSize = parseInt(searchParams.pageSize ?? '20');
  const currentTab = searchParams.tab ?? 'active';
  const currentView = searchParams.view ?? 'list';

  const { chats, totalChats } = await getChatMetadataWithAccounts(
    search,
    offset,
    currentTab === 'blocked',
    pageSize
  );

  return (
    <TabWrapper basePath="/dashboard/groups" defaultTab="active">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ViewSwitcher currentView={currentView} />

          <TabsList>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="blocked">Blocked</TabsTrigger>
          </TabsList>
        </div>
        <Search />
      </div>

      <TabsContent value="active" className="mt-4">
        {currentView === 'list' ? (
          <GroupsTable
            chats={chats}
            offset={offset}
            totalChats={totalChats}
            pageSize={pageSize}
            showCheckboxes={true}
            columns={GROUP_TAB_COLUMNS.active}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chats.map((chat) => (
              <GroupsCard key={chat.id} chat={chat} showCheckboxes={true} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="blocked" className="mt-4">
        {currentView === 'list' ? (
          <GroupsTable
            chats={chats}
            offset={offset}
            totalChats={totalChats}
            pageSize={pageSize}
            showCheckboxes={false}
            columns={GROUP_TAB_COLUMNS.blocked}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chats.map((chat) => (
              <GroupsCard key={chat.id} chat={chat} showCheckboxes={false} />
            ))}
          </div>
        )}
      </TabsContent>
    </TabWrapper>
  );
}
