import React, { useState } from 'react';
import type { ProjectBillingMilestone, ProjectDefinition } from '../../types';

interface ProjectBillingPageProps {
    projectBillings: ProjectBillingMilestone[];
    projects: ProjectDefinition[];
}

export const ProjectBillingPage: React.FC<ProjectBillingPageProps> = ({ projectBillings, projects }) => {
    const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');

    const filteredBillings = projectBillings.filter(b => b.projectId === selectedProjectId);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">صدور صورت وضعیت پروژه</h1>
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
                            <th className="p-2 text-right">شرح مایلستون</th>
                            <th className="p-2 text-right">تاریخ سررسید</th>
                            <th className="p-2 text-right">مبلغ</th>
                            <th className="p-2 text-right">وضعیت</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBillings.map(b => (
                            <tr key={b.id} className="border-t dark:border-gray-700">
                                <td className="p-2 font-semibold">{b.description}</td>
                                <td className="p-2">{b.dueDate}</td>
                                <td className="p-2 font-mono">{b.amount.toLocaleString('fa-IR')}</td>
                                <td className="p-2"><span className={`px-2 py-1 text-xs rounded-full ${b.status === 'پرداخت شده' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{b.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;}.dark .input-field{background-color:#374151;border-color:#4B5563}`}</style>
        </div>
    );
};
