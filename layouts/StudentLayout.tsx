import React, { useMemo, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData as useGlobalData } from '../contexts/DataContext';
import { SandboxedDataProvider } from '../contexts/SandboxedDataContext';
import { SimulatedRole } from '../types';

// Kitchen Professional Role Components
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import OrderPortal from '../pages/teacher/OrderPortal';
import CreateOrder from '../pages/teacher/CreateOrder';
import MyRecipes from '../pages/teacher/MyRecipes';
import RecipeForm from '../pages/teacher/RecipeForm';
import MyOrderHistory from '../pages/teacher/MyOrderHistory';

// Warehouse Role Components
import WarehouseDashboard from '../pages/student/WarehouseDashboard';
import ProcessOrders from '../pages/manager/ProcessOrders';
import ReceptionManagement from '../pages/manager/ReceptionManagement';
import MiniEconomatoPage from '../pages/manager/MiniEconomatoPage';
import OrderHistory from '../pages/manager/OrderHistory';
import StudentCatalog from '../pages/student/StudentCatalog';
import StudentSuppliers from '../pages/student/StudentSuppliers';


const WaitingForAssignment: React.FC = () => (
    <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Esperando Asignación de Rol</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
            Tu profesor-tutor debe asignarte a un aula y a un rol de práctica para comenzar.
            Por favor, contacta con él si tienes alguna duda.
        </p>
        <p className="mt-4 text-sm text-gray-500">Mientras tanto, puedes acceder a tu perfil o a la mensajería desde la barra lateral.</p>
    </div>
);

const StudentLayout: React.FC = () => {
    const { currentUser, setSimulatedRole } = useAuth();
    const { classrooms } = useGlobalData();

    const { myClassroom, practiceStudent } = useMemo(() => {
        if (!currentUser) return { myClassroom: null, practiceStudent: null };
        
        const classroom = classrooms.find(c => c.students.some(s => s.id === currentUser.id));
        if (!classroom) return { myClassroom: null, practiceStudent: null };

        const studentProfile = classroom.students.find(s => s.id === currentUser.id);
        return { myClassroom: classroom, practiceStudent: studentProfile };
    }, [classrooms, currentUser]);

    useEffect(() => {
        // Set the simulated role in the auth context so the sidebar can adapt
        setSimulatedRole(practiceStudent?.simulatedRole || null);
        
        // Cleanup on unmount
        return () => setSimulatedRole(null);
    }, [practiceStudent, setSimulatedRole]);

    if (!myClassroom || !practiceStudent) {
        return <WaitingForAssignment />;
    }

    return (
        <SandboxedDataProvider classroom={myClassroom}>
            <Routes>
                {practiceStudent.simulatedRole === SimulatedRole.KITCHEN_PROFESSIONAL && (
                    <>
                        <Route path="dashboard" element={<TeacherDashboard />} />
                        <Route path="order-portal" element={<OrderPortal />} />
                        <Route path="create-order/:eventId" element={<CreateOrder />} />
                        <Route path="my-recipes" element={<MyRecipes />} />
                        <Route path="recipe/new" element={<RecipeForm />} />
                        <Route path="recipe/edit/:recipeId" element={<RecipeForm />} />
                        <Route path="order-history" element={<MyOrderHistory />} />
                    </>
                )}
                {practiceStudent.simulatedRole === SimulatedRole.WAREHOUSE && (
                    <>
                        <Route path="dashboard" element={<WarehouseDashboard />} />
                        <Route path="process-orders" element={<ProcessOrders />} />
                        <Route path="reception" element={<ReceptionManagement />} />
                        <Route path="mini-economato" element={<MiniEconomatoPage />} />
                        <Route path="order-history" element={<OrderHistory />} />
                        <Route path="catalog" element={<StudentCatalog />} />
                        <Route path="suppliers" element={<StudentSuppliers />} />
                    </>
                )}
                {/* Redirect any other student path to their specific dashboard */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
        </SandboxedDataProvider>
    );
};

export default StudentLayout;