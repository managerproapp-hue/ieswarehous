import React, { useState, useEffect, FormEvent } from 'react';
import { Service } from '../types';
import { useData } from '../contexts/DataContext';
import Modal from './Modal';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service | Omit<Service, 'id'>) => void;
  serviceToEdit?: Service | null;
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ isOpen, onClose, onSave, serviceToEdit }) => {
    const { serviceGroups } = useData();
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [serviceGroupId, setServiceGroupId] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (serviceToEdit) {
                setName(serviceToEdit.name);
                setDate(serviceToEdit.date.slice(0, 16)); // Format for datetime-local
                setServiceGroupId(serviceToEdit.serviceGroupId);
            } else {
                setName('');
                setDate('');
                setServiceGroupId('');
            }
        }
    }, [serviceToEdit, isOpen]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const serviceData = { 
            name, 
            date: new Date(date).toISOString(), 
            serviceGroupId,
            // Default empty values for teacher-managed fields
            menu: serviceToEdit?.menu || [],
            roleAssignments: serviceToEdit?.roleAssignments || {},
        };

        if (serviceToEdit) {
            onSave({ ...serviceToEdit, ...serviceData });
        } else {
            onSave(serviceData as Omit<Service, 'id'>);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={serviceToEdit ? 'Editar Servicio' : 'Programar Servicio'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label-style">Nombre del Servicio</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
                </div>
                 <div>
                    <label className="label-style">Fecha y Hora</label>
                    <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required className="input-style" />
                </div>
                 <div>
                    <label className="label-style">Asignar Grupo</label>
                    <select value={serviceGroupId} onChange={e => setServiceGroupId(e.target.value)} required className="input-style">
                        <option value="">-- Seleccionar Grupo --</option>
                        {serviceGroups.map(group => (
                            <option key={group.id} value={group.id}>{group.name}</option>
                        ))}
                    </select>
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

export default ServiceFormModal;
