import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import StudentManagerTab from './classroom-tabs/StudentManagerTab';
import CatalogManagerTab from './classroom-tabs/CatalogManagerTab';
import PracticeEventManagerTab from './classroom-tabs/PracticeEventManagerTab';
import ReviewOrdersTab from './classroom-tabs/ReviewOrdersTab';
import SettingsTab from './classroom-tabs/SettingsTab';
import DashboardTab from './classroom-tabs/DashboardTab';
import { DashboardIcon, UsersIcon, PackageIcon, CalendarIcon, ClipboardIcon, SettingsIcon } from '../../components/icons';

type ActiveTab = 'dashboard' | 'students' | 'catalog' | 'events' | 'orders' | 'settings';

const ClassroomDashboard: React.FC = () => {
    const { classroomId } = useParams<{ classroomId: string }>();
    const { classrooms } = useData();
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

    const classroom = useMemo(() => classrooms.find(c => c.id === classroomId), [classrooms, classroomId]);

    if (!classroom) {
        return <div>Aula no encontrada. <Link to="/teacher/classrooms" className="text-indigo-500">Volver a la lista</Link></div>;
    }
    
    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
        { id: 'students', label: 'Alumnos', icon: UsersIcon },
        { id: 'catalog', label: 'Catálogo', icon: PackageIcon },
        { id: 'events', label: 'Prácticas', icon: CalendarIcon },
        { id: 'orders', label: 'Revisión', icon: ClipboardIcon },
        { id: 'settings', label: 'Configuración', icon: SettingsIcon },
    ];

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard': return <DashboardTab classroom={classroom} setActiveTab={setActiveTab} />;
            case 'students': return <StudentManagerTab classroom={classroom} />;
            case 'catalog': return <CatalogManagerTab classroom={classroom} />;
            case 'events': return <PracticeEventManagerTab classroom={classroom} />;
            case 'orders': return <ReviewOrdersTab classroom={classroom} />;
            case 'settings': return <SettingsTab classroom={classroom} />;
            default: return <DashboardTab classroom={classroom} setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                 <Link to="/teacher/classrooms" className="text-indigo-600 hover:underline text-sm">&larr; Volver a mis aulas</Link>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panel del Aula: {classroom.name}</h1>
            </div>

            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)} 
                            className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'}`}
                        >
                            <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default ClassroomDashboard;