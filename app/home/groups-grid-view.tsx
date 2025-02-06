'use client';

import { GroupsGridView as BaseGroupsGridView } from '../dashboard/groups/groups-grid-view';

// 继承原有组件但覆盖路由行为
export function GroupsGridView(props: any) {
  const handleItemClick = (chatId: string) => `/home/${chatId}`;

  return (
    <BaseGroupsGridView
      {...props}
      basePath="/home"
      hideAccountInfo={true}
      onItemClick={handleItemClick}
    />
  );
}
