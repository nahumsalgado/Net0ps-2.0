import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { User } from '../../types';

interface HeaderProps {
  user: User | null;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header: React.FC<HeaderProps> = ({ user, setSidebarOpen }) => {
  const initials = user?.nombre
    ? user.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-10 shrink-0">
      <div className="flex items-center gap-3 md:gap-6">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          <Menu size={22} />
        </button>
        <h1 className="text-xl font-bold text-blue-600 m-0 tracking-tight hidden md:block">
          NetOps <span className="text-gray-700">2.0</span>
        </h1>
        
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-1.5 w-48 md:w-80 gap-2.5">
          <Search size={18} className="text-gray-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="border-none bg-transparent outline-none w-full text-sm text-gray-700"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {user && (
          <div className="hidden md:flex flex-col items-end mr-2 text-right">
            <span className="text-sm font-semibold text-gray-900 leading-tight">{user.nombre}</span>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">{user.rol}</span>
          </div>
        )}
        <button className="bg-transparent border-none cursor-pointer p-2 rounded-full flex items-center justify-center transition-colors hover:bg-gray-100">
          <Bell size={20} className="text-gray-500" />
        </button>
        <div 
          title={`${user?.nombre} (${user?.rol})`}
          className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-blue-700 transition-colors"
        >
          {initials}
        </div>
      </div>
    </header>
  );
};
