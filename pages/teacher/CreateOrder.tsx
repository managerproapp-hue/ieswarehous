import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
// Fix: Added Role to imports to use the enum value instead of a string.
import { Product, OrderItem, OrderStatus, EventStatus, Supplier, Role } from '../../types';
import { TrashIcon } from '../../components/icons';

type TempOrderItem = Omit<OrderItem, 'id' | 'orderId'>;

const CreateOrder: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('orderId');
    const navigate = useNavigate();

    const { products, suppliers, events, getOrderWithItems, saveOrder } = useData();
    const { currentUser } = useAuth();
    
    const [items, setItems] = useState<TempOrderItem[]>([]);
    const [notes, setNotes] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [outOfCatalogName, setOutOfCatalogName] = useState('');

    const event = useMemo(() => events.find(e => e.id === eventId), [events, eventId]);
    const isEventActive = event?.status === EventStatus.ACTIVE;
    const suppliersMap = useMemo(() => new Map(suppliers.map(s => [s.id, s])), [suppliers]);
    
    const { order, isFormDisabled } = useMemo(() => {
        if (!orderId) {
            return { order: null, isFormDisabled: !isEventActive };
        }
        const { order } = getOrderWithItems(orderId);
        const disabled = !isEventActive || 
            order?.status === OrderStatus.PROCESSED || 
            order?.status === OrderStatus.SUBMITTED ||
            order?.status === OrderStatus.RECEIVED_OK ||
            order?.status === OrderStatus.RECEIVED_PARTIAL;
        
        return { order, isFormDisabled: disabled };

    }, [orderId, getOrderWithItems, isEventActive]);


    useEffect(() => {
        if (orderId) {
            const { order, items: existingItems } = getOrderWithItems(orderId);
            if (order && (order.teacherId === currentUser?.id || currentUser?.roles.includes(Role.ADMIN))) {
                setItems(existingItems.map(({ id, orderId, ...rest}) => rest));
                setNotes(order.notes);
            }
        }
    }, [orderId, getOrderWithItems, currentUser]);

    const handleAddItem = (product: Product, supplierId: string) => {
        const supplierInfo = product.suppliers.find(s => s.supplierId === supplierId);
        if (!supplierInfo) return;

        const newItem: TempOrderItem = {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unit: product.unit,
            isOutOfCatalog: false,
            supplierId: supplierInfo.supplierId,
            unitPrice: supplierInfo.price
        };

        const existingItemIndex = items.findIndex(i => i.productId === product.id && i.supplierId === supplierId);
        if (existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += 1;
            setItems(newItems);
        } else {
            setItems([...items, newItem]);
        }
        setProductSearch('');
    };
    
    const handleAddOutOfCatalogItem = () => {
        if (outOfCatalogName.trim()) {
            setItems([...items, { productId: null, productName: outOfCatalogName, quantity: 1, unit: 'ud', isOutOfCatalog: true, supplierId: undefined, unitPrice: 0 }]);
            setOutOfCatalogName('');
        }
    };
    
    const handleUpdateQuantity = (index: number, quantity: number) => {
        if (quantity >= 1) {
            const newItems = [...items];
            newItems[index].quantity = quantity;
            setItems(newItems);
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleSave = (status: OrderStatus) => {
        if (!eventId || !currentUser) return;
        
        const orderData = {
            id: orderId || undefined,
            eventId,
            teacherId: currentUser.id,
            status,
            notes,
        };
        saveOrder(orderData, items);
        alert(`Pedido ${status === OrderStatus.DRAFT ? 'guardado como borrador' : 'enviado'} con éxito!`);
        navigate('/teacher/order-portal');
    };
    
    const filteredProducts = productSearch 
        ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
        : [];

    if (!event) return <div>Evento no encontrado.</div>;
    if (!currentUser) return null;

    return (
        <div className="space-y-6">
            <div>
                <Link to="/teacher/order-portal" className="text-indigo-600 hover:underline text-sm">&larr; Volver al portal</Link>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pedido para: {event.name}</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Fecha límite para enviar: {new Date(event.endDate).toLocaleDateString()}</p>
                {isFormDisabled && order && order.status !== OrderStatus.DRAFT && <p className="mt-1 font-bold text-green-700 dark:text-green-400">Este pedido ya ha sido enviado/procesado y no se puede modificar.</p>}
                {!isEventActive && <p className="mt-1 font-bold text-red-700 dark:text-red-400">Este evento no está activo. No se pueden modificar pedidos.</p>}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Artículos del Pedido</h2>
                    {items.length === 0 ? (
                        <p className="text-gray-500">No hay artículos en el pedido.</p>
                    ) : (
                        <ul className="divide-y dark:divide-gray-700">
                            {items.map((item, index) => (
                                <li key={index} className="py-3 flex items-center justify-between gap-4">
                                    <div className="flex-grow">
                                        <p className="font-medium">{item.productName}</p>
                                        {item.isOutOfCatalog ? (
                                             <span className="text-xs bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5">Fuera de catálogo</span>
                                        ) : (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {suppliersMap.get(item.supplierId!)?.name} - {item.unitPrice?.toFixed(2)}€/{item.unit}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="number" 
                                            value={item.quantity}
                                            onChange={e => handleUpdateQuantity(index, parseInt(e.target.value, 10))}
                                            min="1"
                                            className="w-20 text-center bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md"
                                            disabled={isFormDisabled}
                                        />
                                        <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700" disabled={isFormDisabled}><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                     <div className="pt-4">
                        <label className="block text-sm font-medium">Notas generales del pedido</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 w-full input-style" disabled={isFormDisabled}></textarea>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 className="font-semibold mb-2">Añadir desde Catálogo</h3>
                        <input 
                            type="text" 
                            placeholder="Buscar producto..." 
                            value={productSearch}
                            onChange={e => setProductSearch(e.target.value)}
                            className="w-full input-style"
                            disabled={isFormDisabled}
                        />
                        {productSearch && (
                            <ul className="mt-2 border dark:border-gray-700 rounded-md max-h-64 overflow-y-auto">
                                {filteredProducts.map(p => (
                                    <li key={p.id} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm">
                                        <p className="font-bold">{p.name}</p>
                                        {p.suppliers.length > 0 ? (
                                            <div className="pl-2 mt-1 space-y-1">
                                                {p.suppliers.map(sup => (
                                                     <button key={sup.supplierId} onClick={() => handleAddItem(p, sup.supplierId)} className="w-full text-left text-xs p-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex justify-between">
                                                        <span>{suppliersMap.get(sup.supplierId)?.name || 'Desconocido'}</span>
                                                        <span className="font-semibold">{sup.price.toFixed(2)}€</span>
                                                    </button>
                                                ))}
                                            </div>
                                        ) : <p className="text-xs text-gray-400 pl-2">Sin proveedores</p>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 className="font-semibold mb-2">Añadir Fuera de Catálogo</h3>
                        <input 
                            type="text" 
                            placeholder="Nombre del artículo..." 
                            value={outOfCatalogName}
                            onChange={e => setOutOfCatalogName(e.target.value)}
                            className="w-full input-style"
                            disabled={isFormDisabled}
                        />
                        <button onClick={handleAddOutOfCatalogItem} className="mt-2 w-full btn-secondary" disabled={isFormDisabled}>Añadir Artículo</button>
                    </div>
                    {!isFormDisabled && (
                        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 flex flex-col gap-3">
                            <button onClick={() => handleSave(OrderStatus.DRAFT)} className="w-full btn-secondary" disabled={!isEventActive}>Guardar Borrador</button>
                            <button onClick={() => handleSave(OrderStatus.SUBMITTED)} className="w-full btn-primary" disabled={!isEventActive || items.length === 0}>Enviar Pedido Final</button>
                        </div>
                    )}
                </div>
            </div>
            <style>{`
                .input-style { background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } 
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; }
                .btn-primary:hover:not(:disabled) { background-color: #4338CA; }
                .btn-secondary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border-radius: 0.375rem; }
                .dark .btn-secondary { background-color: #4B5563; color: #D1D5DB; }
                .btn-secondary:hover:not(:disabled) { background-color: #E5E7EB; }
                .dark .btn-secondary:hover:not(:disabled) { background-color: #374151; }
                :disabled { cursor: not-allowed; opacity: 0.6; }
            `}</style>
        </div>
    );
};

export default CreateOrder;