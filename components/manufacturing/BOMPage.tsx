import React, { useState, useMemo } from 'react';
import type { BOM, Good, BOMItem } from '../../types';
import { IconPlusCircle, IconTrash, IconEdit, IconDeviceFloppy } from '../Icons';
import { Modal } from '../common/Modal';
import { SearchableSelector } from '../common/SearchableSelector';
import { v4 as uuidv4 } from 'uuid';

const BOMItemForm: React.FC<{
    onSave: (item: BOMItem) => void;
    onCancel: () => void;
    components: Good[];
    initialData?: BOMItem | null;
}> = ({ onSave, onCancel, components, initialData }) => {
    const isEditing = !!initialData;
    const [selectedComponent, setSelectedComponent] = useState<Good | null>(
        initialData ? components.find(c => c.id === initialData.componentId) || null : null
    );
    const [quantity, setQuantity] = useState(initialData?.quantity || 1);

    const handleSubmit = () => {
        if (!selectedComponent || quantity <= 0) return;
        onSave({
            id: initialData?.id || uuidv4(),
            componentId: selectedComponent.id,
            componentName: selectedComponent.name,
            quantity: quantity,
        });
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="label-form">جزء محصول (ماده اولیه)</label>
                <SearchableSelector 
                    items={components}
                    onSelect={item => setSelectedComponent(item as Good | null)}
                    placeholder="جستجوی ماده اولیه..."
                    value={selectedComponent}
                />
            </div>
             <div>
                <label className="label-form">تعداد</label>
                <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="input-field" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onCancel} className="btn-secondary">لغو</button>
                <button type="button" onClick={handleSubmit} className="btn-primary">ذخیره</button>
            </div>
        </div>
    );
};

interface BOMPageProps {
    boms: BOM[];
    goods: Good[];
    onSaveBOM: (bom: BOM) => void;
}

export const BOMPage: React.FC<BOMPageProps> = ({ boms, goods, onSaveBOM }) => {
    const [selectedGoodId, setSelectedGoodId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<BOMItem | null>(null);

    const finishedGoods = useMemo(() => goods.filter(g => g.type === 'Finished Good'), [goods]);
    const components = useMemo(() => goods.filter(g => g.type === 'Raw Material'), [goods]);

    const selectedBOM = useMemo(() => {
        if (!selectedGoodId) return null;
        return boms.find(b => b.goodId === selectedGoodId);
    }, [boms, selectedGoodId]);

    const handleSaveItem = (item: BOMItem) => {
        if (!selectedGoodId) return;

        let bomToUpdate = selectedBOM;
        if (!bomToUpdate) {
             bomToUpdate = {
                id: uuidv4(),
                goodId: selectedGoodId,
                goodName: goods.find(g => g.id === selectedGoodId)?.name || '',
                items: [],
            };
        }
        
        const existingItem = bomToUpdate.items.find(i => i.id === item.id);
        let newItems;
        if (existingItem) {
            newItems = bomToUpdate.items.map(i => i.id === item.id ? item : i);
        } else {
            newItems = [...bomToUpdate.items, item];
        }
        onSaveBOM({ ...bomToUpdate, items: newItems });
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleDeleteItem = (itemId: string) => {
        if (!selectedBOM) return;
        const newItems = selectedBOM.items.filter(i => i.id !== itemId);
        onSaveBOM({ ...selectedBOM, items: newItems });
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">فرمول ساخت محصول (BOM)</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
                <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col">
                    <h3 className="font-semibold mb-2">محصولات نهایی</h3>
                    <ul className="space-y-1 overflow-y-auto">
                        {finishedGoods.map(g => (
                            <li key={g.id}>
                                <button
                                    onClick={() => setSelectedGoodId(g.id)}
                                    className={`w-full text-right p-2 rounded-md text-sm ${selectedGoodId === g.id ? 'bg-primary-50 text-primary dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                                >
                                    {g.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    {selectedGoodId ? (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">فرمول ساخت: {goods.find(g=>g.id === selectedGoodId)?.name}</h2>
                                <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 text-sm"><IconPlusCircle className="w-4 h-4" /> افزودن جزء</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr>
                                            <th className="text-right p-2">جزء محصول</th>
                                            <th className="text-right p-2">تعداد</th>
                                            <th className="text-right p-2">واحد</th>
                                            <th className="p-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedBOM?.items.map(item => {
                                            const componentGood = goods.find(g => g.id === item.componentId);
                                            return (
                                                <tr key={item.id} className="border-t dark:border-gray-700">
                                                    <td className="p-2">{item.componentName}</td>
                                                    <td className="p-2">{item.quantity}</td>
                                                    <td className="p-2">{componentGood?.unit}</td>
                                                    <td className="p-2 text-left">
                                                        <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="text-blue-500 p-1"><IconEdit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteItem(item.id)} className="text-danger p-1"><IconTrash className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">یک محصول را برای مشاهده فرمول ساخت آن انتخاب کنید.</div>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'ویرایش جزء محصول' : 'افزودن جزء محصول'}>
                    <BOMItemForm onSave={handleSaveItem} onCancel={() => setIsModalOpen(false)} components={components} initialData={editingItem} />
                </Modal>
            )}
        </div>
    );
};
