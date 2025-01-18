export enum TgLinkStatus {
  PENDING_PRE_PROCESSING = 'pending_pre_processing',
  PENDING_PROCESSING = 'pending_processing',
  PROCESSING = 'processing',
  PROCESSED = 'processed',
  ERROR = 'error',
  IGNORED = 'ignored'
}

export type LinkTableColumn =
  | 'link'
  | 'chatName'
  | 'status'
  | 'createdAt'
  | 'processedAt'
  | 'markName';

export const LINK_TAB_COLUMNS: Record<string, LinkTableColumn[]> = {
  queued: ['link', 'createdAt'],
  todo: ['link', 'chatName', 'createdAt'],
  processing: ['link', 'chatName', 'createdAt', 'markName'],
  processed: ['link', 'chatName', 'status', 'createdAt', 'processedAt']
};

export type ChatMetadata = {
  id: number;
  chatId: string;
  name: string;
  about: string;
  username: string;
  participantsCount: number;
  entity: any;
  qualityReports: any[];
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GroupTableColumn =
  | 'name'
  | 'username'
  | 'participants'
  | 'entity'
  | 'reports'
  | 'status'
  | 'createdAt';

export const GROUP_TAB_COLUMNS: Record<string, GroupTableColumn[]> = {
  active: [
    'name',
    'username',
    'participants',
    'entity',
    'reports',
    'createdAt'
  ],
  blocked: ['name', 'username', 'participants', 'status', 'createdAt']
};

export enum AccountStatus {
  ACTIVE = 'active',
  BANNED = 'banned',
  SUSPENDED = 'suspended'
}

export type AccountTableColumn =
  | 'username'
  | 'tgId'
  | 'phone'
  | 'status'
  | 'fullname'
  | 'lastActiveAt'
  | 'createdAt';

export const ACCOUNT_TAB_COLUMNS: Record<string, AccountTableColumn[]> = {
  active: [
    'username',
    'tgId',
    'phone',
    'fullname',
    'lastActiveAt',
    'createdAt'
  ],
  banned: ['username', 'tgId', 'phone', 'status', 'lastActiveAt', 'createdAt'],
  suspended: ['username', 'tgId', 'status', 'lastActiveAt', 'createdAt']
};
