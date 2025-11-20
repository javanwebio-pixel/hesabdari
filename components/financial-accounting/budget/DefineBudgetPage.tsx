
import React, { useState, useMemo, useEffect } from 'react';
import type { Budget, BudgetLine, AccountNode, CostCenterNode } from '../../../types';
import { IconDeviceFloppy } from '../../Icons';
import { v4 as uuidv4 } from 'uuid';

const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

const flattenHierarchy = (nodes: (AccountNode | CostCenterNode)[]): { code: string, name: string, type: string, level: number }[] => {
    const flatList: { code: string, name: string, type: string, level: number }[] = [];
    const traverse = (nodes: (AccountNode | CostCenterNode)[], level: number) => {
        nodes.forEach(node => {
            flatList.push({ code: node.code, name: node.name, type: node.type, level });
            if (node.children) {
                traverse(node.children, level + 1);
            }
        });
    };
    traverse(nodes, 0);
    return flatList;
};

interface DefineBudgetPageProps {
    budgets: Budget[];
    accounts: AccountNode[];
    costCenters: CostCenterNode[];
    onSaveBudget: (budget: Budget) => void;
}

export const DefineBudgetPage: React.FC<DefineBudgetPageProps> = ({ budgets, accounts, costCenters, onSaveBudget }) => {
    const [fiscalYear, setFiscalYear] = useState(1403);
    const [version, setVersion] = useState('بودجه اصلی');
    const [dimension, setDimension] = useState<'account' | 'costCenter'>('account');
    const [budgetLines, setBudgetLines] = useState<Map<string, number[]>>(new Map());
    
    const hierarchyData = useMemo(() => {
        const data = dimension === 'account' ? accounts : costCenters;
        return flattenHierarchy(data).filter(item => item.type !== 'group');
    }, [dimension, accounts, costCenters]);

    useEffect(() => {
        const existingBudget = budgets.find(b => b.fiscalYear === fiscalYear && b.version === version && b.dimension === dimension);
        const newLines = new Map<string, number[]>();
        if (existingBudget) {
            existingBudget.lines.forEach(line => {
                newLines.set(line.dimensionCode, line.monthlyAmounts);
            });
        }
        setBudgetLines(newLines);
    }, [fiscalYear, version, dimension, budgets]);

    const handleLineChange = (code: string, monthIndex: number, value: number) => {
        const newLines = new Map(budgetLines as Map<string, number[]>);
        const currentAmounts = newLines.get(code) || Array(12).fill(0);
        currentAmounts[monthIndex] = value;
        newLines.set(code, [...currentAmounts]);
        setBudgetLines(newLines);
    };

    const handleTotalChange = (code: string, totalValue: number) => {
        const distributedAmounts = Array(12).fill(Math.floor(totalValue / 12));
        const remainder = totalValue % 12;
        for (let i = 0; i < remainder; i++) {
            distributedAmounts[i] += 1;
        }
        const newLines = new Map(budgetLines as Map<string, number[]>);
        newLines.set(code, distributedAmounts);
        setBudgetLines(newLines);
    };

    const handleSave = () => {
        const lines: BudgetLine[] = [];
        // FIX: Cast `budgetLines` to a Map to resolve "must have a '[Symbol.iterator]()' method" error.
        for (const [dimensionCode, monthlyAmounts] of Array.from((budgetLines as Map<string, number[]>).entries())) {
            lines.push({ dimensionCode, monthlyAmounts });
        }

        const existingBudget = budgets.find(b => b.fiscalYear === fiscalYear && b.version === version && b.dimension === dimension);

        const budgetData: Budget = {
            id: existingBudget?.id || uuidv4(),
            fiscalYear,
            version,
            dimension,
            lines,
        };
        onSaveBudget(budgetData);
    };
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">تعریف و برنامه‌ریزی بودجه</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">بودجه سالانه را برای حساب‌ها یا مراکز هزینه تعریف و مدیریت کنید.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="label-form">سال مالی</label>
                        <select value={fiscalYear} onChange={e => setFiscalYear(Number(e.target.value))} className="input-field">
                            <option value={1403}>۱۴۰۳</option>
                            <option value={1404}>۱۴۰۴</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-form">نسخه بودجه</label>
                        <input type="text" value={version} onChange={e => setVersion(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="label-form">بودجه‌ریزی بر اساس</label>
                         <select value={dimension} onChange={e => setDimension(e.target.value as any)} className="input-field">
                            <option value="account">سرفصل حسابداری</option>
                            <option value="costCenter">مرکز هزینه</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right whitespace-nowrap">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 sticky right-0 bg-gray-50 dark:bg-gray-700">کد</th>
                                <th className="px-4 py-3 sticky right-24 bg-gray-50 dark:bg-gray-700 min-w-[200px]">عنوان</th>
                                <th className="px-4 py-3 font-bold">جمع سالانه</th>
                                {PERSIAN_MONTHS.map(month => <th key={month} className="px-4 py-3">{month}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                           {hierarchyData.map(item => {
                               const amounts = (budgetLines as Map<string, number[]>).get(item.code) || Array(12).fill(0);
                               const total = amounts.reduce((sum, val) => sum + val, 0);
                               return (
                                   <tr key={item.code} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                       <td className="px-4 py-1 sticky right-0 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700 font-mono">{item.code}</td>
                                       <td className="px-4 py-1 sticky right-24 bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-700">{item.name}</td>
                                       <td className="px-2 py-1"><input type="number" value={total || ''} onChange={e => handleTotalChange(item.code, Number(e.target.value))} className="input-field-table font-bold"/></td>
                                       {PERSIAN_MONTHS.map((_, index) => (
                                            <td key={index} className="px-2 py-1"><input type="number" value={amounts[index] || ''} onChange={e => handleLineChange(item.code, index, Number(e.target.value))} className="input-field-table"/></td>
                                       ))}
                                   </tr>
                               );
                           })}
                        </tbody>
                    </table>
                 </div>
            </div>
             <div className="flex justify-end pt-4">
                <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconDeviceFloppy className="w-5 h-5" />
                    ذخیره بودجه
                </button>
            </div>
             <style>{`
                .label-form { display: block; font-size: 0.875rem; font-weight: 500; color: #4B5563; margin-bottom: 0.25rem; } .dark .label-form { color: #D1D5DB; }
                .input-field { width: 100%; padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; } .dark .input-field { background-color: #374151; border-color: #4B5563; }
                .input-field:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: hsl(262 83% 58%); box-shadow: 0 0 0 2px var(--tw-ring-color); }
                .input-field-table { width: 100px; padding: 0.25rem 0.5rem; border-radius: 0.25rem; background-color: transparent; border: 1px solid transparent; font-family: monospace; } .dark .input-field-table { color: #E5E7EB; }
                .input-field-table:focus { background-color: #F9FAFB; border-color: #D1D5DB; outline: none; } .dark .input-field-table:focus { background-color: #374151; border-color: #4B5563; }
            `}</style>
        </div>
    );
};