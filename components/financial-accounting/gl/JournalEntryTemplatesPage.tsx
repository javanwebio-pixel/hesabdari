import React, { useState, useCallback, useMemo } from 'react';
import type { JournalEntryTemplate, JournalEntryLine, AccountNode } from '../../../types';
import { IconPlusCircle, IconEdit, IconTrash } from '../../Icons';
import { Modal } from '../../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const TemplateForm: React.FC<{
    onSave: (template: Omit<JournalEntryTemplate, 'id'> | JournalEntryTemplate) => void;
    onCancel: () => void;
    initialData?: JournalEntryTemplate | null;
    accounts: AccountNode[];
}> = ({ onSave, onCancel, initialData, accounts }) => {
    const isEditing = !!initialData;
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [lines, setLines] = useState<Omit<JournalEntryLine, 'id'>[]>(initialData?.lines || [{ accountCode: '', accountName: '', description: '', debit: 0, credit: 0 }]);

    const handleLineChange = useCallback((index: number, field: keyof Omit<JournalEntryLine, 'id'>, value: any) => {
        setLines(prev => prev.map((line, i) => i === index ? { ...line, [field]: value } : line));
    }, []);

    const addLine = useCallback(() => setLines(prev => [...prev, { accountCode: '', accountName: '', description: '', debit: 0, credit: 0 }]), []);
    const removeLine = useCallback((index: number) => setLines(prev => prev.filter((_, i) => i !== index)), []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const templateData = {
            name,
            description,
            lines: lines.filter(l => l.accountCode && (l.debit > 0 || l.credit > 0)),
        };

        if (isEditing && initialData) {
            onSave({ ...initialData, ...templateData });
        } else {
            onSave(templateData);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label-form">نام الگو</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-field w-full" />
            </div>
            <div>
                <label className="label-form">توضیحات</label>
                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-field w-full" />
            </div>
             <div className="overflow-x-auto border-t dark:border-gray-600 pt-4">
                <h4 className="font-semibold mb-2">آرتیکل‌ها:</h4>
                <table className="w-full text-sm">
                    <thead><tr><th className="p-1 font-medium text-right">کد/نام حساب</th><th className="p-1 font-medium text-right w-1/3">شرح</th><th className="p-1 font-medium w-24">بدهکار</th><th className="p-1 font-medium w-24">بستانکار</th><th className="w-8"></th></tr></thead>
                    <tbody>
                        {lines.map((line, index) => (
                            <tr key={index}>
                                <td className="p-1"><input type="text" value={line.accountCode} onChange={e => handleLineChange(index, 'accountCode', e.target.value)} placeholder="کد حساب" className="input-field w-full"/></td>
                                <td className="p-1"><input type="text" value={line.description} onChange={e => handleLineChange(index, 'description', e.target.value)} placeholder="شرح" className="input-field w-full"/></td>
                                <td className="p-1"><input type="number" value={line.debit || ''} onChange={e => handleLineChange(index, 'debit', Number(e.target.value))} className="input-field w-full"/></td>
                                <td className="p-1"><input type="number" value={line.credit || ''} onChange={e => handleLineChange(index, 'credit', Number(e.target.value))} className="input-field w-full"/></td>
                                <td className="p-1 text-center">{lines.length > 1 && <button type="button" onClick={() => removeLine(index)} className="text-danger p-1"><IconTrash className="w-4 h-4"/></button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <button type="button" onClick={addLine} className="flex items-center gap-2 mt-2 px-3 py-1.5 text-sm bg-primary-50 text-primary rounded-lg hover:bg-primary-100 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                    <IconPlusCircle className="w-4 h-4"/> افزودن سطر
                </button>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-600">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره الگو</button>
            </div>
        </form>
    )
}

interface JournalEntryTemplatesPageProps {
    templates: JournalEntryTemplate[];
    addTemplate: (template: Omit<JournalEntryTemplate, 'id'>) => void;
    updateTemplate: (template: JournalEntryTemplate) => void;
    deleteTemplate: (id: string) => void;
    accounts: AccountNode[];
}

export const JournalEntryTemplatesPage: React.FC<JournalEntryTemplatesPageProps> = ({ templates, addTemplate, updateTemplate, deleteTemplate, accounts }) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<JournalEntryTemplate | null>(null);

    const handleSave = (templateData: Omit<JournalEntryTemplate, 'id'> | JournalEntryTemplate) => {
        if ('id' in templateData) {
            updateTemplate(templateData);
        } else {
            addTemplate(templateData);
        }
        setModalOpen(false);
        setEditingTemplate(null);
    };

    const handleEdit = (template: JournalEntryTemplate) => {
        setEditingTemplate(template);
        setModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:background-color .2s}.btn-primary:hover{background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500;transition:background-color .2s}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}.btn-secondary:hover{background-color:#D1D5DB}.dark .btn-secondary:hover{background-color:#6B7280}`}</style>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت الگوهای سند</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">الگوهایی برای اسناد پرتکرار جهت تسریع در ثبت سند ایجاد کنید.</p>
                </div>
                <button onClick={() => { setEditingTemplate(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2"><IconPlusCircle className="w-5 h-5"/> ایجاد الگوی جدید</button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">نام الگو</th><th className="px-4 py-3">توضیحات</th><th className="px-4 py-3">تعداد آرتیکل</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map(t => (
                                <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-semibold text-gray-800 dark:text-gray-200">{t.name}</td>
                                    <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{t.description}</td>
                                    <td className="px-4 py-2 font-mono">{t.lines.length}</td>
                                    <td className="px-4 py-2">
                                         <div className="flex items-center justify-start gap-2">
                                            <button onClick={() => handleEdit(t)} className="p-1 text-blue-500 hover:text-blue-600" title="ویرایش"><IconEdit className="w-4 h-4"/></button>
                                            <button onClick={() => deleteTemplate(t.id)} className="p-1 text-danger hover:text-red-600" title="حذف"><IconTrash className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={editingTemplate ? "ویرایش الگو" : "ایجاد الگوی جدید"}>
                <TemplateForm onSave={handleSave} onCancel={() => setModalOpen(false)} initialData={editingTemplate} accounts={accounts} />
            </Modal>
        </div>
    );
};