import React, { useState } from 'react';
import { Classroom, PracticeStudent, Role, SimulatedRole } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { EditIcon, TrashIcon, ImpersonateIcon } from '../../../components/icons';
import PracticeStudentFormModal from '../../../components/PracticeStudentFormModal';
import ConfirmationModal from '../../../components/ConfirmationModal';

interface StudentManagerTabProps {
  classroom: Classroom;
}

const StudentManagerTab: React.FC<StudentManagerTabProps> = ({ classroom }) => {
    const { updateClassroomContent } = useData();
    const { startImpersonation } = useAuth();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<PracticeStudent | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<PracticeStudent | null>(null);

    const handleCreate = () => {
        setStudentToEdit(null);
        setFormModalOpen(true);
    };

    const handleEdit = (student: PracticeStudent) => {
        setStudentToEdit(student);
        setFormModalOpen(true);
    };

    const handleDeleteRequest = (student: PracticeStudent) => {
        setStudentToDelete(student);
        setDeleteModalOpen(true);
    };

    const handleSave = (studentData: Omit<PracticeStudent, 'id' | 'roles' | 'avatar'>) => {
        if (studentToEdit) {
            const updatedStudents = classroom.students.map(s => s.id === studentToEdit.id ? { ...studentToEdit, ...studentData } : s);
            updateClassroomContent(classroom.id, 'students', updatedStudents);
        } else {
            const newStudent: PracticeStudent = {
                ...studentData,
                id: `ps-${Date.now()}`,
                roles: [Role.STUDENT],
                avatar: `https://picsum.photos/seed/student-${Date.now()}/200`,
            };
            updateClassroomContent(classroom.id, 'students', [...classroom.students, newStudent]);
        }
    };
    
    const handleDelete = () => {
        if (studentToDelete) {
            const updatedStudents = classroom.students.filter(s => s.id !== studentToDelete.id);
            updateClassroomContent(classroom.id, 'students', updatedStudents);
            setDeleteModalOpen(false);
            setStudentToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-gray-600 dark:text-gray-400">Gestiona los perfiles de los estudiantes para esta práctica.</p>
                 <button onClick={handleCreate} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Añadir Alumno</button>
            </div>
            
             <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="th-style">Nombre</th>
                            <th className="th-style">Email</th>
                            <th className="th-style">Rol Simulado</th>
                            <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {classroom.students.map(s => (
                             <tr key={s.id}>
                                <td className="px-6 py-4 font-medium">{s.name}</td>
                                <td className="px-6 py-4">{s.email}</td>
                                <td className="px-6 py-4">{s.simulatedRole}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <button onClick={() => startImpersonation(s as any)} className="btn-action" title="Suplantar"><ImpersonateIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleEdit(s)} className="btn-action" title="Editar"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeleteRequest(s)} className="btn-action-danger" title="Eliminar"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>

             <PracticeStudentFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSave={handleSave}
                studentToEdit={studentToEdit}
             />

             {studentToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title={`Eliminar Alumno: ${studentToDelete.name}`}
                    confirmationText="ELIMINAR"
                >
                    <p>Esta acción eliminará al alumno de esta aula de práctica.</p>
                </ConfirmationModal>
            )}
            <style>{`.th-style{padding:0.75rem 1.5rem;text-align:left;font-size:0.75rem;}.btn-action{padding:0.5rem;}.btn-action-danger{padding:0.5rem;color:#DC2626;}`}</style>
        </div>
    );
};

export default StudentManagerTab;