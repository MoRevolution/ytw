export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  accessToken?: string;
  createdAt: Date;
  lastLogin: Date;
  lastDataUpdate?: Date;
  hasWatchHistory: boolean;
} 