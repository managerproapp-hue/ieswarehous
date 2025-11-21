import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { Event, Order, OrderItem, OrderStatus, Product, Incident, Supplier } from '../../types';
import { WarningIcon } from '../../components/icons';
import Modal from '../../components/Modal';
import { useAuth } from '../../contexts/AuthContext';

// Add jsPDF declaration
declare global {
  interface Window {
    jspdf: any;
  }
}

interface VerifiableItem {
  productId: string | null;
  productName: string;
  reference: string;
  unit: string;
  totalOrdered: number;
  totalReceived: number;
  verificationState: 'pending' | 'ok' | 'partial' | 'incident';
  incidents: { description: string, supplierId?: string }[];
  breakdown: {
    orderItemId: string;
    supplierId?: string;
    orderedQuantity: number;
  }[];
  supplierName?: string;
}

const ReceptionManagement: React.FC = () => {
    const { events, orders, orderItems, products, suppliers, users, finalizeReception, companyInfo } = useData();
    const { currentUser } = useAuth();

    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [verifiableItems, setVerifiableItems] = useState<VerifiableItem[]>([]);
    const [isIncidentModalOpen, setIncidentModalOpen] = useState(false);
    const [incidentItemIndex, setIncidentItemIndex] = useState<number | null>(null);
    const [incidentDescription, setIncidentDescription] = useState('');
    
    const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);
    const supplierMap = useMemo(() => new Map(suppliers.map(s => [s.id, s])), [suppliers]);

    const processedEvents = useMemo(() => {
        const eventData = new Map<string, { name: string; verificationStatus: 'Pendiente' | 'Verificado'; processedDate: string }>();

        orders.forEach(order => {
            if ([OrderStatus.PROCESSED, OrderStatus.RECEIVED_OK, OrderStatus.RECEIVED_PARTIAL].includes(order.status)) {
                if (!eventData.has(order.eventId)) {
                    const event = events.find(e => e.id === order.eventId);
                    eventData.set(order.eventId, { 
                        name: event?.name || 'Evento Desconocido',
                        verificationStatus: 'Verificado', // Assume verified initially
                        processedDate: order.updatedAt 
                    });
                }
                
                if (order.status === OrderStatus.PROCESSED) {
                    eventData.get(order.eventId)!.verificationStatus = 'Pendiente';
                }
                
                // Use the latest update date as the processed date
                const currentData = eventData.get(order.eventId)!;
                if(new Date(order.updatedAt) > new Date(currentData.processedDate)) {
                    currentData.processedDate = order.updatedAt;
                }
            }
        });

        return Array.from(eventData.entries()).map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => (a.verificationStatus > b.verificationStatus ? 1 : -1) || new Date(b.processedDate).getTime() - new Date(a.processedDate).getTime());
    }, [events, orders]);

    useEffect(() => {
        if (!selectedEventId) return;

        const eventOrders = orders.filter(o => o.eventId === selectedEventId && [OrderStatus.PROCESSED, OrderStatus.RECEIVED_OK, OrderStatus.RECEIVED_PARTIAL].includes(o.status));
        const eventOrderIds = new Set(eventOrders.map(o => o.id));
        const eventItems = orderItems.filter(item => eventOrderIds.has(item.orderId));
        
        const aggregationMap = new Map<string, VerifiableItem>();

        for (const item of eventItems) {
            const product = item.productId ? productMap.get(item.productId) : null;
            const key = item.productId || `ooc-${item.productName}`;

            if (!aggregationMap.has(key)) {
                aggregationMap.set(key, {
                    productId: item.productId,
                    productName: item.productName,
                    reference: product?.reference || 'N/A',
                    unit: product?.unit || item.unit || 'ud',
                    totalOrdered: 0,
                    totalReceived: 0,
                    verificationState: 'pending',
                    incidents: [],
                    breakdown: [],
                    supplierName: item.supplierId ? supplierMap.get(item.supplierId)?.name : 'Varios',
                });
            }
            
            const aggItem = aggregationMap.get(key)!;
            aggItem.totalOrdered += item.quantity;
            aggItem.breakdown.push({
                orderItemId: item.id,
                supplierId: item.supplierId,
                orderedQuantity: item.quantity,
            });
        }
        
        const initialVerifiableItems = Array.from(aggregationMap.values()).map(item => ({...item, totalReceived: item.totalOrdered }));
        setVerifiableItems(initialVerifiableItems);

    }, [selectedEventId, orders, orderItems, products, supplierMap]);
    
    const handleUpdateReceived = (index: number, quantityStr: string) => {
        const quantity = parseFloat(quantityStr);
        if (isNaN(quantity) || quantity < 0) return;

        const newItems = [...verifiableItems];
        const item = newItems[index];
        item.totalReceived = quantity;
        if (item.verificationState !== 'incident') {
            item.verificationState = item.totalReceived < item.totalOrdered ? 'partial' : 'ok';
        }
        setVerifiableItems(newItems);
    };

    const handleOpenIncidentModal = (index: number) => {
        setIncidentItemIndex(index);
        setIncidentDescription('');
        setIncidentModalOpen(true);
    };

    const handleAddIncident = () => {
        if (incidentItemIndex === null || !incidentDescription.trim()) return;
        
        const newItems = [...verifiableItems];
        const item = newItems[incidentItemIndex];
        const supplierId = item.breakdown[0]?.supplierId;
        item.incidents.push({ description: incidentDescription, supplierId });
        item.verificationState = 'incident';
        setVerifiableItems(newItems);

        setIncidentModalOpen(false);
        setIncidentItemIndex(null);
    };
    
    const handleSetStatusOK = (index: number) => {
        const newItems = [...verifiableItems];
        const item = newItems[index];
        item.totalReceived = item.totalOrdered;
        item.verificationState = 'ok';
        item.incidents = [];
        setVerifiableItems(newItems);
    };
    
    const isFinalizable = useMemo(() => verifiableItems.every(item => item.verificationState !== 'pending'), [verifiableItems]);

    const handleFinalize = () => {
        if (!isFinalizable || !selectedEventId) return;
        finalizeReception(selectedEventId, verifiableItems);
        alert('Recepción finalizada con éxito. Los estados de los pedidos han sido actualizados.');
        setSelectedEventId(null);
    };
    
    const handleGeneratePdf = () => {
        const { jsPDF } = window as any;
        const doc = new jsPDF();
        const event = events.find(e => e.id === selectedEventId);
        
        doc.setFontSize(18);
        doc.text(`Hoja de Recepción - ${event?.name || ''}`, 105, 20, { align: 'center' });
        doc.setFontSize(11);
        doc.text(`Fecha de Recepción: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Responsable: ${currentUser?.name || 'N/A'}`, 14, 35);

        doc.autoTable({
            startY: 45,
            head: [['Producto', 'Cant. Pedida', 'Cant. Recibida', 'Estado', 'Firma']],
            body: verifiableItems.map(item => [
                item.productName,
                `${item.totalOrdered} ${item.unit}`,
                '', // Empty for manual entry
                '', // Empty for manual entry
                ''  // Empty for manual entry
            ]),
        });
        
        const incidents = verifiableItems.flatMap(item => item.incidents.map(inc => ({...inc, productName: item.productName })));
        if(incidents.length > 0) {
            doc.addPage();
            doc.setFontSize(16);
            doc.text('Incidencias Registradas', 14, 22);
            doc.autoTable({
                head: [['Producto', 'Descripción']],
                body: incidents.map(inc => [
                    inc.productName,
                    inc.description
                ]),
                startY: 30,
            });
        }
        
        doc.save(`Recepcion_${event?.name.replace(/\s/g, '_')}.pdf`);
    };

    if (!selectedEventId) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Gestión de Economato y Recepción</h1>
                <div className="card">
                    <h2 className="card-title">Eventos Procesados</h2>
                    {processedEvents.length > 0 ? (
                        <ul className="space-y-3">
                            {processedEvents.map(event => (
                                <li key={event.id} className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold">{event.name}</h3>
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${event.verificationStatus === 'Verificado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{event.verificationStatus}</span>
                                        <span className="text-sm text-gray-500 ml-2">Procesado el {new Date(event.processedDate).toLocaleDateString()}</span>
                                    </div>
                                    {event.verificationStatus === 'Pendiente' && <button onClick={() => setSelectedEventId(event.id)} className="btn-primary">Gestionar Recepción</button>}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No hay eventos procesados pendientes de recepción.</p>
                    )}
                </div>
                <style>{`.card{background-color:white;padding:1.5rem;border-radius:0.5rem}.dark .card{background-color:#1F2937}.card-title{font-size:1.25rem;font-weight:600}.btn-primary{padding:0.5rem 1rem;color:white;background-color:#4F46E5;border-radius:0.5rem}`}</style>
            </div>
        );
    }

    const getStateIndicator = (state: VerifiableItem['verificationState']) => {
        switch (state) {
            case 'ok': return <span className="text-green-500">✅ OK</span>;
            case 'partial': return <span className="text-orange-500">⚠️ Parcial</span>;
            case 'incident': return <span className="text-red-500">🚨 Incidencia</span>;
            default: return '⚪️ Pendiente';
        }
    };
    
    return (
        <div className="space-y-6">
             <div>
                <button onClick={() => setSelectedEventId(null)} className="text-indigo-600 hover:underline text-sm">&larr; Volver a Eventos</button>
                <h1 className="text-3xl font-bold mt-1">Verificando Recepción: {events.find(e=>e.id===selectedEventId)?.name}</h1>
            </div>
            
            <div className="card">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="th-style">Producto</th><th className="th-style">Cant. Pedida</th><th className="th-style">Cant. Recibida</th><th className="th-style">Estado</th><th className="th-style">Acciones</th></tr></thead>
                        <tbody>
                            {verifiableItems.map((item, index) => (
                                <tr key={item.productId || item.productName} className={`border-b dark:border-gray-700 ${item.verificationState === 'incident' ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                    <td className="p-2 font-medium">
                                        {item.productName}
                                        <span className="block text-xs text-gray-400">{item.reference} | {item.supplierName}</span>
                                    </td>
                                    <td className="p-2">{item.totalOrdered} {item.unit}</td>
                                    <td className="p-2">
                                        <input type="number" value={item.totalReceived} onChange={e => handleUpdateReceived(index, e.target.value)} className="input-style w-24" />
                                    </td>
                                    <td className="p-2 font-semibold">{getStateIndicator(item.verificationState)}</td>
                                    <td className="p-2 space-x-2">
                                        <button onClick={() => handleSetStatusOK(index)} className="btn-action bg-green-100 text-green-800">OK</button>
                                        <button onClick={() => handleOpenIncidentModal(index)} className="btn-action bg-red-100 text-red-800">Incidencia</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="card flex justify-end items-center gap-4">
                <button onClick={handleGeneratePdf} className="btn-secondary">Generar Hoja de Recepción (PDF)</button>
                <button onClick={handleFinalize} disabled={!isFinalizable} className="btn-primary">Finalizar Verificación</button>
            </div>

            <Modal isOpen={isIncidentModalOpen} onClose={() => setIncidentModalOpen(false)} title="Registrar Incidencia">
                <div className="space-y-4">
                    <p>Producto: <strong>{incidentItemIndex !== null && verifiableItems[incidentItemIndex].productName}</strong></p>
                    <textarea value={incidentDescription} onChange={e => setIncidentDescription(e.target.value)} placeholder="Describe el problema (ej: producto caducado, error en variedad, etc.)" rows={4} className="input-style w-full"></textarea>
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIncidentModalOpen(false)} className="btn-secondary">Cancelar</button>
                        <button onClick={handleAddIncident} className="btn-primary">Guardar Incidencia</button>
                    </div>
                </div>
            </Modal>
            
            <style>{`
                .card{background-color:white;padding:1.5rem;border-radius:0.5rem;}.dark .card{background-color:#1F2937}
                .th-style{padding:0.75rem;text-align:left;font-size:0.75rem;color:#6B7280;text-transform:uppercase}.dark .th-style{color:#9CA3AF}
                .input-style{background-color:white;border:1px solid #D1D5DB;border-radius:0.375rem;padding:0.5rem 0.75rem}.dark .input-style{background-color:#374151;border-color:#4B5563;color:#F9FAFB}
                .btn-primary{padding:0.5rem 1rem;font-weight:500;color:white;background-color:#4F46E5;border-radius:0.5rem;}.btn-primary:disabled{background-color:#A5B4FC;cursor:not-allowed;}
                .btn-secondary{padding:0.5rem 1rem;font-weight:500;color:#374151;background-color:#F3F4F6;border-radius:0.5rem;}.dark .btn-secondary{background-color:#4B5563;color:#D1D5DB}
                .btn-action{padding:0.25rem 0.75rem;font-size:0.75rem;font-weight:600;border-radius:0.5rem}
            `}</style>
        </div>
    );
};

export default ReceptionManagement;