import React from 'react';
import { IconMenu, IconSearch, IconSun, IconMoon, IconApps, IconBell, IconLanguage } from '../Icons';

interface HeaderProps {
    onToggleSidebar: () => void;
    onToggleTheme: () => void;
    currentTheme: 'light' | 'dark';
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleTheme, currentTheme }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center">
                <button onClick={onToggleSidebar} className="text-gray-500 dark:text-gray-400 mr-4">
                    <IconMenu />
                </button>
                <div className="relative hidden md:block">
                    <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="جستجو..." 
                        className="pr-10 pl-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>
            <div className="flex items-center">
                <button className="text-gray-500 dark:text-gray-400 hover:text-primary">
                    <IconLanguage />
                </button>
                <button onClick={onToggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-primary mx-4">
                    {currentTheme === 'light' ? <IconMoon /> : <IconSun />}
                </button>
                <button className="text-gray-500 dark:text-gray-400 hover:text-primary">
                    <IconApps />
                </button>
                <div className="relative mx-4">
                    <button className="text-gray-500 dark:text-gray-400 hover:text-primary">
                        <IconBell />
                    </button>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">۵</span>
                </div>
                <div className="relative">
                    <button className="flex items-center">
                        <img 
                            src="https://picsum.photos/40/40" 
                            alt="User Avatar" 
                            className="w-10 h-10 rounded-full"
                        />
                        <div className="mr-3 hidden md:block text-right">
                            <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">جان دو</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">مدیر</p>
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
};