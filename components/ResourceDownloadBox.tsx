
import React from 'react';
import { ResourceLink, StorageProvider } from '../types';
import { ExternalLink, Copy, Check, Lock } from 'lucide-react';
import { STORAGE_ICONS } from '../constants';

interface ResourceDownloadBoxProps {
  links: ResourceLink[];
}

const ResourceDownloadBox: React.FC<ResourceDownloadBoxProps> = ({ links }) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="my-8 bg-slate-50 border border-indigo-100 rounded-xl overflow-hidden">
      <div className="bg-indigo-600 px-6 py-3 flex items-center justify-between">
        <h4 className="text-white font-bold flex items-center gap-2">
          <ExternalLink size={18} /> Download Resources
        </h4>
        <span className="text-indigo-100 text-xs">Always verify files before opening</span>
      </div>
      
      <div className="p-6 space-y-4">
        {links.map((link, idx) => (
          <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 flex-grow min-w-0">
              <div className="w-10 h-10 flex-shrink-0 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-100">
                 <img src={STORAGE_ICONS[link.provider]} className="w-6 h-6 rounded" alt={link.provider} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-700 truncate">{link.provider}</div>
                <div className="text-xs text-indigo-500 truncate max-w-xs">{link.url}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {link.password && (
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-md px-3 py-2 text-xs">
                  <Lock size={12} className="text-slate-400 mr-2" />
                  <span className="font-mono font-bold mr-2">{link.password}</span>
                  <button 
                    onClick={() => copyToClipboard(link.password!, idx)}
                    className="text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {copiedIndex === idx ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                  </button>
                </div>
              )}
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-grow sm:flex-grow-0 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                Access <ExternalLink size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResourceDownloadBox;
