<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { 
  BookOpen, Search, PlusCircle, Sparkles, User as UserIcon, 
  ChevronRight, Filter, MessageSquare, Eye, Pin, 
  HardDrive, ExternalLink, Copy, Check, ArrowLeft, Lock
} from 'lucide-vue-next';
import { MOCK_POSTS, STORAGE_ICONS } from './constants';
import { Category, Post, StorageProvider } from './types';
import { analyzeResourceDescription } from './services/geminiService';

// --- 路由与状态 ---
const currentPath = ref(window.location.hash || '#/');
const posts = ref<Post[]>(MOCK_POSTS);
const searchKeyword = ref('');
const activeCategory = ref('全部');

const handleHashChange = () => {
  currentPath.value = window.location.hash || '#/';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => window.addEventListener('hashchange', handleHashChange));
onUnmounted(() => window.removeEventListener('hashchange', handleHashChange));

const navigateTo = (path: string) => { window.location.hash = path; };

// --- 计算数据 ---
const filteredPosts = computed(() => {
  let res = posts.value;
  if (activeCategory.value !== '全部') {
    res = res.filter(p => p.category === activeCategory.value);
  }
  if (searchKeyword.value) {
    const kw = searchKeyword.value.toLowerCase();
    res = res.filter(p => p.title.toLowerCase().includes(kw) || p.content.toLowerCase().includes(kw));
  }
  return res;
});

const currentPost = computed(() => {
  const parts = currentPath.value.split('/');
  const id = parts[parts.length - 1];
  return posts.value.find(p => p.id === id);
});

// --- 发帖逻辑 ---
const newPost = ref({
  title: '',
  content: '',
  category: Category.EXAMS,
  links: [{ provider: StorageProvider.BAIDU, url: '', password: '' }]
});
const isAnalyzing = ref(false);

const handleAIParse = async () => {
  if (newPost.value.content.length < 10) return alert('请先输入一些资源描述');
  isAnalyzing.value = true;
  try {
    const result = await analyzeResourceDescription(newPost.value.content);
    if (result) {
      newPost.value.title = result.title;
      // 简单匹配分类
      const foundCat = Object.values(Category).find(c => result.category.includes(c));
      if (foundCat) newPost.value.category = foundCat;
    }
  } finally {
    isAnalyzing.value = false;
  }
};

const publishPost = () => {
  const post: Post = {
    id: Math.random().toString(36).substring(2, 9),
    title: newPost.value.title,
    content: newPost.value.content,
    category: newPost.value.category,
    author: '学习先锋',
    createdAt: new Date().toISOString(),
    views: 0,
    replies: 0,
    isPinned: false,
    links: newPost.value.links.filter(l => l.url),
    thumbnail: `https://picsum.photos/seed/${Math.random()}/600/350`
  };
  posts.value.unshift(post);
  navigateTo('/');
  newPost.value = { title: '', content: '', category: Category.EXAMS, links: [{ provider: StorageProvider.BAIDU, url: '', password: '' }] };
};

// --- 工具 ---
const copiedIdx = ref<number | null>(null);
const doCopy = (text: string, idx: number) => {
  navigator.clipboard.writeText(text);
  copiedIdx.value = idx;
  setTimeout(() => copiedIdx.value = null, 2000);
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- 导航栏 -->
    <header class="sticky top-0 z-50 w-full glass-header border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div @click="navigateTo('/')" class="flex items-center gap-2 cursor-pointer group">
          <div class="bg-indigo-600 p-2 rounded-xl group-hover:rotate-6 transition-transform">
            <BookOpen class="text-white" :size="20" />
          </div>
          <span class="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 hidden sm:block">智享论坛</span>
        </div>

        <div class="flex-grow max-w-xl relative">
          <input v-model="searchKeyword" type="text" placeholder="搜索资源..." class="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none" />
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" :size="18" />
        </div>

        <div class="flex items-center gap-4">
          <button @click="navigateTo('/post')" class="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
            <PlusCircle :size="18" /> 发布
          </button>
          <div class="h-9 w-9 bg-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
            <UserIcon :size="18" class="text-slate-500" />
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 w-full flex-grow mt-8 mb-12">
      <!-- 列表页 -->
      <div v-if="currentPath === '#/'" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside class="hidden lg:block lg:col-span-3 space-y-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm sticky top-24">
            <h3 class="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Filter :size="18" class="text-indigo-600" /> 资源分类
            </h3>
            <nav class="space-y-1">
              <button @click="activeCategory = '全部'" :class="[activeCategory === '全部' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50']" class="w-full text-left p-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-between">
                全部 <ChevronRight :size="14" v-if="activeCategory === '全部'" />
              </button>
              <button v-for="cat in Object.values(Category)" :key="cat" @click="activeCategory = cat" :class="[activeCategory === cat ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50']" class="w-full text-left p-2.5 text-sm font-bold rounded-xl transition-all flex items-center justify-between">
                {{ cat }}
                <ChevronRight :size="14" v-if="activeCategory === cat" />
              </button>
            </nav>
          </div>
        </aside>

        <main class="lg:col-span-9 space-y-4">
          <div v-for="post in filteredPosts" :key="post.id" @click="navigateTo(`/post/${post.id}`)" class="post-card bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm cursor-pointer group flex flex-col md:flex-row md:h-48">
            <div v-if="post.thumbnail" class="md:w-64 h-40 md:h-full overflow-hidden flex-shrink-0">
              <img :src="post.thumbnail" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div class="p-6 flex flex-col flex-grow">
              <div class="flex items-center gap-3 mb-2 text-[10px] font-bold">
                <span v-if="post.isPinned" class="bg-amber-100 text-amber-600 px-2 py-0.5 rounded flex items-center gap-1"><Pin :size="10" /> 置顶</span>
                <span class="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{{ post.category }}</span>
                <span class="text-slate-400">发布于 {{ new Date(post.createdAt).toLocaleDateString() }}</span>
              </div>
              <h3 class="text-lg font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 mb-2">{{ post.title }}</h3>
              <p class="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">{{ post.content }}</p>
              <div class="mt-auto flex items-center justify-between">
                <div class="flex items-center gap-4 text-slate-400 text-[11px] font-bold">
                  <span class="flex items-center gap-1"><MessageSquare :size="14" /> {{ post.replies }}</span>
                  <span class="flex items-center gap-1"><Eye :size="14" /> {{ post.views }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-600">{{ post.author }}</span>
                  <div class="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center text-white text-[10px] font-black">{{ post.author[0] }}</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <!-- 详情页 -->
      <div v-else-if="currentPath.startsWith('#/post/')" class="max-w-4xl mx-auto">
        <button @click="navigateTo('/')" class="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1 mb-6">
          <ArrowLeft :size="16" /> 返回列表
        </button>

        <article v-if="currentPost" class="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-12">
          <div class="p-8 md:p-12">
            <header class="mb-10">
              <div class="flex items-center gap-2 mb-6 text-xs font-bold">
                <span class="bg-indigo-600 text-white px-3 py-1 rounded-full">{{ currentPost.category }}</span>
                <span class="text-slate-400">/</span>
                <span class="text-slate-400">发布日期 {{ new Date(currentPost.createdAt).toLocaleString() }}</span>
              </div>
              <h1 class="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight">{{ currentPost.title }}</h1>
              <div class="flex items-center gap-4 pb-8 border-b border-slate-100">
                <div class="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100">
                  {{ currentPost.author[0] }}
                </div>
                <div>
                  <div class="font-black text-slate-900 text-lg">{{ currentPost.author }}</div>
                  <div class="text-[10px] font-black text-indigo-400 uppercase tracking-widest">认证优质资源分享者</div>
                </div>
              </div>
            </header>

            <section class="prose prose-slate max-w-none text-slate-600 leading-loose text-lg mb-12">
              <div v-for="(p, i) in currentPost.content.split('\n')" :key="i" class="mb-6">{{ p }}</div>
              <img v-if="currentPost.thumbnail" :src="currentPost.thumbnail" class="w-full rounded-3xl shadow-2xl border-4 border-white my-8" />
            </section>

            <!-- 网盘直达区域 - 老王论坛风格 -->
            <div class="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
              <div class="px-10 py-6 bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-between">
                <h3 class="text-white font-black flex items-center gap-3 text-sm uppercase tracking-widest">
                  <HardDrive :size="20" /> 资源云盘直达
                </h3>
                <span class="text-indigo-100 text-[10px] font-bold">已通过病毒与安全性扫描</span>
              </div>
              <div class="p-8 space-y-4">
                <div v-for="(link, idx) in currentPost.links" :key="idx" class="bg-white/5 border border-white/10 p-6 rounded-3xl flex flex-col md:flex-row items-center gap-6 hover:bg-white/10 transition-all">
                  <div class="flex items-center gap-4 flex-grow w-full md:w-auto">
                    <div class="w-12 h-12 bg-white rounded-xl p-2.5 flex-shrink-0">
                      <img :src="STORAGE_ICONS[link.provider]" class="w-full h-full object-contain" />
                    </div>
                    <div class="min-w-0">
                      <div class="text-white font-black">{{ link.provider }}</div>
                      <div class="text-indigo-300 text-[10px] truncate opacity-50">{{ link.url }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 w-full md:w-auto">
                    <div v-if="link.password" class="flex-grow flex items-center gap-3 bg-black/40 border border-white/10 px-5 py-3 rounded-2xl">
                      <span class="text-indigo-400 text-[10px] font-black">提取码</span>
                      <span class="text-white font-mono font-black text-lg tracking-widest">{{ link.password }}</span>
                      <button @click="doCopy(link.password, idx)" class="text-slate-400 hover:text-white transition-colors">
                        <Check v-if="copiedIdx === idx" :size="18" class="text-emerald-400" />
                        <Copy v-else :size="18" />
                      </button>
                    </div>
                    <a :href="link.url" target="_blank" class="flex-grow bg-white text-slate-900 px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2">
                      直达 <ExternalLink :size="18" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- 发帖页 -->
      <div v-else-if="currentPath === '#/post'" class="max-w-3xl mx-auto">
        <div class="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
          <div class="p-10 bg-slate-900 text-white">
            <h2 class="text-3xl font-black flex items-center gap-3"><PlusCircle :size="32" /> 分享新资源</h2>
            <p class="text-slate-400 text-sm mt-2 font-medium">帮助他人，提升自我。贡献一份高质量资源。</p>
          </div>
          
          <div class="p-10 space-y-8">
            <div class="space-y-4">
              <label class="block text-sm font-black text-slate-800 uppercase tracking-widest">1. 资源介绍</label>
              <textarea v-model="newPost.content" placeholder="在此输入资源的详细描述..." class="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl min-h-[180px] focus:border-indigo-500 outline-none transition-all focus:bg-white text-lg leading-relaxed shadow-inner"></textarea>
              <button @click="handleAIParse" :disabled="isAnalyzing" class="flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 font-black text-xs rounded-2xl hover:bg-indigo-100 transition-all active:scale-95 disabled:opacity-50 border border-indigo-100">
                <Sparkles :size="16" /> {{ isAnalyzing ? '正在分析...' : 'AI 自动生成标题与分类' }}
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <label class="block text-sm font-black text-slate-800 uppercase tracking-widest">2. 资源标题</label>
                <input v-model="newPost.title" type="text" placeholder="资源标题..." class="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold" />
              </div>
              <div class="space-y-4">
                <label class="block text-sm font-black text-slate-800 uppercase tracking-widest">3. 资源分类</label>
                <select v-model="newPost.category" class="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none appearance-none font-bold">
                  <option v-for="cat in Object.values(Category)" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>
            </div>

            <div class="space-y-6">
              <label class="block text-sm font-black text-slate-800 uppercase tracking-widest">4. 网盘地址</label>
              <div v-for="(link, idx) in newPost.links" :key="idx" class="p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl space-y-4">
                <div class="flex gap-4">
                  <select v-model="link.provider" class="w-1/3 p-4 bg-white border border-slate-200 rounded-2xl text-sm font-black">
                    <option v-for="p in Object.values(StorageProvider)" :key="p" :value="p">{{ p }}</option>
                  </select>
                  <input v-model="link.url" type="text" placeholder="粘贴网盘完整地址" class="flex-grow p-4 bg-white border border-slate-200 rounded-2xl text-sm font-mono" />
                </div>
                <div class="relative">
                  <input v-model="link.password" type="text" placeholder="提取码 (选填)" class="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-black tracking-widest" />
                  <Lock class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300" :size="18" />
                </div>
              </div>
            </div>

            <div class="pt-8 flex gap-4">
              <button @click="navigateTo('/')" class="flex-1 py-4 text-slate-400 font-black rounded-3xl hover:bg-slate-50 transition-all">取消</button>
              <button @click="publishPost" :disabled="!newPost.title || !newPost.links[0].url" class="flex-[2] py-4 bg-slate-900 text-white font-black rounded-3xl hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-20 shadow-xl">确认并发布资源</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
