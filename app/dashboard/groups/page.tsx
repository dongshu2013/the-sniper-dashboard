import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getChatMetadataWithAccounts } from '@/lib/actions/chat';
import { GroupsTable } from './groups-table';
import { GROUP_TAB_COLUMNS } from '@/lib/types';
import { TabWrapper } from '@/components/shared/tab-wrapper';
import { ViewSwitcher } from './view-switcher';
import { GroupsGridView } from './groups-grid-view';
import { SortDirection } from '@/components/ui/filterable-table-header';
import { CategorySelect } from './category-select';

export default async function GroupsPage({
  searchParams: _searchParams
}: {
  searchParams: Promise<{
    q?: string;
    offset?: string;
    tab?: string;
    pageSize?: string;
    view?: string;
    sortColumn?: string;
    sortDirection?: string;
    categories?: string;
    [key: string]: string | undefined;
  }>;
}) {
  const searchParams = await _searchParams;

  const filters = Object.entries(searchParams).reduce(
    (acc, [key, value]) => {
      if (key.startsWith('filter_') && value) {
        const filterKey = key.replace('filter_', '');
        acc[filterKey] = value;
      }
      return acc;
    },
    {} as Record<string, string>
  );

  const categories = searchParams.categories?.split(',').filter(Boolean) || [];

  const { chats, totalChats } = await getChatMetadataWithAccounts(
    searchParams.q ?? '',
    parseInt(searchParams.offset ?? '0'),
    searchParams.tab === 'blocked',
    parseInt(searchParams.pageSize ?? '20'),
    searchParams.sortColumn,
    searchParams.sortDirection as SortDirection,
    categories,
    filters
  );

  const search = searchParams.q ?? '';
  const offset = parseInt(searchParams.offset ?? '0');
  const pageSize = parseInt(searchParams.pageSize ?? '20');
  const currentTab = searchParams.tab ?? 'active';
  const currentView = searchParams.view ?? 'list';
  const sortColumn = searchParams.sortColumn;
  const sortDirection = searchParams.sortDirection as SortDirection;

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
        <div className="flex items-center gap-4">
          <CategorySelect />
        </div>
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
