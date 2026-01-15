import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Search, PlusCircle, Sparkles, User as UserIcon, 
  ChevronRight, Filter, MessageSquare, Eye, Pin, 
  HardDrive, ExternalLink, Copy, Check, ArrowLeft, Lock,
  ShieldCheck, Calendar, Star, ShoppingBag, History, CreditCard,
  Heart, LogOut, LayoutDashboard, Wallet
} from 'lucide-react';
import { MOCK_POSTS, STORAGE_ICONS, MOCK_USER } from './constants';
import { Category, Post, StorageProvider, User } from './types';
import { analyzeResourceDescription } from './services/geminiService';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');
  const [user, setUser] = useState<User | null>(MOCK_USER); // 模拟已登录
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');

  useEffect(() => {
    const handleHash = () => setCurrentPath(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (path: string) => { window.location.hash = path; };

  const filteredPosts = useMemo(() => {
    let res = posts;
    if (activeCategory !== '全部') res = res.filter(p => p.category === activeCategory);
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      res = res.filter(p => p.title.toLowerCase().includes(kw) || p.content.toLowerCase().includes(kw));
    }
    return res;
  }, [posts, activeCategory, searchKeyword]);

  const currentPost = useMemo(() => {
    const id = currentPath.split('/').pop();
    return posts.find(p => p.id === id);
  }, [currentPath, posts]);

  // --- 核心业务逻辑 ---
  const handlePurchase = (postId: string, price: number) => {
    if (!user) return alert('请先登录');
    if (user.credits < price) return alert('学分不足，请分享资源赚取学分');
    if (user.purchasedIds.includes(postId)) return;

    setUser({
      ...user,
      credits: user.credits - price,
      purchasedIds: [...user.purchasedIds, postId]
    });
  };

  const toggleFavorite = (postId: string) => {
    if (!user) return alert('请先登录');
    const isFav = user.favoriteIds.includes(postId);
    setUser({
      ...user,
      favoriteIds: isFav ? user.favoriteIds.filter(id => id !== postId) : [...user.favoriteIds, postId]
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 w-full glass-effect border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-6">
          <div onClick={() => navigateTo('/')} className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-6 transition-transform shadow-lg shadow-indigo-100">
              <BookOpen className="text-white" size={20} />
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 hidden sm:block tracking-tighter italic">CampusHub</span>
          </div>

          <div className="flex-grow max-w-xl relative">
            <input 
              value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)}
              type="text" placeholder="搜索资源..." 
              className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all text-sm outline-none" 
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('/post')} className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md active:scale-95">
              <PlusCircle size={18} /> 发布
            </button>
            {user ? (
              <div onClick={() => navigateTo('/profile')} className="flex items-center gap-3 bg-white border border-slate-200 pl-2 pr-4 py-1.5 rounded-full cursor-pointer hover:border-indigo-400 transition-all shadow-sm">
                <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-100" />
                <div className="hidden lg:block">
                  <div className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Credits</div>
                  <div className="text-xs font-black text-indigo-600 leading-none">{user.credits}</div>
                </div>
              </div>
            ) : (
              <button onClick={() => alert('请登录')} className="text-sm font-bold text-slate-600 hover:text-indigo-600">登录</button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 w-full flex-grow mt-8 mb-20">
        {currentPath === '#/' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <aside className="hidden lg:block lg:col-span-3 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24">
                <h3 className="font-black text-slate-800 mb-5 flex items-center gap-2 text-xs uppercase tracking-widest">
                  <Filter size={16} className="text-indigo-600" /> 学科分类
                </h3>
                <nav className="space-y-1">
                  <button onClick={() => setActiveCategory('全部')} className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeCategory === '全部' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>全部</button>
                  {Object.values(Category).map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)} className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all ${activeCategory === cat ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>{cat}</button>
                  ))}
                </nav>
              </div>
            </aside>

            <section className="lg:col-span-9 space-y-5">
              {filteredPosts.map(post => (
                <div key={post.id} onClick={() => navigateTo(`/post/${post.id}`)} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-xl transition-all cursor-pointer group flex flex-col md:flex-row md:h-52">
                  <div className="md:w-64 h-44 md:h-full flex-shrink-0 overflow-hidden relative">
                    <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-4 left-4">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${post.price > 0 ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}>
                         {post.price > 0 ? `${post.price} 学分` : '免费'}
                       </span>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-3 mb-3 text-[10px] font-black uppercase tracking-tight">
                      {post.isPinned && <span className="text-amber-500 flex items-center gap-1"><Pin size={12} /> Pinned</span>}
                      <span className="text-indigo-400">{post.category}</span>
                    </div>
                    <h3 className="text-xl font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 mb-2 leading-tight">{post.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed mb-4">{post.content}</p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-5 text-slate-400 text-[11px] font-bold">
                        <span className="flex items-center gap-1.5"><MessageSquare size={14} /> {post.replies}</span>
                        <span className="flex items-center gap-1.5"><Eye size={14} /> {post.views}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">{post.author}</span>
                        <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white text-[10px] font-black">{post.author[0]}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </div>
        )}

        {currentPath.startsWith('#/post/') && currentPost && (
          <PostDetail post={currentPost} user={user} navigateTo={navigateTo} onPurchase={handlePurchase} onToggleFav={toggleFavorite} />
        )}

        {currentPath === '#/profile' && user && (
          <ProfileView user={user} posts={posts} navigateTo={navigateTo} />
        )}

        {currentPath === '#/post' && (
          <CreatePost setPosts={setPosts} navigateTo={navigateTo} user={user} />
        )}
      </main>
    </div>
  );
};

// --- 子组件：详情页 ---
const PostDetail: React.FC<{ post: Post, user: User | null, navigateTo: (p: string) => void, onPurchase: (id: string, price: number) => void, onToggleFav: (id: string) => void }> = ({ post, user, navigateTo, onPurchase, onToggleFav }) => {
  const isPurchased = user?.purchasedIds.includes(post.id) || post.price === 0 || user?.id === post.authorId;
  const isFavorite = user?.favoriteIds.includes(post.id);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigateTo('/')} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} /> 返回列表
        </button>
        <button onClick={() => onToggleFav(post.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-white text-slate-400 hover:text-red-400'}`}>
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} /> {isFavorite ? '已收藏' : '收藏资源'}
        </button>
      </div>

      <article className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden mb-12">
        <div className="p-8 md:p-14">
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-indigo-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full">{post.category}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-400 text-xs font-medium">发布于 {new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-10">{post.title}</h1>
            
            <div className="flex items-center justify-between py-8 border-y border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">{post.author[0]}</div>
                <div>
                  <div className="font-black text-slate-900 text-lg">{post.author}</div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">资源主讲人</div>
                </div>
              </div>
            </div>
          </header>

          <section className="prose prose-slate max-w-none text-slate-600 leading-[1.8] text-lg mb-16 whitespace-pre-wrap">
            {post.content}
            {post.thumbnail && <img src={post.thumbnail} className="mt-10 w-full rounded-[2.5rem] shadow-2xl" />}
          </section>

          {/* 网盘下载面板 - 老王风格 + 购买逻辑 */}
          <div className="netdisk-gradient rounded-[3rem] p-1 shadow-2xl">
            <div className="px-10 py-12">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-white text-xl font-black flex items-center gap-3">
                  <HardDrive size={24} className="text-indigo-400" /> 资源下载地址
                </h3>
                <div className="px-4 py-2 bg-white/10 rounded-full text-[10px] font-black text-indigo-300 border border-white/10 uppercase tracking-widest">
                  Secure Download
                </div>
              </div>
              
              {!isPurchased ? (
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 text-center">
                  <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock size={40} />
                  </div>
                  <h4 className="text-white text-2xl font-black mb-4">该资源需要付费解锁</h4>
                  <p className="text-slate-400 mb-10 max-w-sm mx-auto">本资源由作者设定为付费解锁，消耗 <span className="text-white font-black underline">{post.price} 学分</span> 即可获得永久下载权限。</p>
                  <button onClick={() => onPurchase(post.id, post.price)} className="bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-500 transition-all shadow-2xl active:scale-95 flex items-center gap-3 mx-auto">
                    <Wallet size={20} /> 立即解锁资源
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {post.links.map((link, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-7 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-5 flex-grow w-full md:w-auto">
                        <div className="w-14 h-14 bg-white rounded-2xl p-3 flex-shrink-0">
                          <img src={STORAGE_ICONS[link.provider]} className="w-full h-full object-contain" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-black text-lg">{link.provider}</div>
                          <div className="text-indigo-400/50 text-[10px] truncate max-w-[200px]">{link.url}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        {link.password && (
                          <div className="flex-grow md:flex-grow-0 flex items-center gap-4 bg-black/40 border border-white/10 px-6 py-4 rounded-2xl">
                            <span className="text-indigo-400 text-[10px] font-black uppercase tracking-tighter">提取码</span>
                            <span className="text-white font-mono font-black text-xl tracking-widest">{link.password}</span>
                            <button onClick={() => copyCode(link.password!, idx)} className="text-slate-400 hover:text-white transition-colors">
                              {copiedIdx === idx ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                            </button>
                          </div>
                        )}
                        <a href={link.url} target="_blank" className="flex-grow md:flex-grow-0 bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2 shadow-xl active:scale-95">
                          跳转网盘 <ExternalLink size={18} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

// --- 子组件：个人中心 ---
const ProfileView: React.FC<{ user: User, posts: Post[], navigateTo: (p: string) => void }> = ({ user, posts, navigateTo }) => {
  const [activeTab, setActiveTab] = useState<'shared' | 'purchased' | 'favorite'>('shared');

  const displayedPosts = useMemo(() => {
    if (activeTab === 'shared') return posts.filter(p => user.sharedIds.includes(p.id));
    if (activeTab === 'purchased') return posts.filter(p => user.purchasedIds.includes(p.id));
    if (activeTab === 'favorite') return posts.filter(p => user.favoriteIds.includes(p.id));
    return [];
  }, [activeTab, posts, user]);

  return (
    <div className="max-w-6xl mx-auto">
      {/* 头部信息卡片 */}
      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white flex flex-col md:flex-row items-center gap-10 mb-12 relative overflow-hidden">
        <div className="relative z-10 w-40 h-40 flex-shrink-0">
          <img src={user.avatar} className="w-full h-full rounded-[2.5rem] border-4 border-white/20 shadow-2xl" />
        </div>
        <div className="relative z-10 flex-grow text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
            <h1 className="text-4xl font-black tracking-tighter">{user.name}</h1>
            <span className="bg-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Gold Member</span>
          </div>
          <p className="text-slate-400 font-bold mb-8">{user.college} · 核心贡献者</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
              <div className="text-[10px] font-black text-indigo-400 uppercase mb-1">Total Credits</div>
              <div className="text-2xl font-black flex items-center gap-2"><Wallet size={20} className="text-emerald-400" /> {user.credits}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
              <div className="text-[10px] font-black text-indigo-400 uppercase mb-1">Shares</div>
              <div className="text-2xl font-black">{user.sharedIds.length}</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4">
              <div className="text-[10px] font-black text-indigo-400 uppercase mb-1">Favorites</div>
              <div className="text-2xl font-black">{user.favoriteIds.length}</div>
            </div>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]"></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-white p-2 rounded-3xl border border-slate-200 shadow-sm w-fit mx-auto md:mx-0">
        <button onClick={() => setActiveTab('shared')} className={`flex items-center gap-2 px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all ${activeTab === 'shared' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
          <LayoutDashboard size={18} /> 我的分享
        </button>
        <button onClick={() => setActiveTab('purchased')} className={`flex items-center gap-2 px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all ${activeTab === 'purchased' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
          <ShoppingBag size={18} /> 已购资源
        </button>
        <button onClick={() => setActiveTab('favorite')} className={`flex items-center gap-2 px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all ${activeTab === 'favorite' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
          <Heart size={18} /> 我的收藏
        </button>
      </div>

      {/* 列表渲染 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedPosts.length > 0 ? displayedPosts.map(post => (
          <div key={post.id} onClick={() => navigateTo(`/post/${post.id}`)} className="bg-white border border-slate-200 p-6 rounded-[2rem] hover:shadow-xl transition-all cursor-pointer group flex gap-6 items-center">
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={post.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
            </div>
            <div className="min-w-0">
              <h4 className="font-black text-slate-800 line-clamp-1 group-hover:text-indigo-600 mb-1">{post.title}</h4>
              <p className="text-xs text-slate-400 mb-3">{new Date(post.createdAt).toLocaleDateString()}</p>
              <div className="flex gap-2">
                <span className="bg-slate-50 text-[10px] font-bold px-2 py-1 rounded-md text-slate-500 uppercase">{post.category}</span>
                {post.price > 0 && <span className="bg-amber-50 text-[10px] font-bold px-2 py-1 rounded-md text-amber-600">{post.price}学分</span>}
              </div>
            </div>
            <ChevronRight className="ml-auto text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" size={20} />
          </div>
        )) : (
          <div className="col-span-full py-20 text-center bg-white border border-slate-200 border-dashed rounded-[3rem]">
            <History size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">暂无相关记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 子组件：发布页 (复用之前逻辑，增加积分设置) ---
const CreatePost: React.FC<{ setPosts: React.Dispatch<React.SetStateAction<Post[]>>, navigateTo: (p: string) => void, user: User | null }> = ({ setPosts, navigateTo, user }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(Category.EXAMS);
  const [price, setPrice] = useState(0);
  const [links, setLinks] = useState([{ provider: StorageProvider.BAIDU, url: '', password: '' }]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAIParse = async () => {
    if (content.length < 15) return alert('请描述资源以供AI分析');
    setIsAnalyzing(true);
    try {
      const result = await analyzeResourceDescription(content);
      if (result) {
        setTitle(result.title);
        const matched = Object.values(Category).find(c => result.category.includes(c));
        if (matched) setCategory(matched as Category);
      }
    } finally { setIsAnalyzing(false); }
  };

  const publish = () => {
    const p: Post = {
      id: Math.random().toString(36).substr(2, 9),
      title, content, category, price, author: user?.name || '匿名同学', authorId: user?.id || 'anon',
      createdAt: new Date().toISOString(), views: 0, replies: 0, isPinned: false,
      links: links.filter(l => l.url),
      thumbnail: `https://picsum.photos/seed/${Math.random()}/600/350`
    };
    setPosts(prev => [p, ...prev]);
    navigateTo('/');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-12 bg-slate-900 text-white">
           <h2 className="text-4xl font-black mb-2">发布学习资源</h2>
           <p className="text-slate-400 font-medium">帮助他人的同时赚取学分，构建共赢的学习圈。</p>
        </div>
        <div className="p-12 space-y-10">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">资源描述</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] min-h-[200px] focus:border-indigo-500 focus:bg-white outline-none transition-all text-lg shadow-inner" placeholder="请详细输入资源背景、包含内容、适用范围等..." />
            <button onClick={handleAIParse} disabled={isAnalyzing} className="px-6 py-3 bg-indigo-50 text-indigo-600 font-black text-xs rounded-2xl hover:bg-indigo-100 flex items-center gap-2"><Sparkles size={16} /> {isAnalyzing ? '智能总结中...' : 'AI 智能一键生成标题与分类'}</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">资源标题</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 outline-none" />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">下载学分限制</label>
              <div className="relative">
                <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold focus:border-indigo-500 outline-none pl-12" />
                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">云盘链接设置</label>
            {links.map((link, idx) => (
              <div key={idx} className="p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] space-y-5">
                <div className="flex gap-4">
                  <select value={link.provider} onChange={e => { const n = [...links]; n[idx].provider = e.target.value as StorageProvider; setLinks(n); }} className="w-1/3 p-4 bg-white border border-slate-200 rounded-2xl font-black text-sm">
                    {Object.values(StorageProvider).map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <input value={link.url} onChange={e => { const n = [...links]; n[idx].url = e.target.value; setLinks(n); }} placeholder="粘贴网盘完整地址" className="flex-grow p-4 bg-white border border-slate-200 rounded-2xl text-sm font-mono" />
                </div>
                <input value={link.password} onChange={e => { const n = [...links]; n[idx].password = e.target.value; setLinks(n); }} placeholder="提取码 (选填)" className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm font-black tracking-widest" />
              </div>
            ))}
          </div>

          <div className="pt-8 flex gap-6">
            <button onClick={() => navigateTo('/')} className="flex-1 py-5 font-black text-slate-400 rounded-3xl hover:bg-slate-50 transition-colors">取消发布</button>
            <button onClick={publish} className="flex-[2] py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-indigo-600 transition-all shadow-xl active:scale-95">确认发布并上架</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
