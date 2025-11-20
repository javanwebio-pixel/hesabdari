import React, { useState, useMemo, useEffect } from 'react';
import type { AccountNode, JournalEntryLine } from '../../types';
import { IconFolder, IconFolderOpen, IconFileText, IconChevronLeft, IconPlusCircle, IconEdit, IconTrash, IconBook } from '../Icons';
import { Modal } from '../common/Modal';


interface AccountTreeItemProps { 
    node: AccountNode; 
    level: number; 
    onToggle: (code: string) => void;
    expandedNodes: Set<string>;
    onEdit: (node: AccountNode) => void;
    onDelete: (node: AccountNode) => void;
}

const AccountTreeItem: React.FC<AccountTreeItemProps> = ({ node, level, onToggle, expandedNodes, onEdit, onDelete }) => {
  const isExpanded = expandedNodes.has(node.code);
  const hasChildren = node.children && node.children.length > 0;

  const Icon = node.type === 'group' 
    ? (isExpanded ? IconFolderOpen : IconFolder) 
    : IconFileText;
  
  const indentStyle = { paddingRight: `${level * 1.5}rem` };

  return (
    <>
      <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-4 py-2" style={indentStyle} onClick={() => hasChildren && onToggle(node.code)} >
          <div className="flex items-center gap-2 cursor-pointer">
            {hasChildren && <IconChevronLeft className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />}
            <Icon className={`w-5 h-5 ${node.type === 'group' ? 'text-yellow-500' : 'text-gray-400'}`} />
            <span className="font-medium text-gray-800 dark:text-gray-200">{node.name}</span>
          </div>
        </td>
        <td className="px-4 py-2 text-gray-600 dark:text-gray-400 font-mono">{node.code}</td>
        <td className="px-4 py-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${node.type === 'group' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}`}>
                {node.type === 'group' ? 'گروه' : 'حساب معین'}
            </span>
        </td>
         <td className="px-4 py-2 text-center">
            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {node.type === 'account' &&
                    <button onClick={() => alert(`دفتر حساب ${node.name} باز می‌شود...`)} className="text-gray-500 hover:text-gray-700 p-1" title="مشاهده دفتر حساب"><IconBook className="w-4 h-4" /></button>
                }
                <button onClick={(e) => { e.stopPropagation(); onEdit(node); }} className="text-blue-500 hover:text-blue-700 p-1" title="ویرایش"><IconEdit className="w-4 h-4" /></button>
                {!(node.type === 'group' && level === 0) && (
                    <button onClick={(e) => { e.stopPropagation(); onDelete(node); }} className="text-danger hover:text-red-700 p-1" title="حذف"><IconTrash className="w-4 h-4" /></button>
                )}
            </div>
        </td>
      </tr>
      {isExpanded && hasChildren && node.children?.map(childNode => (
        <AccountTreeItem key={childNode.code} node={childNode} level={level + 1} onToggle={onToggle} expandedNodes={expandedNodes} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </>
  );
};


const NewAccountForm: React.FC<{
    accounts: AccountNode[], 
    onSave: (newAccount: AccountNode, parentCode: string | null) => void,
    onCancel: () => void,
    initialData?: AccountNode | null,
}> = ({ accounts, onSave, onCancel, initialData }) => {
    const isEditing = !!initialData;
    
    const findParentCode = useMemo(() => (nodes: AccountNode[], childCode: string): string | null => {
        for (const node of nodes) {
            if (node.children?.some(child => child.code === childCode)) {
                return node.code;
            }
            if (node.children) {
                const found = findParentCode(node.children, childCode);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const [parentCode, setParentCode] = useState<string>(() => {
         if (!initialData) return 'root';
         const parent = findParentCode(accounts, initialData.code);
         return parent || 'root';
    });
    const [accountName, setAccountName] = useState(initialData?.name || '');
    const [accountCode, setAccountCode] = useState(initialData?.code || '');
    const [accountType, setAccountType] = useState<'group' | 'account'>(initialData?.type || 'account');
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const groupAccounts = useMemo(() => {
        const groups: { name: string, code: string, level: number }[] = [];
        const findGroups = (nodes: AccountNode[], level: number) => {
            nodes.forEach(node => {
                if (node.type === 'group') {
                    groups.push({ name: '—'.repeat(level) + ` ${node.name}`, code: node.code, level });
                    if (node.children) {
                        findGroups(node.children, level + 1);
                    }
                }
            });
        };
        findGroups(accounts, 0);
        return groups;
    }, [accounts]);
    
    useEffect(() => {
        if (isEditing) return;

        if (!parentCode || parentCode === 'root') {
            const topLevelCodes = accounts.map(a => parseInt(a.code, 10)).filter(c => !isNaN(c));
            const nextCode = topLevelCodes.length > 0 ? Math.max(...topLevelCodes) + 1 : 1;
            setAccountCode(String(nextCode));
            return;
        }

        let parentNode: AccountNode | null = null;
        const findParent = (nodes: AccountNode[]) => {
            for (const node of nodes) {
                if (node.code === parentCode) {
                    parentNode = node;
                    return;
                }
                if (node.children) findParent(node.children);
            }
        };
        findParent(accounts);
        
        if (parentNode && parentNode.children) {
            const childCodes = parentNode.children.map(c => parseInt(c.code, 10)).filter(c => !isNaN(c));
            const maxChildCode = childCodes.length > 0 ? Math.max(...childCodes) : 0;
            const nextCode = maxChildCode > 0 ? maxChildCode + 1 : parseInt(`${parentCode}01`, 10);
            setAccountCode(String(nextCode));

        } else if(parentNode) {
            setAccountCode(`${parentCode}01`);
        }
    }, [parentCode, accounts, isEditing]);

    const canChangeType = !(isEditing && initialData.type === 'group' && initialData.children && initialData.children.length > 0);
    const isSaveDisabled = isEditing && !canChangeType && accountType !== initialData?.type;

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!accountName.trim()) newErrors.accountName = 'نام حساب الزامی است.';
        if (!accountCode.trim()) {
            newErrors.accountCode = 'کد حساب الزامی است.';
        } else if (!/^\d+$/.test(accountCode)) {
            newErrors.accountCode = 'کد حساب باید فقط شامل اعداد باشد.';
        }
    
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSaveDisabled || !validate()) return;
        
        const newAccount: AccountNode = {
            name: accountName,
            code: accountCode,
            type: accountType,
            children: initialData?.children || (accountType === 'group' ? [] : undefined),
        };
        onSave(newAccount, isEditing ? null : (parentCode === 'root' ? null : parentCode));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">حساب والد</label>
                <select value={parentCode || ''} onChange={e => setParentCode(e.target.value)} disabled={isEditing} className="w-full input-field disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">
                    <option value="root">بدون والد (سطح اصلی)</option>
                    {groupAccounts.map(g => <option key={g.code} value={g.code}>{g.name}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع حساب</label>
                    <select value={accountType} onChange={e => setAccountType(e.target.value as any)} disabled={!canChangeType} className="w-full input-field disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed">
                        <option value="account">معین</option>
                        <option value="group">گروه</option>
                    </select>
                    {!canChangeType && <p className="text-xs text-danger mt-1">این گروه دارای زیرمجموعه است و نمی‌تواند به حساب معین تبدیل شود.</p>}
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">کد حساب</label>
                    <input type="number" value={accountCode} onChange={e => setAccountCode(e.target.value)} required disabled={isEditing} className="w-full input-field font-mono disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:cursor-not-allowed" />
                    {errors.accountCode && <p className="text-xs text-danger mt-1">{errors.accountCode}</p>}
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نام حساب</label>
                <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} required className="w-full input-field" />
                {errors.accountName && <p className="text-xs text-danger mt-1">{errors.accountName}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition-colors">لغو</button>
                <button type="submit" disabled={isSaveDisabled} className="px-6 py-2 text-sm bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">ذخیره حساب</button>
            </div>
        </form>
    );
}


interface AccountsPageProps {
    accounts: AccountNode[];
    addAccount: (newAccount: AccountNode, parentCode: string | null) => void;
    updateAccount: (updatedAccount: AccountNode) => void;
    deleteAccount: (code: string) => void;
    getAccountLedger: (accountCode: string) => (JournalEntryLine & { journalDate: string; docNumber: number })[];
}

export const AccountsPage: React.FC<AccountsPageProps> = ({ accounts, addAccount, updateAccount, deleteAccount, getAccountLedger }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<AccountNode | null>(null);

    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
        const initialExpanded = new Set<string>();
        const expandAll = (nodes: AccountNode[]) => {
            nodes.forEach(node => {
                if (node.type === 'group') {
                    initialExpanded.add(node.code);
                    if (node.children) expandAll(node.children);
                }
            })
        }
        expandAll(accounts);
        return initialExpanded;
    });

    const handleToggleNode = (code: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(code)) {
                newSet.delete(code);
            } else {
                newSet.add(code);
            }
            return newSet;
        });
    };
    
    const handleSaveAccount = (accountData: AccountNode, parentCode: string | null) => {
        if (editingAccount) {
            updateAccount(accountData);
        } else {
            addAccount(accountData, parentCode);
        }
        setIsModalOpen(false);
        setEditingAccount(null);
    };
    
    const handleEdit = (node: AccountNode) => {
        setEditingAccount(node);
        setIsModalOpen(true);
    };
    
    const handleDelete = (node: AccountNode) => {
        const message = (node.children && node.children.length > 0)
            ? `آیا از حذف گروه "${node.name}" و تمام زیرمجموعه‌های آن اطمینان دارید؟`
            : `آیا از حذف حساب "${node.name}" اطمینان دارید؟`;

        if (window.confirm(message)) {
            deleteAccount(node.code);
        }
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAccount(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">فهرست حساب‌ها (درختواره)</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors"
                >
                    <IconPlusCircle className="w-5 h-5" />
                    <span>ایجاد حساب جدید</span>
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-4 py-3">نام حساب</th>
                                <th scope="col" className="px-4 py-3">کد حساب</th>
                                <th scope="col" className="px-4 py-3">نوع</th>
                                <th scope="col" className="px-4 py-3 w-32 text-center">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accounts.map(node => (
                                <AccountTreeItem key={node.code} node={node} level={0} onToggle={handleToggleNode} expandedNodes={expandedNodes} onEdit={handleEdit} onDelete={handleDelete} />
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingAccount ? "ویرایش حساب" : "ایجاد حساب جدید"}>
                 <style>{`.input-field { padding: 0.5rem 0.75rem; border-radius: 0.5rem; background-color: rgb(249 250 251 / var(--tw-bg-opacity)); border: 1px solid rgb(229 231 235 / var(--tw-border-opacity)); } .dark .input-field { background-color: rgb(55 65 81 / var(--tw-bg-opacity)); border-color: rgb(75 85 99 / var(--tw-border-opacity)); } .input-field:focus { outline: 2px solid transparent; outline-offset: 2px; --tw-ring-color: hsl(262 83% 58%); box-shadow: 0 0 0 2px var(--tw-ring-color); }`}</style>
                <NewAccountForm accounts={accounts} onSave={handleSaveAccount} onCancel={handleCloseModal} initialData={editingAccount} />
            </Modal>
        </div>
    );
};
