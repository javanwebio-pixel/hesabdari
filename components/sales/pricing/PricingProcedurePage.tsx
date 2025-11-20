import React from 'react';
import type { PricingProcedure, PricingProcedureStep } from '../../../types';
import { IconChartPie, IconFileText, IconWallet, IconTrendingUp, IconTrendingDown } from '../../Icons';

const conditionClassMap: { [key in PricingProcedureStep['conditionClass']]: { icon: React.ReactNode, class: string } } = {
    'Price': { icon: <IconWallet className="w-4 h-4"/>, class: 'text-gray-500' },
    'Discount': { icon: <IconTrendingDown className="w-4 h-4"/>, class: 'text-danger' },
    'Surcharge': { icon: <IconTrendingUp className="w-4 h-4"/>, class: 'text-success' },
    'Tax': { icon: <IconChartPie className="w-4 h-4"/>, class: 'text-purple-500' },
};

export const PricingProcedurePage: React.FC<{ procedure: PricingProcedure }> = ({ procedure }) => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">رویه قیمت‌گذاری: {procedure.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">این صفحه منطق محاسبه قیمت نهایی در اسناد فروش را تعریف می‌کند. (این صفحه در حال حاضر نمایشی است)</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">گام</th>
                                <th className="px-4 py-3">کد شرط</th>
                                <th className="px-4 py-3">شرح</th>
                                <th className="px-4 py-3">کلاس</th>
                                <th className="px-4 py-3">فرمول محاسبه</th>
                            </tr>
                        </thead>
                        <tbody>
                            {procedure.steps.map(step => (
                                <tr key={step.step} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-4 py-3 font-mono font-bold">{step.step}</td>
                                    <td className="px-4 py-3 font-mono">{step.conditionCode}</td>
                                    <td className={`px-4 py-3 font-semibold ${step.conditionCode.startsWith('SUB') || step.conditionCode.startsWith('NET') || step.conditionCode.startsWith('FINAL') ? 'text-primary' : ''}`}>{step.description}</td>
                                    <td className="px-4 py-3">
                                        <div className={`flex items-center gap-2 ${conditionClassMap[step.conditionClass].class}`}>
                                            {conditionClassMap[step.conditionClass].icon}
                                            <span>{step.conditionClass}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">{step.calculationFormula}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
