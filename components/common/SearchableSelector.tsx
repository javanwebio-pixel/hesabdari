import React, { useState, useMemo, useRef, useEffect } from 'react';
import { IconSearch } from '../Icons';

interface Item {
    id: string;
    name: string;
}

interface SearchableSelectorProps {
    items: Item[];
    onSelect: (item: Item | null) => void;
    placeholder: string;
    value: Item | null;
}

export const SearchableSelector: React.FC<SearchableSelectorProps> = ({ items, onSelect, placeholder, value }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        return items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [items, searchTerm]);

    const handleSelect = (item: Item) => {
        onSelect(item);
        setSearchTerm(item.name);
        setIsOpen(false);
    };
    
    useEffect(() => {
        if (value) {
            setSearchTerm(value.name);
        } else {
            setSearchTerm('');
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                if (value) setSearchTerm(value.name);
                else setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value]);

    return (
        <div className="relative" ref={wrapperRef}>
            <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={e => {
                    setSearchTerm(e.target.value);
                    if (e.target.value === '') {
                        onSelect(null);
                    }
                }}
                onFocus={() => setIsOpen(true)}
                className="input-field w-full pr-10"
            />
            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                        filteredItems.map(item => (
                            <li
                                key={item.id}
                                onClick={() => handleSelect(item)}
                                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer"
                            >
                                {item.name}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-sm text-gray-500">موردی یافت نشد.</li>
                    )}
                </ul>
            )}
        </div>
    );
};
