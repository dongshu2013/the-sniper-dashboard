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

export interface Entity {
  name?: string;
  type?: string;
  chain?: string;
  address?: string;
  twitter?: string;
  website?: string;
}

export interface QualityReport {
  score: number;
  reason: string;
  processed_at: number;
}

export type ChatMetadata = {
  id: number;
  chatId: string;
  name: string;
  about: string;
  username: string;
  participantsCount: number;
  entity: Entity | null;
  qualityReports: QualityReport[];
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  photo: { path?: string };
};

export type GroupTableColumn =
  | 'name'
  | 'account'
  | 'participants'
  | 'entity'
  | 'quality'
  | 'status'
  | 'createdAt';

export const GROUP_TAB_COLUMNS: Record<string, GroupTableColumn[]> = {
  active: ['name', 'account', 'participants', 'entity', 'quality', 'createdAt'],
  blocked: ['name', 'account', 'participants', 'status', 'createdAt']
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
