import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { OrderStatus } from '../../types';

const ExpenseDetailByTeacher: React.FC = () => {
    const { teacherId } = useParams<{ teacherId: string }>();
    const { users, orders, orderItems, sales, products, suppliers } = useData();

    const teacher = useMemo(() => users.find(u => u.id === teacherId), [users, teacherId]);

    const {
        totalExpense,
        totalRevenue,
        balance,
        processedOrders,
    } = useMemo(() => {
        if (!teacher) return { totalExpense: 0, totalRevenue: 0, balance: 0, processedOrders: [] };

        const productMap = new Map(products.map(p => [p.id, p]));
        const getCost = (item: typeof orderItems[0]) => {
            if (item.unitPrice !== undefined) return item.quantity * item.unitPrice;
            if (item.productId) {
                const product = productMap.get(item.productId);
                if (product && product.suppliers.length > 0) return item.quantity * product.suppliers[0].price;
            }
            return 0;
        };

        const teacherOrders = orders.filter(o => o.teacherId === teacher.id && o.status === OrderStatus.PROCESSED);
        const teacherOrderIds = new Set(teacherOrders.map(o => o.id));
        const teacherItems = orderItems.filter(item => teacherOrderIds.has(item.orderId));
        
        const totalExpense = teacherItems.reduce((sum, item) => sum + getCost(item), 0);
        const totalRevenue = sales.filter(s => s.teacherId === teacher.id).reduce((sum, sale) => sum + sale.amount, 0);

        const ordersWithDetails = teacherOrders.map(order => ({
            ...order,
            items: teacherItems.filter(item => item.orderId === order.id),
            cost: teacherItems.filter(item => item.orderId === order.id).reduce((sum, item) => sum + getCost(item), 0),
        })).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return {
            totalExpense,
            totalRevenue,
            balance: totalRevenue - totalExpense,
            processedOrders: ordersWithDetails,
        };

    }, [teacher, orders, orderItems, sales, products]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
    const supplierMap = useMemo(() => new Map(suppliers.map(s => [s.id, s.name])), [suppliers]);

    if (!teacher) {
        return <div>Profesor no encontrado.</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <Link to="/admin/expense-management" className="text-indigo-600 hover:underline text-sm">&larr; Volver al dashboard</Link>
                <h1 className="text-3xl font-bold">Detalle de Gastos: {teacher.name}</h1>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="kpi-card bg-blue-500"><span className="kpi-label">Gasto Total</span><span className="kpi-value">{formatCurrency(totalExpense)}</span></div>
                <div className="kpi-card bg-green-500"><span className="kpi-label">Ingresos Totales</span><span className="kpi-value">{formatCurrency(totalRevenue)}</span></div>
                <div className={`kpi-card ${balance >= 0 ? 'bg-emerald-600' : 'bg-red-600'}`}><span className="kpi-label">Balance</span><span className="kpi-value">{formatCurrency(balance)}</span></div>
            </div>

            {/* Monthly Chart Placeholder */}
            <div className="card">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="p-6">
                    <h2 className="card-title">Evolución Mensual (Gastos vs. Ingresos)</h2>
                    <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md">
                        <p className="text-gray-500 italic">(Gráfico de evolución mensual futuro)</p>
                    </div>
                </div>
            </div>

            {/* Orders List */}
            <div className="card">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="p-6">
                    <h2 className="card-title">Pedidos Procesados</h2>
                    <div className="space-y-4">
                        {processedOrders.map(order => (
                            <details key={order.id} className="border dark:border-gray-700 rounded-lg">
                                <summary className="p-4 cursor-pointer flex justify-between items-center">
                                    <div>
                                        <span className="font-semibold">Pedido del {new Date(order.createdAt).toLocaleDateString()}</span>
                                        <span className="ml-4 text-sm text-gray-500">({order.items.length} artículos)</span>
                                    </div>
                                    <span className="font-bold">{formatCurrency(order.cost)}</span>
                                </summary>
                                <div className="p-4 border-t dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                                    <h4 className="font-semibold mb-2">Artículos:</h4>
                                    <ul className="list-disc list-inside pl-2 text-sm space-y-1">
                                        {order.items.map(item => (
                                            <li key={item.id}>
                                                {item.quantity} x {item.productName} 
                                                <span className="text-xs text-gray-500">
                                                    {item.supplierId ? ` (@ ${supplierMap.get(item.supplierId) || 'N/A'})` : ' (Fuera de catálogo)'}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                    {order.notes && <p className="mt-3 text-sm italic"><strong>Notas:</strong> {order.notes}</p>}
                                </div>
                            </details>
                        ))}
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
            `}</style>
        </div>
    );
};

export default ExpenseDetailByTeacher;