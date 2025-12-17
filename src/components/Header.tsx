import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Book, User as UserIcon, Settings } from 'lucide-react';
import { User } from '../types';
import { subscriptionPlans } from '../config/subscriptions';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    // If the mouse re-enters (either avatar or menu) before the close delay finishes,
    // we clear the close timer so the menu stays open.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsMenuOpen(true);
  };

  const handleMouseLeave = () => {
    // Add a small delay (200ms) before closing. This acts as a bridge,
    // allowing the user to cross the gap between the avatar and the menu
    // without the menu disappearing immediately.
    timeoutRef.current = setTimeout(() => {
      setIsMenuOpen(false);
    }, 200);
  };

  if (!user) return null; // Header is only for authenticated users now

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'ultra_realistic_16k': return 'text-yellow-500';
      case 'ultra_4k': return 'text-purple-400';
      case 'premium_2k': return 'text-blue-400';
      default: return 'text-zinc-500';
    }
  };

  const currentPlanName = subscriptionPlans.find(p => p.id === user.tier)?.name || user.tier;

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
               <div className="text-xs font-bold text-white">{user.displayName}</div>
               <div className={`text-[10px] font-mono font-bold ${getTierColor(user.tier)}`}>
                 {currentPlanName}
               </div>
             </div>

             {/* Wrapper div handles hover state for both the Avatar button and the Dropdown menu */}
             <div 
               className="relative"
               onMouseEnter={handleMouseEnter}
               onMouseLeave={handleMouseLeave}
             >
                <button className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center transition-colors border border-zinc-700 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-zinc-400" />
                  )}
                </button>
                
                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="p-2 space-y-1">
                      <button 
                        onClick={() => {
                          onSettingsClick();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Account Settings
                      </button>
                      <div className="h-px bg-zinc-800 my-1"></div>
                      <button 
                        onClick={() => {
                          onLogoutClick();
                          setIsMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  </div>
                )}
             </div>
           </div>
        </div>
      </div>
    </header>
  );
};