import React, { useState, FormEvent, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Sale } from '../../types';
import SaleFormModal from '../../components/SaleFormModal';
import { DownloadIcon, EditIcon, TrashIcon } from '../../components/icons';

// Add jsPDF declaration
declare global {
  interface Window {
    jspdf: any;
  }
}

const SalesManagement: React.FC = () => {
    const { currentUser } = useAuth();
    const { sales, addSale, updateSale, deleteSale } = useData();
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);

    const mySales = useMemo(() => {
        if (!currentUser) return [];
        return sales.filter(s => s.teacherId === currentUser.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [sales, currentUser]);
    
    const handleCreate = () => {
        setSaleToEdit(null);
        setModalOpen(true);
    };

    const handleEdit = (sale: Sale) => {
        setSaleToEdit(sale);
        setModalOpen(true);
    };

    const handleDelete = (saleId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este registro de venta? Esta acción no se puede deshacer.')) {
            deleteSale(saleId);
        }
    };

    const handleSave = (saleData: Sale | Omit<Sale, 'id'>) => {
        if ('id' in saleData) {
            updateSale(saleData);
        } else if (currentUser) {
            addSale({ ...saleData, teacherId: currentUser.id });
        }
    };
    
    const handleDownloadPdf = () => {
        const { jsPDF } = window as any;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`Informe de Ventas - ${currentUser?.name}`, 14, 22);
        doc.setFontSize(11);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
        
        doc.autoTable({
            startY: 40,
            head: [['Fecha', 'Categoría', 'Descripción', 'Importe']],
            body: mySales.map(sale => [
                new Date(sale.date).toLocaleDateString(),
                sale.category,
                sale.description,
                formatCurrency(sale.amount)
            ]),
            foot: [['', '', 'Total', formatCurrency(mySales.reduce((sum, s) => sum + s.amount, 0))]]
        });

        doc.save(`informe_ventas_${currentUser?.name.replace(' ', '_')}.pdf`);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value);

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Registro de Ventas</h1>
                <div className="flex gap-2">
                    <button onClick={handleDownloadPdf} className="btn-secondary flex items-center justify-center gap-2"><DownloadIcon className="w-4 h-4"/> Descargar PDF</button>
                    <button onClick={handleCreate} className="btn-primary">Nueva Venta</button>
                </div>
            </div>
            
            <div className="card">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="th-style">Fecha</th>
                                <th className="th-style">Categoría</th>
                                <th className="th-style">Descripción</th>
                                <th className="th-style text-right">Importe</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {mySales.map(sale => (
                                <tr key={sale.id}>
                                    <td className="px-6 py-4">{new Date(sale.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">{sale.category}</td>
                                    <td className="px-6 py-4 truncate max-w-sm">{sale.description}</td>
                                    <td className="px-6 py-4 font-semibold text-right">{formatCurrency(sale.amount)}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button onClick={() => handleEdit(sale)} className="btn-action" title="Editar"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDelete(sale.id)} className="btn-action-danger" title="Eliminar"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {mySales.length === 0 && <p className="text-center text-gray-500 py-8">No has registrado ninguna venta aún.</p>}
                </div>
            </div>
            
            <SaleFormModal 
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSave}
                saleToEdit={saleToEdit}
            />

            <style>{`
                .card { background-color: white; border-radius: 0.75rem; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); overflow: hidden; }
                .dark .card { background-color: #1F2937; }
                .btn-primary { padding: 0.6rem 1rem; font-weight: 600; color: white; background-color: #4F46E5; border-radius: 0.5rem; }
                .btn-secondary { padding: 0.6rem 1rem; font-weight: 600; color: #374151; background-color: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
                .dark .btn-secondary { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                .th-style { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; color: #6B7280;}
                .dark .th-style { color: #9CA3AF; }
                .btn-action { display: inline-flex; padding: 0.5rem; color: #4B5563; border-radius: 9999px; } .dark .btn-action { color: #9CA3AF; }
                .btn-action:hover { background-color: #F3F4F6; } .dark .btn-action:hover { background-color: #4B5563; }
                .btn-action-danger { display: inline-flex; padding: 0.5rem; color: #DC2626; border-radius: 9999px; } .dark .btn-action-danger { color: #F87171; }
                .btn-action-danger:hover { background-color: #FEE2E2; } .dark .btn-action-danger:hover { background-color: #450A0A; }
            `}</style>
        </div>
    );
};

export default SalesManagement;