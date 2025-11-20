

import React, { useState } from 'react';
import type { CostCenterNode, CostCenterType } from '../../types';
import { IconFolder, IconFolderOpen, IconChartPie, IconChevronLeft, IconPlusCircle, IconEdit, IconTrash, IconBuildingStore } from '../Icons';
import { Modal } from '../common/Modal';

// Helper component for rendering each item in the tree
interface CostCenterTreeItemProps { 
    node: CostCenterNode; 
    level: number; 
    onToggle: (code: string) => void;
    expandedNodes: Set<string>;
    onEdit: (node: CostCenterNode) => void;
    onDelete: (node: CostCenterNode) => void;
}

const typeMap: { [key in CostCenterType]: { name: string, icon: React.ReactElement<{ className?: string }>, class: string } } = {
    'group': { name: 'گروه', icon: <IconFolder />, class: 'text-yellow-500' },
    'Cost Center': { name: 'مرکز هزینه', icon: <IconBuildingStore />, class: 'text-blue-500' },
    'Profit Center': { name: 'مرکز سود', icon: <IconChartPie />, class: 'text-green-500' },
    'Service Center': { name: 'مرکز خدماتی', icon: <IconBuildingStore />, class: 'text-indigo-500' }
};


const CostCenterTreeItem: React.FC<CostCenterTreeItemProps> = ({ node, level, onToggle, expandedNodes, onEdit, onDelete }) => {
  const isExpanded = expandedNodes.has(node.code);
  const hasChildren = node.children && node.children.length > 0;
  
  const icon = node.type === 'group' && isExpanded ? <IconFolderOpen className={typeMap[node.type].class} /> : React.cloneElement(typeMap[node.type].icon, { className: typeMap[node.type].class });
  
  const indentStyle = { paddingRight: `${level * 1.5}rem` };

  return (
    <>
      <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700">
        <td className="px-4 py-2" style={indentStyle} onClick={() => hasChildren && onToggle(node.code)} >
          <div className="flex items-center gap-2 cursor-pointer">
            {hasChildren ? <IconChevronLeft className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? '-rotate-90' : ''}`} /> : <div className="w-4 h-4"></div>}
            {icon}
            <span className="font-medium text-gray-800 dark:text-gray-200">{node.name}</span>
          </div>
        </td>
        <td className="px-4 py-2 text-gray-600 dark:text-gray-400 font-mono">{node.code}</td>
        <td className="px-4 py-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900 ${typeMap[node.type].class}`}>
                {typeMap[node.type].name}
            </span>
        </td>
         <td className="px-4 py-2 text-center">
            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(node)} className="text-blue-500 hover:text-blue-700 p-1" title="ویرایش"><IconEdit className="w-4 h-4" /></button>
                <button onClick={() => onDelete(node)} className="text-danger hover:text-red-700 p-1" title="حذف"><IconTrash className="w-4 h-4" /></button>
            </div>
        </td>
      </tr>
      {isExpanded && hasChildren && node.children?.map(childNode => (
        <CostCenterTreeItem key={childNode.code} node={childNode} level={level + 1} onToggle={onToggle} expandedNodes={expandedNodes} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </>
  );
};

// Form for creating/editing a cost center
const CostCenterForm: React.FC<{
    onSave: (center: CostCenterNode, parentCode: string | null) => void,
    onCancel: () => void,
    initialData?: CostCenterNode | null,
    costCenters: CostCenterNode[]
}> = ({ onSave, onCancel, initialData, costCenters }) => {
    // Simplified form logic
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const name = (form.elements.namedItem('name') as HTMLInputElement).value;
        const code = (form.elements.namedItem('code') as HTMLInputElement).value;
        const type = (form.elements.namedItem('type') as HTMLSelectElement).value as CostCenterType;
        const parentCode = (form.elements.namedItem('parentCode') as HTMLSelectElement).value;

        const newCenter: CostCenterNode = {
            ...initialData,
            code,
            name,
            type,
            children: initialData?.children || (type === 'group' ? [] : undefined),
        };
        onSave(newCenter, initialData ? null : (parentCode === 'root' ? null : parentCode));
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label className="label-form">والد</label>
                <select name="parentCode" defaultValue={initialData ? 'root' : 'root'} disabled={!!initialData} className="input-field w-full">
                    <option value="root">ریشه</option>
                    {/* Populate with existing groups */}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label-form">کد</label>
                    <input name="code" type="text" defaultValue={initialData?.code} required className="input-field w-full font-mono" />
                </div>
                 <div>
                    <label className="label-form">نوع</label>
                    <select name="type" defaultValue={initialData?.type || 'Cost Center'} className="input-field w-full">
                        <option value="group">گروه</option>
                        <option value="Service Center">مرکز خدماتی</option>
                        <option value="Cost Center">مرکز هزینه</option>
                        <option value="Profit Center">مرکز سود</option>
                    </select>
                </div>
            </div>
             <div>
                <label className="label-form">نام</label>
                <input name="name" type="text" defaultValue={initialData?.name} required className="input-field w-full" />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="submit" className="btn-primary">ذخیره</button>
            </div>
        </form>
    );
}

// Main page component
interface CostCentersPageProps {
    costCenters: CostCenterNode[];
    addCostCenter: (center: CostCenterNode, parentCode: string | null) => void;
    updateCostCenter: (center: CostCenterNode) => void;
    deleteCostCenter: (code: string) => void;
}

export const CostCentersPage: React.FC<CostCentersPageProps> = ({ costCenters, addCostCenter, updateCostCenter, deleteCostCenter }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCenter, setEditingCenter] = useState<CostCenterNode | null>(null);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(costCenters.map(c => c.code)));

    const handleToggleNode = (code: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(code)) newSet.delete(code);
            else newSet.add(code);
            return newSet;
        });
    };

    const handleSave = (center: CostCenterNode, parentCode: string | null) => {
        if (editingCenter) {
            updateCostCenter(center);
        } else {
            addCostCenter(center, parentCode);
        }
        setIsModalOpen(false);
        setEditingCenter(null);
    };

    const handleEdit = (node: CostCenterNode) => {
        setEditingCenter(node);
        setIsModalOpen(true);
    };

    const handleDelete = (node: CostCenterNode) => {
        if (window.confirm(`آیا از حذف "${node.name}" اطمینان دارید؟`)) {
            deleteCostCenter(node.code);
        }
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:background-color .2s}.btn-primary:hover{background-color:hsl(262 75% 52%)}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت مراکز هزینه و سود</h1>
                <button onClick={() => { setEditingCenter(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> ایجاد مرکز جدید
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-4 py-3">نام مرکز</th>
                                <th scope="col" className="px-4 py-3">کد</th>
                                <th scope="col" className="px-4 py-3">نوع</th>
                                <th scope="col" className="px-4 py-3 w-32 text-center">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {costCenters.map(node => (
                                <CostCenterTreeItem key={node.code} node={node} level={0} onToggle={handleToggleNode} expandedNodes={expandedNodes} onEdit={handleEdit} onDelete={handleDelete} />
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCenter ? 'ویرایش مرکز' : 'ایجاد مرکز جدید'}>
                <CostCenterForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingCenter} costCenters={costCenters} />
            </Modal>
        </div>
    );
};
