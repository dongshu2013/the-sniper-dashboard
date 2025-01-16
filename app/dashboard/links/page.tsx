import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getTgLinks } from '@/lib/db';
import { LinksTable } from './links-table';
import { ImportLinksDialog } from './import-dialog';

export default async function LinksPage({
  searchParams
}: {
  searchParams: { q: string; offset: string };
}) {
  const search = searchParams.q ?? '';
  const offset = searchParams.offset ?? 0;
  const { links, newOffset, totalLinks } = await getTgLinks(
    search,
    Number(offset)
  );

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All Links</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processed">Processed</TabsTrigger>
          <TabsTrigger value="error">Error</TabsTrigger>
        </TabsList>
        <div className="ml-auto">
          <ImportLinksDialog />
        </div>
      </div>
      <TabsContent value="all" className="mt-4">
        <LinksTable
          links={links}
          offset={newOffset ?? 0}
          totalLinks={totalLinks}
        />
      </TabsContent>
    </Tabs>
  );
}
