import React, { useState, useMemo } from 'react';
import type { Good, StandardCost, ActualProductionData } from '../../../types';
import { IconTrendingUp, IconTrendingDown } from '../../Icons';

const VarianceCard: React.FC<{ title: string, value: number, favorableIsGood: boolean }> = ({ title, value, favorableIsGood }) => {
    const isFavorable = favorableIsGood ? value <= 0 : value >= 0;
    const isZero = Math.abs(value) < 0.01;
    let statusClass = '';
    if (isZero) {
        statusClass = 'text-gray-500';
    } else if (isFavorable) {
        statusClass = 'text-success';
    } else {
        statusClass = 'text-danger';
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <div className={`flex items-center gap-2 mt-1 ${statusClass}`}>
                <p className="text-xl font-bold font-mono">{Math.abs(value).toLocaleString('fa-IR', { maximumFractionDigits: 0 })}</p>
                {!isZero && (isFavorable ? <IconTrendingDown className="w-5 h-5" /> : <IconTrendingUp className="w-5 h-5" />)}
                <span className="text-xs font-semibold">{isZero ? 'بدون انحراف' : (isFavorable ? 'مساعد' : 'نامساعد')}</span>
            </div>
        </div>
    );
};


interface StandardCostingPageProps {
    goods: Good[];
    standardCosts: StandardCost[];
    actualData: ActualProductionData;
    setActualData: React.Dispatch<React.SetStateAction<ActualProductionData>>;
}

export const StandardCostingPage: React.FC<StandardCostingPageProps> = ({ goods, standardCosts, actualData, setActualData }) => {
    const [selectedGoodId, setSelectedGoodId] = useState(actualData.goodId);

    const good = useMemo(() => goods.find(g => g.id === selectedGoodId), [goods, selectedGoodId]);
    const standard = useMemo(() => standardCosts.find(s => s.goodId === selectedGoodId), [standardCosts, selectedGoodId]);

    const variances = useMemo(() => {
        if (!standard || !actualData) return null;
        
        const stdQtyForProd = standard.materialStdQty * actualData.producedQty;
        const stdHoursForProd = standard.laborStdHours * actualData.producedQty;

        // Material Variances
        const materialPriceVariance = (actualData.actualMaterialPrice - standard.materialStdPrice) * actualData.actualMaterialQty;
        const materialQuantityVariance = (actualData.actualMaterialQty - stdQtyForProd) * standard.materialStdPrice;

        // Labor Variances
        const laborRateVariance = (actualData.actualLaborRate - standard.laborStdRate) * actualData.actualLaborHours;
        const laborEfficiencyVariance = (actualData.actualLaborHours - stdHoursForProd) * standard.laborStdRate;

        return {
            materialPriceVariance,
            materialQuantityVariance,
            laborRateVariance,
            laborEfficiencyVariance
        };
    }, [standard, actualData]);

    const handleActualChange = (field: keyof ActualProductionData, value: string) => {
        setActualData(prev => ({ ...prev, [field]: Number(value) }));
    };

    if (!standard || !good) {
        return <div>لطفا یک محصول با هزینه‌های استاندارد تعریف شده انتخاب کنید.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">هزینه‌یابی استاندارد و تحلیل انحرافات</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">مقایسه هزینه‌های واقعی با استانداردهای از پیش تعیین شده برای کنترل هوشمند تولید.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <label htmlFor="good-select" className="text-sm font-medium mr-2">انتخاب محصول:</label>
                <select id="good-select" value={selectedGoodId} onChange={e => setSelectedGoodId(e.target.value)}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary">
                    {goods.filter(g => standardCosts.some(s => s.goodId === g.id)).map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inputs for Standard and Actual */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">ورود اطلاعات واقعی تولید</h3>
                     <div>
                        <label className="label-form">تعداد تولید شده</label>
                        <input type="number" value={actualData.producedQty} onChange={e => handleActualChange('producedQty', e.target.value)} className="input-field"/>
                    </div>
                    {/* Material */}
                    <fieldset className="border p-4 rounded-lg">
                        <legend className="px-2 font-semibold">مواد اولیه</legend>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="stat-label">نرخ استاندارد</p><p className="stat-value">{standard.materialStdPrice.toLocaleString('fa-IR')}</p></div>
                            <div><p className="stat-label">مصرف استاندارد (کل)</p><p className="stat-value">{(standard.materialStdQty * actualData.producedQty).toLocaleString('fa-IR')}</p></div>
                            <div><label className="label-form">نرخ واقعی خرید</label><input type="number" value={actualData.actualMaterialPrice} onChange={e => handleActualChange('actualMaterialPrice', e.target.value)} className="input-field"/></div>
                            <div><label className="label-form">مقدار واقعی مصرف (کل)</label><input type="number" value={actualData.actualMaterialQty} onChange={e => handleActualChange('actualMaterialQty', e.target.value)} className="input-field"/></div>
                        </div>
                    </fieldset>
                    {/* Labor */}
                    <fieldset className="border p-4 rounded-lg">
                         <legend className="px-2 font-semibold">دستمزد مستقیم</legend>
                         <div className="grid grid-cols-2 gap-4">
                            <div><p className="stat-label">نرخ استاندارد</p><p className="stat-value">{standard.laborStdRate.toLocaleString('fa-IR')}</p></div>
                            <div><p className="stat-label">ساعت استاندارد (کل)</p><p className="stat-value">{(standard.laborStdHours * actualData.producedQty).toLocaleString('fa-IR')}</p></div>
                            <div><label className="label-form">نرخ واقعی</label><input type="number" value={actualData.actualLaborRate} onChange={e => handleActualChange('actualLaborRate', e.target.value)} className="input-field"/></div>
                            <div><label className="label-form">ساعت واقعی (کل)</label><input type="number" value={actualData.actualLaborHours} onChange={e => handleActualChange('actualLaborHours', e.target.value)} className="input-field"/></div>
                        </div>
                    </fieldset>
                </div>
                
                {/* Variance Analysis */}
                {variances && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
                        <h3 className="text-lg font-semibold border-b pb-2">تحلیل انحرافات</h3>
                        <div>
                            <h4 className="font-semibold mb-2">انحرافات مواد</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <VarianceCard title="انحراف نرخ مواد" value={variances.materialPriceVariance} favorableIsGood={true} />
                                <VarianceCard title="انحراف مصرف مواد" value={variances.materialQuantityVariance} favorableIsGood={true} />
                            </div>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2">انحرافات دستمزد</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <VarianceCard title="انحراف نرخ دستمزد" value={variances.laborRateVariance} favorableIsGood={true} />
                                <VarianceCard title="انحراف کارایی دستمزد" value={variances.laborEfficiencyVariance} favorableIsGood={true} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .label-form { display: block; font-size: 0.875rem; font-weight: 500; color: #4B5563; margin-bottom: 0.25rem; } .dark .label-form { color: #D1D5DB; }
                .input-field { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; font-family: Vazirmatn, sans-serif; font-size: 1rem; } .dark .input-field { background-color: #374151; border-color: #4B5563; color: white; }
                .input-field:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: hsl(262 83% 58%); box-shadow: 0 0 0 2px var(--tw-ring-color); }
                .stat-label { font-size: 0.8rem; color: #6B7280; } .dark .stat-label { color: #9CA3AF; }
                .stat-value { font-weight: 600; font-family: monospace; }
            `}</style>
        </div>
    );
};
