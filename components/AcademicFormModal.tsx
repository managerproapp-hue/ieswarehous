import React, { useState, useEffect, FormEvent } from 'react';
import { Cycle, Module, Group } from '../types';
import Modal from './Modal';

type ModalState =
  | { type: 'create-cycle' }
  | { type: 'edit-cycle', cycle: Cycle }
  | { type: 'create-module', cycleId: string }
  | { type: 'edit-module', module: Module }
  | { type: 'create-group', moduleId: string }
  | { type: 'edit-group', group: Group }
  | null;

interface AcademicFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  modalState: ModalState;
}

const AcademicFormModal: React.FC<AcademicFormModalProps> = ({ isOpen, onClose, onSave, modalState }) => {
  const [name, setName] = useState('');
  const [course, setCourse] = useState<number>(1);
  const [shift, setShift] = useState<'Mañana' | 'Tarde'>('Mañana');

  useEffect(() => {
    if (isOpen && modalState) {
      if ('cycle' in modalState) setName(modalState.cycle.name);
      else if ('module' in modalState) {
        setName(modalState.module.name);
        setCourse(modalState.module.course);
      }
      else if ('group' in modalState) {
        setName(modalState.group.name);
        setShift(modalState.group.shift);
      }
      else {
        setName('');
        setCourse(1);
        setShift('Mañana');
      }
    }
  }, [modalState, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    let data = {};
    if (modalState?.type.includes('cycle')) data = { name };
    if (modalState?.type.includes('module')) data = { name, course };
    if (modalState?.type.includes('group')) data = { name, shift };
    onSave(data);
  };
  
  const getTitle = () => {
    if (!modalState) return '';
    if (modalState.type === 'create-cycle') return 'Nuevo Ciclo Formativo';
    if (modalState.type === 'edit-cycle') return 'Editar Ciclo Formativo';
    if (modalState.type === 'create-module') return 'Nuevo Módulo';
    if (modalState.type === 'edit-module') return 'Editar Módulo';
    if (modalState.type === 'create-group') return 'Nuevo Grupo';
    if (modalState.type === 'edit-group') return 'Editar Grupo';
    return '';
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
        
        {modalState?.type.includes('module') && (
            <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Curso</label>
                <input type="number" id="course" value={course} min="1" onChange={(e) => setCourse(parseInt(e.target.value, 10))} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
        )}

        {modalState?.type.includes('group') && (
            <div>
                <label htmlFor="shift" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Turno</label>
                <select id="shift" value={shift} onChange={(e) => setShift(e.target.value as 'Mañana' | 'Tarde')} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option>Mañana</option>
                    <option>Tarde</option>
                </select>
            </div>
        )}

        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AcademicFormModal;
