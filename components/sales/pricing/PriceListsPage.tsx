import React, { useState, useMemo, useCallback } from 'react';
import type { PriceList, PriceListItem, Good, ToastData } from '../../../types';
import { IconSearch, IconPlusCircle } from '../../Icons';
import { v4 as uuidv4 } from 'uuid';

interface PriceListsPageProps {
    priceLists: PriceList[];
    onUpdatePriceList: (list: PriceList) => void;
    goods: Good[];
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const PriceListsPage: React.FC<PriceListsPageProps> = ({ priceLists, onUpdatePriceList, goods, showToast }) => {
    const [selectedListId, setSelectedListId] = useState<string | null>(priceLists[0]?.id || null);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedList = useMemo(() => priceLists.find(pl => pl.id === selectedListId), [priceLists, selectedListId]);

    const filteredItems = useMemo(() => {
        if (!selectedList) return [];
        return selectedList.items.filter(item =>
            item.goodName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [selectedList, searchTerm]);

    const handlePriceChange = useCallback((itemId: string, newPrice: number) => {
        if (!selectedList) return;
        const updatedItems = selectedList.items.map(item =>
            item.id === itemId ? { ...item, price: newPrice } : item
        );
        onUpdatePriceList({ ...selectedList, items: updatedItems });
    }, [selectedList, onUpdatePriceList]);

    const handleAddItem = (good: Good) => {
        if (!selectedList) return;
        if (selectedList.items.some(item => item.goodId === good.id)) {
            showToast('این کالا از قبل در لیست قیمت وجود دارد.', 'info');
            return;
        }
        const newItem: PriceListItem = {
            id: uuidv4(),
            goodId: good.id,
            goodName: good.name,
            price: good.salePrice, // Default to base sale price
        };
        const updatedItems = [...selectedList.items, newItem];
        onUpdatePriceList({ ...selectedList, items: updatedItems });
    };

    const goodsNotInList = useMemo(() => {
        if (!selectedList) return [];
        const itemIds = new Set(selectedList.items.map(i => i.goodId));
        return goods.filter(g => !itemIds.has(g.id));
    }, [goods, selectedList]);

    return (
        <div className="space-y-6">
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت لیست‌های قیمت</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
                {/* Price Lists */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
                    <h3 className="font-semibold mb-2">لیست‌های قیمت</h3>
                    <ul className="space-y-1 overflow-y-auto">
                        {priceLists.map(pl => (
                            <li key={pl.id}>
                                <button onClick={() => setSelectedListId(pl.id)}
                                    className={`w-full text-right p-3 rounded-md text-sm ${selectedListId === pl.id ? 'bg-primary-50 text-primary dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    <p className="font-semibold">{pl.name}</p>
                                    <p className="text-xs text-gray-500">{pl.items.length} آیتم</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Price List Items */}
                <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
                    {selectedList ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">{selectedList.name}</h2>
                                    <p className="text-sm text-gray-500">معتبر از: {new Date(selectedList.validFrom).toLocaleDateString('fa-IR')}</p>
                                </div>
                                <div className="relative w-1/3">
                                    <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input type="text" placeholder="جستجوی کالا..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field w-full pr-10"/>
                                </div>
                            </div>
                            <div className="overflow-auto flex-grow">
                                <table className="w-full text-sm text-right">
                                    <thead className="sticky top-0 bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-500 dark:text-gray-400">
                                        <tr><th className="p-2">کد</th><th className="p-2">نام کالا</th><th className="p-2">قیمت</th></tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {filteredItems.map(item => (
                                            <tr key={item.id}>
                                                <td className="p-2 font-mono">{goods.find(g=>g.id === item.goodId)?.code}</td>
                                                <td className="p-2 font-semibold">{item.goodName}</td>
                                                <td className="p-2 w-48">
                                                    <input type="number" value={item.price} onChange={e => handlePriceChange(item.id, Number(e.target.value))} className="input-field font-mono"/>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="pt-4 border-t dark:border-gray-700">
                                 <div className="group relative">
                                    <button className="btn-secondary text-sm">افزودن کالا به لیست</button>
                                    <div className="absolute bottom-full mb-2 w-64 bg-white dark:bg-gray-800 border rounded-lg shadow-lg hidden group-focus-within:block group-hover:block max-h-60 overflow-y-auto z-10">
                                        {goodsNotInList.map(g => (
                                            <div key={g.id} onClick={() => handleAddItem(g)} className="p-2 text-sm hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer">{g.name}</div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : <p className="text-center text-gray-500 m-auto">یک لیست قیمت را برای مشاهده انتخاب کنید.</p>}
                </div>
            </div>
        </div>
    );
};