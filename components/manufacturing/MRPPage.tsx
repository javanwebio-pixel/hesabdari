import React, { useState, useMemo } from 'react';
import type { MRPDemand, MRPResult, Good } from '../../types';
import { IconDeviceFloppy } from '../Icons';

interface MRPPageProps {
    goods: Good[];
    runMRP: (demands: MRPDemand[]) => MRPResult[];
    onConvert: (result: MRPResult) => void;
}

export const MRPPage: React.FC<MRPPageProps> = ({ goods, runMRP, onConvert }) => {
    const [demands, setDemands] = useState<MRPDemand[]>([{ goodId: '', quantity: 100, dueDate: '' }]);
    const [results, setResults] = useState<MRPResult[]>([]);
    const [step, setStep] = useState(1);

    const handleDemandChange = (index: number, field: keyof MRPDemand, value: any) => {
        setDemands(prev => prev.map((d, i) => i === index ? { ...d, [field]: value } : d));
    };

    const handleRunMRP = () => {
        const validDemands = demands.filter(d => d.goodId && d.quantity > 0 && d.dueDate);
        if (validDemands.length > 0) {
            setResults(runMRP(validDemands));
            setStep(2);
        }
    };

    return (
        <div className="space-y-6">
             <style>{`.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-primary:disabled{opacity:0.5;cursor:not-allowed}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;border-radius:.5rem;}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}`}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">برنامه‌ریزی نیازمندی‌های مواد (MRP)</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-around mb-4 border-b">
                    <div className={`text-center p-2 ${step === 1 ? 'border-b-2 border-primary font-bold' : ''}`}>۱. ورود تقاضا</div>
                    <div className={`text-center p-2 ${step === 2 ? 'border-b-2 border-primary font-bold' : ''}`}>۲. نتایج و پیشنهادات</div>
                </div>

                {step === 1 && (
                    <div>
                        {demands.map((demand, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2 items-end">
                                <div><label className="text-xs">محصول</label><select value={demand.goodId} onChange={e => handleDemandChange(index, 'goodId', e.target.value)} className="input-field"><option value="">انتخاب محصول</option>{goods.filter(g => g.type === 'Finished Good').map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select></div>
                                <div><label className="text-xs">تعداد</label><input type="number" value={demand.quantity} onChange={e => handleDemandChange(index, 'quantity', Number(e.target.value))} className="input-field" placeholder="تعداد"/></div>
                                <div><label className="text-xs">تاریخ نیاز</label><input type="date" value={demand.dueDate} onChange={e => handleDemandChange(index, 'dueDate', e.target.value)} className="input-field"/></div>
                            </div>
                        ))}
                        <button onClick={handleRunMRP} disabled={demands.some(d => !d.goodId || !d.quantity || !d.dueDate)} className="btn-primary mt-4">اجرای MRP و مشاهده نتایج</button>
                    </div>
                )}
                {step === 2 && (
                    <div>
                        <table className="w-full text-sm">
                            <thead><tr><th className="p-2 text-right">نوع پیشنهاد</th><th className="p-2 text-right">محصول/ماده</th><th className="p-2 text-right">تعداد</th><th className="p-2 text-right">تاریخ نیاز</th><th className="p-2 text-center">عملیات</th></tr></thead>
                            <tbody>
                                {results.map((res, index) => (
                                    <tr key={index} className="border-t dark:border-gray-700">
                                        <td className="p-2">{res.type === 'Purchase Requisition' ? 'درخواست خرید' : 'دستور تولید'}</td>
                                        <td className="p-2">{res.goodName}</td>
                                        <td className="p-2">{res.quantity}</td>
                                        <td className="p-2">{res.requiredDate ? new Date(res.requiredDate).toLocaleDateString('fa-IR-u-nu-latn') : ''}</td>
                                        <td className="p-2 text-center"><button onClick={() => onConvert(res)} className="btn-secondary text-xs">تبدیل</button></td>
                                    </tr>
                                ))}
                                {results.length === 0 && <tr><td colSpan={5} className="text-center p-4">نیازمندی یافت نشد. موجودی کافی است.</td></tr>}
                            </tbody>
                        </table>
                        <button onClick={() => setStep(1)} className="btn-secondary mt-4">بازگشت</button>
                    </div>
                )}
            </div>
        </div>
    );
};
