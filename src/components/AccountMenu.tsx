import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { Settings, LogOut, User as UserIcon } from 'lucide-react';

interface AccountMenuProps {
  user: User;
  onLogout: () => void;
  onSettings: () => void;
}

export default function AccountMenu({ user, onLogout, onSettings }: AccountMenuProps) {
  return (
    <DropdownMenu.Root>
      {/* Trigger (avatar / icon) */}
      <DropdownMenu.Trigger asChild>
        <button
          aria-label="Account menu"
          className="account-trigger w-9 h-9 rounded-full overflow-hidden border border-zinc-700 transition-colors hover:border-zinc-500 flex items-center justify-center bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
          ) : (
             <UserIcon className="w-5 h-5 text-zinc-400" />
          )}
        </button>
      </DropdownMenu.Trigger>

      {/* Portal = outside click + z-index safe */}
      <DropdownMenu.Portal>
        <AnimatePresence>
          <DropdownMenu.Content asChild sideOffset={8} align="end">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="account-menu z-50 bg-zinc-950 border border-zinc-800"
            >
              <DropdownMenu.Item
                className="menu-item hover:bg-zinc-900 outline-none"
                onSelect={onSettings}
              >
                <Settings className="w-4 h-4 mr-2" />
                Account Settings
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="menu-separator bg-zinc-800" />

              <DropdownMenu.Item
                className="menu-item danger hover:bg-red-900/10 text-red-400 outline-none"
                onSelect={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </DropdownMenu.Item>
            </motion.div>
          </DropdownMenu.Content>
        </AnimatePresence>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}