import React, { useState, useMemo } from 'react';
import type { PricingProcedure, PriceList, DiscountRule, Party, Good } from '../../../types';

interface AnalysisResultLine {
    step: number;
    code: string;
    desc: string;
    value: number;
    subtotal: number;
    condition: string;
}

export const PriceAnalysisPage: React.FC<{
    procedure: PricingProcedure;
    priceLists: PriceList[];
    discountRules: DiscountRule[];
    parties: Party[];
    goods: Good[];
}> = ({ procedure, priceLists, discountRules, parties, goods }) => {
    const [customerId, setCustomerId] = useState('');
    const [goodId, setGoodId] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResultLine[]>([]);

    const runAnalysis = () => {
        const customer = parties.find(p => p.id === customerId);
        const good = goods.find(g => g.id === goodId);
        if (!customer || !good) {
            setAnalysisResult([]);
            return;
        }

        const results: AnalysisResultLine[] = [];
        let currentSubtotal = 0;

        // Step-by-step calculation
        // Step 10: Base Price
        const basePriceListItem = priceLists[0]?.items.find(item => item.goodId === goodId);
        const basePrice = basePriceListItem ? basePriceListItem.price * quantity : 0;
        currentSubtotal = basePrice;
        results.push({ step: 10, code: 'PR00', desc: 'قیمت پایه فروش', value: basePrice, subtotal: currentSubtotal, condition: 'از لیست قیمت استاندارد' });

        // Step 30, 40, 50: Discounts
        const applicableDiscounts = discountRules
            .filter(r => r.isActive)
            .filter(r => {
                // Simplified logic: checks first condition only
                const cond = r.conditions[0];
                if (cond.target === 'CUSTOMER' && cond.value === customerId) return true;
                if (cond.target === 'PRODUCT' && cond.value === goodId) return true;
                if (cond.target === 'CATEGORY' && cond.value === good.category) return true;
                return false;
            })
            .sort((a,b) => a.priority - b.priority);

        for (const rule of applicableDiscounts) {
            let discountAmount = 0;
            if (rule.action.type === 'PERCENTAGE' && rule.action.value) {
                discountAmount = (basePrice * rule.action.value) / 100;
                currentSubtotal -= discountAmount;
                results.push({ step: rule.priority, code: 'DSC', desc: rule.name, value: -discountAmount, subtotal: currentSubtotal, condition: `${rule.action.value}%` });
            }
        }
        
        // Step 80: Net Price
        const netPrice = currentSubtotal;
        results.push({ step: 80, code: 'NET', desc: 'قیمت خالص', value: netPrice, subtotal: netPrice, condition: 'جمع' });

        // Step 90: Tax
        const tax = netPrice * 0.09;
        currentSubtotal += tax;
        results.push({ step: 90, code: 'MWST', desc: 'مالیات بر ارزش افزوده', value: tax, subtotal: currentSubtotal, condition: '9%' });

        // Step 100: Final Price
        results.push({ step: 100, code: 'FINAL', desc: 'قیمت نهایی', value: currentSubtotal, subtotal: currentSubtotal, condition: 'جمع نهایی' });
        
        setAnalysisResult(results);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">تحلیل قیمت‌گذاری (شبیه‌سازی)</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="label-form">مشتری</label>
                        <select value={customerId} onChange={e=>setCustomerId(e.target.value)} className="input-field"><option value="">انتخاب...</option>{parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    </div>
                     <div>
                        <label className="label-form">محصول</label>
                        <select value={goodId} onChange={e=>setGoodId(e.target.value)} className="input-field"><option value="">انتخاب...</option>{goods.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
                    </div>
                     <div>
                        <label className="label-form">تعداد</label>
                        <input type="number" value={quantity} onChange={e=>setQuantity(Number(e.target.value))} className="input-field"/>
                    </div>
                    <button onClick={runAnalysis} className="btn-primary h-10">اجرای تحلیل</button>
                </div>
            </div>
             {analysisResult.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="font-bold mb-4">نتیجه تحلیل</h3>
                     <table className="w-full text-sm">
                        <thead><tr className="border-b dark:border-gray-700"><th className="p-2 text-right">گام</th><th className="p-2 text-right">شرط</th><th className="p-2 text-right">شرح</th><th className="p-2 text-right">منبع/مقدار</th><th className="p-2 text-left">مبلغ</th><th className="p-2 text-left">جمع کل</th></tr></thead>
                        <tbody>
                            {analysisResult.map(res => (
                                <tr key={res.step} className="border-b dark:border-gray-600 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-2">{res.step}</td>
                                    <td className="p-2 font-mono">{res.code}</td>
                                    <td className="p-2 font-semibold">{res.desc}</td>
                                    <td className="p-2 text-xs text-gray-500">{res.condition}</td>
                                    <td className={`p-2 text-left font-mono ${res.value < 0 ? 'text-danger' : 'text-gray-700 dark:text-gray-300'}`}>{res.value.toLocaleString('fa-IR')}</td>
                                    <td className={`p-2 text-left font-mono font-bold`}>{res.subtotal.toLocaleString('fa-IR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
