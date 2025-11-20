import React, { useState, useMemo } from 'react';
import type { TafsiliGroup, TafsiliAccount, AccountNode, ToastData } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// Flatten GL accounts for multi-select
const flattenAccountsForSelect = (nodes: AccountNode[]): { code: string, name: string }[] => {
    let flatList: { code: string, name: string }[] = [];
    nodes.forEach(node => {
        if (node.type === 'account') {
            flatList.push({ code: node.code, name: node.name });
        }
        if (node.children) {
            flatList = flatList.concat(flattenAccountsForSelect(node.children));
        }
    });
    return flatList;
};

interface DetailedAccountsPageProps {
    tafsiliGroups: TafsiliGroup[];
    tafsiliAccounts: TafsiliAccount[];
    glAccounts: AccountNode[];
    setTafsiliAccounts: React.Dispatch<React.SetStateAction<TafsiliAccount[]>>;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const DetailedAccountsPage: React.FC<DetailedAccountsPageProps> = ({ tafsiliGroups, tafsiliAccounts, glAccounts, setTafsiliAccounts, showToast }) => {
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(tafsiliGroups[0]?.id || null);
    const [selectedTafsiliId, setSelectedTafsiliId] = useState<string | null>(null);

    const accountsForGroup = useMemo(() => {
        return tafsiliAccounts.filter(acc => acc.groupId === selectedGroupId);
    }, [tafsiliAccounts, selectedGroupId]);

    const selectedTafsili = useMemo(() => {
        return tafsiliAccounts.find(acc => acc.id === selectedTafsiliId);
    }, [tafsiliAccounts, selectedTafsiliId]);
    
    const flatGlAccounts = useMemo(() => flattenAccountsForSelect(glAccounts), [glAccounts]);

    const handleLinkToggle = (glCode: string) => {
        if (!selectedTafsili) return;
        setTafsiliAccounts(prev => prev.map(acc => {
            if (acc.id !== selectedTafsiliId) return acc;
            
            const newLinks = new Set(acc.linkedGLAccounts);
            if(newLinks.has(glCode)) {
                newLinks.delete(glCode);
            } else {
                newLinks.add(glCode);
            }
            return { ...acc, linkedGLAccounts: Array.from(newLinks) };
        }));
    };
    
    return (
        <div className="space-y-6">
             <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-primary:hover:not(:disabled){background-color:hsl(262 75% 52%)}`}</style>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت حساب‌های تفصیلی</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">حساب‌های تفصیلی شناور و ارتباط آن‌ها با حساب‌های کل را مدیریت کنید.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
                {/* 1. Tafsili Groups */}
                <div className="lg:col-span-1 xl:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
                    <h3 className="font-semibold mb-2">گروه‌های تفصیلی</h3>
                    <ul className="space-y-1 overflow-y-auto">
                        {tafsiliGroups.map(g => (
                            <li key={g.id}>
                                <button onClick={() => { setSelectedGroupId(g.id); setSelectedTafsiliId(null); }}
                                    className={`w-full text-right p-2 rounded-md text-sm font-semibold ${selectedGroupId === g.id ? 'bg-primary-50 text-primary dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {g.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                {/* 2. Tafsili Accounts */}
                <div className="lg:col-span-2 xl:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
                    <h3 className="font-semibold mb-2">حساب‌های تفصیلی در گروه «{tafsiliGroups.find(g => g.id === selectedGroupId)?.name}»</h3>
                    <div className="overflow-y-auto">
                        <table className="w-full text-sm text-right">
                             <tbody>
                                {accountsForGroup.map(acc => (
                                    <tr key={acc.id} onClick={() => setSelectedTafsiliId(acc.id)}
                                        className={`border-b dark:border-gray-700 cursor-pointer ${selectedTafsiliId === acc.id ? 'bg-blue-50 dark:bg-blue-900/50' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                    >
                                        <td className="p-2 font-mono">{acc.code}</td>
                                        <td className="p-2 font-semibold">{acc.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* 3. GL Links */}
                <div className="lg:col-span-3 xl:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
                    <h3 className="font-semibold mb-2">اتصال به دفتر کل</h3>
                    {selectedTafsili ? (
                        <div className="overflow-y-auto space-y-2">
                             <p className="text-sm font-bold text-primary">{selectedTafsili.name}</p>
                             {flatGlAccounts.map(gl => (
                                <label key={gl.code} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
                                    <input type="checkbox" className="h-4 w-4"
                                        checked={selectedTafsili.linkedGLAccounts.includes(gl.code)}
                                        onChange={() => handleLinkToggle(gl.code)}
                                    />
                                    {gl.name} ({gl.code})
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <p>یک حساب تفصیلی را برای مشاهده اتصالات انتخاب کنید.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
