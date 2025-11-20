import React, { useState, useMemo } from 'react';
import type { AccountNode, JournalEntry } from '../../../types';
import { IconBook, IconChartPie } from '../../Icons';

// Helper function to parse 'YYYY/MM/DD' date strings
const parseFaDate = (dateStr: string): Date => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(1900, 0, 1);
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};

interface StatementRow {
    level: number;
    code: string;
    name: string;
    isGroup: boolean;
    balance: number;
}

interface FinancialStatementsPageProps {
    accounts: AccountNode[];
    journalEntries: JournalEntry[];
}

export const FinancialStatementsPage: React.FC<FinancialStatementsPageProps> = ({ accounts, journalEntries }) => {
    const [activeTab, setActiveTab] = useState<'balanceSheet' | 'incomeStatement'>('balanceSheet');
    const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    const calculateNetIncome = useMemo(() => {
        const start = parseFaDate(dateRange.start.replace(/-/g, '/'));
        const end = parseFaDate(dateRange.end.replace(/-/g, '/'));
        
        let totalRevenue = 0;
        let totalExpense = 0;

        journalEntries.forEach(entry => {
            const entryDate = parseFaDate(entry.date);
            if (entryDate >= start && entryDate <= end) {
                entry.lines.forEach(line => {
                    if (line.accountCode.startsWith('4')) { // Revenues
                        totalRevenue += line.credit - line.debit;
                    } else if (line.accountCode.startsWith('5')) { // Expenses
                        totalExpense += line.debit - line.credit;
                    }
                });
            }
        });
        return totalRevenue - totalExpense;
    }, [journalEntries, dateRange]);


    const balanceSheetData = useMemo(() => {
        const endDate = parseFaDate(asOfDate.replace(/-/g, '/'));
        const balances = new Map<string, number>();

        // Calculate balance for every account up to the asOfDate
        journalEntries.forEach(entry => {
            const entryDate = parseFaDate(entry.date);
            if (entryDate <= endDate) {
                entry.lines.forEach(line => {
                    const balance = line.debit - line.credit;
                    balances.set(line.accountCode, (balances.get(line.accountCode) || 0) + balance);
                });
            }
        });

        const buildStatement = (nodes: AccountNode[], level: number): StatementRow[] => {
            let rows: StatementRow[] = [];
            nodes.forEach(node => {
                let balance = 0;
                if (node.type === 'account') {
                    balance = balances.get(node.code) || 0;
                } else if (node.children) {
                    // Recursively get children balances
                    const childrenRows = buildStatement(node.children, level + 1);
                    balance = childrenRows.reduce((sum, row) => sum + row.balance, 0);
                    rows.push({ level, code: node.code, name: node.name, isGroup: true, balance });
                    rows = rows.concat(childrenRows);
                    return; // Avoid pushing group again
                }
                rows.push({ level, code: node.code, name: node.name, isGroup: node.type === 'group', balance });
            });
            return rows;
        };
        
        const assets = buildStatement(accounts.filter(a => a.code.startsWith('1')), 0);
        const liabilities = buildStatement(accounts.filter(a => a.code.startsWith('2')), 0);
        const equity = buildStatement(accounts.filter(a => a.code.startsWith('3')), 0);

        // Manually add Net Income to equity
        const netIncomeForPeriod = calculateNetIncome;
        const retainedEarnings = equity.find(r => r.code === '3103');
        if (retainedEarnings) {
            retainedEarnings.balance += netIncomeForPeriod;
        } else {
             equity.push({ level: 1, code: '3999', name: 'سود (زیان) دوره', isGroup: false, balance: netIncomeForPeriod });
        }
        
        // Recalculate equity group totals
        const totalEquity = equity.filter(r => !r.isGroup).reduce((sum, r) => sum + r.balance, 0);
        const equityGroup = equity.find(r => r.isGroup && r.code === '3');
        if(equityGroup) equityGroup.balance = totalEquity;


        const totalAssets = assets.find(r => r.level === 0)?.balance || 0;
        const totalLiabilities = liabilities.find(r => r.level === 0)?.balance || 0;
        const totalEquityFinal = equity.find(r => r.level === 0)?.balance || 0;

        return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity: totalEquityFinal };

    }, [accounts, journalEntries, asOfDate, calculateNetIncome]);

     const incomeStatementData = useMemo(() => {
        const start = parseFaDate(dateRange.start.replace(/-/g, '/'));
        const end = parseFaDate(dateRange.end.replace(/-/g, '/'));
        const turnovers = new Map<string, number>();

        journalEntries.forEach(entry => {
            const entryDate = parseFaDate(entry.date);
            if (entryDate >= start && entryDate <= end) {
                entry.lines.forEach(line => {
                    const amount = line.credit - line.debit; // For revenues
                    turnovers.set(line.accountCode, (turnovers.get(line.accountCode) || 0) + amount);
                });
            }
        });

        const buildStatement = (nodes: AccountNode[], level: number): StatementRow[] => {
            let rows: StatementRow[] = [];
            nodes.forEach(node => {
                let balance = 0;
                if (node.type === 'account') {
                    balance = turnovers.get(node.code) || 0;
                } else if (node.children) {
                    const childrenRows = buildStatement(node.children, level + 1);
                    balance = childrenRows.reduce((sum, row) => sum + row.balance, 0);
                    rows.push({ level, code: node.code, name: node.name, isGroup: true, balance });
                    rows = rows.concat(childrenRows);
                    return;
                }
                rows.push({ level, code: node.code, name: node.name, isGroup: node.type === 'group', balance });
            });
            return rows;
        };

        const revenues = buildStatement(accounts.filter(a => a.code.startsWith('4')), 0);
        const expenses = buildStatement(accounts.filter(a => a.code.startsWith('5')), 0);
        
        const totalRevenues = revenues.find(r => r.level === 0)?.balance || 0;
        const totalExpenses = expenses.find(r => r.level === 0)?.balance || 0;

        return { revenues, expenses, totalRevenues, totalExpenses, netIncome: totalRevenues - totalExpenses };

    }, [accounts, journalEntries, dateRange]);


    const renderStatementRows = (rows: StatementRow[]) => (
        <tbody>
            {rows.map(row => (
                <tr key={row.code} className={`border-b dark:border-gray-700 ${row.isGroup ? 'bg-gray-50 dark:bg-gray-700/50 font-semibold' : ''}`}>
                    <td className="py-2 pr-4" style={{ paddingRight: `${1 + row.level * 1.5}rem` }}>{row.name}</td>
                    <td className="py-2 px-4 font-mono text-left">{row.balance.toLocaleString('fa-IR')}</td>
                </tr>
            ))}
        </tbody>
    );


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">صورت‌های مالی</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">تولید گزارشات ترازنامه و صورت سود و زیان.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                 <div className="flex justify-between items-center">
                    <div className="flex border-b dark:border-gray-600">
                        <button onClick={() => setActiveTab('balanceSheet')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'balanceSheet' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>ترازنامه</button>
                        <button onClick={() => setActiveTab('incomeStatement')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'incomeStatement' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>صورت سود و زیان</button>
                    </div>
                    {activeTab === 'balanceSheet' ? (
                        <div className="flex items-center gap-2">
                             <label className="text-sm">تا تاریخ:</label>
                            <input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} className="input-field" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <label className="text-sm">از:</label>
                            <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))} className="input-field" />
                             <label className="text-sm">تا:</label>
                            <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))} className="input-field" />
                        </div>
                    )}
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                {activeTab === 'balanceSheet' && (
                    <div className="animate-fade-in-right">
                        <h2 className="text-xl font-bold text-center mb-2">ترازنامه</h2>
                        <p className="text-center text-sm text-gray-500 mb-6">برای تاریخ {new Date(asOfDate).toLocaleDateString('fa-IR')}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-lg font-semibold mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-t-md">دارایی‌ها</h3>
                                <table className="w-full text-sm">{renderStatementRows(balanceSheetData.assets)}</table>
                                <div className="flex justify-between font-bold text-lg p-2 bg-gray-100 dark:bg-gray-700 rounded-b-md">
                                    <span>جمع دارایی‌ها</span>
                                    <span>{balanceSheetData.totalAssets.toLocaleString('fa-IR')}</span>
                                </div>
                            </div>
                             <div>
                                <h3 className="text-lg font-semibold mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-t-md">بدهی‌ها و حقوق صاحبان سهام</h3>
                                <table className="w-full text-sm">{renderStatementRows(balanceSheetData.liabilities)}</table>
                                <div className="flex justify-between font-bold p-2 bg-gray-100 dark:bg-gray-700">
                                    <span>جمع بدهی‌ها</span>
                                    <span>{(-1 * balanceSheetData.totalLiabilities).toLocaleString('fa-IR')}</span>
                                </div>
                                <table className="w-full text-sm mt-4">{renderStatementRows(balanceSheetData.equity)}</table>
                                 <div className="flex justify-between font-bold p-2 bg-gray-100 dark:bg-gray-700">
                                    <span>جمع حقوق صاحبان سهام</span>
                                    <span>{(-1 * balanceSheetData.totalEquity).toLocaleString('fa-IR')}</span>
                                </div>
                                 <div className="flex justify-between font-bold text-lg p-2 bg-gray-100 dark:bg-gray-700 rounded-b-md mt-4">
                                    <span>جمع بدهی‌ها و حقوق صاحبان سهام</span>
                                    <span>{(-1 * (balanceSheetData.totalLiabilities + balanceSheetData.totalEquity)).toLocaleString('fa-IR')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                 {activeTab === 'incomeStatement' && (
                     <div className="animate-fade-in-right max-w-3xl mx-auto">
                        <h2 className="text-xl font-bold text-center mb-2">صورت سود و زیان</h2>
                        <p className="text-center text-sm text-gray-500 mb-6">برای دوره {new Date(dateRange.start).toLocaleDateString('fa-IR')} تا {new Date(dateRange.end).toLocaleDateString('fa-IR')}</p>
                        
                        <table className="w-full text-sm">
                            {renderStatementRows(incomeStatementData.revenues)}
                            <tr className="font-bold text-base bg-gray-100 dark:bg-gray-700"><td className="p-2">جمع درآمدها</td><td className="p-2 text-left font-mono">{incomeStatementData.totalRevenues.toLocaleString('fa-IR')}</td></tr>
                        </table>
                        <table className="w-full text-sm mt-6">
                            {renderStatementRows(incomeStatementData.expenses)}
                             <tr className="font-bold text-base bg-gray-100 dark:bg-gray-700"><td className="p-2">جمع هزینه‌ها</td><td className="p-2 text-left font-mono">({(incomeStatementData.totalExpenses).toLocaleString('fa-IR')})</td></tr>
                        </table>
                        <div className="flex justify-between font-bold text-xl p-3 bg-primary/10 text-primary dark:bg-primary/20 rounded-b-md mt-6">
                            <span>سود (زیان) خالص دوره</span>
                            <span className="font-mono">{incomeStatementData.netIncome.toLocaleString('fa-IR')}</span>
                        </div>
                     </div>
                )}
            </div>

             <style>{`.input-field { padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; } .dark .input-field { background-color: #374151; border-color: #4B5563; }`}</style>
        </div>
    );
};