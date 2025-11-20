
import React, { useState, useMemo } from 'react';
import type { Good } from '../../types';
import { IconDeviceFloppy } from '../Icons';

interface BarcodePrintingPageProps {
    goods: Good[];
}

export const BarcodePrintingPage: React.FC<BarcodePrintingPageProps> = ({ goods }) => {
    const [selectedGoodId, setSelectedGoodId] = useState<string>('');
    const [quantity, setQuantity] = useState(1);
    
    const selectedGood = useMemo(() => goods.find(g => g.id === selectedGoodId), [goods, selectedGoodId]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <style>{`
                .input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}
                .btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}
                @media print {
                  body * { visibility: hidden; }
                  #print-area, #print-area * { visibility: visible; }
                  #print-area { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">چاپ بارکد و لیبل</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                     <div>
                        <label className="text-sm font-medium">کالا</label>
                        <select value={selectedGoodId} onChange={e => setSelectedGoodId(e.target.value)} className="input-field mt-1">
                            <option value="">انتخاب کنید...</option>
                            {goods.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-medium">تعداد لیبل</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className="input-field mt-1"/>
                    </div>
                    <button onClick={handlePrint} disabled={!selectedGood} className="btn-primary w-full h-10 flex items-center justify-center gap-2 disabled:opacity-50">
                        <IconDeviceFloppy className="w-5 h-5"/> چاپ
                    </button>
                </div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="font-semibold mb-4">پیش‌نمایش لیبل</h3>
                    <div id="print-area">
                        <div className="grid grid-cols-2 gap-4">
                            {selectedGood && Array.from({ length: quantity }).map((_, i) => (
                                <div key={i} className="p-3 border-2 border-dashed rounded-lg text-center aspect-[2/1] flex flex-col justify-center items-center">
                                    <p className="font-bold text-lg">{selectedGood.name}</p>
                                    <p className="font-mono text-sm">{selectedGood.code}</p>
                                    {/* Barcode simulation */}
                                    <div className="h-8 w-full flex items-end gap-px mt-2">
                                        {[...Array(50)].map((_, i) => <div key={i} className="bg-black dark:bg-white" style={{width: `${Math.random()*1.5 + 0.5}px`, height: `${Math.random()*60+40}%`}}></div>)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
