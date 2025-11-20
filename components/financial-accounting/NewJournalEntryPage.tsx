
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { JournalEntry, JournalEntryLine, ToastData, AccountNode, JournalEntryTemplate, TafsiliGroup, TafsiliAccount } from '../../types';
import { IconPlusCircle, IconTrash, IconChevronRight, IconDeviceFloppy, IconScale, IconSettings, IconTable, IconCalendar, IconFile, IconMenu } from '../Icons';
import { Modal } from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

// --- Helpers ---
const flattenAccounts = (nodes: AccountNode[]): { code: string; name: string }[] => {
    let flatList: { code: string; name: string }[] = [];
    nodes.forEach(node => {
        if (node.type === 'account') {
            flatList.push({ code: node.code, name: node.name });
        }
        if (node.children) {
            flatList = flatList.concat(flattenAccounts(node.children));
        }
    });
    return flatList;
};

const initialLine: Omit<JournalEntryLine, 'id'> = {
    accountCode: '',
    accountName: '',
    description: '',
    debit: 0,
    credit: 0,
    tafsiliId: '',
    tafsiliName: '',
    costCenterId: '',
    projectId: '',
};

interface NewJournalEntryPageProps {
    onNavigate: (page: 'financials-gl-list') => void;
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'serialNumber'>) => void;
    nextSerialNumber: number;
    showToast: (message: string, type?: ToastData['type']) => void;
    accounts: AccountNode[];
    templates: JournalEntryTemplate[];
    tafsiliGroups: TafsiliGroup[];
    tafsiliAccounts: TafsiliAccount[];
    saveButtonRef: React.RefObject<HTMLButtonElement>;
}

export const NewJournalEntryPage: React.FC<NewJournalEntryPageProps> = ({ onNavigate, addJournalEntry, nextSerialNumber, showToast, accounts, templates, tafsiliGroups, tafsiliAccounts, saveButtonRef }) => {
    // --- State ---
    const [docNumber, setDocNumber] = useState(''); 
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [description, setDescription] = useState('');
    const [referenceNo, setReferenceNo] = useState('');
    
    const [lines, setLines] = useState<JournalEntryLine[]>([
        { id: uuidv4(), ...initialLine },
        { id: uuidv4(), ...initialLine },
        { id: uuidv4(), ...initialLine }, 
    ]);

    const [isTemplateModalOpen, setTemplateModalOpen] = useState(false);
    
    // --- Memos ---
    const flatAccounts = useMemo(() => flattenAccounts(accounts), [accounts]);
    
    const { totalDebit, totalCredit, difference } = useMemo(() => {
        const totals = lines.reduce((acc, line) => {
            acc.debit += Number(line.debit) || 0;
            acc.credit += Number(line.credit) || 0;
            return acc;
        }, { debit: 0, credit: 0 });
        
        return {
            totalDebit: totals.debit,
            totalCredit: totals.credit,
            difference: totals.debit - totals.credit
        };
    }, [lines]);

    const isBalanced = Math.abs(difference) < 1; // Allow small floating point tolerance

    // --- Handlers ---
    const handleLineChange = useCallback((id: string, field: keyof JournalEntryLine, value: any) => {
        setLines(prevLines => prevLines.map(line => {
            if (line.id !== id) return line;
            
            const updates: Partial<JournalEntryLine> = { [field]: value };
            
            if (field === 'accountCode') {
                const acc = flatAccounts.find(a => a.code === value);
                if (acc) updates.accountName = acc.name;
            }
            if (field === 'tafsiliId') {
                 const taf = tafsiliAccounts.find(t => t.id === value);
                 if(taf) updates.tafsiliName = taf.name;
            }
            // Exclusive Debit/Credit logic
            if (field === 'debit' && Number(value) > 0) updates.credit = 0;
            if (field === 'credit' && Number(value) > 0) updates.debit = 0;

            return { ...line, ...updates };
        }));
    }, [flatAccounts, tafsiliAccounts]);

    const addLine = useCallback(() => {
        setLines(prev => [...prev, { ...initialLine, id: uuidv4(), description: description || prev[prev.length-1]?.description || '' }]);
    }, [description]);

    const removeLine = (id: string) => {
        if (lines.length <= 1) return;
        setLines(prev => prev.filter(l => l.id !== id));
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number, field: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (field === 'credit' && index === lines.length - 1) {
                addLine();
                // In a real implementation, focus would move to the new line here
            }
        }
        // F2 to Save
        if (e.key === 'F2') {
            e.preventDefault();
            saveButtonRef.current?.click();
        }
    };

    const handleSave = () => {
        if (!docNumber) { showToast('شماره سند الزامی است.', 'error'); return; }
        if (!isBalanced) { showToast('سند تراز نیست.', 'error'); return; }

        const validLines = lines.filter(l => l.accountCode && (l.debit > 0 || l.credit > 0));
        if(validLines.length === 0) { showToast('حداقل یک سطر معتبر وارد کنید.', 'error'); return; }

        addJournalEntry({
            docNumber: Number(docNumber),
            date: new Date(date).toLocaleDateString('fa-IR-u-nu-latn'),
            description: description || 'سند صادره',
            status: 'ثبت شده',
            lines: validLines,
            totalDebit,
            totalCredit,
            sourceModule: 'GL',
            referenceNumber: referenceNo
        });
        showToast('سند با موفقیت ثبت شد.');
        onNavigate('financials-gl-list');
    };

     const autoBalance = () => {
        const lastLine = lines[lines.length - 1];
        if(difference > 0) { 
             if (!lastLine.accountCode) {
                 handleLineChange(lastLine.id, 'credit', difference);
             } else {
                 const newLineId = uuidv4();
                 setLines(prev => [...prev, { ...initialLine, id: newLineId, credit: difference, description }]);
             }
        } else if (difference < 0) { 
             if (!lastLine.accountCode) {
                 handleLineChange(lastLine.id, 'debit', Math.abs(difference));
             } else {
                 const newLineId = uuidv4();
                 setLines(prev => [...prev, { ...initialLine, id: newLineId, debit: Math.abs(difference), description }]);
             }
        }
        showToast('تراز خودکار انجام شد.');
    };

    const applyTemplate = (t: JournalEntryTemplate) => {
        setLines(t.lines.map(l => ({...l, id: uuidv4()})));
        setDescription(t.description);
        setTemplateModalOpen(false);
    };

    return (
        <div className="flex flex-col h-full gap-5 pb-2">
            {/* Header / Toolbar */}
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                    <button onClick={() => onNavigate('financials-gl-list')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"><IconChevronRight className="w-6 h-6"/></button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">سند حسابداری جدید</h1>
                        <div className="flex items-center gap-2 mt-1">
                             <span className="px-2 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">سریال: {nextSerialNumber}</span>
                             <span className="text-xs text-gray-400">|</span>
                             <span className="text-xs text-gray-500">وضعیت: پیش‌نویس</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setTemplateModalOpen(true)} className="btn-secondary text-sm flex items-center gap-2"><IconMenu className="w-4 h-4"/> الگوها</button>
                    <button className="btn-secondary text-sm flex items-center gap-2"><IconSettings className="w-4 h-4"/> تنظیمات</button>
                </div>
            </div>

            {/* Main Entry Form */}
            <div className="flex-grow bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col overflow-hidden">
                
                {/* Document Header Fields */}
                <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5 border-b border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/20">
                    <div className="md:col-span-2">
                        <label className="label-mini">شماره سند</label>
                        <input type="number" value={docNumber} onChange={e => setDocNumber(e.target.value)} className="input-mini font-bold text-center font-mono" placeholder="خودکار" autoFocus />
                    </div>
                    <div className="md:col-span-2">
                        <label className="label-mini">تاریخ سند</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-mini text-center font-mono" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="label-mini">عطف / فرعی</label>
                        <input type="text" value={referenceNo} onChange={e => setReferenceNo(e.target.value)} className="input-mini font-mono" placeholder="---"/>
                    </div>
                    <div className="md:col-span-6">
                        <label className="label-mini">شرح کلی سند</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-mini" placeholder="بابت..."/>
                    </div>
                </div>

                {/* Journal Lines Grid */}
                <div className="flex-grow overflow-auto bg-white dark:bg-gray-800">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="w-12 p-3 text-center font-medium border-b dark:border-gray-700">#</th>
                                <th className="w-48 p-3 text-right font-medium border-b dark:border-gray-700">کد حساب (معین)</th>
                                <th className="w-48 p-3 text-right font-medium border-b dark:border-gray-700">تفصیلی شناور</th>
                                <th className="p-3 text-right font-medium border-b dark:border-gray-700 min-w-[250px]">شرح آرتیکل</th>
                                <th className="w-32 p-3 text-center font-medium border-b dark:border-gray-700">مرکز هزینه</th>
                                <th className="w-40 p-3 text-left font-medium border-b dark:border-gray-700 text-green-600">بدهکار</th>
                                <th className="w-40 p-3 text-left font-medium border-b dark:border-gray-700 text-red-600">بستانکار</th>
                                <th className="w-12 p-3 border-b dark:border-gray-700"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {lines.map((line, index) => (
                                <tr key={line.id} className="group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                                    <td className="p-2 text-center text-gray-400 text-xs">{index + 1}</td>
                                    
                                    {/* Account */}
                                    <td className="p-2 relative">
                                        <input 
                                            list={`accounts-${line.id}`} 
                                            value={line.accountCode} 
                                            onChange={e => handleLineChange(line.id, 'accountCode', e.target.value)}
                                            className="input-grid font-mono text-sm font-bold text-gray-700 dark:text-gray-200" 
                                            placeholder="انتخاب حساب"
                                        />
                                        <datalist id={`accounts-${line.id}`}>
                                            {flatAccounts.map(acc => <option key={acc.code} value={acc.code}>{acc.name}</option>)}
                                        </datalist>
                                        <div className="absolute bottom-0.5 right-2 text-[10px] text-gray-400 truncate max-w-[160px] pointer-events-none">{line.accountName}</div>
                                    </td>

                                    {/* Tafsili */}
                                    <td className="p-2">
                                        <select 
                                            value={line.tafsiliId || ''} 
                                            onChange={e => handleLineChange(line.id, 'tafsiliId', e.target.value)}
                                            className="input-grid text-xs text-gray-600 dark:text-gray-300"
                                        >
                                            <option value="">-- تفصیلی --</option>
                                            {tafsiliAccounts.map(t => <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                                        </select>
                                    </td>

                                    {/* Description */}
                                    <td className="p-2">
                                        <input 
                                            type="text" 
                                            value={line.description} 
                                            onChange={e => handleLineChange(line.id, 'description', e.target.value)} 
                                            className="input-grid text-gray-800 dark:text-gray-200"
                                            placeholder={description} 
                                        />
                                    </td>

                                    {/* Cost Center */}
                                    <td className="p-2">
                                        <input 
                                            type="text"
                                            value={line.costCenterId || ''}
                                            onChange={e => handleLineChange(line.id, 'costCenterId', e.target.value)} 
                                            className="input-grid text-center font-mono text-xs text-gray-500"
                                            placeholder="-"
                                        />
                                    </td>

                                    {/* Debit */}
                                    <td className="p-2">
                                        <input 
                                            type="number" 
                                            value={line.debit || ''} 
                                            onChange={e => handleLineChange(line.id, 'debit', e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, index, 'debit')}
                                            className="input-grid text-left font-mono text-sm font-bold text-gray-800 dark:text-gray-200 focus:bg-green-50 dark:focus:bg-green-900/20 focus:text-green-700"
                                            placeholder="0"
                                        />
                                    </td>

                                    {/* Credit */}
                                    <td className="p-2">
                                        <input 
                                            type="number" 
                                            value={line.credit || ''} 
                                            onChange={e => handleLineChange(line.id, 'credit', e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, index, 'credit')}
                                            className="input-grid text-left font-mono text-sm font-bold text-gray-800 dark:text-gray-200 focus:bg-red-50 dark:focus:bg-red-900/20 focus:text-red-700"
                                            placeholder="0"
                                        />
                                    </td>

                                    <td className="p-2 text-center">
                                        <button onClick={() => removeLine(line.id)} tabIndex={-1} className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"><IconTrash className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                            
                        </tbody>
                    </table>
                    <button onClick={addLine} className="w-full py-3 text-center text-sm text-primary hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors border-t border-dashed border-primary/30 font-medium flex justify-center items-center gap-2">
                        <IconPlusCircle className="w-4 h-4"/> افزودن سطر جدید
                    </button>
                </div>

                {/* Footer / Totals Bar */}
                <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 z-20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        
                        {/* Totals Display */}
                        <div className="flex items-center gap-6 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full md:w-auto justify-between md:justify-start">
                             <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">جمع بدهکار</span>
                                <span className="font-mono font-bold text-lg text-gray-800 dark:text-white">{totalDebit.toLocaleString('fa-IR')}</span>
                            </div>
                            <div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-500 uppercase font-bold">جمع بستانکار</span>
                                <span className="font-mono font-bold text-lg text-gray-800 dark:text-white">{totalCredit.toLocaleString('fa-IR')}</span>
                            </div>
                            <div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>
                             <div className={`flex flex-col items-end px-2 rounded ${isBalanced ? 'text-green-600' : 'text-red-600 bg-red-50 dark:bg-red-900/20'}`}>
                                <span className="text-[10px] uppercase font-bold">اختلاف تراز</span>
                                <span className="font-mono font-bold text-lg">
                                    {Math.abs(difference).toLocaleString('fa-IR')}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                             {!isBalanced && (
                                 <button onClick={autoBalance} className="px-4 py-2.5 rounded-xl bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 transition-colors flex items-center gap-2 text-sm font-medium">
                                     <IconScale className="w-5 h-5"/> تراز خودکار
                                 </button>
                             )}
                            <button 
                                ref={saveButtonRef}
                                onClick={handleSave} 
                                className="btn-primary px-8 py-2.5 rounded-xl shadow-lg shadow-primary/30 flex items-center gap-2 text-base font-bold"
                            >
                                <IconDeviceFloppy className="w-5 h-5"/> ثبت نهایی (F2)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Modal */}
             <Modal isOpen={isTemplateModalOpen} onClose={() => setTemplateModalOpen(false)} title="انتخاب الگوی سند">
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {templates.map(t => (
                        <button key={t.id} onClick={() => applyTemplate(t)} className="w-full text-right p-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 transition-all hover:shadow-md group">
                            <div className="font-bold text-gray-800 dark:text-white group-hover:text-primary transition-colors">{t.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{t.description}</div>
                            <div className="mt-2 flex gap-2">
                                <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">{t.lines.length} آرتیکل</span>
                            </div>
                        </button>
                    ))}
                    {templates.length === 0 && <p className="text-center text-gray-500 py-4">الگویی تعریف نشده است.</p>}
                </div>
            </Modal>

            <style>{`
                .label-mini { display: block; font-size: 0.75rem; color: #6B7280; margin-bottom: 4px; font-weight: 600; } .dark .label-mini { color: #9CA3AF; }
                .input-mini { width: 100%; font-size: 0.9rem; padding: 0.5rem; border-radius: 0.5rem; border: 1px solid #E5E7EB; background: white; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); } .dark .input-mini { background: #1F2937; border-color: #374151; color: white; }
                .input-mini:focus { border-color: hsl(262, 83%, 58%); box-shadow: 0 0 0 3px hsla(262, 83%, 58%, 0.1); outline: none; }
                .input-grid { width: 100%; padding: 0.5rem; background: transparent; border: 1px solid transparent; border-radius: 6px; transition: all 0.1s; font-size: 0.9rem; }
                .input-grid:focus { background: white; border-color: #A78BFA; outline: none; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); } .dark .input-grid:focus { background: #374151; }
                .btn-primary { background: hsl(262, 83%, 58%); color: white; transition: background 0.2s; } .btn-primary:hover { background: hsl(262, 83%, 48%); }
                .btn-secondary { background: white; border: 1px solid #E5E7EB; color: #374151; border-radius: 0.75rem; padding: 0.5rem 1rem; font-weight: 500; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.05); } .dark .btn-secondary { background: #374151; border-color: #4B5563; color: #E5E7EB; } .btn-secondary:hover { bg-gray-50; dark:bg-gray-700; border-color: #D1D5DB; }
            `}</style>
        </div>
    );
};
