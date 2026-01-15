
import React from 'react';
import { Post } from '../types';
import { MessageSquare, Eye, Pin, ExternalLink, Calendar } from 'lucide-react';

interface ResourceCardProps {
  post: Post;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ post }) => {
  return (
    <div 
      onClick={() => window.location.hash = `/post/${post.id}`}
      className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex flex-col md:flex-row">
        {post.thumbnail && (
          <div className="md:w-64 h-48 md:h-auto overflow-hidden">
            <img 
              src={post.thumbnail} 
              alt={post.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        )}
        <div className="p-5 flex-grow">
          <div className="flex items-start justify-between mb-2">
            <div className="flex flex-wrap gap-2 items-center">
              {post.isPinned && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-md border border-amber-200">
                  <Pin size={10} /> Pinned
                </span>
              )}
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-md border border-indigo-200">
                {post.category}
              </span>
            </div>
            <div className="text-slate-400 text-xs flex items-center gap-1">
              <Calendar size={12} />
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-slate-500 text-sm line-clamp-2 mb-4">
            {post.content}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-4 text-slate-500 text-xs">
              <span className="flex items-center gap-1">
                <MessageSquare size={14} /> {post.replies}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={14} /> {post.views}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-700">{post.author}</span>
              <div className="w-6 h-6 bg-indigo-100 text-indigo-600 flex items-center justify-center rounded-full font-bold text-[10px]">
                {post.author[0]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
