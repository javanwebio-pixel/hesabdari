import React, { useState, useMemo } from 'react';
import type { TreasuryDoc, TreasuryDocType, PaymentMethod, BankAccount, CashDesk, Check } from '../../types';
import { IconChevronRight, IconChevronLeft, IconPlusCircle, IconSearch, IconBuildingBank, IconWallet, IconFileText } from '../Icons';
import { Modal } from '../common/Modal';

const ITEMS_PER_PAGE = 5;

const KPICard: React.FC<{ title: string; value: number; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary-50 dark:bg-gray-700/50 text-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold font-mono text-gray-800 dark:text-gray-200 mt-1">{value.toLocaleString('fa-IR')}</p>
        </div>
    </div>
);

interface TreasuryDashboardPageProps {
    treasuryDocs: TreasuryDoc[];
    bankAccounts: BankAccount[];
    cashDesks: CashDesk[];
    checks: Check[];
    onNavigate: (page: 'treasury-receive' | 'treasury-payment') => void;
}

export const TreasuryListPage: React.FC<TreasuryDashboardPageProps> = ({ treasuryDocs, bankAccounts, cashDesks, checks, onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewingDoc, setViewingDoc] = useState<TreasuryDoc | null>(null);

    const typeMap = {
        'دریافت': { class: 'text-success' },
        'پرداخت': { class: 'text-danger' },
    };

    const kpis = useMemo(() => {
        const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalCashBalance = cashDesks.reduce((sum, desk) => sum + desk.balance, 0);
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const receivableChecks = checks.filter(c => c.type === 'دریافتی' && c.status === 'در جریان وصول' && c.dueDateObj <= nextWeek).reduce((sum, c) => sum + c.amount, 0);
        const payableChecks = checks.filter(c => c.type === 'پرداختی' && c.status === 'در جریان وصول' && c.dueDateObj <= nextWeek).reduce((sum, c) => sum + c.amount, 0);

        return { totalBankBalance, totalCashBalance, receivableChecks, payableChecks };
    }, [bankAccounts, cashDesks, checks]);

    const filteredDocs = useMemo(() => {
        return treasuryDocs.filter(doc =>
            (doc.description.toLowerCase().includes(searchTerm.toLowerCase()) || doc.partyName.toLowerCase().includes(searchTerm.toLowerCase()))
        ).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [treasuryDocs, searchTerm]);

    const paginatedDocs = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredDocs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredDocs, currentPage]);

    const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">میزکار خزانه‌داری</h1>
                <div className="flex gap-2">
                    <button 
                        onClick={() => onNavigate('treasury-receive')}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors"
                    >
                        <IconPlusCircle className="w-5 h-5" />
                        <span>دریافت جدید</span>
                    </button>
                    <button 
                        onClick={() => onNavigate('treasury-payment')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
                    >
                        <IconPlusCircle className="w-5 h-5" />
                        <span>پرداخت جدید</span>
                    </button>
                </div>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="موجودی کل بانک‌ها" value={kpis.totalBankBalance} icon={<IconBuildingBank className="w-6 h-6"/>} />
                <KPICard title="موجودی کل صندوق‌ها" value={kpis.totalCashBalance} icon={<IconWallet className="w-6 h-6"/>} />
                <KPICard title="چک‌های دریافتی سررسید هفته" value={kpis.receivableChecks} icon={<IconFileText className="w-6 h-6"/>} />
                <KPICard title="چک‌های پرداختی سررسید هفته" value={kpis.payableChecks} icon={<IconFileText className="w-6 h-6"/>} />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <h3 className="text-lg font-semibold mb-4">گردش‌های اخیر خزانه</h3>
                <div className="relative mb-4">
                    <IconSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="جستجو شرح یا طرف حساب..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pr-10 pl-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">تاریخ</th>
                                <th scope="col" className="px-6 py-3">نوع</th>
                                <th scope="col" className="px-6 py-3">طرف حساب</th>
                                <th scope="col" className="px-6 py-3">روش</th>
                                <th scope="col" className="px-6 py-3">مبلغ</th>
                                <th scope="col" className="px-6 py-3">شرح</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDocs.map(doc => (
                                <tr key={doc.id} onClick={() => setViewingDoc(doc)} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer">
                                    <td className="px-6 py-4">{doc.date}</td>
                                    <td className={`px-6 py-4 font-semibold ${typeMap[doc.type].class}`}>{doc.type}</td>
                                    <td className="px-6 py-4">{doc.partyName}</td>
                                    <td className="px-6 py-4">{doc.paymentMethod}</td>
                                    <td className="px-6 py-4 font-mono">{(doc.amount ?? 0).toLocaleString('fa-IR')}</td>
                                    <td className="px-6 py-4 truncate max-w-xs">{doc.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <div>نمایش {paginatedDocs.length} از {filteredDocs.length} سند</div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"><IconChevronRight/></button>
                        <span className="px-3 py-1 text-xs">صفحه {currentPage} از {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"><IconChevronLeft/></button>
                    </div>
                </div>
            </div>
            {viewingDoc && (
                <Modal isOpen={!!viewingDoc} onClose={() => setViewingDoc(null)} title={`جزئیات سند شماره ${viewingDoc.docNumber}`}>
                    <div className="space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div><strong className="text-gray-500 dark:text-gray-400">نوع سند:</strong> <span className={`font-semibold ${typeMap[viewingDoc.type].class}`}>{viewingDoc.type}</span></div>
                            <div><strong className="text-gray-500 dark:text-gray-400">تاریخ:</strong> {viewingDoc.date}</div>
                            <div><strong className="text-gray-500 dark:text-gray-400">طرف حساب:</strong> {viewingDoc.partyName}</div>
                            <div><strong className="text-gray-500 dark:text-gray-400">روش:</strong> {viewingDoc.paymentMethod}</div>
                             <div className="col-span-2"><strong className="text-gray-500 dark:text-gray-400">مبلغ:</strong> <span className="font-mono font-bold text-lg">{viewingDoc.amount.toLocaleString('fa-IR')} ریال</span></div>
                            <div className="col-span-2"><strong className="text-gray-500 dark:text-gray-400">شرح:</strong> {viewingDoc.description}</div>
                             {viewingDoc.checkNumber && <div><strong className="text-gray-500 dark:text-gray-400">شماره چک:</strong> {viewingDoc.checkNumber}</div>}
                             {viewingDoc.checkDueDate && <div><strong className="text-gray-500 dark:text-gray-400">سررسید چک:</strong> {viewingDoc.checkDueDate}</div>}
                             {viewingDoc.transactionId && <div><strong className="text-gray-500 dark:text-gray-400">شماره پیگیری:</strong> {viewingDoc.transactionId}</div>}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};