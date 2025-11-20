
import React, { useState } from 'react';
import type { RecurringEntry, AccountNode, ToastData } from '../../../types';
import { IconDeviceFloppy, IconPlusCircle, IconEdit, IconTrash, IconClock, IconCheckCircle, IconCalendar } from '../../Icons';
import { Modal } from '../../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const RecurringEntryForm: React.FC<{
    onSave: (entry: RecurringEntry) => void,
    onCancel: () => void,
    initialData?: RecurringEntry,
    accounts: AccountNode[],
}> = ({ onSave, onCancel, initialData, accounts }) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        frequency: initialData?.frequency || 'ماهانه',
        startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
        nextDueDate: initialData?.nextDueDate || new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: initialData?.id || uuidv4(),
            ...formData,
            status: 'فعال',
            lines: initialData?.lines || [] 
        } as RecurringEntry);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label-form">عنوان الگو</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field w-full" required/></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label-form">دوره تناوب</label><select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value as any})} className="input-field w-full"><option value="ماهانه">ماهانه</option><option value="سالانه">سالانه</option><option value="هفتگی">هفتگی</option></select></div>
                <div><label className="label-form">تاریخ شروع</label><input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="input-field w-full"/></div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <IconClock className="w-5 h-5 flex-shrink-0"/>
                <p>پس از ذخیره، می‌توانید آرتیکل‌های سند را در بخش ویرایش مدیریت کنید.</p>
            </div>
             <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره و ادامه</button>
            </div>
        </form>
    );
};


interface RecurringEntriesPageProps {
    recurringEntries: RecurringEntry[];
    onRunEntries: () => void;
    setRecurringEntries: React.Dispatch<React.SetStateAction<RecurringEntry[]>>;
    accounts: AccountNode[];
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const RecurringEntriesPage: React.FC<RecurringEntriesPageProps> = ({ recurringEntries, onRunEntries, setRecurringEntries, accounts, showToast }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<RecurringEntry | null>(null);

    const handleSave = (entry: RecurringEntry) => {
        if(editingEntry) {
            setRecurringEntries(prev => prev.map(e => e.id === entry.id ? entry : e));
            showToast('الگوی دوره‌ای با موفقیت به‌روزرسانی شد.');
        } else {
            setRecurringEntries(prev => [{...entry, id: uuidv4()}, ...prev]);
            showToast('الگوی جدید ایجاد شد.');
        }
        setModalOpen(false);
        setEditingEntry(null);
    }

    const pendingRuns = recurringEntries.filter(r => r.status === 'فعال' && new Date(r.nextDueDate) <= new Date()).length;
    
    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover{background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">اسناد دوره‌ای (Recurring)</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">اتوماسیون ثبت اسناد تکراری مانند اجاره، استهلاک و حقوق.</p>
                </div>
                 <button onClick={() => { setEditingEntry(null); setModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5" />
                    <span>الگوی جدید</span>
                </button>
            </div>

            {/* Automation Dashboard Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold mb-1">وضعیت اتوماسیون</h2>
                    <p className="text-indigo-100 text-sm">
                        {pendingRuns > 0 
                            ? `${pendingRuns} سند آماده اجرا وجود دارد.` 
                            : 'همه اسناد تا این تاریخ اجرا شده‌اند.'}
                    </p>
                </div>
                {pendingRuns > 0 && (
                    <button 
                        onClick={onRunEntries}
                        className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 rounded-lg shadow hover:bg-gray-50 transition-colors font-bold"
                    >
                        <IconDeviceFloppy className="w-5 h-5" />
                        <span>اجرای گروهی ({pendingRuns})</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {recurringEntries.map(entry => (
                    <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow p-5 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-primary-50 dark:bg-gray-700 rounded-lg text-primary">
                                <IconClock className="w-6 h-6"/>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${entry.status === 'فعال' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {entry.status}
                            </span>
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-1">{entry.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">تناوب: {entry.frequency}</p>
                        
                        <div className="mt-auto space-y-3">
                            <div className="flex justify-between text-sm bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                <span className="text-gray-500">آخرین اجرا:</span>
                                <span className="font-mono text-gray-700 dark:text-gray-300">{entry.lastRunDate || '-'}</span>
                            </div>
                            <div className="flex justify-between text-sm bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                                <span className="text-gray-500">اجرای بعدی:</span>
                                <span className={`font-mono font-bold ${new Date(entry.nextDueDate) <= new Date() ? 'text-orange-500' : 'text-green-500'}`}>
                                    {entry.nextDueDate}
                                </span>
                            </div>
                            <div className="flex gap-2 pt-2 border-t dark:border-gray-700">
                                <button onClick={() => { setEditingEntry(entry); setModalOpen(true); }} className="flex-1 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">ویرایش</button>
                                <button className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors">تاریخچه</button>
                            </div>
                        </div>
                    </div>
                 ))}
            </div>
            
             <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingEntry ? "ویرایش الگوی دوره‌ای" : "ایجاد الگوی دوره‌ای جدید"}>
                <RecurringEntryForm onSave={handleSave} onCancel={() => setModalOpen(false)} initialData={editingEntry!} accounts={accounts} />
            </Modal>
        </div>
    );
};
