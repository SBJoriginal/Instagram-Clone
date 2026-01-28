import { User } from '../models/user.model';
import { ImagePost } from '../models/image.models';

export const MOCK_USERS: User[] = [
  {
    id: 1,
    username: 'alice_martin',
    firstName: 'Alice',
    lastName: 'Martin',
    email: 'alice@email.com',
    phoneNumber: '418-555-0001',
    profilePictureUrl: 'https://i.pravatar.cc/150?img=1',
    registrationDate: '2026-01-10',
  },
  {
    id: 2,
    username: 'bob_tremblay',
    firstName: 'Bob',
    lastName: 'Tremblay',
    email: 'bob@email.com',
    phoneNumber: '418-555-0002',
    profilePictureUrl: 'https://i.pravatar.cc/150?img=2',
    registrationDate: '2026-01-12',
  },
  {
    id: 3,
    username: 'charlie_roy',
    firstName: 'Charlie',
    lastName: 'Roy',
    email: 'charlie@email.com',
    phoneNumber: '418-555-0003',
    profilePictureUrl: 'https://i.pravatar.cc/150?img=3',
    registrationDate: '2026-01-15',
  },
];

export const MOCK_IMAGES: ImagePost[] = [
  {
    id: 1,
    userId: 1,
    imageUrl: 'https://picsum.photos/seed/img1/400/400',
    description: 'Beautiful sunset in Quebec',
    hashtags: ['#sunset', '#quebec', '#nature'],
    mentionedUser: 'bob_tremblay',
    createdAt: '2026-01-20',
  },
  {
    id: 2,
    userId: 1,
    imageUrl: 'https://picsum.photos/seed/img2/400/400',
    description: 'Morning coffee',
    hashtags: ['#coffee', '#morning'],
    mentionedUser: '',
    createdAt: '2026-01-18',
  },
  {
    id: 3,
    userId: 2,
    imageUrl: 'https://picsum.photos/seed/img3/400/400',
    description: 'Montreal by night',
    hashtags: ['#montreal', '#night'],
    mentionedUser: 'alice_martin',
    createdAt: '2026-01-19',
  },
];
