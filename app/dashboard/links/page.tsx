import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTgLinks } from '@/lib/db';
import { LinksTable } from './links-table';
import { LINK_TAB_COLUMNS, TgLinkStatus } from '@/lib/types';
import { TabWrapper } from '@/components/shared/tab-wrapper';
import { ImportLinksDialog } from './import-dialog';
import { Search } from './search';

export default async function LinksPage(props: {
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
  const currentTab = searchParams.tab ?? 'todo';

  const statusMap = {
    todo: [TgLinkStatus.PENDING_PROCESSING],
    queued: [TgLinkStatus.PENDING_PRE_PROCESSING],
    processed: [
      TgLinkStatus.PROCESSED,
      TgLinkStatus.ERROR,
      TgLinkStatus.IGNORED
    ]
  };

  const { links, totalLinks } = await getTgLinks(
    search,
    offset,
    statusMap[currentTab as keyof typeof statusMap],
    pageSize
  );

  return (
    <TabWrapper basePath="/dashboard/links" defaultTab="todo">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="todo">TODO</TabsTrigger>
          <TabsTrigger value="queued">Queued</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-4">
          <Search />
          <ImportLinksDialog />
        </div>
      </div>
      <TabsContent value="todo" className="mt-4">
        <LinksTable
          links={links}
          offset={offset}
          totalLinks={totalLinks}
          pageSize={pageSize}
          showCheckboxes={true}
          showStatus={false}
          columns={LINK_TAB_COLUMNS.todo}
        />
      </TabsContent>
      <TabsContent value="queued" className="mt-4">
        <LinksTable
          links={links}
          offset={offset}
          totalLinks={totalLinks}
          pageSize={pageSize}
          showCheckboxes={false}
          showStatus={false}
          columns={LINK_TAB_COLUMNS.queued}
        />
      </TabsContent>
      <TabsContent value="processed" className="mt-4">
        <LinksTable
          links={links}
          offset={offset}
          totalLinks={totalLinks}
          pageSize={pageSize}
          showCheckboxes={false}
          showStatus={true}
          columns={LINK_TAB_COLUMNS.processed}
        />
      </TabsContent>
    </TabWrapper>
  );
}
