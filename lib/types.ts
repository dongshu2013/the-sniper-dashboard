export enum TgLinkStatus {
  PENDING_PRE_PROCESSING = 'pending_pre_processing',
  PENDING_PROCESSING = 'pending_processing',
  PROCESSED = 'processed',
  ERROR = 'error',
  IGNORED = 'ignored'
}

export type LinkTableColumn =
  | 'link'
  | 'chatName'
  | 'status'
  | 'createdAt'
  | 'processedAt';

export const LINK_TAB_COLUMNS: Record<string, LinkTableColumn[]> = {
  todo: ['link', 'chatName', 'createdAt'],
  queued: ['link', 'createdAt'],
  processed: ['link', 'chatName', 'status', 'createdAt', 'processedAt']
};

export type ChatMetadata = {
  id: number;
  chat_id: string;
  name: string;
  about: string;
  username: string;
  participants_count: number;
  entity: any;
  quality_reports: any[];
  is_blocked: boolean;
  created_at: Date;
  updated_at: Date;
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
