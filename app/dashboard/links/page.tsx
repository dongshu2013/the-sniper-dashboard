import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTgLinks } from '@/lib/db';
import { LinksTable } from './links-table';
import { ImportLinksDialog } from './import-dialog';
import { TgLinkStatus } from '@/lib/types';
import { TabWrapper } from './tab-wrapper';
import { redirect } from 'next/navigation';

export default async function LinksPage(props: {
  searchParams: Promise<{ q?: string; offset?: string; tab?: string }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.q ?? '';
  const offset = parseInt(searchParams.offset ?? '0');
  const currentTab = searchParams.tab ?? 'todo';

  // Map tabs to their corresponding statuses
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
    statusMap[currentTab as keyof typeof statusMap]
  );

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams({
      ...(search && { q: search }),
      offset: newOffset.toString(),
      tab: currentTab
    });
    redirect(`/dashboard/links?${params.toString()}`);
  };

  return (
    <TabWrapper>
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="todo">TODO</TabsTrigger>
          <TabsTrigger value="queued">Queued</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
        </TabsList>
        <div className="ml-auto">
          <ImportLinksDialog />
        </div>
      </div>
      <TabsContent value="todo" className="mt-4">
        <LinksTable
          links={links}
          offset={offset}
          totalLinks={totalLinks}
          showCheckboxes={true}
          showStatus={false}
        />
      </TabsContent>
      <TabsContent value="queued" className="mt-4">
        <LinksTable
          links={links}
          offset={offset}
          totalLinks={totalLinks}
          showCheckboxes={false}
          showStatus={false}
        />
      </TabsContent>
      <TabsContent value="processed" className="mt-4">
        <LinksTable
          links={links}
          offset={offset}
          totalLinks={totalLinks}
          showCheckboxes={false}
          showStatus={true}
        />
      </TabsContent>
    </TabWrapper>
  );
}
