
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_STYLES } from '../../constants';

const ROLE_MESSAGES: Record<string, { title: string, message: string }> = {
    TEACHER: {
        title: "Panel de Profesor",
        message: "Gestiona tus pedidos, eventos y servicios."
    },
    MANAGER: {
        title: "Panel de Manager",
        message: "Supervisa el progreso general, gestiona recursos y obtén reportes clave para la toma de decisiones."
    }
}

const GenericDashboard: React.FC = () => {
  const { currentUser, activeRole } = useAuth();

  if (!currentUser || !activeRole) {
    return <div>Cargando...</div>;
  }

  const roleStyle = ROLE_STYLES[activeRole];
  const roleContent = ROLE_MESSAGES[activeRole] || { title: "Panel Principal", message: "Bienvenido a tu panel de control." };

  return (
    <div className="space-y-8">
      <div className={`rounded-xl text-white bg-gradient-to-r ${roleStyle.gradient} shadow-lg overflow-hidden`}>
        <div className="h-1.5 bg-white/30"></div>
        <div className="p-8">
            <h1 className="text-4xl font-bold">¡Bienvenido, {currentUser.name}!</h1>
            <p className="mt-2 text-lg opacity-90">{roleContent.message}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="h-1.5 bg-indigo-500"></div>
        <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{roleContent.title}</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Esta es tu área principal. Las funcionalidades específicas de tu rol aparecerán aquí.
            </p>
            {/* Placeholder for future content */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-gray-500 italic">Contenido futuro...</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default GenericDashboard;
