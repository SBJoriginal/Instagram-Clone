export interface Notification {
  id: number;
  actorUsername: string;
  actorProfilePictureUrl?: string;
  imageId: number;
  type: 'Like' | 'Comment';
  isRead: boolean;
  createdAt: string;
  message: string;
}
