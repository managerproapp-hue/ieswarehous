import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Product, EventType, EventStatus, OrderStatus, OrderItem } from '../../types';
import { WAREHOUSE_INTERNAL_USER_ID } from '../../constants';
import { TrashIcon } from '../../components/icons';

type TempOrderItem = Omit<OrderItem, 'id' | 'orderId'>;

const ReplenishStock: React.FC = () => {
    const { events, products, suppliers, saveOrder } = useData();
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    
    // State for order form
    const [items, setItems] = useState<TempOrderItem[]>([]);
    const [notes, setNotes] = useState('Pedido de reposición de stock para Mini-Economato.');
    const [productSearch, setProductSearch] = useState('');

    const suppliersMap = useMemo(() => new Map(suppliers.map(s => [s.id, s])), [suppliers]);
    
    // --- Event Selection Logic ---
    const availableEvents = useMemo(() => {
        return events.filter(e => e.type === EventType.REGULAR && e.status === EventStatus.ACTIVE);
    }, [events]);

    const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

    // --- Order Form Logic ---
    const getBestPriceInfo = (product: Product): { price: number; supplierId: string } | null => {
        if (!product.suppliers || product.suppliers.length === 0) {
            return null;
        }
        const sortedSuppliers = [...product.suppliers].sort((a, b) => a.price - b.price);
        return { price: sortedSuppliers[0].price, supplierId: sortedSuppliers[0].supplierId };
    };

    const handleAddItem = (product: Product) => {
        const bestPriceInfo = getBestPriceInfo(product);
        if (!bestPriceInfo) {
            alert("Este producto no tiene proveedores asignados y no puede ser añadido.");
            return;
        }

        const existingItemIndex = items.findIndex(i => i.productId === product.id);
        if (existingItemIndex > -1) {
            const newItems = [...items];
            newItems[existingItemIndex].quantity += 1;
            setItems(newItems);
        } else {
            const newItem: TempOrderItem = {
                productId: product.id,
                productName: product.name,
                quantity: 1,
                isOutOfCatalog: false,
                supplierId: bestPriceInfo.supplierId,
                unitPrice: bestPriceInfo.price,
                unit: product.unit,
            };
            setItems([...items, newItem]);
        }
        setProductSearch('');
    };

    const handleUpdateQuantity = (index: number, quantity: number) => {
        if (quantity >= 0) {
            const newItems = [...items];
            if (quantity === 0) {
                 newItems.splice(index, 1);
            } else {
                newItems[index].quantity = quantity;
            }
            setItems(newItems);
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };
    
    const handleSubmit = () => {
        if (!selectedEventId) return;
        
        const orderData = {
            eventId: selectedEventId,
            teacherId: WAREHOUSE_INTERNAL_USER_ID,
            status: OrderStatus.SUBMITTED,
            notes,
        };

        const validItems = items.filter(i => i.quantity > 0);

        saveOrder(orderData, validItems);
        alert(`Pedido de reposición enviado con éxito!`);
        setSelectedEventId(null);
        setItems([]);
    };
    
    const filteredProducts = productSearch 
        ? products.filter(p => p.status === 'Activo' && p.name.toLowerCase().includes(productSearch.toLowerCase()))
        : [];
        
    const totalCost = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.unitPrice || 0) * item.quantity, 0);
    }, [items]);

    // --- Render Logic ---
    if (!selectedEventId) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Reposición de Stock: Seleccionar Evento</h1>
                <p className="text-gray-600 dark:text-gray-400">Selecciona una ventana de pedido regular y activa para crear un pedido de reposición.</p>
                <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    {availableEvents.length > 0 ? (
                        <ul className="space-y-3">
                            {availableEvents.map(event => (
                                <li key={event.id} className="p-4 border dark:border-gray-700 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h3 className="font-bold">{event.name}</h3>
                                        <p className="text-sm text-gray-500">Cierra el: {new Date(event.endDate).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => setSelectedEventId(event.id)} className="btn-primary">Seleccionar</button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No hay ventanas de pedido abiertas para reposición.</p>
                    )}
                </div>
                <style>{`.btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.5rem; }`}</style>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <button onClick={() => setSelectedEventId(null)} className="text-indigo-600 hover:underline text-sm">&larr; Cambiar Evento</button>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pedido de Reposición para: {selectedEvent?.name}</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Añade los productos necesarios para reabastecer el Mini-Economato.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Artículos del Pedido</h2>
                        <span className="font-bold text-lg">Total: {totalCost.toFixed(2)}€</span>
                    </div>
                    {items.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">Añade productos desde el catálogo.</p>
                    ) : (
                        <div className="max-h-96 overflow-y-auto pr-2">
                        <table className="min-w-full">
                            <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="border-b dark:border-gray-700">
                                    <td className="py-2">
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-xs text-gray-500">
                                            {suppliersMap.get(item.supplierId!)?.name} - {item.unitPrice?.toFixed(2)}€/{item.unit}
                                        </p>
                                    </td>
                                    <td className="py-2">
                                        <input 
                                            type="number" 
                                            value={item.quantity}
                                            onChange={e => handleUpdateQuantity(index, parseFloat(e.target.value))}
                                            min="0"
                                            step="0.1"
                                            className="w-24 text-center bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md"
                                        />
                                    </td>
                                    <td className="py-2 text-right">
                                        <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 className="font-semibold mb-2">Añadir desde Catálogo</h3>
                        <div className="relative">
                        <input 
                            type="text" 
                            placeholder="Buscar producto..." 
                            value={productSearch}
                            onChange={e => setProductSearch(e.target.value)}
                            className="w-full input-style"
                        />
                        {productSearch && (
                            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-64 overflow-y-auto">
                                {filteredProducts.map(p => {
                                    const bestPrice = getBestPriceInfo(p);
                                    return (
                                        <li key={p.id} onClick={() => handleAddItem(p)} className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${!bestPrice ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} title={!bestPrice ? 'Sin proveedor asignado' : ''}>
                                            <div className="flex justify-between">
                                                <span>{p.name}</span>
                                                {bestPrice && <span className="font-semibold">{bestPrice.price.toFixed(2)}€</span>}
                                            </div>
                                        </li>
                                    );
                                })}
                                {filteredProducts.length === 0 && <li className="p-2 text-center text-xs text-gray-500">No se encontraron productos</li>}
                            </ul>
                        )}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                        <h3 className="font-semibold mb-2">Notas del Pedido</h3>
                         <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full input-style"></textarea>
                        <button onClick={handleSubmit} className="mt-3 w-full btn-primary" disabled={items.length === 0}>Enviar Pedido de Reposición</button>
                    </div>
                </div>
            </div>
             <style>{`
                .input-style { background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } 
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                .btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.5rem; }
                .btn-primary:disabled { background-color: #A5B4FC; cursor: not-allowed; }
            `}</style>
        </div>
    );
};

export default ReplenishStock;