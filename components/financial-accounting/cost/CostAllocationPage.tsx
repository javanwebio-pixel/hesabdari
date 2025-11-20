


import React, { useState, useMemo } from 'react';
import type { CostCenterNode, JournalEntry, ToastData } from '../../../types';
import { IconDeviceFloppy, IconChevronLeft, IconCheckCircle } from '../../Icons';
import { v4 as uuidv4 } from 'uuid';

// Mock data for cost center balances
const mockCostBalances: Record<string, number> = {
    '1101': 15000000,
    '1102': 25000000,
    '1200': 8000000,
};

const flattenCostCenters = (nodes: CostCenterNode[]): CostCenterNode[] => {
    let flatList: CostCenterNode[] = [];
    nodes.forEach(node => {
        flatList.push(node);
        if (node.children) {
            flatList = flatList.concat(flattenCostCenters(node.children));
        }
    });
    return flatList;
};

interface CostAllocationPageProps {
    costCenters: CostCenterNode[];
    addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'serialNumber'>) => void;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const CostAllocationPage: React.FC<CostAllocationPageProps> = ({ costCenters, addJournalEntry, showToast }) => {
    const [step, setStep] = useState(1);
    const [sourceCenters, setSourceCenters] = useState<Set<string>>(new Set());
    const [targetCenters, setTargetCenters] = useState<Set<string>>(new Set());
    const [allocationBasis, setAllocationBasis] = useState<'percentage' | 'fixed'>('percentage');
    // Using Record<string, number> to fix type errors
    const [allocationValues, setAllocationValues] = useState<Record<string, number>>({});

    const flatCenters = useMemo(() => flattenCostCenters(costCenters), [costCenters]);

    const handleToggleCenter = (set: React.Dispatch<React.SetStateAction<Set<string>>>, code: string) => {
        set(prev => {
            const newSet = new Set(prev);
            if (newSet.has(code)) newSet.delete(code);
            else newSet.add(code);
            return newSet;
        });
    };

    const totalSourceAmount = useMemo(() => {
        let total = 0;
        sourceCenters.forEach(code => {
            total += (mockCostBalances[code] || 0);
        });
        return total;
    }, [sourceCenters]);

    const handleAllocationValueChange = (targetCode: string, value: string) => {
        setAllocationValues(prev => ({ ...prev, [targetCode]: Number(value) }));
    };

    const allocationPreview = useMemo(() => {
        const targets = Array.from(targetCenters);
        if (targets.length === 0) return [];

        return targets.map(code => {
            const val = allocationValues[code] || 0;
            let allocatedAmount = 0;
            if (allocationBasis === 'fixed') {
                allocatedAmount = val;
            } else {
                allocatedAmount = (totalSourceAmount * val) / 100;
            }
            return {
                code,
                name: flatCenters.find(c => c.code === code)?.name || '',
                amount: allocatedAmount
            };
        });
    }, [targetCenters, allocationValues, allocationBasis, totalSourceAmount, flatCenters]);

    const handlePost = () => {
        const totalAllocated = allocationPreview.reduce((sum, item) => sum + item.amount, 0);
        
        if (Math.abs(totalAllocated - totalSourceAmount) > 1000 && allocationBasis === 'fixed') { // Allow small margin
             showToast('جمع مبالغ تخصیص یافته با مبلغ کل مبدا برابر نیست.', 'error');
             return;
        }

        // Create Journal Entry Lines
        const lines: any[] = [];
        // Credit Source Centers
        sourceCenters.forEach(code => {
            const amount = mockCostBalances[code] || 0;
            lines.push({
                id: uuidv4(),
                accountCode: '9000', // Technical clearing account for allocation
                accountName: 'هزینه جذب شده',
                description: `تسهیم هزینه از مرکز ${flatCenters.find(c=>c.code===code)?.name}`,
                debit: 0,
                credit: amount,
                costCenterId: code,
            });
        });

        // Debit Target Centers
        allocationPreview.forEach(item => {
             lines.push({
                id: uuidv4(),
                accountCode: '9000',
                accountName: 'هزینه جذب شده',
                description: `دریافت هزینه تسهیم شده`,
                debit: item.amount,
                credit: 0,
                costCenterId: item.code,
            });
        });

        addJournalEntry({
            docNumber: 0, // Auto-assigned
            date: new Date().toLocaleDateString('fa-IR-u-nu-latn'),
            description: 'سند تسهیم هزینه',
            status: 'ثبت شده',
            sourceModule: 'Costing',
            lines,
            totalDebit: totalAllocated,
            totalCredit: totalAllocated
        });
        
        showToast('سند تسهیم هزینه با موفقیت صادر شد.');
        setStep(1);
        setSourceCenters(new Set());
        setTargetCenters(new Set());
        setAllocationValues({});
    };

    return (
        <div className="space-y-6">
             <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">تسهیم هزینه (Cost Allocation)</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">توزیع هزینه‌های مراکز خدماتی به مراکز تولیدی.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                {/* Stepper Header */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>{s}</div>
                            {s < 3 && <div className={`w-16 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                        </React.Fragment>
                    ))}
                </div>

                {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold mb-4">۱. انتخاب مراکز مبدا (فرستنده هزینه)</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto border p-2 rounded dark:border-gray-600">
                                {flatCenters.filter(c => c.type === 'Service Center').map(center => (
                                    <div key={center.code} className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={sourceCenters.has(center.code)} onChange={() => handleToggleCenter(setSourceCenters, center.code)} />
                                            {center.name}
                                        </label>
                                        <span className="text-xs font-mono text-gray-500">{(mockCostBalances[center.code] || 0).toLocaleString('fa-IR')}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-2 text-right font-bold">
                                جمع قابل تسهیم: {totalSourceAmount.toLocaleString('fa-IR')}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold mb-4">۲. انتخاب مراکز مقصد (گیرنده هزینه)</h3>
                             <div className="space-y-2 max-h-64 overflow-y-auto border p-2 rounded dark:border-gray-600">
                                {flatCenters.filter(c => c.type === 'Cost Center' || c.type === 'Profit Center').map(center => (
                                    <div key={center.code} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                                        <input type="checkbox" checked={targetCenters.has(center.code)} onChange={() => handleToggleCenter(setTargetCenters, center.code)} />
                                        {center.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h3 className="font-bold mb-4 text-center">۳. تعیین مبنای تسهیم</h3>
                        <div className="flex justify-center gap-4 mb-6">
                            <button onClick={() => setAllocationBasis('percentage')} className={`px-4 py-2 rounded-lg border ${allocationBasis === 'percentage' ? 'bg-primary-50 border-primary text-primary' : ''}`}>درصدی</button>
                            <button onClick={() => setAllocationBasis('fixed')} className={`px-4 py-2 rounded-lg border ${allocationBasis === 'fixed' ? 'bg-primary-50 border-primary text-primary' : ''}`}>مبلغ ثابت</button>
                        </div>
                        
                        <div className="max-w-2xl mx-auto space-y-3">
                            {Array.from(targetCenters).map(code => {
                                const center = flatCenters.find(c => c.code === code);
                                return (
                                    <div key={code} className="flex items-center justify-between gap-4 p-3 border rounded dark:border-gray-600">
                                        <span className="font-semibold">{center?.name}</span>
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="number" 
                                                className="input-field w-32 text-center font-mono" 
                                                placeholder={allocationBasis === 'percentage' ? '%' : 'ریال'}
                                                value={allocationValues[code] || ''}
                                                onChange={e => handleAllocationValueChange(code, e.target.value)}
                                            />
                                            <span className="text-sm text-gray-500 w-8">{allocationBasis === 'percentage' ? '%' : ''}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <h3 className="font-bold mb-4 text-center">۴. پیش‌نمایش سند تسهیم</h3>
                        <div className="max-w-3xl mx-auto border rounded-lg overflow-hidden dark:border-gray-600">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr><th className="p-3">مرکز هزینه</th><th className="p-3">وضعیت</th><th className="p-3">مبلغ</th></tr>
                                </thead>
                                <tbody>
                                    {/* Render Source (Credit) */}
                                    {Array.from(sourceCenters).map(code => (
                                        <tr key={`src-${code}`} className="border-b dark:border-gray-700 bg-red-50 dark:bg-red-900/20">
                                            <td className="p-3">{flatCenters.find(c=>c.code===code)?.name}</td>
                                            <td className="p-3 text-red-600">کاهش (بستانکار)</td>
                                            <td className="p-3 font-mono">{(mockCostBalances[code] || 0).toLocaleString('fa-IR')}</td>
                                        </tr>
                                    ))}
                                    {/* Render Target (Debit) */}
                                    {allocationPreview.map(item => (
                                        <tr key={`tgt-${item.code}`} className="border-b dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                                            <td className="p-3">{item.name}</td>
                                            <td className="p-3 text-green-600">افزایش (بدهکار)</td>
                                            <td className="p-3 font-mono">{item.amount.toLocaleString('fa-IR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="flex justify-between mt-8 pt-4 border-t dark:border-gray-700">
                    <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="btn-secondary">بازگشت</button>
                    {step < 3 ? (
                         <button onClick={() => setStep(s => s + 1)} disabled={step === 1 && (sourceCenters.size === 0 || targetCenters.size === 0)} className="btn-primary">مرحله بعد</button>
                    ) : (
                        <button onClick={handlePost} className="btn-primary flex items-center gap-2"><IconDeviceFloppy className="w-5 h-5"/> صدور سند</button>
                    )}
                </div>
            </div>
        </div>
    );
};
