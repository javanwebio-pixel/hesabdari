
import React, { useState, useMemo } from 'react';
import type { CostCenterNode, JournalEntry, ToastData } from '../../../types';
import { IconDeviceFloppy, IconChevronLeft } from '../../Icons';
import { v4 as uuidv4 } from 'uuid';

// Mock data for cost center balances
const mockCostBalances: { [code: string]: number } = {
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
    const [allocationBasis, setAllocationBasis] = useState<{ [key: string]: number }>({});

    const allCenters = useMemo(() => flattenCostCenters(costCenters), [costCenters]);
    const serviceCenters = allCenters.filter(c => c.type === 'Service Center');
    const productionCenters = allCenters.filter(c => c.type === 'Cost Center');

    const totalSourceCost = useMemo(() => {
        return (Array.from(sourceCenters) as string[]).reduce((sum: number, code) => sum + (mockCostBalances[code] || 0), 0);
    }, [sourceCenters]);

    const totalBasis = useMemo(() => Object.values(allocationBasis).reduce((sum: number, val: number) => sum + val, 0), [allocationBasis]);

    const totalBasisValue = totalBasis; // Use the calculated value

    const handleAllocation = () => {
        if (totalSourceCost <= 0 || targetCenters.size === 0 || totalBasisValue <= 0) {
            showToast('اطلاعات تسهیم ناقص است.', 'error');
            return;
        }

        const lines = [];
        // Credit source centers
        for (const code of (Array.from(sourceCenters) as string[])) {
            const center = allCenters.find(c => c.code === code);
            if (!center) continue;
            lines.push({
                id: uuidv4(), accountCode: '60001', accountName: `هزینه تسهیم شده - ${center.name}`,
                description: `تسهیم هزینه ${center.name}`,
                debit: 0, credit: mockCostBalances[code] || 0
            });
        }
        // Debit target centers
        for (const code of (Array.from(targetCenters) as string[])) {
            const center = allCenters.find(c => c.code === code);
            if (!center || !allocationBasis[code]) continue;
            const allocatedAmount = (allocationBasis[code] / totalBasisValue) * totalSourceCost;
            lines.push({
                id: uuidv4(), accountCode: '60002', accountName: `هزینه جذب شده - ${center.name}`,
                description: `جذب هزینه از مراکز خدماتی`,
                debit: allocatedAmount, credit: 0
            });
        }

        addJournalEntry({
            docNumber: 9001,
            date: new Date().toLocaleDateString('fa-IR-u-nu-latn'),
            description: 'سند تسهیم هزینه های مراکز خدماتی',
            status: 'ثبت شده',
            lines,
            totalDebit: totalSourceCost,
            totalCredit: totalSourceCost,
            sourceModule: 'Costing'
        });
        showToast('سند تسهیم هزینه با موفقیت صادر شد.');
        setStep(1);
        setSourceCenters(new Set());
        setTargetCenters(new Set());
        setAllocationBasis({});
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مرکز تسهیم هزینه‌ها</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">هزینه‌های مراکز خدماتی را به مراکز تولیدی یا سود تخصیص دهید.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                {/* Step 1: Select Source Centers */}
                <div className={`${step === 1 ? 'block' : 'hidden'}`}>
                    <h3 className="font-semibold text-lg mb-4">گام ۱: انتخاب مراکز هزینه مبدأ (خدماتی)</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto p-2 border rounded-md">
                        {serviceCenters.map(center => (
                            <div key={center.code} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700">
                                <label htmlFor={`src-${center.code}`} className="flex-grow cursor-pointer">{center.name} ({center.code})</label>
                                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{(mockCostBalances[center.code] || 0).toLocaleString('fa-IR')}</span>
                                <input id={`src-${center.code}`} type="checkbox" className="mr-4 h-4 w-4"
                                    checked={sourceCenters.has(center.code)}
                                    onChange={e => {
                                        const newSet = new Set(sourceCenters);
                                        if (e.target.checked) newSet.add(center.code);
                                        else newSet.delete(center.code);
                                        setSourceCenters(newSet);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                     <div className="flex justify-end pt-4 mt-4 border-t">
                        <button onClick={() => setStep(2)} disabled={sourceCenters.size === 0} className="btn-primary">بعدی</button>
                    </div>
                </div>

                {/* Step 2: Select Target Centers & Basis */}
                 <div className={`${step === 2 ? 'block' : 'hidden'}`}>
                    <h3 className="font-semibold text-lg mb-2">گام ۲: انتخاب مراکز مقصد و مبنای تسهیم</h3>
                     <p className="text-sm text-gray-500 mb-4">مبلغ کل برای تسهیم: <span className="font-bold font-mono text-primary">{totalSourceCost.toLocaleString('fa-IR')}</span></p>
                    <div className="space-y-2 max-h-80 overflow-y-auto p-2 border rounded-md">
                         {productionCenters.map(center => (
                            <div key={center.code} className="flex items-center p-2 rounded-md">
                                <input id={`tgt-${center.code}`} type="checkbox" className="h-4 w-4"
                                    checked={targetCenters.has(center.code)}
                                     onChange={e => {
                                        const newSet = new Set(targetCenters);
                                        if (e.target.checked) newSet.add(center.code);
                                        else {
                                            newSet.delete(center.code);
                                            setAllocationBasis(prev => {
                                                const newState = {...prev};
                                                delete newState[center.code];
                                                return newState;
                                            })
                                        }
                                        setTargetCenters(newSet);
                                    }}
                                />
                                <label htmlFor={`tgt-${center.code}`} className="mr-3 flex-grow">{center.name} ({center.code})</label>
                                {targetCenters.has(center.code) && (
                                    <input type="number" placeholder="مبنا (مثلا: نفر ساعت)"
                                        value={allocationBasis[center.code] || ''}
                                        onChange={e => setAllocationBasis(prev => ({ ...prev, [center.code]: Number(e.target.value) }))}
                                        className="input-field w-48 font-mono"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                     <div className="flex justify-between pt-4 mt-4 border-t">
                        <button onClick={() => setStep(1)} className="btn-secondary">قبلی</button>
                        <button onClick={() => setStep(3)} disabled={targetCenters.size === 0 || totalBasisValue <= 0} className="btn-primary">مشاهده پیش‌نمایش</button>
                    </div>
                </div>

                {/* Step 3: Preview and Confirm */}
                 <div className={`${step === 3 ? 'block' : 'hidden'}`}>
                    <h3 className="font-semibold text-lg mb-4">گام ۳: پیش‌نمایش و تایید نهایی</h3>
                    <div className="overflow-x-auto border rounded-md">
                        <table className="w-full text-sm text-right">
                             <thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-2">مرکز هزینه مقصد</th><th className="p-2">مبنای تسهیم</th><th className="p-2">درصد</th><th className="p-2">مبلغ تسهیم شده</th></tr></thead>
                            <tbody>
                            {Array.from(targetCenters).map(code => {
                                const center = allCenters.find(c => c.code === code);
                                if (!center) return null;
                                const basis = allocationBasis[code] || 0;
                                const percentage = totalBasisValue > 0 ? (basis / totalBasisValue * 100) : 0;
                                const amount = percentage / 100 * totalSourceCost;
                                return (
                                    <tr key={code} className="border-b dark:border-gray-600 last:border-0">
                                        <td className="p-2 font-semibold">{center.name}</td>
                                        <td className="p-2 font-mono">{basis.toLocaleString('fa-IR')}</td>
                                        <td className="p-2 font-mono">{percentage.toFixed(2)}%</td>
                                        <td className="p-2 font-mono font-bold text-green-600">{amount.toLocaleString('fa-IR', {maximumFractionDigits: 0})}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                     <div className="flex justify-between pt-4 mt-4 border-t">
                        <button onClick={() => setStep(2)} className="btn-secondary">
                            <IconChevronLeft className="w-4 h-4 inline-block ml-1"/> ویرایش
                        </button>
                        <button onClick={handleAllocation} className="btn-primary flex items-center gap-2">
                           <IconDeviceFloppy className="w-5 h-5" /> تایید و صدور سند تسهیم
                        </button>
                    </div>
                </div>
            </div>
            <style>{`.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-primary:disabled{opacity:.5;cursor:not-allowed}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB}.dark .input-field{background-color:#374151;border-color:#4B5563}`}</style>
        </div>
    );
};
