'use client';

import { GroupsTable as BaseGroupsTable } from '../dashboard/groups/groups-table';

// 继承原有组件但覆盖路由行为
export function GroupsTable(props: any) {
  const handleItemClick = (chatId: string) => `/home/${chatId}`;

  return (
    <BaseGroupsTable
      {...props}
      basePath="/home" // 修改路由基础路径
      hideAccountInfo={true} // 添加标志位隐藏账户信息
      onItemClick={handleItemClick} // 自定义点击行为
    />
  );
}
