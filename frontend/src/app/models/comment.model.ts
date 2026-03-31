export interface Comment {
  id: number;
  imageId: number;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
  profilePictureUrl?: string;
}

export interface CreateComment {
  imageId: number;
  content: string;
}
