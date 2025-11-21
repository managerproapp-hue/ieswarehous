import React, { useState, useEffect, FormEvent } from 'react';
import { PracticeStudent, SimulatedRole } from '../types';
import Modal from './Modal';

interface PracticeStudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Omit<PracticeStudent, 'id' | 'roles' | 'avatar'>) => void;
  studentToEdit?: PracticeStudent | null;
}

const PracticeStudentFormModal: React.FC<PracticeStudentFormModalProps> = ({ isOpen, onClose, onSave, studentToEdit }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [simulatedRole, setSimulatedRole] = useState<SimulatedRole>(SimulatedRole.KITCHEN_PROFESSIONAL);

    useEffect(() => {
        if (isOpen) {
            if (studentToEdit) {
                setName(studentToEdit.name);
                setEmail(studentToEdit.email);
                setSimulatedRole(studentToEdit.simulatedRole);
                setPassword('');
            } else {
                setName('');
                setEmail('');
                setPassword('');
                setSimulatedRole(SimulatedRole.KITCHEN_PROFESSIONAL);
            }
        }
    }, [studentToEdit, isOpen]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({ name, email, password, simulatedRole });
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={studentToEdit ? 'Editar Alumno de Práctica' : 'Nuevo Alumno de Práctica'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label-style">Nombre</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="input-style" />
                </div>
                 <div>
                    <label className="label-style">Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="input-style" />
                </div>
                 <div>
                    <label className="label-style">Contraseña</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!studentToEdit} placeholder={studentToEdit ? "Dejar en blanco para no cambiar" : ""} className="input-style" />
                </div>
                 <div>
                    <label className="label-style">Rol Simulado</label>
                    <select value={simulatedRole} onChange={e => setSimulatedRole(e.target.value as SimulatedRole)} className="input-style">
                        <option value={SimulatedRole.KITCHEN_PROFESSIONAL}>Profesional de Cocina</option>
                        <option value={SimulatedRole.WAREHOUSE}>Almacén</option>
                    </select>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
            <style>{`.label-style{display:block;margin-bottom:0.25rem}.input-style{display:block;width:100%;border-radius:0.375rem;padding:0.5rem 0.75rem}.btn-primary{padding:0.5rem 1rem;color:white;background-color:#4F46E5}.btn-secondary{padding:0.5rem 1rem;}`}</style>
        </Modal>
    );
};

export default PracticeStudentFormModal;
