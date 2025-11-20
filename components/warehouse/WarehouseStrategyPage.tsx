
import React, { useState } from 'react';
import type { PutawayStrategy, PickingStrategy, ToastData } from '../../types';
import { IconPlusCircle, IconEdit, IconTrash } from '../Icons';
import { Modal } from '../common/Modal';

interface WarehouseStrategyPageProps {
    strategies: {
        putaway: PutawayStrategy[];
        picking: PickingStrategy[];
    };
    setStrategies: React.Dispatch<React.SetStateAction<{ putaway: PutawayStrategy[], picking: PickingStrategy[] }>>;
    showToast: (message: string, type?: ToastData['type']) => void;
}

export const WarehouseStrategyPage: React.FC<WarehouseStrategyPageProps> = ({ strategies, setStrategies, showToast }) => {
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">استراتژی‌های انبار</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Putaway Strategies */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">استراتژی‌های جانمایی (Putaway)</h2>
                        <button onClick={() => showToast('این قابلیت در نسخه نمایشی غیرفعال است', 'info')} className="btn-secondary text-xs"><IconPlusCircle className="w-4 h-4 inline-block ml-1"/> جدید</button>
                    </div>
                    <div className="space-y-2">
                        {strategies.putaway.map(s => (
                            <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{s.name}</p>
                                    <p className="text-xs text-gray-500">قانون: {s.rule}</p>
                                </div>
                                <div>
                                    <button className="p-1 text-blue-500"><IconEdit className="w-4 h-4"/></button>
                                    <button className="p-1 text-danger"><IconTrash className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Picking Strategies */}
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">استراتژی‌های برداشت (Picking)</h2>
                        <button onClick={() => showToast('این قابلیت در نسخه نمایشی غیرفعال است', 'info')} className="btn-secondary text-xs"><IconPlusCircle className="w-4 h-4 inline-block ml-1"/> جدید</button>
                    </div>
                    <div className="space-y-2">
                         {strategies.picking.map(s => (
                            <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div>
                                    <p className="font-semibold">{s.name}</p>
                                    <p className="text-xs text-gray-500">قانون: {s.rule}</p>
                                </div>
                                <div>
                                    <button className="p-1 text-blue-500"><IconEdit className="w-4 h-4"/></button>
                                    <button className="p-1 text-danger"><IconTrash className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
             <style>{`.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
        </div>
    );
};
