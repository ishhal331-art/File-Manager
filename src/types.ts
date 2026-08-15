export type Role = 'ADMIN' | 'MANAGER' | 'USER';

export type AccountStatus = 'ACTIVE' | 'DISABLED';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  phone?: string;
  employeeId?: string;
  role: Role;
  status: AccountStatus;
  avatarUrl?: string;
  createdAt: string;
}

export type FileType = 'SALES' | 'PURCHASE' | 'BANK_STATEMENT' | 'ADDITIONAL';

export interface UploadedFile {
  id: string;
  userId: string;
  userName?: string;
  fileType: FileType;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  period?: string;
  isAiProcessed: boolean;
  extractedText?: string;
  extractedData?: Array<{
    date?: string;
    description?: string;
    amount?: number;
    category?: string;
    vendor?: string;
    referenceNo?: string;
    [key: string]: any;
  }>;
  summary?: string;
  fileUrl?: string; // base64 or stored link
  localFilePath?: string;
}

export interface NotificationReply {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  message: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  senderId: string;
  senderName: string;
  targetUserId: string | 'ALL'; // 'ALL' or specific userId
  timestamp: string;
  readBy: string[]; // userIds
  replies: NotificationReply[];
}

export interface UserUploadProgress {
  userId: string;
  userName: string;
  salesUploaded: boolean;
  purchaseUploaded: boolean;
  bankUploaded: boolean;
  additionalUploaded?: boolean;
  salesCount?: number;
  purchaseCount?: number;
  bankCount?: number;
  additionalCount?: number;
  totalFiles?: number;
  percentage: number; // 0, 33, 67, 100 based on 3 required files
  lastUploadTime?: string;
}
