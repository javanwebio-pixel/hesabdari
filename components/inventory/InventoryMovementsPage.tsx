
import React, { useState, useMemo } from 'react';
import type { InventoryMovement } from '../../types';
import { IconSearch, IconChevronLeft, IconChevronRight } from '../Icons';

const ITEMS_PER_PAGE = 10;

interface InventoryMovementsPageProps {
    movements: InventoryMovement[];
}

export const InventoryMovementsPage: React.FC<InventoryMovementsPageProps> = ({ movements }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const parseFaDate = (dateStr: string): Date => {
        if (!dateStr) return new Date();
        const parts = dateStr.split('/');
        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    };

    const filteredMovements = useMemo(() => {
        return movements.filter(m =>
            m.goodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.referenceDocNumber.includes(searchTerm)
        ).sort((a,b) => parseFaDate(b.date).getTime() - parseFaDate(a.date).getTime());
    }, [movements, searchTerm]);

    const paginatedMovements = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredMovements.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredMovements, currentPage]);

    const totalPages = Math.ceil(filteredMovements.length / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">گردش انبار (کاردکس)</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">تاریخچه کامل ورود و خروج کالاها از انبار.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="relative mb-4">
                    <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="جستجو نام کالا یا شماره سند..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pr-10 pl-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3">تاریخ</th>
                                <th className="px-6 py-3">کالا</th>
                                <th className="px-6 py-3">نوع تراکنش</th>
                                <th className="px-6 py-3">تعداد</th>
                                <th className="px-6 py-3">سند مرجع</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMovements.map(m => (
                                <tr key={m.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">{m.date}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{m.goodName}</td>
                                    <td className={`px-6 py-4 font-semibold ${m.type === 'ورود' ? 'text-success' : 'text-danger'}`}>
                                        {m.type}
                                    </td>
                                    <td className="px-6 py-4 font-mono">{m.quantity}</td>
                                    <td className="px-6 py-4 font-mono">{m.referenceDocNumber}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>نمایش {paginatedMovements.length} از {filteredMovements.length} تراکنش</div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"><IconChevronRight/></button>
                        <span className="px-3 py-1 text-xs">صفحه {currentPage} از {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"><IconChevronLeft/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};
