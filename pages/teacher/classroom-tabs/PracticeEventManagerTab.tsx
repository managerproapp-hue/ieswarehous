import React, { useState } from 'react';
import { Classroom, Event, EventStatus } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import EventFormModal from '../../../components/EventFormModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { EditIcon, TrashIcon } from '../../../components/icons';

interface PracticeEventManagerTabProps {
    classroom: Classroom;
}

const statusStyles: Record<EventStatus, string> = {
    [EventStatus.INACTIVE]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    [EventStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [EventStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [EventStatus.CLOSED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const PracticeEventManagerTab: React.FC<PracticeEventManagerTabProps> = ({ classroom }) => {
    const { updateClassroomContent } = useData();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

    const handleSave = (eventData: Event | Omit<Event, 'id'>) => {
        let updatedEvents;
        if ('id' in eventData) {
            updatedEvents = classroom.events.map(e => e.id === eventData.id ? eventData : e);
        } else {
            const newEvent = { ...eventData, id: `sb-event-${Date.now()}` };
            updatedEvents = [...classroom.events, newEvent];
        }
        updateClassroomContent(classroom.id, 'events', updatedEvents);
    };

    const handleDelete = () => {
        if (eventToDelete) {
            const updatedEvents = classroom.events.filter(e => e.id !== eventToDelete.id);
            updateClassroomContent(classroom.id, 'events', updatedEvents);
            setDeleteModalOpen(false);
            setEventToDelete(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-gray-600 dark:text-gray-400">Define las ventanas de tiempo en las que los alumnos podrán realizar sus pedidos simulados.</p>
                <button onClick={() => { setEventToEdit(null); setFormModalOpen(true); }} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    Crear Práctica
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="th-style">Nombre de la Práctica</th>
                            <th className="th-style">Fechas</th>
                            <th className="th-style">Estado</th>
                            <th className="th-style"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {classroom.events.map(event => (
                            <tr key={event.id} className="border-t dark:border-gray-700">
                                <td className="p-3 font-medium">{event.name}</td>
                                <td className="p-3 text-sm">{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</td>
                                <td className="p-3"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[event.status]}`}>{event.status}</span></td>
                                <td className="p-3 text-right">
                                    <button onClick={() => { setEventToEdit(event); setFormModalOpen(true); }} className="btn-action"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => { setEventToDelete(event); setDeleteModalOpen(true); }} className="btn-action-danger"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <EventFormModal isOpen={isFormModalOpen} onClose={() => setFormModalOpen(false)} onSave={handleSave} eventToEdit={eventToEdit} />
            
            {eventToDelete && (
                <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete} title={`Eliminar Práctica: ${eventToDelete.name}`} confirmationText="ELIMINAR">
                    <p>Esta acción es irreversible.</p>
                </ConfirmationModal>
            )}

            <style>{`.th-style{padding:0.75rem;text-align:left;font-size:0.75rem;}.btn-action{padding:0.5rem;}.btn-action-danger{padding:0.5rem;color:#DC2626;}`}</style>
        </div>
    );
};

export default PracticeEventManagerTab;