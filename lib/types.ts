export enum TgLinkStatus {
  PENDING_PRE_PROCESSING = 'pending_pre_processing',
  PENDING_PROCESSING = 'pending_processing',
  PROCESSED = 'processed',
  ERROR = 'error',
  IGNORED = 'ignored'
}

export type TableColumn =
  | 'link'
  | 'chatName'
  | 'status'
  | 'createdAt'
  | 'processedAt';

export const TAB_COLUMNS: Record<string, TableColumn[]> = {
  todo: ['link', 'chatName', 'createdAt'],
  queued: ['link', 'createdAt'],
  processed: ['link', 'chatName', 'status', 'createdAt', 'processedAt']
};
