import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { UsersIcon } from '../../components/icons';

const ClassroomList: React.FC = () => {
    const { currentUser } = useAuth();
    const { classrooms } = useData();
    const navigate = useNavigate();

    const myClassrooms = useMemo(() => {
        if (!currentUser) return [];
        return classrooms.filter(c => c.tutorId === currentUser.id);
    }, [classrooms, currentUser]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mis Aulas de Práctica</h1>

            {myClassrooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myClassrooms.map(c => (
                        <div key={c.id} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden flex flex-col">
                            <div className="h-1.5 bg-indigo-500"></div>
                            <div className="p-5 flex-grow">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{c.name}</h3>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <UsersIcon className="w-4 h-4" />
                                    <span>{c.students.length} alumnos</span>
                                </div>
                                 <span className={`mt-2 text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full ${c.status === 'Activa' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {c.status}
                                </span>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-4">
                                <button
                                    onClick={() => navigate(`/teacher/classroom/${c.id}`)}
                                    className="w-full px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                                >
                                    Gestionar Aula
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No tienes ninguna aula de práctica asignada.</p>
                </div>
            )}
        </div>
    );
};

export default ClassroomList;