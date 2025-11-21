
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_STYLES, ROLE_DASHBOARD_PATHS } from '../constants';
import { Role } from '../types';

const ProfileSelector: React.FC = () => {
  const { currentUser, setActiveRole, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      if (currentUser.roles.length === 1) {
        const role = currentUser.roles[0];
        setActiveRole(role);
        navigate(ROLE_DASHBOARD_PATHS[role], { replace: true });
      } else if (currentUser.roles.length === 0) {
        logout();
        navigate('/login', { replace: true });
      }
    }
  }, [currentUser, setActiveRole, navigate, logout]);

  const handleRoleSelect = (role: Role) => {
    setActiveRole(role);
  };

  if (!currentUser || currentUser.roles.length < 2) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600"></div>

        <div className="p-10 flex flex-col items-center">
            <img src={currentUser.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-md" />
            
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
            
            <p className="mt-1 text-md text-gray-500 dark:text-gray-400">{currentUser.email}</p>
            
            <h3 className="mt-8 text-lg font-semibold text-gray-700 dark:text-gray-300">Roles Asignados</h3>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {currentUser.roles.map((role) => {
                const style = ROLE_STYLES[role];
                return (
                  <Link
                    key={role}
                    to={ROLE_DASHBOARD_PATHS[role]}
                    onClick={() => handleRoleSelect(role)}
                    className={`px-5 py-2 rounded-full text-white text-sm font-semibold bg-gradient-to-r ${style.gradient} transform hover:scale-105 transition-transform duration-200 shadow-sm`}
                  >
                    {style.name}
                  </Link>
                );
              })}
            </div>
            
            <button
              onClick={() => { logout(); navigate('/login'); }}
              className="mt-10 text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              Cerrar sesión
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSelector;
