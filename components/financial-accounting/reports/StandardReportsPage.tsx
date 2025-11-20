
import React, { useState, useMemo } from 'react';
import type { AccountNode, JournalEntry } from '../../../types';
import { IconBook, IconTable, IconChevronLeft } from '../../Icons';

// Helper function to parse 'YYYY/MM/DD' date strings
const parseFaDate = (dateStr: string): Date => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return new Date(1900, 0, 1);
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
};


interface TrialBalanceRow {
    level: number;
    code: string;
    name: string;
    isGroup: boolean;
    openingBalance: number;
    turnoverDebit: number;
    turnoverCredit: number;
    closingBalance: number;
}

interface StandardReportsPageProps {
    accounts: AccountNode[];
    journalEntries: JournalEntry[];
}

export const StandardReportsPage: React.FC<StandardReportsPageProps> = ({ accounts, journalEntries }) => {
    const [reportType, setReportType] = useState<'trialBalance' | 'generalLedger'>('trialBalance');
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [selectedAccount, setSelectedAccount] = useState<AccountNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(accounts.map(a => a.code)));

    const handleToggleNode = (code: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(code)) newSet.delete(code);
            else newSet.add(code);
            return newSet;
        });
    };

    const trialBalanceData = useMemo(() => {
        const startDate = parseFaDate(dateRange.start.replace(/-/g, '/'));
        const endDate = parseFaDate(dateRange.end.replace(/-/g, '/'));

        const calculateBalances = (node: AccountNode, level: number): TrialBalanceRow => {
            let row: TrialBalanceRow = {
                level, code: node.code, name: node.name, isGroup: node.type === 'group',
                openingBalance: 0, turnoverDebit: 0, turnoverCredit: 0, closingBalance: 0,
            };

            if (node.type === 'account') {
                journalEntries.forEach(entry => {
                    const entryDate = parseFaDate(entry.date);
                    entry.lines.forEach(line => {
                        if (line.accountCode === node.code) {
                            const balanceChange = line.debit - line.credit;
                            if (entryDate < startDate) {
                                row.openingBalance += balanceChange;
                            } else if (entryDate <= endDate) {
                                row.turnoverDebit += line.debit;
                                row.turnoverCredit += line.credit;
                            }
                        }
                    });
                });
            } else if (node.children) {
                const childRows = node.children.map(child => calculateBalances(child, level + 1));
                row.openingBalance = childRows.reduce((sum, r) => sum + r.openingBalance, 0);
                row.turnoverDebit = childRows.reduce((sum, r) => sum + r.turnoverDebit, 0);
                row.turnoverCredit = childRows.reduce((sum, r) => sum + r.turnoverCredit, 0);
            }
            
            row.closingBalance = row.openingBalance + row.turnoverDebit - row.turnoverCredit;
            return row;
        };
        
        const buildHierarchy = (nodes: AccountNode[], level: number): TrialBalanceRow[] => {
            let rows: TrialBalanceRow[] = [];
            nodes.forEach(node => {
                const rowData = calculateBalances(node, level);
                rows.push(rowData);
                if (node.children && expandedNodes.has(node.code)) {
                    rows = rows.concat(buildHierarchy(node.children, level + 1));
                }
            });
            return rows;
        }

        return buildHierarchy(accounts, 0);
    }, [accounts, journalEntries, dateRange, expandedNodes]);

    const generalLedgerData = useMemo(() => {
        if (!selectedAccount) return { lines: [], openingBalance: 0 };
        
        const startDate = parseFaDate(dateRange.start.replace(/-/g, '/'));
        const endDate = parseFaDate(dateRange.end.replace(/-/g, '/'));
        let openingBalance = 0;
        const lines: (JournalEntry['lines'][0] & { docNumber: number; date: string; runningBalance: number })[] = [];
        
        journalEntries.forEach(entry => {
             const entryDate = parseFaDate(entry.date);
             entry.lines.forEach(line => {
                if (line.accountCode === selectedAccount.code) {
                     const balanceChange = line.debit - line.credit;
                     if (entryDate < startDate) {
                         openingBalance += balanceChange;
                     } else if (entryDate <= endDate) {
                         lines.push({ ...line, docNumber: entry.docNumber, date: entry.date, runningBalance: 0 });
                     }
                }
             })
        });

        lines.sort((a,b) => parseFaDate(a.date).getTime() - parseFaDate(b.date).getTime());
        
        let runningBalance = openingBalance;
        lines.forEach(line => {
            runningBalance += line.debit - line.credit;
            line.runningBalance = runningBalance;
        });

        return { lines, openingBalance };
    }, [journalEntries, dateRange, selectedAccount]);

    const handleAccountClick = (code: string) => {
        const findAccount = (nodes: AccountNode[]): AccountNode | null => {
            for(const node of nodes) {
                if(node.code === code) return node;
                if(node.children) {
                    const found = findAccount(node.children);
                    if (found) return found;
                }
            }
            return null;
        }
        const account = findAccount(accounts);
        if (account && account.type === 'account') {
            setSelectedAccount(account);
            setReportType('generalLedger');
        }
    };


    return (
        <div className="flex gap-6 h-full">
            {/* Report Selection Sidebar */}
            <div className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex-shrink-0">
                <h2 className="text-lg font-bold mb-4">گزارشات استاندارد</h2>
                <ul>
                    <li><button onClick={() => { setReportType('trialBalance'); setSelectedAccount(null); }} className={`w-full text-right flex items-center gap-2 p-2 rounded-md ${reportType === 'trialBalance' ? 'bg-primary-50 text-primary dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><IconTable/> تراز آزمایشی</button></li>
                    <li><button onClick={() => setReportType('generalLedger')} className={`w-full text-right flex items-center gap-2 p-2 rounded-md ${reportType === 'generalLedger' && !selectedAccount ? 'bg-primary-50 text-primary dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}><IconBook/> دفتر کل/معین</button></li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-grow bg-white dark:bg-gray-800 rounded-lg shadow p-6 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center border-b dark:border-gray-700 pb-4 mb-4">
                    <h2 className="text-xl font-bold">
                        {reportType === 'trialBalance' ? 'تراز آزمایشی' : `دفتر معین: ${selectedAccount?.name || 'حسابی انتخاب نشده'}`}
                    </h2>
                    <div className="flex items-center gap-2">
                        <label className="text-sm">از:</label>
                        <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({...p, start: e.target.value}))} className="input-field" />
                        <label className="text-sm">تا:</label>
                        <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({...p, end: e.target.value}))} className="input-field" />
                    </div>
                </div>

                <div className="overflow-auto flex-grow">
                    {reportType === 'trialBalance' && (
                        <table className="w-full text-sm text-right whitespace-nowrap">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th className="py-3 px-4 text-right">حساب</th>
                                    <th className="py-3 px-4 text-left">مانده اول دوره</th>
                                    <th className="py-3 px-4 text-left">گردش بدهکار</th>
                                    <th className="py-3 px-4 text-left">گردش بستانکار</th>
                                    <th className="py-3 px-4 text-left">مانده پایان دوره</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-600">
                                {trialBalanceData.map(row => (
                                    <tr key={row.code} className={`${row.isGroup ? 'bg-gray-50 dark:bg-gray-700/50 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                        <td className="py-2 px-4">
                                            <div className="flex items-center" style={{paddingRight: `${row.level * 1.5}rem`}}>
                                                {row.isGroup && <IconChevronLeft className={`w-4 h-4 ml-1 cursor-pointer transition-transform ${expandedNodes.has(row.code) ? '-rotate-90' : ''}`} onClick={() => handleToggleNode(row.code)} />}
                                                <span className={`${!row.isGroup ? 'cursor-pointer hover:text-primary hover:underline' : ''}`} onClick={() => handleAccountClick(row.code)}>{row.name} ({row.code})</span>
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 font-mono text-left">{Math.abs(row.openingBalance).toLocaleString('fa-IR')} <span className="text-xs text-gray-400">{row.openingBalance > 0 ? 'بد' : (row.openingBalance < 0 ? 'بس' : '')}</span></td>
                                        <td className="py-2 px-4 font-mono text-left">{row.turnoverDebit.toLocaleString('fa-IR')}</td>
                                        <td className="py-2 px-4 font-mono text-left">{row.turnoverCredit.toLocaleString('fa-IR')}</td>
                                        <td className="py-2 px-4 font-mono text-left">{Math.abs(row.closingBalance).toLocaleString('fa-IR')} <span className="text-xs text-gray-400">{row.closingBalance > 0 ? 'بد' : (row.closingBalance < 0 ? 'بس' : '')}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {reportType === 'generalLedger' && (
                        !selectedAccount ? <p className="text-center p-8 text-gray-500">لطفاً یک حساب را از تراز آزمایشی برای مشاهده دفتر آن انتخاب کنید.</p> :
                        <table className="w-full text-sm text-right">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 sticky top-0">
                                <tr>
                                    <th className="py-3 px-4">تاریخ</th><th className="py-3 px-4">شماره سند</th><th className="py-3 px-4">شرح</th>
                                    <th className="py-3 px-4 text-left">بدهکار</th><th className="py-3 px-4 text-left">بستانکار</th><th className="py-3 px-4 text-left">مانده</th>
                                </tr>
                            </thead>
                             <tbody>
                                <tr className="font-semibold bg-gray-50 dark:bg-gray-700"><td className="py-2 px-4" colSpan={5}>مانده اول دوره</td><td className="py-2 px-4 text-left font-mono">{generalLedgerData.openingBalance.toLocaleString('fa-IR')}</td></tr>
                                {generalLedgerData.lines.map(line => (
                                    <tr key={line.id} className="border-b dark:border-gray-600">
                                        <td className="py-2 px-4">{line.date}</td><td className="py-2 px-4">{line.docNumber}</td><td className="py-2 px-4">{line.description}</td>
                                        <td className="py-2 px-4 text-left font-mono">{line.debit > 0 ? line.debit.toLocaleString('fa-IR') : '-'}</td>
                                        <td className="py-2 px-4 text-left font-mono">{line.credit > 0 ? line.credit.toLocaleString('fa-IR') : '-'}</td>
                                        <td className="py-2 px-4 text-left font-mono">{line.runningBalance.toLocaleString('fa-IR')}</td>
                                    </tr>
                                ))}
                                <tr className="font-semibold bg-gray-50 dark:bg-gray-700"><td className="py-2 px-4" colSpan={5}>مانده پایان دوره</td><td className="py-2 px-4 text-left font-mono">{generalLedgerData.lines[generalLedgerData.lines.length - 1]?.runningBalance.toLocaleString('fa-IR') || generalLedgerData.openingBalance.toLocaleString('fa-IR')}</td></tr>
                             </tbody>
                        </table>
                    )}
                </div>
            </div>
             <style>{`.input-field { padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: #F9FAFB; border: 1px solid #E5E7EB; } .dark .input-field { background-color: #374151; border-color: #4B5563; }`}</style>
        </div>
    );
};
