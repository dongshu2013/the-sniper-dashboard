'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { TgLink } from '@/lib/db';
import { updateLinkStatus } from './actions';
import { TgLinkStatus } from '@/lib/types';

export function LinksTable({
  links,
  offset,
  totalLinks
}: {
  links: TgLink[];
  offset: number;
  totalLinks: number;
}) {
  const [selectedLinks, setSelectedLinks] = useState<number[]>([]);
  const router = useRouter();

  const handleStatusChange = async (status: string) => {
    if (selectedLinks.length === 0) return;
    await updateLinkStatus(selectedLinks, status);
    setSelectedLinks([]);
    router.refresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Links</CardTitle>
        {selectedLinks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedLinks.length} selected
            </span>
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Update status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TgLinkStatus.PENDING_PRE_PROCESSING}>
                  Mark as Pending
                </SelectItem>
                <SelectItem value={TgLinkStatus.PROCESSED}>
                  Mark as Processed
                </SelectItem>
                <SelectItem value={TgLinkStatus.ERROR}>
                  Mark as Error
                </SelectItem>
                <SelectItem value={TgLinkStatus.IGNORED}>
                  Mark as Ignored
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedLinks.length === links.length}
                  onCheckedChange={(checked) => {
                    setSelectedLinks(
                      checked ? links.map((link) => link.id) : []
                    );
                  }}
                />
              </TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Chat Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Processed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedLinks.includes(link.id)}
                    onCheckedChange={(checked) => {
                      setSelectedLinks(
                        checked
                          ? [...selectedLinks, link.id]
                          : selectedLinks.filter((id) => id !== link.id)
                      );
                    }}
                  />
                </TableCell>
                <TableCell className="font-medium">{link.tgLink}</TableCell>
                <TableCell className="font-medium">{link.chatName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {link.status}
                  </Badge>
                </TableCell>
                <TableCell>{link.processedAt?.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-sm text-muted-foreground">
          Showing {offset + 1}-{Math.min(offset + 10, totalLinks)} of{' '}
          {totalLinks} links
        </div>
      </CardFooter>
    </Card>
  );
}
