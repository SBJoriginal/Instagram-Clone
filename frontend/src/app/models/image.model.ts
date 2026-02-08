export interface ImagePost {
  id: number;
  userId: string;
  imageUrl: string;
  description: string;
  hashtags: string[];
  mentionedUser: string;
  createdAt: string;
}
