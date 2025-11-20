import React, { useState, useMemo } from 'react';
import type { Opportunity, OpportunityStage, Party, ToastData } from '../../../types';
import { IconPlusCircle, IconChartPie, IconTarget, IconCheckCircle, IconUser } from '../../Icons';
import { Modal } from '../../common/Modal';

const KANBAN_STAGES: OpportunityStage[] = ['ارزیابی', 'ارسال پیشنهاد', 'مذاکره', 'موفق', 'ناموفق'];

const stageColors: { [key in OpportunityStage]: { border: string, bg: string, text: string } } = {
    'ارزیابی': { border: 'border-blue-500', bg: 'bg-blue-500', text: 'text-blue-500' },
    'ارسال پیشنهاد': { border: 'border-purple-500', bg: 'bg-purple-500', text: 'text-purple-500' },
    'مذاکره': { border: 'border-orange-500', bg: 'bg-orange-500', text: 'text-orange-500' },
    'موفق': { border: 'border-green-500', bg: 'bg-green-500', text: 'text-green-500' },
    'ناموفق': { border: 'border-red-500', bg: 'bg-red-500', text: 'text-red-500' },
};

const OpportunityCard: React.FC<{ opp: Opportunity, onDragStart: (e: React.DragEvent, oppId: string) => void }> = ({ opp, onDragStart }) => (
    <div 
        draggable
        onDragStart={(e) => onDragStart(e, opp.id)}
        className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border-r-4 border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing"
    >
        <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{opp.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1"><IconUser className="w-3 h-3"/>{opp.customerName}</p>
        <div className="flex justify-between items-center mt-3 text-xs">
            <span className={`font-semibold ${stageColors[opp.stage].text}`}>{opp.value.toLocaleString('fa-IR')} تومان</span>
            <span className="text-gray-400">پایان: {opp.expectedCloseDate}</span>
        </div>
    </div>
);

const OpportunityFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (opp: Omit<Opportunity, 'id'>) => void;
    parties: Party[];
}> = ({ isOpen, onClose, onSave, parties }) => {
    // A simplified form for brevity
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const customerId = formData.get('customerId') as string;
        const customer = parties.find(p => p.id === customerId);
        if (!customer) return;

        const newOpp: Omit<Opportunity, 'id'> = {
            name: formData.get('name') as string,
            customerId,
            customerName: customer.name,
            stage: 'ارزیابی',
            value: Number(formData.get('value')),
            probability: 20,
            expectedCloseDate: new Date(formData.get('expectedCloseDate') as string).toLocaleDateString('fa-IR-u-nu-latn'),
            description: formData.get('description') as string,
        };
        onSave(newOpp);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ایجاد فرصت فروش جدید">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label-form">نام فرصت</label>
                    <input name="name" type="text" required className="input-field"/>
                </div>
                <div>
                    <label className="label-form">مشتری</label>
                    <select name="customerId" required className="input-field">
                        {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label-form">ارزش تخمینی (تومان)</label>
                        <input name="value" type="number" required className="input-field"/>
                    </div>
                     <div>
                        <label className="label-form">تاریخ مورد انتظار بستن</label>
                        <input name="expectedCloseDate" type="date" required className="input-field"/>
                    </div>
                </div>
                 <div>
                    <label className="label-form">توضیحات</label>
                    <textarea name="description" rows={3} className="input-field"></textarea>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">لغو</button>
                    <button type="submit" className="btn-primary">ایجاد فرصت</button>
                </div>
            </form>
        </Modal>
    );
};

interface OpportunitiesPageProps {
    opportunities: Opportunity[];
    onUpdateOpportunity: (opp: Opportunity) => void;
    onAddOpportunity: (opp: Omit<Opportunity, 'id'>) => void;
    parties: Party[];
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({ opportunities, onUpdateOpportunity, onAddOpportunity, parties, showToast }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

    const pipelineStats = useMemo(() => {
        const valueByStage = KANBAN_STAGES.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {} as { [key in OpportunityStage]: number });
        opportunities.forEach(opp => { valueByStage[opp.stage] += opp.value; });
        const totalPipeline = opportunities.filter(o=>o.stage!=='موفق' && o.stage!=='ناموفق').reduce((sum, o) => sum + o.value, 0);
        const won = valueByStage['موفق'];
        const lost = valueByStage['ناموفق'];
        const conversionRate = (won + lost) > 0 ? (won / (won + lost)) * 100 : 0;
        return { valueByStage, totalPipeline, conversionRate };
    }, [opportunities]);

    const opportunitiesByStage = useMemo(() => {
        const grouped = KANBAN_STAGES.reduce((acc, stage) => ({...acc, [stage]: []}), {} as { [key in OpportunityStage]: Opportunity[] });
        opportunities.forEach(opp => { if (grouped[opp.stage]) grouped[opp.stage].push(opp); });
        return grouped;
    }, [opportunities]);
    
    const handleDragStart = (e: React.DragEvent, oppId: string) => {
        setDraggedItemId(oppId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent, targetStage: OpportunityStage) => {
        e.preventDefault();
        if (!draggedItemId) return;

        const opp = opportunities.find(o => o.id === draggedItemId);
        if (opp && opp.stage !== targetStage) {
            onUpdateOpportunity({ ...opp, stage: targetStage });
        }
        setDraggedItemId(null);
    };
    
    const handleSave = (opp: Omit<Opportunity, 'id'>) => {
        onAddOpportunity(opp);
        showToast('فرصت جدید با موفقیت ایجاد شد.');
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500;transition:all .2s}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">خط لوله فروش (فرصت‌ها)</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2"><IconPlusCircle className="w-5 h-5"/> ایجاد فرصت</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4"><IconChartPie className="w-8 h-8 text-primary"/><p>ارزش خط لوله باز: <span className="font-bold text-lg">{pipelineStats.totalPipeline.toLocaleString('fa-IR')}</span></p></div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4"><IconTarget className="w-8 h-8 text-green-500"/><p>نرخ تبدیل: <span className="font-bold text-lg">{pipelineStats.conversionRate.toFixed(1)}%</span></p></div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex items-center gap-4"><IconCheckCircle className="w-8 h-8 text-blue-500"/><p>فرصت‌های باز: <span className="font-bold text-lg">{opportunities.filter(o=>o.stage !== 'موفق' && o.stage !== 'ناموفق').length}</span></p></div>
            </div>

            <div className="w-full overflow-x-auto pb-4">
                <div className="flex gap-4 min-w-max">
                    {KANBAN_STAGES.map(stage => (
                        <div key={stage} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, stage)} className="w-80 bg-gray-100 dark:bg-gray-900 rounded-lg p-3 flex-shrink-0">
                            <h3 className={`font-semibold mb-3 border-b-2 pb-2 ${stageColors[stage].border}`}>{stage} <span className="text-sm text-gray-500">({opportunitiesByStage[stage].length})</span></h3>
                            <div className="space-y-3 h-[calc(100vh-27rem)] overflow-y-auto pr-1">
                                {opportunitiesByStage[stage].map(opp => (
                                    <OpportunityCard key={opp.id} opp={opp} onDragStart={handleDragStart} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <OpportunityFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} parties={parties} />
        </div>
    );
};
