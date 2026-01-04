// YouTube-related types shared across the application

export interface YouTubeVideoMetadata {
  video_id: string;
  title: string;
  channel: string;
  category_id: string;
  published_at: string;
  tags: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  made_for_kids: boolean;
  duration: string;
}

export interface WatchHistoryEntry {
  title: string;
  titleUrl?: string;
  time: string;
  video_id?: string;
  // Metadata fields (added after processing)
  channel?: string;
  category_id?: string;
  published_at?: string;
  tags?: string[];
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  made_for_kids?: boolean;
  duration?: string;
}

export interface MetadataRequest {
  videoIds: string[];
}

export interface MetadataResponse {
  metadata: Record<string, YouTubeVideoMetadata>;
  cached: number;
  fetched: number;
  failed: number;
}
