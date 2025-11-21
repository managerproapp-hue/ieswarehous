
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_DASHBOARD_PATHS } from '../constants';

const NotFound: React.FC = () => {
  const { activeRole } = useAuth();
  const homePath = activeRole ? ROLE_DASHBOARD_PATHS[activeRole] : '/login';

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-9xl font-black text-gray-200 dark:text-gray-700">404</h1>
        <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          ¡Ups! Página no encontrada.
        </p>
        <p className="mt-4 text-gray-500 dark:text-gray-400">
          Lo sentimos, no pudimos encontrar la página que estás buscando.
        </p>
        <Link
          to={homePath}
          className="mt-6 inline-block rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
