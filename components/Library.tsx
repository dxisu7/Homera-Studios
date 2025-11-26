import React from 'react';
import { SavedResult } from '../types';
import { Trash2, Download, Calendar, Sparkles } from 'lucide-react';

interface LibraryProps {
  items: SavedResult[];
  onDelete: (id: string) => void;
}

export const Library: React.FC<LibraryProps> = ({ items, onDelete }) => {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 opacity-20" />
        </div>
        <p className="text-lg font-medium">Your library is empty</p>
        <p className="text-sm">Generated designs you save will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {items.map((item) => (
        <div key={item.id} className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all shadow-lg hover:shadow-2xl hover:shadow-yellow-900/10">
          <div className="relative aspect-video bg-black">
            <img src={item.generatedImage} alt={item.prompt} className="w-full h-full object-cover" />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
              <a 
                href={item.generatedImage} 
                download={`homera-ai-${item.id}.png`}
                className="p-3 bg-white text-black rounded-full hover:bg-yellow-500 transition-colors shadow-lg transform hover:scale-110"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </a>
              <button 
                onClick={() => onDelete(item.id)}
                className="p-3 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg transform hover:scale-110"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
                 <div className="bg-black/70 backdrop-blur px-2 py-1 rounded text-[10px] text-zinc-300 font-mono border border-white/10">
                  {new Date(item.date).toLocaleDateString()}
                </div>
            </div>
            <div className="absolute bottom-2 right-2">
                 <div className={`
                   px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border backdrop-blur
                   ${item.tierUsed === 'ULTRA_4K' ? 'bg-purple-500/20 border-purple-500/50 text-purple-200' : 
                     item.tierUsed === 'PREMIUM_2K' ? 'bg-blue-500/20 border-blue-500/50 text-blue-200' : 
                     'bg-zinc-800/80 border-zinc-600 text-zinc-400'}
                 `}>
                  {item.quality.replace('_', ' ')}
                </div>
            </div>
          </div>
          
          <div className="p-4">
             <div className="flex items-start gap-2">
               <Sparkles className="w-4 h-4 text-yellow-500/50 mt-0.5 flex-shrink-0" />
               <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed" title={item.prompt}>
                 {item.prompt}
               </p>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};