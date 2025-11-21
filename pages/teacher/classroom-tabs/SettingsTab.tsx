import React, { useState } from 'react';
import { Classroom } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import ConfirmationModal from '../../../components/ConfirmationModal';

interface SettingsTabProps {
    classroom: Classroom;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ classroom }) => {
    const { resetClassroom } = useData();
    const [isResetModalOpen, setResetModalOpen] = useState(false);

    const handleReset = () => {
        resetClassroom(classroom.id);
        setResetModalOpen(false);
    };

    return (
        <div className="border-2 border-red-500/50 rounded-lg bg-red-50 dark:bg-red-900/20 overflow-hidden">
            <div className="h-1.5 bg-indigo-500"></div>
            <div className="p-6">
                <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Zona Peligrosa</h2>
                <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Resetear Aula</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Esta acción borrará todos los datos de esta aula (alumnos, productos, pedidos, etc.) y la devolverá a su estado inicial. Esta acción es irreversible.</p>
                    </div>
                    <button onClick={() => setResetModalOpen(true)} className="mt-4 md:mt-0 md:ml-4 flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
                        Resetear Aula
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={isResetModalOpen}
                onClose={() => setResetModalOpen(false)}
                onConfirm={handleReset}
                title={`Resetear el aula "${classroom.name}"`}
                confirmationText="RESET"
            >
                <p>Estás a punto de <strong className="text-red-600 dark:text-red-400">eliminar permanentemente</strong> todos los datos de práctica de esta aula.</p>
                <p>Es ideal para empezar una nueva unidad didáctica desde cero.</p>
            </ConfirmationModal>
        </div>
    );
};

export default SettingsTab;