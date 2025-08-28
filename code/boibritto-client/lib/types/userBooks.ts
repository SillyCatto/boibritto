// User Books Types
export interface UserBook {
  _id: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  title: string;
  synopsis?: string;
  genres: string[];
  visibility: 'public' | 'private';
  coverImage?: string;
  likes: string[];
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  chapterCount?: number;
  totalWordCount?: number;
  chapters?: Chapter[];
}

export interface Chapter {
  _id: string;
  book: string | UserBook;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
  title: string;
  content: string;
  chapterNumber: number;
  visibility: 'public' | 'private';
  wordCount: number;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserBookData {
  title: string;
  synopsis?: string;
  genres?: string[];
  visibility?: 'public' | 'private';
  coverImage?: string;
}

export interface UpdateUserBookData {
  title?: string;
  synopsis?: string;
  genres?: string[];
  visibility?: 'public' | 'private';
  coverImage?: string;
  isCompleted?: boolean;
}

export interface CreateChapterData {
  bookId: string;
  title: string;
  content: string;
  chapterNumber: number;
  visibility?: 'public' | 'private';
}

export interface UpdateChapterData {
  title?: string;
  content?: string;
  visibility?: 'public' | 'private';
}
