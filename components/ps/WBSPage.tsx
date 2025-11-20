
import React, { useState, useMemo } from 'react';
import type { WBSNode, ProjectDefinition } from '../../types';
import { IconChevronLeft, IconPlusCircle, IconEdit, IconTrash } from '../Icons';
import { Modal } from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

interface WBSItemProps {
    node: WBSNode;
    level: number;
    onEdit: (node: WBSNode) => void;
    onDelete: (id: string) => void;
    children?: React.ReactNode;
}

const WBSItem: React.FC<WBSItemProps> = ({ node, level, onEdit, onDelete, children }) => {
    return (
        <>
        <tr className="group hover:bg-gray-50 dark:hover:bg-gray-700">
            <td style={{ paddingRight: `${level * 1.5 + 1}rem` }} className="py-2">{node.description}</td>
            <td className="py-2 font-mono">{node.code}</td>
            <td className="py-2"><span className={`px-2 py-1 text-xs rounded-full ${node.status === 'تکمیل شده' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{node.status}</span></td>
            <td className="py-2 font-mono">{node.plannedCost.toLocaleString('fa-IR')}</td>
            <td className="py-2 font-mono">{node.actualCost.toLocaleString('fa-IR')}</td>
            <td className="py-2">
                <div className="flex opacity-0 group-hover:opacity-100">
                    <button onClick={() => onEdit(node)} className="p-1 text-blue-500"><IconEdit className="w-4 h-4" /></button>
                    <button onClick={() => onDelete(node.id)} className="p-1 text-danger"><IconTrash className="w-4 h-4" /></button>
                </div>
            </td>
        </tr>
        {children}
        </>
    );
};

const WBSForm: React.FC<{ onSave: (data: any) => void, onCancel: () => void, initialData: WBSNode | null, parentId: string | null, projectId: string, wbs: WBSNode[] }> = 
({ onSave, onCancel, initialData, parentId, projectId, wbs }) => {
    const [description, setDescription] = useState(initialData?.description || '');
    const parentCode = parentId ? wbs.find(w => w.id === parentId)?.code : wbs.find(w => w.projectId === projectId && w.parentId === null)?.code;
    const nextCode = useMemo(() => {
        const siblings = wbs.filter(w => w.parentId === parentId);
        return `${parentCode}.${siblings.length + 1}`;
    }, [wbs, parentId, parentCode]);

    const handleSubmit = () => {
        onSave({ 
            id: initialData?.id || uuidv4(),
            projectId,
            parentId,
            code: initialData?.code || nextCode,
            description, 
            status: initialData?.status || 'باز',
            plannedCost: 0,
            actualCost: 0,
        });
    };

    return (
        <div className="space-y-4">
            <div><label>شرح</label><input type="text" value={description} onChange={e => setDescription(e.target.value)} className="input-field w-full" /></div>
            <div className="flex justify-end gap-2"><button onClick={onCancel} className="btn-secondary">لغو</button><button onClick={handleSubmit} className="btn-primary">ذخیره</button></div>
        </div>
    );
};


interface WBSPageProps {
    wbs: WBSNode[];
    setWbs: React.Dispatch<React.SetStateAction<WBSNode[]>>;
    projects: ProjectDefinition[];
}

export const WBSPage: React.FC<WBSPageProps> = ({ wbs, setWbs, projects }) => {
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<WBSNode | null>(null);
    const [parentNode, setParentNode] = useState<WBSNode | null>(null);

    const projectWBS = useMemo(() => {
        // FIX: Rewrite the tree construction logic to be more type-safe and fix inference issues.
        const items = wbs.filter(w => w.projectId === selectedProjectId);
        const rootItems: WBSNode[] = [];
        const lookup: { [id: string]: WBSNode } = {};
        
        items.forEach(item => {
            lookup[item.id] = { ...item, children: [] };
        });

        items.forEach(item => {
            if (item.parentId && lookup[item.parentId]) {
                const parent = lookup[item.parentId];
                if(parent.children) {
                    parent.children.push(lookup[item.id]);
                }
            } else {
                rootItems.push(lookup[item.id]);
            }
        });
        
        return rootItems;
    }, [wbs, selectedProjectId]);
    
    const handleSave = (node: WBSNode) => {
        setWbs(prev => {
            const existing = prev.find(w => w.id === node.id);
            if (existing) {
                return prev.map(w => w.id === node.id ? node : w);
            }
            return [...prev, node];
        });
        setIsModalOpen(false);
    };

    const renderTree = (nodes: WBSNode[], level: number): React.ReactNode => {
        return nodes.map(node => (
            <WBSItem key={node.id} node={node} level={level} onEdit={() => { setEditingNode(node); setIsModalOpen(true); }} onDelete={(id) => setWbs(wbs.filter(w=>w.id !== id))}>
                {node.children && renderTree(node.children, level + 1)}
            </WBSItem>
        ));
    };

    return (
        <div className="space-y-6">
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">ساختار شکست کار (WBS)</h1>
                <div className="flex items-center gap-2">
                    <label>پروژه:</label>
                    <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="input-field">
                        {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode} - {p.description}</option>)}
                    </select>
                    <button onClick={() => {setEditingNode(null); setParentNode(null); setIsModalOpen(true);}} className="btn-primary flex items-center gap-2"><IconPlusCircle/> افزودن</button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <table className="w-full text-sm">
                    <thead><tr><th className="text-right p-2">شرح</th><th className="text-right p-2">کد</th><th className="text-right p-2">وضعیت</th><th className="text-right p-2">هزینه برنامه‌ریزی شده</th><th className="text-right p-2">هزینه واقعی</th><th className="p-2"></th></tr></thead>
                    <tbody>{renderTree(projectWBS, 0)}</tbody>
                </table>
            </div>

            {isModalOpen && <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="عنصر WBS">
                <WBSForm onSave={handleSave} onCancel={() => setIsModalOpen(false)} initialData={editingNode} parentId={parentNode?.id || null} projectId={selectedProjectId} wbs={wbs} />
            </Modal>}
        </div>
    );
};
