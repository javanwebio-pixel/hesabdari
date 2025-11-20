import React, { useState, useMemo } from 'react';
import type { Activity, Good } from '../../../types';
import { IconCheckCircle } from '../../Icons';

interface ActivityBasedCostingPageProps {
    activities: Activity[];
    setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
    goods: Good[];
}

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['شناسایی فعالیت‌ها', 'محاسبه نرخ', 'تخصیص به محصول', 'گزارش نهایی'];
    return (
        <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center text-center w-24">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                            currentStep > index + 1 ? 'bg-green-500 text-white' : 
                            currentStep === index + 1 ? 'bg-primary text-white' : 
                            'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                            {currentStep > index + 1 ? <IconCheckCircle className="w-6 h-6" /> : index + 1}
                        </div>
                        <p className={`mt-2 text-xs font-semibold ${currentStep >= index + 1 ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>{step}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-1 mx-2 rounded-full ${currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

export const ActivityBasedCostingPage: React.FC<ActivityBasedCostingPageProps> = ({ activities, setActivities, goods }) => {
    const [step, setStep] = useState(1);
    const [selectedGoodId, setSelectedGoodId] = useState(goods[0]?.id || '');
    const [consumption, setConsumption] = useState<{ [activityId: string]: number }>({});
    
    const activityRates = useMemo(() => {
        const rates: { [activityId: string]: number } = {};
        activities.forEach(act => {
            if (act.costDriverVolume > 0) {
                rates[act.id] = act.costPool / act.costDriverVolume;
            }
        });
        return rates;
    }, [activities]);

    const allocatedCosts = useMemo(() => {
        let total = 0;
        const details: { name: string, cost: number }[] = [];
        for (const actId in consumption) {
            const consumed = consumption[actId];
            const rate = activityRates[actId];
            const activity = activities.find(a => a.id === actId);
            if (consumed > 0 && rate && activity) {
                const cost = consumed * rate;
                total += cost;
                details.push({ name: activity.name, cost });
            }
        }
        return { total, details };
    }, [consumption, activityRates, activities]);

    const handleConsumptionChange = (actId: string, value: string) => {
        setConsumption(prev => ({ ...prev, [actId]: Number(value) }));
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">هزینه‌یابی بر مبنای فعالیت (ABC)</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">پیچیدگی تخصیص هزینه‌های سربار را با این ویزارد هوشمند مدیریت کنید.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <Stepper currentStep={step} />

                <div className="mt-8 min-h-[300px]">
                    {step === 1 && (
                        <div>
                            <h3 className="font-semibold text-lg mb-4">گام ۱: شناسایی فعالیت‌ها و مخازن هزینه</h3>
                            <p className="text-sm mb-4">در این مرحله، فعالیت‌های اصلی سازمان که هزینه ایجاد می‌کنند و کل هزینه‌های سربار تخصیص یافته به هر کدام، مشخص می‌شوند.</p>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-right">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3">فعالیت</th><th className="px-4 py-3">مخزن هزینه (تومان)</th>
                                            <th className="px-4 py-3">محرک هزینه</th><th className="px-4 py-3">حجم کل محرک</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activities.map(act => (
                                            <tr key={act.id} className="border-b dark:border-gray-700">
                                                <td className="px-4 py-2 font-semibold">{act.name}</td><td className="px-4 py-2 font-mono">{act.costPool.toLocaleString('fa-IR')}</td>
                                                <td className="px-4 py-2">{act.costDriverName}</td><td className="px-4 py-2 font-mono">{act.costDriverVolume.toLocaleString('fa-IR')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                         <div>
                            <h3 className="font-semibold text-lg mb-4">گام ۲: محاسبه نرخ فعالیت</h3>
                            <p className="text-sm mb-4">در این مرحله، نرخ هر واحد از محرک هزینه برای هر فعالیت محاسبه می‌شود. (نرخ = مخزن هزینه / حجم کل محرک)</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {activities.map(act => (
                                    <div key={act.id} className="p-4 rounded-lg bg-primary-50 dark:bg-gray-700/50">
                                        <p className="font-bold text-primary">{act.name}</p>
                                        <p className="text-2xl font-mono font-bold mt-2">{(activityRates[act.id] || 0).toLocaleString('fa-IR', { maximumFractionDigits: 0 })}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">تومان به ازای هر "{act.costDriverName.split(' ').slice(1).join(' ')}"</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div>
                             <h3 className="font-semibold text-lg mb-4">گام ۳: تخصیص هزینه‌ها به محصول</h3>
                             <div className="flex items-center gap-4 mb-4">
                                <label htmlFor="good-select-abc" className="text-sm font-medium">انتخاب محصول:</label>
                                <select id="good-select-abc" value={selectedGoodId} onChange={e => { setSelectedGoodId(e.target.value); setConsumption({}); }}
                                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary">
                                    {goods.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                                </select>
                             </div>
                             <div className="space-y-3">
                                {activities.map(act => (
                                    <div key={act.id} className="grid grid-cols-3 items-center gap-4">
                                        <label htmlFor={`cons-${act.id}`} className="col-span-2 text-sm">{act.name} (میزان مصرف {act.costDriverName})</label>
                                        <input id={`cons-${act.id}`} type="number" value={consumption[act.id] || ''} onChange={e => handleConsumptionChange(act.id, e.target.value)} 
                                            className="input-field font-mono" placeholder="0"
                                        />
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                    {step === 4 && (
                        <div>
                             <h3 className="font-semibold text-lg mb-4">گام ۴: گزارش نهایی برای محصول «{goods.find(g=>g.id === selectedGoodId)?.name}»</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700">
                                    <h4 className="font-bold text-green-800 dark:text-green-300">هزینه سربار تخصیص یافته (ABC)</h4>
                                    <p className="text-3xl font-mono font-bold mt-2">{allocatedCosts.total.toLocaleString('fa-IR', { maximumFractionDigits: 0 })}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">تومان</p>
                                </div>
                                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                    <h4 className="font-semibold">جزئیات هزینه‌های تخصیص یافته:</h4>
                                    <ul className="text-sm mt-2 space-y-1">
                                        {allocatedCosts.details.map(d => (
                                            <li key={d.name} className="flex justify-between">
                                                <span>{d.name}:</span>
                                                <span className="font-mono">{d.cost.toLocaleString('fa-IR', { maximumFractionDigits: 0 })}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between pt-6 mt-6 border-t dark:border-gray-700">
                    <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="btn-secondary">قبلی</button>
                    <button onClick={() => setStep(s => s + 1)} disabled={step === 4} className="btn-primary">بعدی</button>
                </div>
            </div>
            <style>{`.input-field { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; } .dark .input-field { background-color: #374151; border-color: #4B5563; color: white; }
            .btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}.btn-primary:disabled{opacity:.5;cursor:not-allowed}
            .btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}.btn-secondary:disabled{opacity:.5;cursor:not-allowed}`}</style>
        </div>
    );
};
