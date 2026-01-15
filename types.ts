export enum Category {
  MATHEMATICS = '数学',
  SCIENCE = '理化生',
  PROGRAMMING = '编程开发',
  LANGUAGES = '语言学习',
  DESIGN = '设计艺术',
  EXAMS = '考证考研'
}

export enum StorageProvider {
  BAIDU = '百度网盘',
  QUARK = '夸克网盘',
  ALIYUN = '阿里云盘',
  GOOGLE = 'Google Drive',
  MEGA = 'MEGA'
}

export interface ResourceLink {
  provider: StorageProvider;
  url: string;
  password?: string;
}

export interface Post {
  id: string;
  title: string;
  author: string;
  authorId: string;
  content: string;
  category: Category;
  createdAt: string;
  views: number;
  replies: number;
  isPinned: boolean;
  links: ResourceLink[];
  thumbnail?: string;
  price: number; // 解锁所需学分，0为免费
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  college: string;
  credits: number;
  sharedIds: string[];
  purchasedIds: string[];
  favoriteIds: string[];
}
