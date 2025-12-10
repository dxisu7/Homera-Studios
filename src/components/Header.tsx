import React from 'react';
import { LogOut, Book, User as UserIcon, Settings } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogoutClick: () => void;
  onLibraryClick: () => void;
  onHomeClick: () => void;
  onSettingsClick: () => void;
  activeView: 'editor' | 'library' | 'settings';
}

export const Header: React.FC<HeaderProps> = ({ 
  user, onLogoutClick, onLibraryClick, onHomeClick, onSettingsClick, activeView 
}) => {
  if (!user) return null; // Header is only for authenticated users now

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50 backdrop-blur bg-opacity-80">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onHomeClick}>
          {/* Logo Image - Replace src with your provided image URL */}
          <img 
            src="https://placehold.co/100x100/eab308/000000?text=HS" 
            alt="Homera Studios Logo" 
            className="w-8 h-8 rounded-lg object-cover shadow-lg shadow-yellow-500/20 group-hover:shadow-yellow-500/40 transition-shadow"
          />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none group-hover:text-yellow-500 transition-colors">
              Homera Studios Ai
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold mt-0.5">
              Visualization Platform
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Navigation Links */}
           <nav className="hidden md:flex items-center gap-1">
             <button 
              onClick={onHomeClick}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'editor' ? 'text-white bg-zinc-900' : 'text-zinc-400 hover:text-white'}`}
             >
               Editor
             </button>
             <button 
              onClick={onLibraryClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeView === 'library' ? 'text-yellow-500 bg-zinc-900' : 'text-zinc-400 hover:text-white'}`}
             >
               <Book className="w-4 h-4" />
               Library
             </button>
           </nav>

           <div className="h-6 w-px bg-zinc-800 mx-2"></div>

           {/* User Profile */}
           <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
               <div className="text-xs font-bold text-white">{user.name}</div>
               <div className={`text-[10px] font-mono font-bold ${
                 user.tier === 'ULTRA_16K' ? 'text-yellow-500' :
                 user.tier === 'ULTRA_4K' ? 'text-purple-400' :
                 user.tier === 'PREMIUM_2K' ? 'text-blue-400' :
                 'text-zinc-500'
               }`}>
                 {user.tier.replace('_', ' ')}
               </div>
             </div>

             <div className="relative group/menu">
                <button className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors border border-zinc-700 overflow-hidden">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-zinc-400" />
                  )}
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden hidden group-hover/menu:block hover:block">
                  <div className="p-2 space-y-1">
                    <button 
                      onClick={onSettingsClick}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-lg flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" /> Account Settings
                    </button>
                    <div className="h-px bg-zinc-800 my-1"></div>
                    <button 
                      onClick={onLogoutClick}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Log Out
                    </button>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </div>
    </header>
  );
};