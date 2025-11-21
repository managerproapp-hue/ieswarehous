import React, { useState, useEffect, FormEvent } from 'react';
import { Classroom, User } from '../types';
import Modal from './Modal';

interface ClassroomFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string, tutorId: string, status: 'Activa' | 'Inactiva'}) => void;
  classroomToEdit?: Classroom | null;
  teachers: User[];
}

const ClassroomFormModal: React.FC<ClassroomFormModalProps> = ({ isOpen, onClose, onSave, classroomToEdit, teachers }) => {
    const [name, setName] = useState('');
    const [tutorId, setTutorId] = useState('');
    const [status, setStatus] = useState<'Activa' | 'Inactiva'>('Activa');

    useEffect(() => {
        if (isOpen) {
            if (classroomToEdit) {
                setName(classroomToEdit.name);
                setTutorId(classroomToEdit.tutorId);
                setStatus(classroomToEdit.status);
            } else {
                setName('');
                setTutorId('');
                setStatus('Activa');
            }
        }
    }, [classroomToEdit, isOpen]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({ name, tutorId, status });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={classroomToEdit ? 'Editar Aula' : 'Nueva Aula de Práctica'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label-style">Nombre del Aula</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
                </div>
                <div>
                    <label className="label-style">Tutor Asignado</label>
                    <select value={tutorId} onChange={e => setTutorId(e.target.value)} required className="input-style">
                        <option value="">-- Seleccionar Tutor --</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="label-style">Estado</label>
                    <select value={status} onChange={e => setStatus(e.target.value as 'Activa' | 'Inactiva')} required className="input-style">
                        <option value="Activa">Activa</option>
                        <option value="Inactiva">Inactiva</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
             <style>{`
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; }
                .input-style { display: block; width: 100%; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } 
                .btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; }
                .btn-secondary { padding: 0.5rem 1rem; font-weight: 500; background-color: #F3F4F6; border-radius: 0.375rem; }
            `}</style>
        </Modal>
    );
};

export default ClassroomFormModal;
