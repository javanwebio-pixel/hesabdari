
import React, { useState, useMemo, useCallback } from 'react';
import type { User, Role, ToastData } from '../../types';
import { IconPlusCircle, IconSearch, IconEdit, IconTrash } from '../Icons';
import { Modal } from '../common/Modal';
import { v4 as uuidv4 } from 'uuid';

const UserFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: User | Omit<User, 'id'>) => void;
    roles: Role[];
    initialData?: User | null;
}> = ({ isOpen, onClose, onSave, roles, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        username: initialData?.username || '',
        fullName: initialData?.fullName || '',
        roleId: initialData?.roleId || '',
        status: initialData?.status || 'فعال',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple validation
        if (!formData.username || !formData.fullName || !formData.roleId) return;

        const userData = {
            ...formData,
            avatarUrl: initialData?.avatarUrl || `https://picsum.photos/id/${Math.floor(Math.random()*200)}/100/100`,
        };
        
        if (isEditing && initialData) {
            onSave({ ...initialData, ...userData });
        } else {
            onSave(userData as Omit<User, 'id'>);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "ویرایش کاربر" : "ایجاد کاربر جدید"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label-form">نام کاربری</label>
                        <input type="text" value={formData.username} onChange={e => setFormData(f => ({...f, username: e.target.value}))} required className="input-field" disabled={isEditing}/>
                    </div>
                    <div>
                        <label className="label-form">نام کامل</label>
                        <input type="text" value={formData.fullName} onChange={e => setFormData(f => ({...f, fullName: e.target.value}))} required className="input-field"/>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label-form">نقش</label>
                        <select value={formData.roleId} onChange={e => setFormData(f => ({...f, roleId: e.target.value}))} required className="input-field">
                            <option value="" disabled>انتخاب نقش...</option>
                            {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="label-form">وضعیت</label>
                        <select value={formData.status} onChange={e => setFormData(f => ({...f, status: e.target.value as User['status']}))} required className="input-field">
                            <option value="فعال">فعال</option>
                            <option value="غیرفعال">غیرفعال</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="btn-secondary">لغو</button>
                    <button type="submit" className="btn-primary">ذخیره</button>
                </div>
            </form>
        </Modal>
    );
};

interface UsersPageProps {
    users: User[];
    roles: Role[];
    onSaveUser: (user: User | Omit<User, 'id'>) => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ users, roles, onSaveUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    const rolesMap = useMemo(() => new Map(roles.map(r => [r.id, r.name])), [roles]);

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <style>{`.label-form{display:block;font-size:.875rem;font-weight:500;color:#374151;margin-bottom:.25rem}.dark .label-form{color:#D1D5DB}.input-field{padding:.5rem .75rem;border-radius:.5rem;background-color:#F9FAFB;border:1px solid #E5E7EB;width:100%}.dark .input-field{background-color:#374151;border-color:#4B5563}.input-field:focus{outline:2px solid transparent;outline-offset:2px;--tw-ring-color:hsl(262 83% 58%);box-shadow:0 0 0 2px var(--tw-ring-color)}.btn-primary{padding:.5rem 1rem;background-color:hsl(262 83% 58%);color:#fff;border-radius:.5rem;font-weight:500}.btn-secondary{padding:.5rem 1rem;background-color:#E5E7EB;color:#1F2937;border-radius:.5rem;font-weight:500}.dark .btn-secondary{background-color:#4B5563;color:#F9FAFB}`}</style>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت کاربران و دسترسی‌ها</h1>
                <button onClick={() => { setEditingUser(null); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2">
                    <IconPlusCircle className="w-5 h-5"/> کاربر جدید
                </button>
            </div>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-3">کاربر</th>
                                <th className="px-4 py-3">نقش</th>
                                <th className="px-4 py-3">وضعیت</th>
                                <th className="px-4 py-3">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b dark:border-gray-700">
                                    <td className="px-4 py-2">
                                        <div className="flex items-center gap-3">
                                            <img src={user.avatarUrl} alt={user.fullName} className="w-10 h-10 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.fullName}</p>
                                                <p className="text-xs text-gray-500">{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">{rolesMap.get(user.roleId)}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'فعال' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleEdit(user)} className="p-1 text-blue-500 hover:text-blue-700"><IconEdit className="w-5 h-5"/></button>
                                        <button className="p-1 text-danger hover:text-red-700"><IconTrash className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {isModalOpen && <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={onSaveUser} roles={roles} initialData={editingUser} />}
        </div>
    );
};
