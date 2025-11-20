import React, { useState, useMemo } from 'react';
import type { ConvertibleDocument, JournalEntry, JournalEntryLine, JournalEntryStatus, ToastData } from '../../types';
import { IconChevronRight, IconFilter } from '../Icons';

const mockConvertibleDocs: ConvertibleDocument[] = [
    { id: 'pf1', docNumber: 1, date: '۱۴۰۳/۰۵/۱۰', type: 'پیش‌فاکتور', partyName: 'شرکت آلفا', amount: 15000000 },
    { id: 'pf2', docNumber: 2, date: '۱۴۰۳/۰۵/۱۱', type: 'پیش‌فاکتور', partyName: 'فروشگاه برادران حسینی', amount: 8750000 },
    { id: 'wr1', docNumber: 101, date: '۱۴۰۳/۰۵/۱۲', type: 'رسید انبار', partyName: 'تامین کننده گاما', amount: 22000000 },
    { id: 'pf3', docNumber: 3, date: '۱۴۰۳/۰۵/۱۳', type: 'پیش‌فاکتور', partyName: 'مشتری ویژه', amount: 4500000 },
];

interface ConvertDocumentsPageProps {
    onNavigate: (page: 'financials-gl-list') => void;
    // FIX: Correct the type for addJournalEntry to match what App.tsx provides.
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'serialNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
    // FIX: Add journalEntries to props to calculate the next docNumber.
    journalEntries: JournalEntry[];
}

export const ConvertDocumentsPage: React.FC<ConvertDocumentsPageProps> = ({ onNavigate, addJournalEntry, showToast, journalEntries }) => {
    const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

    const handleSelectDoc = (id: string) => {
        setSelectedDocs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const resultingJournalLines = useMemo((): JournalEntryLine[] => {
        const lines: JournalEntryLine[] = [];
        mockConvertibleDocs.forEach(doc => {
            if (selectedDocs.has(doc.id)) {
                if (doc.type === 'پیش‌فاکتور') {
                    lines.push({ id: `${doc.id}-d`, accountCode: '1103', accountName: 'حساب‌های دریافتنی', description: `بابت پیش فاکتور ${doc.docNumber} - ${doc.partyName}`, debit: doc.amount, credit: 0 });
                    lines.push({ id: `${doc.id}-c`, accountCode: '4101', accountName: 'فروش', description: `بابت پیش فاکتور ${doc.docNumber} - ${doc.partyName}`, debit: 0, credit: doc.amount });
                } else if (doc.type === 'رسید انبار') {
                    lines.push({ id: `${doc.id}-d`, accountCode: '1105', accountName: 'موجودی کالا', description: `بابت رسید انبار ${doc.docNumber} - ${doc.partyName}`, debit: doc.amount, credit: 0 });
                    lines.push({ id: `${doc.id}-c`, accountCode: '2101', accountName: 'حساب‌های پرداختنی', description: `بابت رسید انبار ${doc.docNumber} - ${doc.partyName}`, debit: 0, credit: doc.amount });
                }
            }
        });
        return lines;
    }, [selectedDocs]);

    const { debit: totalDebit, credit: totalCredit } = useMemo(() => {
        return resultingJournalLines.reduce((acc, line) => {
            acc.debit += line.debit;
            acc.credit += line.credit;
            return acc;
        }, { debit: 0, credit: 0 });
    }, [resultingJournalLines]);
    
    const handleConvertAndSave = () => {
        if (resultingJournalLines.length === 0) {
             showToast('لطفا ابتدا حداقل یک سند را برای تبدیل انتخاب کنید.', 'error');
             return;
        }
        
        // FIX: Calculate the next document number, as it's required by addJournalEntry.
        const nextDocNumber = (journalEntries.length > 0 ? Math.max(...journalEntries.map(e => e.docNumber)) : 0) + 1;

        // FIX: Create an entry that matches the Omit<JournalEntry, 'id' | 'serialNumber'> type.
        // It now includes 'docNumber'.
        const newEntryData: Omit<JournalEntry, 'id' | 'serialNumber'> = {
            docNumber: nextDocNumber,
            date: new Date().toLocaleDateString('fa-IR-u-nu-latn'),
            description: `سند حاصل از تبدیل ${selectedDocs.size} سند موقت`,
            status: 'ثبت شده' as JournalEntryStatus,
            lines: resultingJournalLines,
            totalDebit,
            totalCredit,
            sourceModule: 'GL',
        };

        addJournalEntry(newEntryData);
        showToast('سند حسابداری با موفقیت ایجاد و ثبت شد.');
        onNavigate('financials-gl-list');
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">تبدیل اسناد موقت به دائم</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">اسناد مورد نظر را برای تبدیل به سند حسابداری انتخاب کنید.</p>
                </div>
                <button 
                    onClick={() => onNavigate('financials-gl-list')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                    <IconChevronRight className="w-5 h-5" />
                    <span>بازگشت به فهرست</span>
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Convertible Documents Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">۱. انتخاب اسناد قابل تبدیل</h2>
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                         <select className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary appearance-none flex-grow">
                            <option>نوع سند: همه</option>
                            <option>پیش‌فاکتور</option>
                            <option>رسید انبار</option>
                        </select>
                        <input type="text" placeholder="تاریخ از" className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary w-36" onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'}/>
                        <input type="text" placeholder="تاریخ تا" className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary w-36" onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'}/>
                         <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            <IconFilter className="w-5 h-5" />
                        </button>
                    </div>
                     <div className="overflow-auto h-96 border rounded-lg dark:border-gray-700">
                        <table className="w-full text-sm text-right">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th className="p-2"><input type="checkbox" onChange={(e) => {
                                        if (e.currentTarget.checked) {
                                            setSelectedDocs(new Set(mockConvertibleDocs.map(d => d.id)));
                                        } else {
                                            setSelectedDocs(new Set());
                                        }
                                    }}/></th>
                                    <th className="p-2 font-medium">شماره</th>
                                    <th className="p-2 font-medium">تاریخ</th>
                                    <th className="p-2 font-medium">نوع</th>
                                    <th className="p-2 font-medium">مبلغ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {mockConvertibleDocs.map(doc => (
                                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="p-2"><input type="checkbox" checked={selectedDocs.has(doc.id)} onChange={() => handleSelectDoc(doc.id)} /></td>
                                    <td className="p-2">{doc.docNumber}</td>
                                    <td className="p-2">{doc.date}</td>
                                    <td className="p-2">{doc.type}</td>
                                    <td className="p-2">{(doc.amount ?? 0).toLocaleString('fa-IR')}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </div>

                {/* Resulting Journal Entry Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">۲. پیش‌نمایش سند حسابداری حاصل</h2>
                    <div className="overflow-auto h-96 border rounded-lg dark:border-gray-700">
                        <table className="w-full text-sm text-right">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th className="p-2 font-medium w-2/5">شرح</th>
                                    <th className="p-2 font-medium">بدهکار</th>
                                    <th className="p-2 font-medium">بستانکار</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {resultingJournalLines.length > 0 ? resultingJournalLines.map(line => (
                                    <tr key={line.id}>
                                        <td className="p-2 text-xs">{line.description}</td>
                                        <td className="p-2 font-mono">{line.debit > 0 ? (line.debit ?? 0).toLocaleString('fa-IR') : '-'}</td>
                                        <td className="p-2 font-mono">{line.credit > 0 ? (line.credit ?? 0).toLocaleString('fa-IR') : '-'}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} className="p-4 text-center text-gray-500">سندی برای نمایش انتخاب نشده است.</td></tr>
                                )}
                            </tbody>
                             <tfoot className="sticky bottom-0 bg-gray-100 dark:bg-gray-900 font-bold">
                                <tr>
                                    <td className="p-2">جمع کل</td>
                                    <td className="p-2 font-mono">{(totalDebit ?? 0).toLocaleString('fa-IR')}</td>
                                    <td className="p-2 font-mono">{(totalCredit ?? 0).toLocaleString('fa-IR')}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
             <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                <button 
                    onClick={handleConvertAndSave}
                    disabled={selectedDocs.size === 0}
                    className="px-6 py-2 text-sm bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    تبدیل و ثبت نهایی سند
                </button>
            </div>
        </div>
    );
};