import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Role, Cycle, Module, Group, Assignment, User } from '../../types';
import { EditIcon, TrashIcon } from '../../components/icons';
import AcademicFormModal from '../../components/AcademicFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';

type ModalState =
  | { type: 'create-cycle' }
  | { type: 'edit-cycle', cycle: Cycle }
  | { type: 'create-module', cycleId: string }
  | { type: 'edit-module', module: Module }
  | { type: 'create-group', moduleId: string }
  | { type: 'edit-group', group: Group }
  | null;

type DeleteState =
  | { type: 'cycle', cycle: Cycle }
  | { type: 'module', module: Module }
  | { type: 'group', group: Group }
  | null;

const AcademicManagement: React.FC = () => {
    const { 
        users, cycles, modules, groups, assignments, 
        addCycle, updateCycle, deleteCycle, 
        addModule, updateModule, deleteModule, 
        addGroup, updateGroup, deleteGroup,
        assignTeacher
    } = useData();

    const [modalState, setModalState] = useState<ModalState>(null);
    const [deleteState, setDeleteState] = useState<DeleteState>(null);
    
    const teachers = useMemo(() => users.filter(u => u.roles.includes(Role.TEACHER)), [users]);
    const assignmentsMap = useMemo(() => {
        const map = new Map<string, Assignment>();
        assignments.forEach(a => map.set(a.groupId, a));
        return map;
    }, [assignments]);
    const teachersMap = useMemo(() => {
        const map = new Map<string, User>();
        teachers.forEach(t => map.set(t.id, t));
        return map;
    }, [teachers]);

    const handleSave = (data: any) => {
        if (!modalState) return;
        switch (modalState.type) {
            case 'create-cycle':
                addCycle({ name: data.name });
                break;
            case 'edit-cycle':
                updateCycle({ ...modalState.cycle, name: data.name });
                break;
            case 'create-module':
                addModule({ name: data.name, course: data.course, cycleId: modalState.cycleId });
                break;
            case 'edit-module':
                updateModule({ ...modalState.module, name: data.name, course: data.course });
                break;
            case 'create-group':
                addGroup({ name: data.name, shift: data.shift, moduleId: modalState.moduleId });
                break;
            case 'edit-group':
                updateGroup({ ...modalState.group, name: data.name, shift: data.shift });
                break;
        }
        setModalState(null);
    };

    const handleDelete = () => {
        if (!deleteState) return;
        switch (deleteState.type) {
            case 'cycle': deleteCycle(deleteState.cycle.id); break;
            case 'module': deleteModule(deleteState.module.id); break;
            case 'group': deleteGroup(deleteState.group.id); break;
        }
        setDeleteState(null);
    };

    const getDeleteConfirmationText = () => {
        if (!deleteState) return '';
        switch (deleteState.type) {
            case 'cycle': return `ELIMINAR CICLO`;
            case 'module': return `ELIMINAR MODULO`;
            case 'group': return `ELIMINAR GRUPO`;
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión Académica y Asignaciones</h1>
                <button
                    onClick={() => setModalState({ type: 'create-cycle' })}
                    className="px-4 py-2 text-white font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Añadir Ciclo Formativo
                </button>
            </div>
            
            <div className="space-y-4">
                {cycles.map(cycle => (
                    <div key={cycle.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                        <div className="h-1.5 bg-indigo-500"></div>
                        <div className="p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50">
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">{cycle.name}</h2>
                            <div className="flex items-center space-x-2">
                                <button onClick={() => setModalState({ type: 'edit-cycle', cycle })} className="p-1 text-gray-500 hover:text-indigo-600"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => setDeleteState({ type: 'cycle', cycle })} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5"/></button>
                                <button onClick={() => setModalState({ type: 'create-module', cycleId: cycle.id })} className="px-3 py-1 text-xs font-semibold text-white bg-indigo-500 rounded-full hover:bg-indigo-600">+ Añadir Módulo</button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            {modules.filter(m => m.cycleId === cycle.id).map(module => (
                                <div key={module.id} className="bg-gray-100 dark:bg-gray-900/50 rounded-md p-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Módulo (Curso {module.course}): {module.name}</h3>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => setModalState({ type: 'edit-module', module })} className="p-1 text-gray-500 hover:text-indigo-600"><EditIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setDeleteState({ type: 'module', module })} className="p-1 text-gray-500 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                            <button onClick={() => setModalState({ type: 'create-group', moduleId: module.id })} className="px-2 py-0.5 text-xs font-semibold text-white bg-green-600 rounded-full hover:bg-green-700">+ Añadir Grupo</button>
                                        </div>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {groups.filter(g => g.moduleId === module.id).map(group => {
                                            const assignment = assignmentsMap.get(group.id);
                                            const assignedTeacher = assignment ? teachersMap.get(assignment.professorId) : null;
                                            return (
                                                <div key={group.id} className="bg-white dark:bg-gray-800 rounded p-2 border dark:border-gray-700">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span>{group.name} ({group.shift})</span>
                                                        <div className="flex items-center space-x-1">
                                                            <button onClick={() => setModalState({ type: 'edit-group', group })} className="p-1 text-gray-400 hover:text-indigo-500"><EditIcon className="w-3 h-3"/></button>
                                                            <button onClick={() => setDeleteState({ type: 'group', group })} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-3 h-3"/></button>
                                                        </div>
                                                    </div>
                                                    <select 
                                                        value={assignedTeacher?.id || ''}
                                                        onChange={(e) => assignTeacher(group.id, e.target.value || null)}
                                                        className="mt-1 block w-full text-xs p-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                    >
                                                        <option value="">-- Sin Asignar --</option>
                                                        {teachers.map(teacher => (
                                                            <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <AcademicFormModal 
                isOpen={!!modalState}
                onClose={() => setModalState(null)}
                onSave={handleSave}
                modalState={modalState}
            />

            {deleteState && (
                <ConfirmationModal
                    isOpen={!!deleteState}
                    onClose={() => setDeleteState(null)}
                    onConfirm={handleDelete}
                    title={`Confirmar eliminación de ${deleteState.type}`}
                    confirmationText={getDeleteConfirmationText()}
                >
                    <p>Estás a punto de eliminar permanentemente <strong>{deleteState[deleteState.type].name}</strong>.</p>
                    <p className="text-red-500 font-semibold">Esta acción es irreversible y borrará todos los elementos anidados (módulos, grupos y asignaciones).</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default AcademicManagement;