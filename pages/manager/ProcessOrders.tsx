
import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { OrderStatus } from '../../types';
import Modal from '../../components/Modal';
import { EditIcon, UploadIcon } from '../../components/icons';
import { WAREHOUSE_INTERNAL_USER_ID } from '../../constants';
import { useCreator } from '../../contexts/CreatorContext';

// Add this declaration to use jsPDF from CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

interface AggregatedItem {
    productId: string | null;
    productName: string;
    unit: string;
    isOutOfCatalog: boolean;
    breakdown: {
        orderId: string;
        orderItemId: string;
        teacherId: string;
        teacherName: string;
        originalQuantity: number;
        currentQuantity: number;
    }[];
    assignedSupplierId?: string;
}

const ProcessOrders: React.FC = () => {
    const { events, orders, orderItems, users, suppliers, products, processEventOrders, reopenProcessedOrders, companyInfo, importMultipleTeacherOrders } = useData();
    const { currentUser } = useAuth();
    const { creatorInfo } = useCreator();
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [aggregatedItems, setAggregatedItems] = useState<AggregatedItem[]>([]);
    const [isBreakdownModalOpen, setBreakdownModalOpen] = useState(false);
    const [itemForBreakdown, setItemForBreakdown] = useState<AggregatedItem | null>(null);

    const eventStatusMap = useMemo(() => {
        const map = new Map<string, { status: 'Pendiente' | 'Procesado', orderCount: number }>();
        const submittedOrders = orders.filter(o => o.status === OrderStatus.SUBMITTED);
        const processedOrders = orders.filter(o => o.status === OrderStatus.PROCESSED);

        events.forEach(event => {
            const submittedCount = submittedOrders.filter(o => o.eventId === event.id).length;
            const processedCount = processedOrders.filter(o => o.eventId === event.id).length;

            if (submittedCount > 0) {
                map.set(event.id, { status: 'Pendiente', orderCount: submittedCount });
            } else if (processedCount > 0) {
                 map.set(event.id, { status: 'Procesado', orderCount: processedCount });
            }
        });
        return map;
    }, [events, orders]);

    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
    const suppliersMap = useMemo(() => new Map(suppliers.map(s => [s.id, s])), [suppliers]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    const warehouseManagerName = useMemo(() => userMap.get(companyInfo.warehouseManagerId) || currentUser?.name, [userMap, companyInfo, currentUser]);


    const initializeAggregatedItems = (eventId: string) => {
        const relevantOrders = orders.filter(o => o.eventId === eventId && (o.status === OrderStatus.SUBMITTED || o.status === OrderStatus.PROCESSED));
        const relevantOrderIds = new Set(relevantOrders.map(o => o.id));
        const relevantItems = orderItems.filter(item => relevantOrderIds.has(item.orderId));
        
        const aggregationMap = new Map<string, AggregatedItem>();

        for (const item of relevantItems) {
            const key = item.productId || `ooc-${item.productName}`;
            if (!aggregationMap.has(key)) {
                const product = item.productId ? productsMap.get(item.productId) : null;
                const cheapestSupplier = product?.suppliers.sort((a,b) => a.price - b.price)[0];
                aggregationMap.set(key, {
                    productId: item.productId,
                    productName: item.productName,
                    unit: product?.unit || 'ud',
                    isOutOfCatalog: item.isOutOfCatalog,
                    breakdown: [],
                    assignedSupplierId: cheapestSupplier?.supplierId
                });
            }

            const aggItem = aggregationMap.get(key)!;
            const order = relevantOrders.find(o => o.id === item.orderId);
            const teacherName = order?.teacherId === WAREHOUSE_INTERNAL_USER_ID
                ? 'Almacén (Reposición)'
                : userMap.get(order?.teacherId || '') || 'Desconocido';
            
            aggItem.breakdown.push({
                orderId: item.orderId,
                orderItemId: item.id,
                teacherId: order?.teacherId || '',
                teacherName,
                originalQuantity: item.quantity,
                currentQuantity: item.quantity
            });
        }
        setAggregatedItems(Array.from(aggregationMap.values()));
    };

    const handleSelectEvent = (eventId: string) => {
        setSelectedEventId(eventId);
        initializeAggregatedItems(eventId);
    };

    const updateItemQuantity = (itemIndex: number, breakdownIndex: number, newQuantity: number) => {
        const newItems = [...aggregatedItems];
        newItems[itemIndex].breakdown[breakdownIndex].currentQuantity = newQuantity;
        setAggregatedItems(newItems);
    };
    
    const updateSupplierAssignment = (itemIndex: number, supplierId: string) => {
        const newItems = [...aggregatedItems];
        newItems[itemIndex].assignedSupplierId = supplierId;
        setAggregatedItems(newItems);
    };

    const handleProcess = () => {
        if (!selectedEventId || !currentUser) return;
        
        const modifiedItems: { orderItemId: string, newQuantity: number, teacherId: string }[] = [];
        aggregatedItems.forEach(item => {
            item.breakdown.forEach(bd => {
                if (bd.originalQuantity !== bd.currentQuantity) {
                    modifiedItems.push({ orderItemId: bd.orderItemId, newQuantity: bd.currentQuantity, teacherId: bd.teacherId });
                }
            });
        });
        
        processEventOrders(selectedEventId, modifiedItems, currentUser.id);
        alert('Pedidos procesados con éxito!');
        setSelectedEventId(null);
    };

    const handleReopen = () => {
        if(selectedEventId && window.confirm('¿Estás seguro de que quieres reabrir los pedidos de este evento? Volverán al estado "Enviado".')) {
            reopenProcessedOrders(selectedEventId);
            alert('Pedidos reabiertos.');
            setSelectedEventId(null);
        }
    };
    
    const handleOpenOrdersFolder = () => {
        if (creatorInfo.ordersFolderUrl) {
            window.open(creatorInfo.ordersFolderUrl, '_blank');
        } else {
            alert('No hay carpeta de pedidos configurada.');
        }
    };

    const handleImportOrders = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileReadPromises: Promise<string>[] = [];

        for (let i = 0; i < files.length; i++) {
            fileReadPromises.push(new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.onerror = reject;
                reader.readAsText(files[i]);
            }));
        }

        try {
            const contents = await Promise.all(fileReadPromises);
            await importMultipleTeacherOrders(contents);
            alert(`${files.length} archivo(s) procesado(s) correctamente. Los pedidos aparecerán como "Pendientes" en la lista.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            alert('Error al importar pedidos: ' + (err instanceof Error ? err.message : String(err)));
        }
    };
    
     const generatePdfs = () => {
        const { jsPDF } = (window as any).jspdf;
        
        const addFooter = (doc: any, pageCount: number) => {
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(
                    `${creatorInfo.appName} - ${creatorInfo.copyrightText} | Generado: ${new Date().toLocaleString()}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }
        };

        const itemsBySupplier = aggregatedItems.reduce((acc, item) => {
            if (item.assignedSupplierId && !item.isOutOfCatalog) {
                if (!acc[item.assignedSupplierId]) acc[item.assignedSupplierId] = [];
                acc[item.assignedSupplierId].push(item);
            }
            return acc;
        }, {} as Record<string, AggregatedItem[]>);

        if (Object.keys(itemsBySupplier).length === 0) {
            alert("No hay productos asignados a proveedores para generar PDFs.");
            return;
        }

        for (const supplierId in itemsBySupplier) {
            const supplier = suppliersMap.get(supplierId);
            if (!supplier) continue;

            const doc = new jsPDF();
            
            // Header
            doc.setFontSize(18);
            doc.text('Hoja de Pedido', 105, 20, { align: 'center' });
            
            doc.setFontSize(10);
            doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 20, 30);

            // Company Info (Sender)
            doc.setFontSize(12).setFont(undefined, 'bold');
            doc.text(companyInfo.name, 20, 40);
            doc.setFontSize(10).setFont(undefined, 'normal');
            doc.text(companyInfo.address, 20, 45);
            doc.text(companyInfo.phone, 20, 50);
            
            // Supplier Info (Recipient)
            doc.setFontSize(12).setFont(undefined, 'bold');
            doc.text(supplier.name, 110, 40);
            doc.setFontSize(10).setFont(undefined, 'normal');
            doc.text(supplier.address, 110, 45);
            doc.text(supplier.phone, 110, 50);

            doc.text(`A la atención de: ${warehouseManagerName}`, 20, 60);

            let totalCost = 0;
            const tableBody = itemsBySupplier[supplierId].map(item => {
                const product = productsMap.get(item.productId!);
                const priceInfo = product?.suppliers.find(s => s.supplierId === supplierId);
                const price = priceInfo ? priceInfo.price : 0;
                const totalQty = item.breakdown.reduce((sum, bd) => sum + bd.currentQuantity, 0);
                const total = totalQty * price;
                totalCost += total;
                return [
                    product?.reference || 'N/A',
                    item.productName,
                    totalQty,
                    item.unit,
                    `${price.toFixed(2)} €`,
                    `${total.toFixed(2)} €`,
                ];
            });

            doc.autoTable({
                head: [['Ref.', 'Producto', 'Cantidad', 'Unidad', 'Precio Unit.', 'Precio Total']],
                body: tableBody,
                startY: 70,
                foot: [['', '', '', '', 'TOTAL', `${totalCost.toFixed(2)} €`]],
                footStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' }
            });

            addFooter(doc, doc.internal.getNumberOfPages());
            doc.save(`Pedido_${supplier.name.replace(/\s/g, '_')}.pdf`);
        }
    };


    const selectedEvent = events.find(e => e.id === selectedEventId);
    const catalogItems = aggregatedItems.filter(i => !i.isOutOfCatalog);
    const outOfCatalogItems = aggregatedItems.filter(i => i.isOutOfCatalog);
    const eventIsProcessed = selectedEventId ? eventStatusMap.get(selectedEventId)?.status === 'Procesado' : false;

    if (!selectedEventId) {
        return (
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Seleccionar Evento a Procesar</h1>
                    <div className="flex gap-2">
                         <button onClick={handleOpenOrdersFolder} className="btn-secondary flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100" title="Abrir carpeta de Drive">
                            <span className="text-lg">📂</span> Abrir Buzón
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="btn-secondary flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100">
                            <UploadIcon className="w-4 h-4" /> Procesar Paquete de Pedidos
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImportOrders} className="hidden" accept=".json" multiple />
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    {Array.from(eventStatusMap.entries()).length > 0 ? (
                        <ul className="space-y-3">
                            {Array.from(eventStatusMap.entries()).map(([eventId, {status, orderCount}]) => {
                                const event = events.find(e => e.id === eventId);
                                if (!event) return null;
                                return (
                                <li key={eventId} className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold">{event.name}</h3>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status === 'Procesado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{status}</span>
                                        <span className="text-sm text-gray-500 ml-2">{orderCount} pedidos</span>
                                    </div>
                                    <button onClick={() => handleSelectEvent(eventId)} className="btn-primary">Gestionar</button>
                                </li>
                            )})}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No hay eventos con pedidos para procesar.</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <button onClick={() => setSelectedEventId(null)} className="text-sm text-indigo-600 hover:underline">&larr; Volver a Eventos</button>
                <h1 className="text-3xl font-bold mt-1">Procesando: {selectedEvent?.name}</h1>
            </div>

            {/* Catalog Items */}
            <div className="card">
                <h2 className="card-title">Productos de Catálogo</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="th-style">Producto</th><th className="th-style">Cantidad Total</th><th className="th-style">Proveedor Asignado</th><th className="th-style">Coste Estimado</th><th className="th-style">Desglose</th></tr></thead>
                        <tbody>
                        {catalogItems.map((item, index) => {
                            const totalQty = item.breakdown.reduce((sum, bd) => sum + bd.currentQuantity, 0);
                            const product = item.productId ? productsMap.get(item.productId) : null;
                            const price = product?.suppliers.find(s => s.supplierId === item.assignedSupplierId)?.price || 0;
                            const cost = totalQty * price;

                            return (
                                <tr key={item.productId} className="border-b dark:border-gray-700">
                                    <td className="p-3 font-medium">{item.productName} <span className="text-xs text-gray-500">({item.unit})</span></td>
                                    <td className="p-3">{totalQty}</td>
                                    <td className="p-3">
                                        <select value={item.assignedSupplierId || ''} onChange={(e) => updateSupplierAssignment(index, e.target.value)} disabled={eventIsProcessed} className="input-style">
                                            {product?.suppliers.map(s => <option key={s.supplierId} value={s.supplierId}>{suppliersMap.get(s.supplierId)?.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-3">{cost.toFixed(2)} €</td>
                                    <td className="p-3">
                                        <button onClick={() => { setItemForBreakdown(item); setBreakdownModalOpen(true); }} className="text-indigo-600 hover:underline text-sm flex items-center gap-1"><EditIcon className="w-4 h-4"/> Ver/Editar</button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Out of Catalog Items */}
            {outOfCatalogItems.length > 0 && (
                <div className="card border-yellow-500/50">
                    <h2 className="card-title">Solicitudes Fuera de Catálogo</h2>
                     <ul className="list-disc list-inside space-y-1">
                        {outOfCatalogItems.map(item => (
                            <li key={item.productName}>{item.breakdown.reduce((sum, bd) => sum + bd.currentQuantity, 0)} x {item.productName}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            {/* Summary & Actions */}
            <div className="card">
                <h2 className="card-title">Resumen por Proveedor y Acciones</h2>
                {/* PDF generation summary would go here */}
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={generatePdfs} className="btn-secondary">Generar Hojas de Pedido (PDF)</button>
                    {eventIsProcessed ? (
                        <button onClick={handleReopen} className="btn-secondary bg-yellow-400 hover:bg-yellow-500">Modificar Pedidos Procesados</button>
                    ) : (
                        <button onClick={handleProcess} className="btn-primary">Finalizar y Procesar Pedidos</button>
                    )}
                </div>
            </div>

            {itemForBreakdown && (
                <Modal isOpen={isBreakdownModalOpen} onClose={() => setBreakdownModalOpen(false)} title={`Desglose de: ${itemForBreakdown.productName}`}>
                    <table className="min-w-full">
                        <thead><tr><th className="th-style">Profesor</th><th className="th-style">Cantidad</th></tr></thead>
                        <tbody>
                            {itemForBreakdown.breakdown.map((bd, bdIndex) => (
                                <tr key={bd.orderItemId}>
                                    <td className="p-2">{bd.teacherName}</td>
                                    <td className="p-2">
                                        <input type="number" value={bd.currentQuantity} disabled={eventIsProcessed} onChange={e => updateItemQuantity(aggregatedItems.indexOf(itemForBreakdown), bdIndex, parseInt(e.target.value) || 0)} className="input-style w-24"/>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Modal>
            )}

            <style>{`
                .card { background-color: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); }
                .dark .card { background-color: #1F2937; }
                .card-title { font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem; }
                .btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.5rem; }
                .btn-secondary { padding: 0.5rem 1rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border-radius: 0.5rem; }
                .dark .btn-secondary { background-color: #4B5563; color: #D1D5DB; }
                .th-style { padding: 0.75rem; text-align: left; font-size: 0.75rem; color: #6B7280; text-transform: uppercase; }
                .dark .th-style { color: #9CA3AF; }
                .input-style { background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } 
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                :disabled { cursor: not-allowed; opacity: 0.7; }
            `}</style>
        </div>
    );
};

export default ProcessOrders;
