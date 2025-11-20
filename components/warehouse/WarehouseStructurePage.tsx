
import React, { useState } from 'react';
import type { WarehouseStructureNode, ToastData } from '../../types';
import { IconFolder, IconFolderOpen, IconChevronLeft, IconPlusCircle, IconEdit, IconTrash } from '../Icons';
import { Modal } from '../common/Modal';

interface StructureItemProps { 
    node: WarehouseStructureNode; 
    level: number; 
    onToggle: (id: string) => void;
    expandedNodes: Set<string>;
}

const StructureItem: React.FC<StructureItemProps> = ({ node, level, onToggle, expandedNodes }) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const icon = isExpanded ? IconFolderOpen : IconFolder;
    const indentStyle = { paddingRight: `${level * 1.5}rem` };

    return (
        <>
            <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-4 py-2" style={indentStyle} onClick={() => hasChildren && onToggle(node.id)}>
                    <div className="flex items-center gap-2 cursor-pointer">
                        {hasChildren && <IconChevronLeft className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />}
                        {React.createElement(icon, { className: 'w-5 h-5 text-yellow-500' })}
                        <span className="font-medium text-gray-800 dark:text-gray-200">{node.name}</span>
                    </div>
                </td>
                <td className="px-4 py-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{node.type}</span>
                </td>
                <td className="px-4 py-2 text-center">
                     <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-blue-500"><IconEdit className="w-4 h-4" /></button>
                        <button className="p-1 text-danger"><IconTrash className="w-4 h-4" /></button>
                    </div>
                </td>
            </tr>
            {isExpanded && hasChildren && node.children.map(childNode => (
                <StructureItem key={childNode.id} node={childNode} level={level + 1} onToggle={onToggle} expandedNodes={expandedNodes} />
            ))}
        </>
    );
};

interface WarehouseStructurePageProps {
    structure: WarehouseStructureNode[];
    setStructure: React.Dispatch<React.SetStateAction<WarehouseStructureNode[]>>;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const WarehouseStructurePage: React.FC<WarehouseStructurePageProps> = ({ structure, setStructure, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(structure.map(n => n.id)));

    const handleToggleNode = (id: string) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">ساختار انبار</h1>
                <button onClick={() => showToast('این قابلیت در نسخه نمایشی غیرفعال است', 'info')} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-600 transition-colors">
                    <IconPlusCircle className="w-5 h-5"/> ایجاد واحد جدید
                </button>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr><th className="px-4 py-3">نام واحد</th><th className="px-4 py-3">نوع</th><th className="px-4 py-3 text-center">عملیات</th></tr>
                        </thead>
                        <tbody>
                            {structure.map(node => (
                                <StructureItem key={node.id} node={node} level={0} onToggle={handleToggleNode} expandedNodes={expandedNodes} />
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
        </div>
    );
};
