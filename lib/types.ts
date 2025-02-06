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

export interface ChatMessage {
  messageId: string;
  chatId: string;
  messageText: string;
  senderId?: string;
  replyTo?: string;
  topicId?: string;
  messageTimestamp: number;
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
  aiAbout: string;
  username: string;
  participantsCount: number;
  pinnedMessages: string[];
  initialMessages: string[];
  category: string;
  entity: Entity | null;
  qualityReports: QualityReport[];
  qualityScore: number;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
  photo: { path?: string };
  accountTgIds: string[];
};

export type GroupTableColumn =
  | 'Name'
  | 'Intro'
  | 'Members'
  | 'Account'
  | 'Category'
  | 'Entity'
  | 'Quality'
  | 'Status'
  | 'Created At';

export const GROUP_TAB_COLUMNS: Record<string, GroupTableColumn[]> = {
  active: [
    'Name',
    'Intro',
    'Members',
    'Account',
    'Category',
    'Entity',
    'Quality',
    'Created At'
  ],
  blocked: [
    'Name',
    'Intro',
    'Members',
    'Account',
    'Category',
    'Entity',
    'Quality',
    'Created At'
  ],
  private: [
    'Name',
    'Intro',
    'Members',
    'Account',
    'Category',
    'Entity',
    'Quality',
    'Created At'
  ],
  public: [
    'Name',
    'Intro',
    'Members',
    'Category',
    'Entity',
    'Quality',
    'Created At'
  ]
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
  | 'status'
  | 'lastActiveAt'
  | 'createdAt';

export const ACCOUNT_TAB_COLUMNS: Record<string, AccountTableColumn[]> = {
  active: [
    'username',
    'tgId',
    'phone',
    'fullname',
    'status',
    'lastActiveAt',
    'createdAt'
  ],
  banned: ['username', 'tgId', 'phone', 'status', 'lastActiveAt', 'createdAt'],
  suspended: ['username', 'tgId', 'status', 'lastActiveAt', 'createdAt']
};
