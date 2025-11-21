import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Classroom, Role } from '../../types';
import { EditIcon, TrashIcon } from '../../components/icons';
import ClassroomFormModal from '../../components/ClassroomFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const ClassroomManager: React.FC = () => {
    const { classrooms, users, addClassroom, updateClassroom, deleteClassroom } = useData();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [classroomToEdit, setClassroomToEdit] = useState<Classroom | null>(null);
    const [classroomToDelete, setClassroomToDelete] = useState<Classroom | null>(null);

    const teachers = useMemo(() => users.filter(u => u.roles.includes(Role.TEACHER)), [users]);
    const teacherMap = useMemo(() => new Map(teachers.map(t => [t.id, t.name])), [teachers]);

    const openCreateModal = () => {
        setClassroomToEdit(null);
        setFormModalOpen(true);
    };

    const openEditModal = (classroom: Classroom) => {
        setClassroomToEdit(classroom);
        setFormModalOpen(true);
    };

    const openDeleteModal = (classroom: Classroom) => {
        setClassroomToDelete(classroom);
        setDeleteModalOpen(true);
    };

    const handleSave = (data: Omit<Classroom, 'id' | 'students' | 'products' | 'suppliers' | 'events' | 'orders' | 'orderItems' | 'recipes' | 'families' | 'categories' | 'productStates'>) => {
        if (classroomToEdit) {
            updateClassroom({ ...classroomToEdit, ...data });
        } else {
            addClassroom(data);
        }
    };

    const handleDelete = () => {
        if (classroomToDelete) {
            deleteClassroom(classroomToDelete.id);
            setDeleteModalOpen(false);
            setClassroomToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Aulas de Práctica</h1>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 text-white font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700"
                >
                    Crear Aula
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="th-style">Nombre del Aula</th>
                            <th className="th-style">Tutor Asignado</th>
                            <th className="th-style">Nº Alumnos</th>
                            <th className="th-style">Estado</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {classrooms.map(c => (
                            <tr key={c.id}>
                                <td className="px-6 py-4 font-medium">{c.name}</td>
                                <td className="px-6 py-4">{teacherMap.get(c.tutorId) || 'Sin asignar'}</td>
                                <td className="px-6 py-4">{c.students.length}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.status === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => openEditModal(c)} className="btn-action"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => openDeleteModal(c)} className="btn-action-danger"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
            </div>

            <ClassroomFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSave={handleSave}
                classroomToEdit={classroomToEdit}
                teachers={teachers}
            />

            {classroomToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title={`Eliminar Aula: ${classroomToDelete.name}`}
                    confirmationText="ELIMINAR AULA"
                >
                    <p>Esta acción es irreversible y eliminará el aula y todos sus datos de práctica (alumnos, catálogos, pedidos, etc.).</p>
                </ConfirmationModal>
            )}
             <style>{`
                .th-style { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; }
                .btn-action { padding: 0.5rem; color: #4B5563; } .dark .btn-action { color: #9CA3AF; }
                .btn-action-danger { padding: 0.5rem; color: #DC2626; } .dark .btn-action-danger { color: #F87171; }
            `}</style>
        </div>
    );
};

export default ClassroomManager;