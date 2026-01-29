export interface ImagePost {
  id: number;
  userId: number;
  imageUrl: string;
  description: string;
  hashtags: string[];
  mentionedUser: string;
  createdAt: string;
}
