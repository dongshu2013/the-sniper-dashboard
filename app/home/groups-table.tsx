'use client';

import { GroupsTable as BaseGroupsTable } from '../dashboard/groups/groups-table';

export function GroupsTable(props: any) {
  const handleItemClick = (chatId: string) => `/home/${chatId}`;

  return (
    <BaseGroupsTable
      {...props}
      basePath="/home"
      hideAccountInfo={true}
      onItemClick={handleItemClick}
    />
  );
}
