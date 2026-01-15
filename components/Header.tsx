
import React from 'react';
import { Search, Bell, User as UserIcon, BookOpen } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => window.location.hash = '/'}>
          <div className="bg-indigo-600 p-2 rounded-lg">
            <BookOpen className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 hidden sm:block">
            EduShare
          </span>
        </div>

        {/* Search */}
        <div className="flex-grow max-w-2xl relative">
          <input 
            type="text" 
            placeholder="Search learning resources, books, courses..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
            <UserIcon size={18} className="text-slate-500" />
          </div>
          <button 
            onClick={() => window.location.hash = '/post'}
            className="hidden md:block px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Post Resource
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
