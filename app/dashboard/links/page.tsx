import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTgLinks } from '@/lib/actions/tgLink';
import { LinksTable } from './links-table';
import { LINK_TAB_COLUMNS, TgLinkStatus } from '@/lib/types';
import { TabWrapper } from '@/components/shared/tab-wrapper';
import { ImportLinksDialog } from './import-dialog';

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
    queued: [TgLinkStatus.PENDING_PRE_PROCESSING],
    todo: [TgLinkStatus.PENDING_PROCESSING],
    processing: [TgLinkStatus.PROCESSING],
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
        <div className="flex items-center gap-4 overflow-x-auto pb-2 sm:pb-0">
          <TabsList>
            <TabsTrigger value="queued">Queued</TabsTrigger>
            <TabsTrigger value="todo">TODO</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="processed">Processed</TabsTrigger>
          </TabsList>
          <ImportLinksDialog dialogTitle="Add Links" source="manual" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {/* <GeneralSort /> */}
        </div>
      </div>
      <TabsContent value="queued" className="mt-4">
        <LinksTable
          links={links}
          offset={offset}
          totalLinks={totalLinks}
          pageSize={pageSize}
          showCheckboxes={false}
          showStatus={false}
          columns={LINK_TAB_COLUMNS.queued}
          currentTab="queued"
        />
      </TabsContent>
      <TabsContent value="todo" className="mt-4">
        <LinksTable
          links={links}
          offset={offset}
          totalLinks={totalLinks}
          pageSize={pageSize}
          showCheckboxes={true}
          showStatus={false}
          columns={LINK_TAB_COLUMNS.todo}
          currentTab="todo"
        />
      </TabsContent>
      <TabsContent value="processing" className="mt-4">
        <LinksTable
          links={links}
          offset={offset}
          totalLinks={totalLinks}
          pageSize={pageSize}
          showCheckboxes={true}
          showStatus={false}
          columns={LINK_TAB_COLUMNS.processing}
          currentTab="processing"
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
          currentTab="processed"
        />
      </TabsContent>
    </TabWrapper>
  );
}
