'use client';
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AccountsTable, TabType } from './accounts-table';
import { ACCOUNT_TAB_COLUMNS } from '@/lib/types';
import { TabWrapper } from '@/components/shared/tab-wrapper';
import { CreateAccountDialog } from './create-dialog';
import { Suspense, useState } from 'react';

export default function AccountsPage() {
  const [currentTab, setCurrentTab] = useState<TabType>('active');

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TabWrapper basePath="/dashboard/accounts" defaultTab={currentTab}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 sm:pb-0">
            <TabsList>
              <TabsTrigger
                value="active"
                onClick={() => setCurrentTab('active')}
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="banned"
                onClick={() => setCurrentTab('banned')}
              >
                Banned
              </TabsTrigger>
              <TabsTrigger
                value="suspended"
                onClick={() => setCurrentTab('suspended')}
              >
                Suspended
              </TabsTrigger>
            </TabsList>
            <CreateAccountDialog />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {/* <GeneralSort /> */}
          </div>
        </div>
        <TabsContent value={currentTab} className="mt-4">
          <AccountsTable
            columns={ACCOUNT_TAB_COLUMNS[currentTab]}
            currentTab={currentTab}
          />
        </TabsContent>
      </TabWrapper>
    </Suspense>
  );
}
