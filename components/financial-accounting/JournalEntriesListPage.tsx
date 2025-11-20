
import React, { useState, useMemo } from 'react';
import type { JournalEntry, JournalEntryStatus } from '../../types';
import { 
    IconPlusCircle, IconSearch, IconFilter, IconDotsVertical, IconEdit, 
    IconTrash, IconEye, IconChevronLeft, IconChevronRight, IconCopy, 
    IconFile, IconCalendar, IconCheckCircle, IconXCircle 
} from '../Icons';
import { Modal } from '../common/Modal';

const ITEMS_PER_PAGE = 10;

const statusMap: { [key in JournalEntryStatus]: { class: string, text: string, icon: React.ReactNode } } = {
    'پیش‌نویس': { class: 'bg-gray-100 text-gray-600 border-gray-300', text: 'پیش‌نویس', icon: <IconFile className="w-3 h-3"/> },
    'تایید شده': { class: 'bg-blue-50 text-blue-600 border-blue-200', text: 'تایید شده', icon: <IconCheckCircle className="w-3 h-3"/> },
    'ثبت شده': { class: 'bg-green-50 text-green-600 border-green-200', text: 'ثبت قطعی', icon: <IconCheckCircle className="w-3 h-3"/> },
    'باطل شده': { class: 'bg-red-50 text-red-600 border-red-200', text: 'باطل شده', icon: <IconXCircle className="w-3 h-3"/> },
};

const KPICard: React.FC<{ title: string, value: number | string, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
            <p className="text-xl font-bold text-gray-800 dark:text-white font-mono">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-opacity-100`}>
            {icon}
        </div>
    </div>
);

interface JournalEntriesListPageProps {
    journalEntries: JournalEntry[];
    onNavigate: (page: 'financials-gl-new') => void;
    deleteJournalEntry: (id: string) => void;
    reverseJournalEntry: (id: string) => void;
}

export const JournalEntriesListPage: React.FC<JournalEntriesListPageProps> = ({ journalEntries, onNavigate, deleteJournalEntry, reverseJournalEntry }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<JournalEntryStatus | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Statistics
    const stats = useMemo(() => {
        return {
            totalDocs: journalEntries.length,
            drafts: journalEntries.filter(e => e.status === 'پیش‌نویس').length,
            finalized: journalEntries.filter(e => e.status === 'ثبت شده').length,
            totalAmount: journalEntries.reduce((sum, e) => sum + e.totalDebit, 0)
        };
    }, [journalEntries]);

    const filteredEntries = useMemo(() => {
        return journalEntries.filter(entry => {
            const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase()) || String(entry.docNumber).includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || entry.status === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => b.docNumber - a.docNumber);
    }, [journalEntries, searchTerm, statusFilter]);

    const paginatedEntries = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredEntries, currentPage]);

    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col h-full space-y-6">
             {/* Header & Actions */}
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">دفتر کل و اسناد حسابداری</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">مدیریت یکپارچه اسناد مالی، جستجو و کنترل وضعیت</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors">
                        <IconFilter className="w-5 h-5" /> فیلترها
                    </button>
                    <button 
                        onClick={() => onNavigate('financials-gl-new')}
                        className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-lg shadow-lg hover:bg-primary-600 transition-all transform hover:-translate-y-0.5"
                    >
                        <IconPlusCircle className="w-5 h-5" />
                        <span className="font-medium">سند جدید</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="کل اسناد" value={stats.totalDocs} icon={<IconFile className="w-6 h-6 text-blue-600"/>} color="bg-blue-100" />
                <KPICard title="پیش‌نویس" value={stats.drafts} icon={<IconEdit className="w-6 h-6 text-orange-600"/>} color="bg-orange-100" />
                <KPICard title="نهایی شده" value={stats.finalized} icon={<IconCheckCircle className="w-6 h-6 text-green-600"/>} color="bg-green-100" />
                <KPICard title="گردش کل دوره" value={(stats.totalAmount/1000000).toFixed(0) + ' M'} icon={<IconDotsVertical className="w-6 h-6 text-purple-600"/>} color="bg-purple-100" />
            </div>

            {/* Data Table Container */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col flex-grow overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="relative w-full md:w-96">
                        <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="جستجو در شرح، شماره سند..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                         <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as any)}
                            className="py-2.5 px-4 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm cursor-pointer"
                        >
                            <option value="all">همه وضعیت‌ها</option>
                            {Object.entries(statusMap).map(([key, val]) => <option key={key} value={key}>{val.text}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto flex-grow">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 sticky top-0 backdrop-blur-sm">
                            <tr>
                                <th className="px-6 py-4 w-20">شماره</th>
                                <th className="px-6 py-4 w-32">تاریخ</th>
                                <th className="px-6 py-4">شرح سند</th>
                                <th className="px-6 py-4 w-40">مبلغ کل (ریال)</th>
                                <th className="px-6 py-4 w-32">منبع</th>
                                <th className="px-6 py-4 w-32">وضعیت</th>
                                <th className="px-6 py-4 w-24 text-center">عملیات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {paginatedEntries.map((entry, index) => (
                                <tr key={entry.id} className="group hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                                    <td className="px-6 py-4 font-mono font-bold text-gray-700 dark:text-gray-300">{entry.docNumber}</td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{entry.date}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-xs" title={entry.description}>
                                            {entry.description}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">{entry.lines.length} آرتیکل</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-semibold tracking-tight text-gray-800 dark:text-gray-200">{(entry.totalDebit ?? 0).toLocaleString('fa-IR')}</td>
                                    <td className="px-6 py-4"><span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 dark:text-gray-400">{entry.sourceModule || 'GL'}</span></td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${statusMap[entry.status].class}`}>
                                            {statusMap[entry.status].icon}
                                            {statusMap[entry.status].text}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                       <div className="flex items-center justify-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors" title="مشاهده/ویرایش"><IconEye className="w-4 h-4"/></button>
                                            <button onClick={() => reverseJournalEntry(entry.id)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="سند معکوس"><IconCopy className="w-4 h-4"/></button>
                                            {entry.status !== 'ثبت شده' && <button onClick={() => deleteJournalEntry(entry.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="حذف"><IconTrash className="w-4 h-4"/></button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                <div className="border-t border-gray-100 dark:border-gray-700 p-4 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        نمایش <span className="font-semibold">{paginatedEntries.length}</span> از <span className="font-semibold">{filteredEntries.length}</span> رکورد
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 shadow-sm transition-colors"><IconChevronRight className="w-4 h-4"/></button>
                        <span className="text-xs font-medium px-2 text-gray-600 dark:text-gray-300">صفحه {currentPage} از {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white dark:bg-gray-700 border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 shadow-sm transition-colors"><IconChevronLeft className="w-4 h-4"/></button>
                    </div>
                </div>
            </div>
        </div>
    );
};
