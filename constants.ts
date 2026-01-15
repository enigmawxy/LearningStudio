import { Category, Post, StorageProvider, User } from './types';

export const MOCK_USER: User = {
  id: 'user_99',
  name: '王小智',
  college: '计算机学院',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  credits: 500,
  sharedIds: ['1'],
  purchasedIds: ['2'],
  favoriteIds: ['3']
};

export const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: '【内部资料】2024操作系统复习精要与历年期末真题',
    author: '王小智',
    authorId: 'user_99',
    content: '涵盖了进程管理、内存分配、文件系统等核心考点。本资料由高分学长整理，附带三套历年期末真题及其详解，祝大家不挂科！',
    category: Category.EXAMS,
    createdAt: '2024-05-20T10:30:00Z',
    views: 1240,
    replies: 45,
    isPinned: true,
    price: 0,
    links: [{ provider: StorageProvider.BAIDU, url: 'https://pan.baidu.com/s/os_res', password: 'os24' }],
    thumbnail: 'https://picsum.photos/seed/os/400/250'
  },
  {
    id: '2',
    title: '雅思 IELTS 8.5分 听力/口语满分笔记 (最新同步)',
    author: '雅思战神',
    authorId: 'user_102',
    content: '这份笔记详细记录了我备考期间的语料库和模考心得。特别适合短期提分的同学，资料包含2GB的听力模拟音频。',
    category: Category.LANGUAGES,
    createdAt: '2024-05-19T14:15:00Z',
    views: 890,
    replies: 12,
    isPinned: false,
    price: 50,
    links: [{ provider: StorageProvider.QUARK, url: 'https://pan.quark.cn/s/ielts_full', password: 'win' }],
    thumbnail: 'https://picsum.photos/seed/ielts/400/250'
  },
  {
    id: '3',
    title: 'React + Node.js 全栈电商实战项目源码及视频',
    author: '码农老李',
    authorId: 'user_105',
    content: '一个完整的电商项目，包含JWT认证、支付接口模拟、Redux状态管理等。适合毕设参考或简历加分。',
    category: Category.PROGRAMMING,
    createdAt: '2024-05-18T09:00:00Z',
    views: 450,
    replies: 8,
    isPinned: false,
    price: 20,
    links: [{ provider: StorageProvider.ALIYUN, url: 'https://www.aliyundrive.com/s/coding' }],
    thumbnail: 'https://picsum.photos/seed/code/400/250'
  }
];

export const STORAGE_ICONS: Record<StorageProvider, string> = {
  [StorageProvider.BAIDU]: 'https://www.baidu.com/favicon.ico',
  [StorageProvider.QUARK]: 'https://pan.quark.cn/favicon.ico',
  [StorageProvider.ALIYUN]: 'https://www.aliyundrive.com/favicon.ico',
  [StorageProvider.GOOGLE]: 'https://www.google.com/favicon.ico',
  [StorageProvider.MEGA]: 'https://mega.nz/favicon.ico'
};
