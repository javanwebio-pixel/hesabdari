import React, { useState, useMemo } from 'react';
import type { JobOpening, Candidate } from '../../../types';

const KANBAN_STAGES: Candidate['stage'][] = ['رزومه دریافتی', 'مصاحبه اولیه', 'مصاحبه فنی', 'پیشنهاد', 'استخدام شده'];

const CandidateCard: React.FC<{ candidate: Candidate, onDragStart: (e: React.DragEvent, id: string) => void }> = ({ candidate, onDragStart }) => (
    <div draggable onDragStart={e => onDragStart(e, candidate.id)} className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center gap-3 cursor-grab">
        <img src={candidate.avatarUrl} className="w-10 h-10 rounded-full" />
        <p className="font-semibold text-sm">{candidate.name}</p>
    </div>
);

interface RecruitmentPageProps {
    jobOpenings: JobOpening[];
    candidates: Candidate[];
    onUpdateCandidate: (candidate: Candidate) => void;
}

export const RecruitmentPage: React.FC<RecruitmentPageProps> = ({ jobOpenings, candidates, onUpdateCandidate }) => {
    const [selectedJobId, setSelectedJobId] = useState(jobOpenings[0]?.id);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    const candidatesForJob = useMemo(() => {
        const grouped: { [key in Candidate['stage']]: Candidate[] } = { 'رزومه دریافتی': [], 'مصاحبه اولیه': [], 'مصاحبه فنی': [], 'پیشنهاد': [], 'استخدام شده': [] };
        candidates.filter(c => c.jobId === selectedJobId).forEach(c => grouped[c.stage].push(c));
        return grouped;
    }, [candidates, selectedJobId]);
    
    const handleDrop = (e: React.DragEvent, targetStage: Candidate['stage']) => {
        if (!draggedItemId) return;
        const candidate = candidates.find(c => c.id === draggedItemId);
        if (candidate) onUpdateCandidate({ ...candidate, stage: targetStage });
        setDraggedItemId(null);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">جذب و استخدام</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"><label>موقعیت شغلی:</label><select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)} className="p-2 bg-gray-50 dark:bg-gray-700 border rounded-md ml-2">{jobOpenings.map(j => <option key={j.id} value={j.id}>{j.title} - {j.department}</option>)}</select></div>
            <div className="w-full overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                    {KANBAN_STAGES.map(stage => (
                        <div key={stage} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, stage)} className="w-64 bg-gray-100 dark:bg-gray-900 rounded-lg p-3 flex-shrink-0">
                            <h3 className="font-semibold mb-3">{stage} ({candidatesForJob[stage].length})</h3>
                            <div className="space-y-3 h-[calc(100vh-25rem)] overflow-y-auto pr-1">{candidatesForJob[stage].map(c => <CandidateCard key={c.id} candidate={c} onDragStart={(e, id) => setDraggedItemId(id)} />)}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
