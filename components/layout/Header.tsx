
import React from 'react';
import { IconMenu, IconSearch, IconSun, IconMoon, IconApps, IconBell, IconLanguage, IconChevronLeft } from '../Icons';

interface HeaderProps {
    onToggleSidebar: () => void;
    onToggleTheme: () => void;
    currentTheme: 'light' | 'dark';
    breadcrumbs: { label: string; path?: string }[];
    pageTitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleTheme, currentTheme, breadcrumbs, pageTitle }) => {
    return (
        <header className="glass-panel bg-white/80 dark:bg-[#151923]/80 sticky top-4 z-20 mx-6 mt-4 rounded-2xl shadow-soft border border-white/20 dark:border-white/5 flex items-center justify-between px-6 h-16 transition-all duration-300">
            <div className="flex items-center gap-4">
                <button onClick={onToggleSidebar} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-all p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95">
                    <IconMenu />
                </button>
                
                <div className="flex flex-col hidden md:flex">
                    <h2 className="text-sm font-extrabold text-gray-800 dark:text-white">{pageTitle}</h2>
                    <nav className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                         {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={index}>
                                <span className={`${index === breadcrumbs.length - 1 ? 'text-primary font-medium' : 'opacity-70'}`}>{crumb.label}</span>
                                {index < breadcrumbs.length - 1 && <IconChevronLeft className="w-3 h-3 mx-1.5 opacity-40" />}
                            </React.Fragment>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative hidden lg:block mr-2 group">
                    <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="جستجو (Ctrl+K)" 
                        className="w-64 pr-10 pl-4 py-2 text-sm rounded-xl bg-gray-100/50 dark:bg-gray-800/50 border-transparent focus:bg-white dark:focus:bg-gray-900 shadow-sm focus:shadow-md focus:border-primary/30 focus:ring-0 transition-all text-gray-700 dark:text-gray-200"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-gray-400 border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 bg-white dark:bg-gray-800">⌘K</span>
                </div>

                <div className="flex items-center gap-2 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl">
                    <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all shadow-sm hover:shadow-md">
                        <IconLanguage className="w-5 h-5" />
                    </button>
                    <button onClick={onToggleTheme} className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all shadow-sm hover:shadow-md">
                        {currentTheme === 'light' ? <IconMoon className="w-5 h-5" /> : <IconSun className="w-5 h-5" />}
                    </button>
                    <div className="relative">
                        <button className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-all shadow-sm hover:shadow-md">
                            <IconBell className="w-5 h-5" />
                        </button>
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse"></span>
                    </div>
                </div>
                
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

                <div className="relative cursor-pointer group pl-2">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                             <img 
                                src="https://i.pravatar.cc/150?img=68" 
                                alt="User Avatar" 
                                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700 shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all object-cover"
                            />
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
                        </div>
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors">امیرحسین راد</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">مدیر مالی ارشد</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
