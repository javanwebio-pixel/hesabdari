
import React, { useState } from 'react';
import type { InspectionLot, ToastData } from '../../types';
import { IconCheckCircle, IconXCircle, IconEye } from '../Icons';
import { Modal } from '../common/Modal';

interface QualityControlPageProps {
    inspectionLots: InspectionLot[];
    setInspectionLots: React.Dispatch<React.SetStateAction<InspectionLot[]>>;
    showToast: (message: string, type?: ToastData['type']) => void;
}

const DecisionModal: React.FC<{
    lot: InspectionLot;
    onClose: () => void;
    onSave: (id: string, decision: 'پذیرفته شده' | 'رد شده') => void;
}> = ({ lot, onClose, onSave }) => {
    const [decision, setDecision] = useState<'پذیرفته شده' | 'رد شده'>('پذیرفته شده');
    return (
        <Modal isOpen={true} onClose={onClose} title={`تصمیم‌گیری برای بچ بازرسی ${lot.lotNumber}`}>
            <div className="space-y-4">
                <p>کالا: {lot.goodName} - تعداد: {lot.quantity}</p>
                <div className="flex gap-4">
                    <button onClick={() => setDecision('پذیرفته شده')} className={`w-full p-4 rounded-lg text-center font-bold border-2 ${decision === 'پذیرفته شده' ? 'border-green-500 bg-green-50' : ''}`}>پذیرفته شده</button>
                    <button onClick={() => setDecision('رد شده')} className={`w-full p-4 rounded-lg text-center font-bold border-2 ${decision === 'رد شده' ? 'border-red-500 bg-red-50' : ''}`}>رد شده</button>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                    <button onClick={onClose} className="btn-secondary">لغو</button>
                    <button onClick={() => onSave(lot.id, decision)} className="btn-primary">ثبت تصمیم</button>
                </div>
            </div>
        </Modal>
    );
};


export const QualityControlPage: React.FC<QualityControlPageProps> = ({ inspectionLots, setInspectionLots, showToast }) => {
    const [selectedLot, setSelectedLot] = useState<InspectionLot | null>(null);

    const handleSaveDecision = (id: string, decision: 'پذیرفته شده' | 'رد شده') => {
        setInspectionLots(prev => prev.map(lot => lot.id === id ? {...lot, status: 'تصمیم‌گیری شده', usageDecision: decision} : lot));
        showToast(`تصمیم استفاده برای بچ ${selectedLot?.lotNumber} ثبت شد.`);
        setSelectedLot(null);
    };
    
    return (
        <div className="space-y-6">
            <style>{`.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">میزکار کنترل کیفیت</h1>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">شماره بچ</th><th className="px-4 py-3">کالا</th>
                                <th className="px-4 py-3">تعداد</th><th className="px-4 py-3">تاریخ ایجاد</th>
                                <th className="px-4 py-3">وضعیت</th><th className="px-4 py-3">تصمیم</th><th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inspectionLots.map(lot => (
                                <tr key={lot.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-4 py-2 font-mono">{lot.lotNumber}</td>
                                    <td className="px-4 py-2 font-semibold">{lot.goodName}</td>
                                    <td className="px-4 py-2 font-mono">{lot.quantity}</td>
                                    <td className="px-4 py-2">{lot.creationDate}</td>
                                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs rounded-full ${lot.status === 'باز' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>{lot.status}</span></td>
                                    <td className="px-4 py-2">
                                        {lot.usageDecision && (
                                            <span className={`font-semibold ${lot.usageDecision === 'پذیرفته شده' ? 'text-success' : 'text-danger'}`}>{lot.usageDecision}</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        {lot.status === 'باز' && (
                                            <button onClick={() => setSelectedLot(lot)} className="p-1 text-gray-500 hover:text-primary"><IconEye className="w-5 h-5"/></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {selectedLot && <DecisionModal lot={selectedLot} onClose={() => setSelectedLot(null)} onSave={handleSaveDecision} />}
        </div>
    );
};
