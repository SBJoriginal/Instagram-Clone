export interface ImagePost {
  id: number;
  fileName: string;
  contentType: string;
  size: number;
  description: string;
  hashtags: string;
  mentions: string;
  filePath: string;
  createdAt: string;
  reactionCount: number;
  hasReacted: boolean;
  commentCount: number;
  userId: string;
  username: string;
}
