

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';

const DashboardLayout = () => {
    const { impersonatingUser, activeRole } = useAuth();
    
    let marginTopClass = 'mt-32'; // Default height
    if (impersonatingUser && activeRole === Role.STUDENT) {
        marginTopClass = 'mt-[168px]'; // Impersonation bar + Student bar
    } else if (impersonatingUser || activeRole === Role.STUDENT) {
        marginTopClass = 'mt-40'; // One bar is visible
    }
  
  return (
    <div className="flex h-screen bg-slate-100 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className={`flex-1 p-8 overflow-y-auto ${marginTopClass}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;