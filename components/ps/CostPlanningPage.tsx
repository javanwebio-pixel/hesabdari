import React, { useState, useMemo } from 'react';
import type { WBSNode, ProjectDefinition } from '../../types';

interface CostPlanningPageProps {
    wbs: WBSNode[];
    setWbs: React.Dispatch<React.SetStateAction<WBSNode[]>>;
    projects: ProjectDefinition[];
}

export const CostPlanningPage: React.FC<CostPlanningPageProps> = ({ wbs, setWbs, projects }) => {
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
    
    const projectWBS = useMemo(() => {
        return wbs.filter(w => w.projectId === selectedProjectId);
    }, [wbs, selectedProjectId]);
    
    const handleCostChange = (id: string, newCost: number) => {
        setWbs(prevWbs => prevWbs.map(w => w.id === id ? { ...w, plannedCost: newCost } : w));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">برنامه‌ریزی هزینه و درآمد پروژه</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                 <div className="flex items-center gap-2 mb-4">
                    <label>پروژه:</label>
                    <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="input-field">
                        {projects.map(p => <option key={p.id} value={p.id}>{p.projectCode} - {p.description}</option>)}
                    </select>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr>
                            <th className="p-2 text-right">WBS</th>
                            <th className="p-2 text-right">هزینه برنامه‌ریزی شده</th>
                            <th className="p-2 text-right">هزینه واقعی</th>
                            <th className="p-2 text-right">انحراف</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projectWBS.map(w => {
                            const variance = w.actualCost - w.plannedCost;
                            return (
                                <tr key={w.id} className="border-t dark:border-gray-700">
                                    <td className="p-2 font-semibold">{w.code} - {w.description}</td>
                                    <td className="p-2 w-48"><input type="number" value={w.plannedCost} onChange={e => handleCostChange(w.id, Number(e.target.value))} className="input-field font-mono" /></td>
                                    <td className="p-2 font-mono">{w.actualCost.toLocaleString('fa-IR')}</td>
                                    <td className={`p-2 font-mono ${variance > 0 ? 'text-danger' : 'text-success'}`}>{variance.toLocaleString('fa-IR')}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
             <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}`}</style>
        </div>
    );
};
