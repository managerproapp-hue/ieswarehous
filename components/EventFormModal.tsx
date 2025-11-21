import React, { useState, useEffect, FormEvent } from 'react';
import { Event, EventType, EventStatus, Role } from '../types';
import { useData } from '../contexts/DataContext';
import Modal from './Modal';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event | Omit<Event, 'id'>) => void;
  eventToEdit?: Event | null;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, eventToEdit }) => {
    const { users } = useData();
    const [formData, setFormData] = useState({
        name: '',
        type: EventType.REGULAR,
        status: EventStatus.INACTIVE,
        startDate: '',
        endDate: '',
        budget: 500,
        authorizedTeacherIds: [] as string[],
    });

    const teachers = users.filter(u => u.roles.includes(Role.TEACHER));

    useEffect(() => {
        if (isOpen) {
            if (eventToEdit) {
                setFormData({
                    ...eventToEdit,
                    startDate: eventToEdit.startDate.slice(0, 10),
                    endDate: eventToEdit.endDate.slice(0, 10),
                });
            } else {
                setFormData({
                    name: '',
                    type: EventType.REGULAR,
                    status: EventStatus.INACTIVE,
                    startDate: '',
                    endDate: '',
                    budget: 500,
                    authorizedTeacherIds: [],
                });
            }
        }
    }, [eventToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'budget' ? parseFloat(value) : value }));
    };

    const handleTeacherToggle = (teacherId: string) => {
        setFormData(prev => {
            const isSelected = prev.authorizedTeacherIds.includes(teacherId);
            const newAuthorizedTeacherIds = isSelected
                ? prev.authorizedTeacherIds.filter(id => id !== teacherId)
                : [...prev.authorizedTeacherIds, teacherId];
            return { ...prev, authorizedTeacherIds: newAuthorizedTeacherIds };
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const eventData = {
            ...formData,
            startDate: new Date(formData.startDate).toISOString(),
            endDate: new Date(formData.endDate).toISOString(),
            // Ensure authorizedTeacherIds is empty for regular events
            authorizedTeacherIds: formData.type === EventType.REGULAR ? [] : formData.authorizedTeacherIds,
        };
        if (eventToEdit) {
            onSave({ ...eventToEdit, ...eventData });
        } else {
            onSave(eventData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={eventToEdit ? 'Editar Evento' : 'Crear Evento'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Nombre</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 w-full input-style" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Tipo</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full input-style">
                            <option value={EventType.REGULAR}>Regular</option>
                            <option value={EventType.EXTRAORDINARY}>Extraordinario</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Estado</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="mt-1 w-full input-style">
                            <option value={EventStatus.INACTIVE}>Inactivo</option>
                            <option value={EventStatus.SCHEDULED}>Programado</option>
                            <option value={EventStatus.ACTIVE}>Activo</option>
                            <option value={EventStatus.CLOSED}>Cerrado</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Fecha de Inicio</label>
                        <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 w-full input-style" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Fecha de Fin</label>
                        <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 w-full input-style" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium">Presupuesto (€)</label>
                    <input type="number" name="budget" value={formData.budget} onChange={handleChange} required min="0" step="0.01" className="mt-1 w-full input-style" />
                </div>
                {formData.type === EventType.EXTRAORDINARY && (
                    <div>
                        <label className="block text-sm font-medium">Profesores Autorizados</label>
                        <div className="mt-2 flex flex-wrap gap-2 border dark:border-gray-600 p-2 rounded-md min-h-[40px]">
                            {teachers.map(teacher => {
                                const isSelected = formData.authorizedTeacherIds.includes(teacher.id);
                                return (
                                    <button
                                        type="button"
                                        key={teacher.id}
                                        onClick={() => handleTeacherToggle(teacher.id)}
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
                )}
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
            <style>{`
                .input-style { background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } 
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; }
                .btn-primary:hover { background-color: #4338CA; }
                .btn-secondary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border-radius: 0.375rem; }
                .dark .btn-secondary { background-color: #4B5563; color: #D1D5DB; }
                .btn-secondary:hover { background-color: #E5E7EB; }
                .dark .btn-secondary:hover { background-color: #374151; }
            `}</style>
        </Modal>
    );
};

export default EventFormModal;