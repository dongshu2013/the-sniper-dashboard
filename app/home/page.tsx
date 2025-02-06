import { getChatMetadataWithAccounts } from '@/lib/actions/chat';
import { GROUP_TAB_COLUMNS } from '@/lib/types';
import { ViewSwitcher } from '../dashboard/groups/view-switcher';
import { GroupsGridView } from './groups-grid-view';
import { GroupsTable } from './groups-table';
import { SortDirection } from '@/components/ui/filterable-table-header';
import { CategorySelect } from '../dashboard/groups/category-select';

export default async function HomePage({
  searchParams: _searchParams
}: {
  searchParams: Promise<{
    q?: string;
    offset?: string;
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
    false,
    parseInt(searchParams.pageSize ?? '20'),
    searchParams.sortColumn,
    searchParams.sortDirection as SortDirection,
    categories,
    filters
  );

  const offset = parseInt(searchParams.offset ?? '0');
  const pageSize = parseInt(searchParams.pageSize ?? '20');
  const currentView = searchParams.view ?? 'list';

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <ViewSwitcher currentView={currentView} basePath="/home" />
        </div>
        <div className="flex items-center gap-4">
          <CategorySelect />
        </div>
      </div>

      {currentView === 'list' ? (
        <GroupsTable
          chats={chats}
          offset={offset}
          totalChats={totalChats}
          pageSize={pageSize}
          showCheckboxes={false}
          columns={GROUP_TAB_COLUMNS.public}
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
    </div>
  );
}
