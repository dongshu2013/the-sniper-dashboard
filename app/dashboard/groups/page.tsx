import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { chatMetadata, getChatMetadataWithAccounts } from '@/lib/db';
import { GroupsTable } from './groups-table';
import { GROUP_TAB_COLUMNS } from '@/lib/types';
import { TabWrapper } from '@/components/shared/tab-wrapper';
import { Search } from './search';
import { ViewSwitcher } from './view-switcher';
import { GroupsGridView } from './groups-grid-view';
import { SortDirection } from '@/components/ui/filterable-table-header';

export default async function GroupsPage(props: {
  searchParams: Promise<{
    q?: string;
    offset?: string;
    tab?: string;
    pageSize?: string;
    view?: string;
    sortColumn?: string;
    sortDirection?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = parseInt(searchParams.offset ?? '0');
  const pageSize = parseInt(searchParams.pageSize ?? '20');
  const currentTab = searchParams.tab ?? 'active';
  const currentView = searchParams.view ?? 'list';
  const sortColumn = searchParams.sortColumn;
  const sortDirection = searchParams.sortDirection as SortDirection;

  const { chats, totalChats } = await getChatMetadataWithAccounts(
    search,
    offset,
    currentTab === 'blocked',
    pageSize,
    sortColumn,
    sortDirection
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
          <GroupsGridView
            chats={chats}
            offset={offset}
            totalChats={totalChats}
            pageSize={pageSize}
            showCheckboxes={true}
          />
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
          <GroupsGridView
            chats={chats}
            offset={offset}
            totalChats={totalChats}
            pageSize={pageSize}
            showCheckboxes={false}
          />
        )}
      </TabsContent>
    </TabWrapper>
  );
}
