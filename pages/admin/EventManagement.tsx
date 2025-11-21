import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Event, EventStatus } from '../../types';
import { EditIcon, TrashIcon } from '../../components/icons';
import EventFormModal from '../../components/EventFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const statusStyles: Record<EventStatus, string> = {
    [EventStatus.INACTIVE]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    [EventStatus.SCHEDULED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
    [EventStatus.ACTIVE]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    [EventStatus.CLOSED]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const EventManagement: React.FC = () => {
    const { events, addEvent, updateEvent, deleteEvent } = useData();
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

    const openCreateModal = () => {
        setEventToEdit(null);
        setFormModalOpen(true);
    };

    const openEditModal = (event: Event) => {
        setEventToEdit(event);
        setFormModalOpen(true);
    };
    
    const openDeleteModal = (event: Event) => {
        setEventToDelete(event);
        setDeleteModalOpen(true);
    };

    const handleSaveEvent = (eventData: Event | Omit<Event, 'id'>) => {
        if ('id' in eventData) {
            updateEvent(eventData);
        } else {
            addEvent(eventData);
        }
    };
    
    const handleDelete = () => {
        if (eventToDelete) {
            deleteEvent(eventToDelete.id);
            setDeleteModalOpen(false);
            setEventToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Eventos de Pedido</h1>
                <button
                    onClick={openCreateModal}
                    className="px-4 py-2 text-white font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Crear Evento
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre del Evento</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fechas</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Presupuesto</th>
                                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {events.sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map((event) => (
                                <tr key={event.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{event.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[event.status]}`}>
                                            {event.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{event.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{event.budget.toFixed(2)}€</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-3">
                                            <button onClick={() => openEditModal(event)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300" title="Editar"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => openDeleteModal(event)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Eliminar"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <EventFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSave={handleSaveEvent}
                eventToEdit={eventToEdit}
            />

            {eventToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title={`Eliminar evento "${eventToDelete.name}"`}
                    confirmationText="ELIMINAR"
                >
                    <p>Esta acción es irreversible. Si hay pedidos asociados a este evento, también podrían verse afectados.</p>
                </ConfirmationModal>
            )}
        </div>
    );
};

export default EventManagement;