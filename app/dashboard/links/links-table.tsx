'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TgLink } from '@/lib/db';
import { updateLinkStatus } from './actions';
import { TgLinkStatus } from '@/lib/types';

export function LinksTable({
  links,
  offset,
  totalLinks,
  showCheckboxes = true,
  showStatus = false
}: {
  links: TgLink[];
  offset: number;
  totalLinks: number;
  showCheckboxes?: boolean;
  showStatus?: boolean;
}) {
  const [selectedLinks, setSelectedLinks] = useState<number[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newOffset: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('offset', newOffset.toString());
    router.push(`/dashboard/links?${params.toString()}`);
  };

  const handleStatusChange = async (status: string) => {
    if (selectedLinks.length === 0) return;
    await updateLinkStatus(selectedLinks, status);
    setSelectedLinks([]);
    router.refresh();
  };

  const totalPages = Math.ceil(totalLinks / 10);
  const currentPage = Math.floor(offset / 10) + 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telegram Links</CardTitle>
        {showCheckboxes && selectedLinks.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedLinks.length} selected
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusChange(TgLinkStatus.PROCESSED)}
            >
              Mark as Processed
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {showCheckboxes && (
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
              )}
              <TableHead>Link</TableHead>
              <TableHead>Chat Name</TableHead>
              {showStatus && <TableHead>Status</TableHead>}
              <TableHead>Processed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link) => (
              <TableRow key={link.id}>
                {showCheckboxes && (
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
                )}
                <TableCell className="font-medium">
                  <a
                    href={link.tgLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 hover:underline"
                  >
                    {link.tgLink}
                  </a>
                </TableCell>
                <TableCell className="font-medium">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    {link.chatName}
                  </a>
                </TableCell>
                {showStatus && (
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {link.status}
                    </Badge>
                  </TableCell>
                )}
                <TableCell>{link.processedAt?.toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {offset + 1}-{Math.min(offset + 10, totalLinks)} of{' '}
          {totalLinks} links
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(offset - 10)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(offset + 10)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
