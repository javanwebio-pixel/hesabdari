import React, { useState, useMemo } from 'react';
import type { WorkCenter, Routing, Good, RoutingOperation } from '../../types';
import { IconPlusCircle, IconTrash, IconEdit } from '../Icons';
import { Modal } from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

// --- Work Center Components ---
const WCForm: React.FC<{ onSave: (wc: WorkCenter) => void, onCancel: () => void, initialData?: WorkCenter | null }> = ({ onSave, onCancel, initialData }) => {
    const [formData, setFormData] = useState({ code: initialData?.code || '', name: initialData?.name || '', capacity: initialData?.capacity || 8 });
    const handleSubmit = () => onSave({ ...initialData, id: initialData?.id || uuidv4(), ...formData });
    return (
        <div className="space-y-4">
            <div><label className="label-form">کد</label><input type="text" value={formData.code} onChange={e => setFormData(f => ({...f, code: e.target.value}))} className="input-field"/></div>
            <div><label className="label-form">نام</label><input type="text" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} className="input-field"/></div>
            <div><label className="label-form">ظرفیت (ساعت/روز)</label><input type="number" value={formData.capacity} onChange={e => setFormData(f => ({...f, capacity: Number(e.target.value)}))} className="input-field"/></div>
            <div className="flex justify-end gap-2 pt-4"><button onClick={onCancel} className="btn-secondary">لغو</button><button onClick={handleSubmit} className="btn-primary">ذخیره</button></div>
        </div>
    );
};

// --- Routing Components ---
const RoutingOperationForm: React.FC<{ onSave: (op: RoutingOperation) => void, onCancel: () => void, initialData?: RoutingOperation | null, workCenters: WorkCenter[] }> = ({ onSave, onCancel, initialData, workCenters }) => {
    const [formData, setFormData] = useState({
        operationNumber: initialData?.operationNumber || 10,
        description: initialData?.description || '',
        workCenterId: initialData?.workCenterId || '',
        setupTime: initialData?.setupTime || 0,
        runTime: initialData?.runTime || 0,
    });
    const handleSubmit = () => onSave({ ...initialData, id: initialData?.id || uuidv4(), ...formData });
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label-form">شماره عملیات</label><input type="number" step="10" value={formData.operationNumber} onChange={e => setFormData(f => ({...f, operationNumber: Number(e.target.value)}))} className="input-field"/></div>
                <div><label className="label-form">مرکز کاری</label><select value={formData.workCenterId} onChange={e => setFormData(f => ({...f, workCenterId: e.target.value}))} className="input-field"><option value="">انتخاب...</option>{workCenters.map(wc => <option key={wc.id} value={wc.id}>{wc.name}</option>)}</select></div>
            </div>
            <div><label className="label-form">شرح عملیات</label><input type="text" value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} className="input-field"/></div>
            <div className="grid grid-cols-2 gap-4">
                <div><label className="label-form">زمان آماده‌سازی (دقیقه)</label><input type="number" value={formData.setupTime} onChange={e => setFormData(f => ({...f, setupTime: Number(e.target.value)}))} className="input-field"/></div>
                <div><label className="label-form">زمان اجرا (دقیقه/واحد)</label><input type="number" value={formData.runTime} onChange={e => setFormData(f => ({...f, runTime: Number(e.target.value)}))} className="input-field"/></div>
            </div>
            <div className="flex justify-end gap-2 pt-4"><button onClick={onCancel} className="btn-secondary">لغو</button><button onClick={handleSubmit} className="btn-primary">ذخیره</button></div>
        </div>
    );
};

interface WorkCenterPageProps {
    workCenters: WorkCenter[];
    routings: Routing[];
    goods: Good[];
    onSaveWorkCenter: (wc: WorkCenter) => void;
    onSaveRouting: (routing: Routing) => void;
}

export const WorkCenterPage: React.FC<WorkCenterPageProps> = ({ workCenters, routings, goods, onSaveWorkCenter, onSaveRouting }) => {
    const [activeTab, setActiveTab] = useState<'wcs' | 'routings'>('wcs');
    const [isWCModalOpen, setIsWCModalOpen] = useState(false);
    const [editingWC, setEditingWC] = useState<WorkCenter | null>(null);
    const [isOpModalOpen, setIsOpModalOpen] = useState(false);
    const [editingOp, setEditingOp] = useState<RoutingOperation | null>(null);
    const [selectedGoodId, setSelectedGoodId] = useState<string | null>(null);
    
    const finishedGoods = useMemo(() => goods.filter(g => g.type === 'Finished Good'), [goods]);
    const selectedRouting = useMemo(() => routings.find(r => r.goodId === selectedGoodId), [routings, selectedGoodId]);

    const handleSaveOperation = (op: RoutingOperation) => {
        let routing = selectedRouting;
        if (!routing && selectedGoodId) {
            routing = { id: uuidv4(), goodId: selectedGoodId, goodName: goods.find(g=>g.id===selectedGoodId)?.name || '', operations: [] };
        }
        if (!routing) return;

        const newOps = editingOp 
            ? routing.operations.map(o => o.id === op.id ? op : o)
            : [...routing.operations, op];
        onSaveRouting({...routing, operations: newOps.sort((a,b) => a.operationNumber - b.operationNumber)});
        setIsOpModalOpen(false);
        setEditingOp(null);
    }

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مراکز کاری و مسیرهای تولید</h1>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="flex border-b dark:border-gray-700">
                    <button onClick={() => setActiveTab('wcs')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'wcs' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>مراکز کاری (Work Centers)</button>
                    <button onClick={() => setActiveTab('routings')} className={`px-4 py-2 text-sm font-semibold ${activeTab === 'routings' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}>مسیرهای تولید (Routings)</button>
                </div>
                <div className="p-6">
                    {activeTab === 'wcs' && (
                        <div>
                            <div className="flex justify-end mb-4"><button onClick={() => { setEditingWC(null); setIsWCModalOpen(true); }} className="btn-primary flex items-center gap-2 text-sm"><IconPlusCircle className="w-4 h-4"/> مرکز کاری جدید</button></div>
                            <table className="w-full text-sm"><thead><tr><th className="p-2 text-right">کد</th><th className="p-2 text-right">نام</th><th className="p-2 text-right">ظرفیت (ساعت)</th><th className="p-2"></th></tr></thead><tbody>
                                {workCenters.map(wc => <tr key={wc.id} className="border-t dark:border-gray-700"><td className="p-2">{wc.code}</td><td className="p-2">{wc.name}</td><td className="p-2">{wc.capacity}</td><td className="p-2 text-left"><button onClick={() => { setEditingWC(wc); setIsWCModalOpen(true); }} className="text-blue-500 p-1"><IconEdit/></button></td></tr>)}
                            </tbody></table>
                        </div>
                    )}
                    {activeTab === 'routings' && (
                        <div className="grid grid-cols-3 gap-4">
                            <div><h3 className="font-semibold mb-2">محصولات</h3><ul className="space-y-1">{finishedGoods.map(g => <li key={g.id}><button onClick={() => setSelectedGoodId(g.id)} className={`w-full text-right p-2 rounded-md text-sm ${selectedGoodId === g.id ? 'bg-primary-50 text-primary' : ''}`}>{g.name}</button></li>)}</ul></div>
                            <div className="col-span-2">
                                {selectedGoodId && (
                                    <div>
                                        <div className="flex justify-between items-center mb-4"><h3 className="font-semibold">عملیات برای: {goods.find(g=>g.id===selectedGoodId)?.name}</h3><button onClick={() => { setEditingOp(null); setIsOpModalOpen(true); }} className="btn-primary flex items-center gap-2 text-sm"><IconPlusCircle/> عملیات جدید</button></div>
                                        <table className="w-full text-sm"><thead><tr><th className="p-2 text-right">#</th><th className="p-2 text-right">شرح</th><th className="p-2 text-right">مرکز کاری</th><th className="p-2"></th></tr></thead><tbody>
                                            {selectedRouting?.operations.map(op => <tr key={op.id} className="border-t"><td className="p-2">{op.operationNumber}</td><td className="p-2">{op.description}</td><td className="p-2">{workCenters.find(wc=>wc.id === op.workCenterId)?.name}</td><td className="p-2 text-left"><button onClick={() => { setEditingOp(op); setIsOpModalOpen(true); }} className="text-blue-500 p-1"><IconEdit/></button></td></tr>)}
                                        </tbody></table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isWCModalOpen && <Modal isOpen={isWCModalOpen} onClose={() => setIsWCModalOpen(false)} title={editingWC ? 'ویرایش مرکز کاری' : 'مرکز کاری جدید'}><WCForm onSave={onSaveWorkCenter} onCancel={() => setIsWCModalOpen(false)} initialData={editingWC}/></Modal>}
            {isOpModalOpen && <Modal isOpen={isOpModalOpen} onClose={() => setIsOpModalOpen(false)} title={editingOp ? 'ویرایش عملیات' : 'عملیات جدید'}><RoutingOperationForm onSave={handleSaveOperation} onCancel={() => setIsOpModalOpen(false)} initialData={editingOp} workCenters={workCenters}/></Modal>}
        </div>
    );
};
