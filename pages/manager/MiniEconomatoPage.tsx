import React, { useState, useMemo, FormEvent } from 'react';
import { useData } from '../../contexts/DataContext';
import { Product, MiniEconomatoItem, Role } from '../../types';
import Modal from '../../components/Modal';
import { DownloadIcon, EditIcon, TrashIcon } from '../../components/icons';

// Add jsPDF declaration
declare global {
  interface Window {
    jspdf: any;
  }
}


type EnrichedItem = MiniEconomatoItem & {
  name: string;
  unit: string;
};

const MiniEconomatoPage: React.FC = () => {
    const { miniEconomato, updateMiniEconomato, assignExpenseFromMiniEconomato, products, users } = useData();
    
    const [modalState, setModalState] = useState<'add' | 'edit' | 'assign' | null>(null);
    const [selectedItem, setSelectedItem] = useState<EnrichedItem | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

    const enrichedItems = useMemo<EnrichedItem[]>(() => 
        miniEconomato.map(item => {
            const product = productMap.get(item.productId);
            return {
                ...item,
                name: product?.name || 'Producto Desconocido',
                unit: product?.unit || 'uds',
            };
        }).sort((a, b) => a.name.localeCompare(b.name)),
    [miniEconomato, productMap]);

    const getStockLevel = (current: number, min: number) => {
        if (current === 0) return { label: 'Agotado', color: 'bg-red-500', icon: '🔴' };
        if (current < min * 0.5) return { label: 'Bajo Mínimos', color: 'bg-orange-500', icon: '🟠' };
        if (current <= min) return { label: 'Nivel Bajo', color: 'bg-yellow-500', icon: '🟡' };
        return { label: 'Saludable', color: 'bg-green-500', icon: '🟢' };
    };
    
    const handleDownloadPdf = () => {
        const { jsPDF } = window as any;
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Informe de Stock - Mini-Economato", 14, 22);
        doc.setFontSize(11);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
        
        doc.autoTable({
            startY: 40,
            head: [['Producto', 'Stock Actual', 'Stock Mínimo', 'Unidad', 'Estado']],
            body: enrichedItems.map(item => [
                item.name,
                item.currentStock.toFixed(2),
                item.minStock.toFixed(2),
                item.unit,
                getStockLevel(item.currentStock, item.minStock).label
            ])
        });

        doc.save(`stock_mini_economato_${new Date().toISOString().split('T')[0]}.pdf`);
    };

    const handleAction = (type: 'add' | 'edit' | 'assign', item?: EnrichedItem) => {
        setSelectedItem(item || null);
        setModalState(type);
        setError(null);
    };
    
    const closeModal = () => {
        setModalState(null);
        setSelectedItem(null);
        setError(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Mini-Economato</h1>
                <div className="flex gap-2">
                    <button onClick={handleDownloadPdf} className="btn-secondary flex items-center gap-2"><DownloadIcon className="w-4 h-4"/> Descargar PDF</button>
                    <button onClick={() => handleAction('add')} className="btn-primary">Añadir Producto</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {enrichedItems.map(item => {
                    const level = getStockLevel(item.currentStock, item.minStock);
                    return (
                        <div key={item.productId} className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden flex flex-col">
                            <div className="p-5 flex-grow">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{item.name}</h3>
                                <div className="mt-4">
                                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{item.currentStock.toFixed(2)} <span className="text-base font-medium text-gray-500">{item.unit}</span></p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Mínimo: {item.minStock.toFixed(2)} {item.unit}</p>
                                </div>
                                <div className="mt-3">
                                    <span className={`text-xs font-semibold inline-flex items-center px-2.5 py-1 rounded-full text-white ${level.color}`}>
                                        {level.icon} <span className="ml-1.5">{level.label}</span>
                                    </span>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 grid grid-cols-2 gap-2">
                                <button onClick={() => handleAction('edit', item)} className="btn-secondary text-sm">Editar Stock</button>
                                <button onClick={() => handleAction('assign', item)} className="btn-primary text-sm">Asignar Gasto</button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {modalState === 'add' && <StockManagementModal onClose={closeModal} />}
            {modalState === 'edit' && selectedItem && <StockManagementModal onClose={closeModal} itemToEdit={selectedItem} />}
            {modalState === 'assign' && selectedItem && <AssignExpenseModal onClose={closeModal} item={selectedItem} setError={setError} error={error} />}

            <style>{`
                .btn-primary { padding: 0.6rem 1rem; font-weight: 600; color: white; background-color: #4F46E5; border-radius: 0.5rem; transition: background-color 0.2s; }
                .btn-secondary { padding: 0.6rem 1rem; font-weight: 600; color: #374151; background-color: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
                .dark .btn-secondary { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
            `}</style>
        </div>
    );
};

// --- MODALS ---

const StockManagementModal: React.FC<{ onClose: () => void, itemToEdit?: EnrichedItem }> = ({ onClose, itemToEdit }) => {
    const { miniEconomato, updateMiniEconomato, products } = useData();
    const [productId, setProductId] = useState(itemToEdit?.productId || '');
    const [currentStock, setCurrentStock] = useState(itemToEdit?.currentStock || 0);
    const [minStock, setMinStock] = useState(itemToEdit?.minStock || 0);

    const availableProducts = useMemo(() => {
        const existingIds = new Set(miniEconomato.map(i => i.productId));
        return products.filter(p => p.status === 'Activo' && !existingIds.has(p.id));
    }, [products, miniEconomato]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!productId || minStock < 0 || currentStock < 0) return;
        
        let updatedItems;
        if (itemToEdit) {
            updatedItems = miniEconomato.map(item => item.productId === itemToEdit.productId ? { ...item, currentStock, minStock } : item);
        } else {
            updatedItems = [...miniEconomato, { productId, currentStock, minStock }];
        }
        updateMiniEconomato(updatedItems);
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={itemToEdit ? 'Editar Stock' : 'Añadir Producto al Mini-Economato'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label-style">Producto</label>
                    {itemToEdit ? (
                        <input value={itemToEdit.name} disabled className="input-style bg-gray-100 dark:bg-gray-700" />
                    ) : (
                        <select value={productId} onChange={e => setProductId(e.target.value)} required className="input-style">
                            <option value="">-- Seleccionar producto --</option>
                            {availableProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label-style">{itemToEdit ? 'Stock Actual' : 'Stock Inicial'}</label>
                        <input type="number" value={currentStock} onChange={e => setCurrentStock(parseFloat(e.target.value))} min="0" step="any" required className="input-style" />
                    </div>
                     <div>
                        <label className="label-style">Stock Mínimo</label>
                        <input type="number" value={minStock} onChange={e => setMinStock(parseFloat(e.target.value))} min="0" step="any" required className="input-style" />
                    </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
            <style>{`
                .label-style{display:block;margin-bottom:0.25rem;font-size:0.875rem;font-weight:500}
                .input-style{display:block;width:100%;border-radius:0.375rem;padding:0.5rem 0.75rem;border:1px solid #D1D5DB}.dark .input-style{background-color:#374151;border-color:#4B5563}
            `}</style>
        </Modal>
    );
};

const AssignExpenseModal: React.FC<{ onClose: () => void, item: EnrichedItem, error: string | null, setError: (e: string | null) => void }> = ({ onClose, item, error, setError }) => {
    const { users, assignExpenseFromMiniEconomato } = useData();
    const [teacherId, setTeacherId] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    const teachers = useMemo(() => users.filter(u => u.roles.includes(Role.TEACHER)), [users]);
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!teacherId || quantity <= 0) return;
        try {
            assignExpenseFromMiniEconomato(item.productId, teacherId, quantity);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
        }
    };

    return (
         <Modal isOpen={true} onClose={onClose} title={`Asignar Gasto de: ${item.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm">{error}</div>}
                <div>
                    <label className="label-style">Profesor Responsable</label>
                    <select value={teacherId} onChange={e => setTeacherId(e.target.value)} required className="input-style">
                        <option value="">-- Seleccionar profesor --</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="label-style">Cantidad Retirada ({item.unit})</label>
                    <input type="number" value={quantity} onChange={e => setQuantity(parseFloat(e.target.value))} min="0.01" max={item.currentStock} step="any" required className="input-style" />
                    <p className="text-xs text-gray-500 mt-1">Stock disponible: {item.currentStock} {item.unit}</p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Confirmar Gasto</button>
                </div>
            </form>
             <style>{`
                .label-style{display:block;margin-bottom:0.25rem;font-size:0.875rem;font-weight:500}
                .input-style{display:block;width:100%;border-radius:0.375rem;padding:0.5rem 0.75rem;border:1px solid #D1D5DB}.dark .input-style{background-color:#374151;border-color:#4B5563}
            `}</style>
        </Modal>
    );
};

export default MiniEconomatoPage;