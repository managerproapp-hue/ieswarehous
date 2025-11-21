import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { OrderStatus, Role } from '../../types';
import { Link } from 'react-router-dom';

const ExpenseManagement: React.FC = () => {
    const { users, sales, orders, orderItems, products, cycles, modules, groups, assignments, suppliers } = useData();

    // Fix: Define a type for teacher expense data to resolve type inference issues with Object.entries.
    type TeacherExpenseData = { name: string, expense: number, orders: number, sales: number };

    const {
        totalExpense,
        totalRevenue,
        balance,
        avgExpensePerTeacher,
        expenseByTeacher,
        expenseByCycle,
        expenseByModule,
        expenseByGroup,
        expenseBySupplier,
        top5Teachers,
    } = useMemo(() => {
        const productMap = new Map(products.map(p => [p.id, p]));
        const getCost = (item: typeof orderItems[0]) => {
            if (item.unitPrice !== undefined) {
                return item.quantity * item.unitPrice;
            }
            if (item.productId) {
                const product = productMap.get(item.productId);
                if (product && product.suppliers.length > 0) {
                    return item.quantity * product.suppliers[0].price; // Fallback
                }
            }
            return 0;
        };

        const processedOrders = orders.filter(o => o.status === OrderStatus.PROCESSED);
        const processedOrderIds = new Set(processedOrders.map(o => o.id));
        const relevantItems = orderItems.filter(item => processedOrderIds.has(item.orderId));

        let totalExpense = 0;
        const expenseByTeacher: Record<string, TeacherExpenseData> = {};
        
        // Calculate teacher expenses
        processedOrders.forEach(order => {
            const teacher = users.find(u => u.id === order.teacherId);
            if (!teacher) return;

            if (!expenseByTeacher[teacher.id]) {
                expenseByTeacher[teacher.id] = { name: teacher.name, expense: 0, orders: 0, sales: 0 };
            }
            
            const orderCost = relevantItems.filter(item => item.orderId === order.id).reduce((sum, item) => sum + getCost(item), 0);
            expenseByTeacher[teacher.id].expense += orderCost;
            expenseByTeacher[teacher.id].orders += 1;
            totalExpense += orderCost;
        });

        // Add sales data
        sales.forEach(sale => {
            if (expenseByTeacher[sale.teacherId]) {
                expenseByTeacher[sale.teacherId].sales += sale.amount;
            }
        });
        
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.amount, 0);
        const balance = totalRevenue - totalExpense;
        const activeTeachers = Object.keys(expenseByTeacher).length;
        const avgExpensePerTeacher = activeTeachers > 0 ? totalExpense / activeTeachers : 0;
        const top5Teachers = Object.entries(expenseByTeacher).sort((a, b) => b[1].expense - a[1].expense).slice(0, 5);

        // Attribution Logic
        const expenseByCycle: { [key: string]: number } = {};
        const expenseByModule: { [key: string]: number } = {};
        const expenseByGroup: { [key: string]: number } = {};

        const teacherAssignments = assignments.reduce((acc, assign) => {
            if (!acc[assign.professorId]) acc[assign.professorId] = [];
            acc[assign.professorId].push(assign.groupId);
            return acc;
        }, {} as Record<string, string[]>);
        
        const groupModuleMap = new Map(groups.map(g => [g.id, g.moduleId]));
        const moduleCycleMap = new Map(modules.map(m => [m.id, m.cycleId]));

        // Fix: Explicitly type the destructured `data` to ensure correct type inference for arithmetic operations.
        Object.entries(expenseByTeacher).forEach(([teacherId, data]: [string, TeacherExpenseData]) => {
            const assignedGroupIds = teacherAssignments[teacherId] || [];
            if (assignedGroupIds.length > 0) {
                const expensePerGroup = data.expense / assignedGroupIds.length;
                assignedGroupIds.forEach(groupId => {
                    expenseByGroup[groupId] = (expenseByGroup[groupId] || 0) + expensePerGroup;
                    const moduleId = groupModuleMap.get(groupId);
                    if (moduleId) {
                        expenseByModule[moduleId] = (expenseByModule[moduleId] || 0) + expensePerGroup;
                        const cycleId = moduleCycleMap.get(moduleId);
                        if (cycleId) {
                            expenseByCycle[cycleId] = (expenseByCycle[cycleId] || 0) + expensePerGroup;
                        }
                    }
                });
            }
        });
        
        const expenseBySupplier = relevantItems.reduce((acc, item) => {
            if (item.supplierId) {
                const cost = getCost(item);
                acc[item.supplierId] = (acc[item.supplierId] || 0) + cost;
            }
            return acc;
        }, {} as Record<string, number>);

        return { totalExpense, totalRevenue, balance, avgExpensePerTeacher, expenseByTeacher, expenseByCycle, expenseByModule, expenseByGroup, expenseBySupplier, top5Teachers };
    }, [orders, orderItems, sales, users, assignments, groups, modules, cycles, products, suppliers]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Gestión y Estadísticas de Gastos</h1>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="kpi-card bg-blue-500"><span className="kpi-label">Gasto Total</span><span className="kpi-value">{formatCurrency(totalExpense)}</span></div>
                <div className="kpi-card bg-green-500"><span className="kpi-label">Ingresos Totales</span><span className="kpi-value">{formatCurrency(totalRevenue)}</span></div>
                <div className={`kpi-card ${balance >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}><span className="kpi-label">Balance General</span><span className="kpi-value">{formatCurrency(balance)}</span></div>
                <div className="kpi-card bg-purple-500"><span className="kpi-label">Gasto Medio / Profesor</span><span className="kpi-value">{formatCurrency(avgExpensePerTeacher)}</span></div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="card-title">Gasto por Ciclo Formativo</h2>
                        <ul className="space-y-2 mt-4">
                            {/* Fix: Explicitly type the destructured `expense` to ensure it is a number. */}
                            {Object.entries(expenseByCycle).map(([cycleId, expense]: [string, number]) => (
                                <li key={cycleId}>
                                    <div className="flex justify-between text-sm"><span className="font-medium">{cycles.find(c=>c.id === cycleId)?.name}</span><span>{formatCurrency(expense)}</span></div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1"><div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${(expense / totalExpense) * 100}%`}}></div></div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                 <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="card-title">Top 5 Profesores con Mayor Gasto</h2>
                        <ul className="space-y-3 mt-4">
                        {/* Fix: Explicitly type the destructured `data` to ensure correct type inference. */}
                        {top5Teachers.map(([teacherId, data]: [string, TeacherExpenseData]) => (
                                <li key={teacherId} className="flex justify-between items-center text-sm">
                                    <span className="font-medium">{data.name}</span>
                                    <span className="text-gray-500">{data.orders} pedidos</span>
                                    <span className="font-bold">{formatCurrency(data.expense)}</span>
                                </li>
                        ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Detailed Tables */}
            <div className="card">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="p-6">
                    <h2 className="card-title">Gasto por Profesor/a</h2>
                    <table className="data-table">
                        <thead><tr><th>Profesor</th><th>Nº Pedidos</th><th>Gasto Total</th><th>Ventas</th><th>Balance</th></tr></thead>
                        <tbody>
                            {/* Fix: Explicitly type the destructured `data` to ensure correct type inference. */}
                            {Object.entries(expenseByTeacher).map(([teacherId, data]: [string, TeacherExpenseData]) => (
                                <tr key={teacherId}>
                                    <td><Link to={`/admin/expense-detail/${teacherId}`} className="text-indigo-600 hover:underline">{data.name}</Link></td>
                                    <td>{data.orders}</td>
                                    <td>{formatCurrency(data.expense)}</td>
                                    <td>{formatCurrency(data.sales)}</td>
                                    <td className={data.sales - data.expense >= 0 ? 'text-green-600' : 'text-red-600'}>{formatCurrency(data.sales - data.expense)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="card-title">Gasto por Grupo</h2>
                        <table className="data-table text-sm">
                            <thead><tr><th>Grupo</th><th>Gasto</th></tr></thead>
                            <tbody>
                                {/* Fix: Explicitly type the destructured `expense` to ensure it is a number. */}
                                {Object.entries(expenseByGroup).map(([groupId, expense]: [string, number]) => (
                                    <tr key={groupId}><td>{groups.find(g=>g.id===groupId)?.name}</td><td>{formatCurrency(expense)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="card-title">Gasto por Módulo</h2>
                        <table className="data-table text-sm">
                            <thead><tr><th>Módulo</th><th>Gasto</th></tr></thead>
                            <tbody>
                                {/* Fix: Explicitly type the destructured `expense` to ensure it is a number. */}
                                {Object.entries(expenseByModule).map(([moduleId, expense]: [string, number]) => (
                                    <tr key={moduleId}><td>{modules.find(m=>m.id===moduleId)?.name}</td><td>{formatCurrency(expense)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h2 className="card-title">Gasto por Proveedor</h2>
                        <table className="data-table text-sm">
                            <thead><tr><th>Proveedor</th><th>Gasto</th></tr></thead>
                            <tbody>
                                {/* Fix: Explicitly type the destructured `expense` to ensure it is a number. */}
                                {Object.entries(expenseBySupplier).map(([supplierId, expense]: [string, number]) => (
                                    <tr key={supplierId}><td>{suppliers.find(s=>s.id===supplierId)?.name}</td><td>{formatCurrency(expense)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .kpi-card { padding: 1.5rem; border-radius: 0.75rem; color: white; }
                .kpi-label { display: block; font-size: 0.875rem; opacity: 0.8; }
                .kpi-value { display: block; font-size: 2rem; font-weight: 700; }
                .card { background-color: white; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); overflow: hidden; }
                .dark .card { background-color: #1F2937; }
                .card-title { font-size: 1.125rem; font-weight: 600; }
                .data-table { width: 100%; margin-top: 1rem; }
                .data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #E5E7EB; }
                .dark .data-table th, .dark .data-table td { border-bottom-color: #374151; }
                .data-table th { font-size: 0.75rem; text-transform: uppercase; color: #6B7280; }
                .dark .data-table th { color: #9CA3AF; }
            `}</style>
        </div>
    );
};

export default ExpenseManagement;