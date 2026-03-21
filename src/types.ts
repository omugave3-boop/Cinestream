export type AppView = 'user' | 'admin';

export interface Movie {
  id: string;
  title: string;
  description: string;
  genre: string;
  year: number;
  rating: number;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  categories: {
    trending: boolean;
    topRated: boolean;
    newRelease: boolean;
    featured: boolean;
  };
  views: number;
  dateAdded: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Rating {
  movieId: string;
  userId: string;
  rating: number;
}
