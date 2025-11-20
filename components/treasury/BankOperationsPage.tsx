import React, { useState, useMemo } from 'react';
import type { Check, CheckStatus } from '../../types';
import { IconPlusCircle, IconSearch, IconFilter, IconDotsVertical, IconCheckCircle, IconTrash, IconFileText, IconChevronLeft, IconChevronRight, IconEdit } from '../Icons';
import { Modal } from '../common/Modal';

const ITEMS_PER_PAGE = 5;

const statusMap: { [key in CheckStatus]: { class: string } } = {
    'در جریان وصول': { class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    'پاس شده': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    'برگشتی': { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' },
    'خرج شده': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    'باطل شده': { class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
};

const allStatuses: CheckStatus[] = ['در جریان وصول', 'پاس شده', 'برگشتی', 'خرج شده', 'باطل شده'];


interface BankOperationsPageProps {
    checks: Check[];
    onNavigate: (page: 'treasury-new-check') => void;
    deleteCheck: (id: string) => void;
    updateCheckStatus: (checkId: string, newStatus: CheckStatus) => void;
}

const CheckTable: React.FC<{
    checks: Check[];
    onOpenStatusModal: (check: Check) => void;
    onDeleteCheck: (id: string) => void;
}> = ({ checks, onOpenStatusModal, onDeleteCheck }) => {
    // This is a sub-component to avoid code repetition for receivable/payable tabs.
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">شماره چک</th><th scope="col" className="px-6 py-3">تاریخ سررسید</th>
                        <th scope="col" className="px-6 py-3">طرف حساب</th><th scope="col" className="px-6 py-3">بانک</th>
                        <th scope="col" className="px-6 py-3">مبلغ</th><th scope="col" className="px-6 py-3">وضعیت</th>
                        <th scope="col" className="px-6 py-3 text-center">عملیات</th>
                    </tr>
                </thead>
                <tbody>
                    {checks.map(check => (
                        <tr key={check.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4 font-mono text-gray-900 dark:text-white">{check.checkNumber}</td>
                            <td className="px-6 py-4">{check.dueDate}</td>
                            <td className="px-6 py-4">{check.partyName}</td>
                            <td className="px-6 py-4">{check.bankName}</td>
                            <td className="px-6 py-4 font-semibold text-gray-800 dark:text-gray-200">{(check.amount ?? 0).toLocaleString('fa-IR')}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusMap[check.status].class}`}>{check.status}</span>
                            </td>
                            <td className="px-6 py-4 text-center">
                               <div className="relative group inline-block">
                                    <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><IconDotsVertical /></button>
                                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible text-right">
                                        <button onClick={() => onOpenStatusModal(check)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"><IconEdit className="w-4 h-4"/>تغییر وضعیت</button>
                                        <button onClick={() => onDeleteCheck(check.id)} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-gray-100 dark:hover:bg-gray-700"><IconTrash className="w-4 h-4"/>حذف/ابطال</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
};


export const BankOperationsPage: React.FC<BankOperationsPageProps> = ({ checks, onNavigate, deleteCheck, updateCheckStatus }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
    const [statusFilter, setStatusFilter] = useState<CheckStatus | 'all'>('all');
    
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
    const [newStatus, setNewStatus] = useState<CheckStatus>('در جریان وصول');
    
    const filteredChecks = useMemo(() => {
        const typeFilter = activeTab === 'receivable' ? 'دریافتی' : 'پرداختی';
        return checks.filter(check => 
            (check.partyName.toLowerCase().includes(searchTerm.toLowerCase()) || check.checkNumber.includes(searchTerm)) &&
            (check.type === typeFilter) &&
            (statusFilter === 'all' || check.status === statusFilter)
        );
    }, [checks, searchTerm, activeTab, statusFilter]);
    
    const openStatusModal = (check: Check) => {
        setSelectedCheck(check);
        setNewStatus(check.status);
        setIsStatusModalOpen(true);
    };

    const handleStatusUpdate = () => {
        if (selectedCheck) {
            updateCheckStatus(selectedCheck.id, newStatus);
            setIsStatusModalOpen(false);
            setSelectedCheck(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">میزکار مدیریت چک‌ها</h1>
                <button 
                    onClick={() => onNavigate('treasury-new-check')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors"
                >
                    <IconPlusCircle className="w-5 h-5" />
                    <span>ثبت چک جدید</span>
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex border-b dark:border-gray-700 mb-4">
                    <button onClick={() => setActiveTab('receivable')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'receivable' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>چک‌های دریافتی</button>
                    <button onClick={() => setActiveTab('payable')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'payable' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>چک‌های پرداختی</button>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="relative">
                        <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="جستجو شماره چک یا طرف حساب..."
                            value={searchTerm}
                            onChange={e => { setSearchTerm(e.target.value); }}
                            className="w-full pr-10 pl-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); }} className="w-full py-2 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">همه وضعیت‌ها</option>
                        {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                
                <CheckTable checks={filteredChecks} onOpenStatusModal={openStatusModal} onDeleteCheck={deleteCheck} />
            </div>
            {selectedCheck && (
                <Modal isOpen={isStatusModalOpen} onClose={() => setIsStatusModalOpen(false)} title={`تغییر وضعیت چک شماره ${selectedCheck.checkNumber}`}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">وضعیت جدید</label>
                            <select value={newStatus} onChange={e => setNewStatus(e.target.value as CheckStatus)} className="w-full py-2 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                                {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                         <div className="border-t dark:border-gray-700 pt-4">
                            <h4 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">تاریخچه وضعیت</h4>
                            <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                                {selectedCheck.history?.map((h, i) => (
                                    <li key={i} className="flex justify-between p-1 bg-gray-100 dark:bg-gray-700 rounded">
                                        <span>{h.status}</span>
                                        <span className="text-gray-500">{h.date} توسط {h.user}</span>
                                    </li>
                                )).reverse()}
                            </ul>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <button onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 rounded-lg">لغو</button>
                            <button onClick={handleStatusUpdate} className="px-4 py-2 text-sm bg-primary text-white rounded-lg">ذخیره تغییرات</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};