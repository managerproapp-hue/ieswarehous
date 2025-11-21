import React, { useState, useEffect, FormEvent } from 'react';
import { ServiceGroup, Role } from '../types';
import { useData } from '../contexts/DataContext';
import Modal from './Modal';

interface ServiceGroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: ServiceGroup | Omit<ServiceGroup, 'id'>) => void;
  groupToEdit?: ServiceGroup | null;
}

const ServiceGroupFormModal: React.FC<ServiceGroupFormModalProps> = ({ isOpen, onClose, onSave, groupToEdit }) => {
    const { users } = useData();
    const [name, setName] = useState('');
    const [memberIds, setMemberIds] = useState<string[]>([]);

    const teachers = users.filter(u => u.roles.includes(Role.TEACHER));

    useEffect(() => {
        if (isOpen) {
            if (groupToEdit) {
                setName(groupToEdit.name);
                setMemberIds(groupToEdit.memberIds);
            } else {
                setName('');
                setMemberIds([]);
            }
        }
    }, [groupToEdit, isOpen]);
    
    const handleMemberToggle = (teacherId: string) => {
        setMemberIds(prev =>
            prev.includes(teacherId)
                ? prev.filter(id => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const groupData = { name, memberIds };
        if (groupToEdit) {
            onSave({ ...groupToEdit, ...groupData });
        } else {
            onSave(groupData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={groupToEdit ? 'Editar Grupo de Servicio' : 'Nuevo Grupo de Servicio'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label-style">Nombre del Grupo</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
                </div>
                <div>
                    <label className="label-style">Asignar Profesores</label>
                    <div className="mt-2 flex flex-wrap gap-2 border dark:border-gray-600 p-2 rounded-md min-h-[40px]">
                        {teachers.map(teacher => {
                            const isSelected = memberIds.includes(teacher.id);
                            return (
                                <button
                                    type="button"
                                    key={teacher.id}
                                    onClick={() => handleMemberToggle(teacher.id)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-indigo-600 text-white shadow-md'
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                                    }`}
                                >
                                    {teacher.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
            <style>{`
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
                .dark .label-style { color: #D1D5DB; }
                .input-style { display: block; width: 100%; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } 
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; }
                .btn-secondary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border-radius: 0.375rem; }
                .dark .btn-secondary { background-color: #4B5563; color: #D1D5DB; }
            `}</style>
        </Modal>
    );
};

export default ServiceGroupFormModal;
