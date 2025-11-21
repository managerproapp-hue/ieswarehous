import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Supplier, Product } from '../../types';
import { EditIcon, TrashIcon, EyeIcon, BriefcaseIcon, WarningIcon } from '../../components/icons';
import SupplierFormModal from '../../components/SupplierFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';
import SupplierDetailModal from '../../components/SupplierDetailModal';
import ProductListModal from '../../components/ProductListModal';
import ProductFormModal from '../../components/ProductFormModal';

// Mini Dashboard Card for each Supplier
const SupplierCard: React.FC<{
    supplier: Supplier;
    onEdit: (supplier: Supplier) => void;
    onDelete: (supplier: Supplier) => void;
    onViewDetails: (supplier: Supplier) => void;
    onViewProducts: (supplier: Supplier) => void;
}> = ({ supplier, onEdit, onDelete, onViewDetails, onViewProducts }) => {
    const { products, orderItems, incidents } = useData();

    const productCount = useMemo(() => {
        return products.filter(p => p.suppliers.some(s => s.supplierId === supplier.id)).length;
    }, [products, supplier.id]);

    const incidentsCount = useMemo(() => {
        return incidents.filter(i => i.supplierId === supplier.id).length;
    }, [incidents, supplier.id]);

    const topProducts = useMemo(() => {
        const relevantItems = orderItems.filter(item => item.supplierId === supplier.id);
        
        const quantityMap = relevantItems.reduce((acc, item) => {
            if (item.productId) {
                acc.set(item.productId, (acc.get(item.productId) || 0) + item.quantity);
            }
            return acc;
        }, new Map<string, number>());
        
        const sorted = Array.from(quantityMap.entries()).sort((a, b) => b[1] - a[1]);
        const top5 = sorted.slice(0, 5);
        
        const productMap = new Map(products.map(p => [p.id, { name: p.name, unit: p.unit }]));
        return top5.map(([productId, quantity]) => ({
            name: productMap.get(productId)?.name || 'Desconocido',
            quantity,
            unit: productMap.get(productId)?.unit || 'uds'
        }));
    }, [products, orderItems, supplier.id]);

    return (
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className={`h-2 ${supplier.status === 'Activo' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <div className="p-5 flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{supplier.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full ${supplier.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                                <span className={`w-2 h-2 mr-1.5 rounded-full ${supplier.status === 'Activo' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                {supplier.status}
                            </span>
                            {incidentsCount > 0 && <WarningIcon className="w-4 h-4 text-yellow-500" title={`${incidentsCount} incidencias registradas`} />}
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 border-t dark:border-gray-700 pt-4 space-y-3">
                    <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">Inteligencia de Negocio</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                        <p><strong>{productCount}</strong> referencias en la App</p>
                        <p><strong>{incidentsCount}</strong> incidencias registradas</p>
                        <div>
                            <p className="font-semibold">Top 5 más pedidos:</p>
                            {topProducts.length > 0 ? (
                                <ul className="list-disc list-inside pl-2 text-xs">
                                    {topProducts.map(p => <li key={p.name}>{p.name} ({p.quantity} {p.unit})</li>)}
                                </ul>
                            ) : <p className="text-xs italic">Sin pedidos registrados.</p>}
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 flex justify-end items-center space-x-1">
                <button onClick={() => onEdit(supplier)} className="btn-action" title="Editar"><EditIcon className="w-4 h-4"/></button>
                <button onClick={() => onViewDetails(supplier)} className="btn-action" title="Ver Ficha Completa"><EyeIcon className="w-4 h-4"/></button>
                <button onClick={() => onViewProducts(supplier)} className="btn-action" title="Ver Productos Asociados"><BriefcaseIcon className="w-4 h-4"/></button>
                <button onClick={() => onDelete(supplier)} className="btn-action-danger" title="Eliminar"><TrashIcon className="w-4 h-4"/></button>
            </div>
            <style>{`
                .btn-action { padding: 0.5rem; border-radius: 9999px; color: #4B5563; } .dark .btn-action { color: #9CA3AF; } .btn-action:hover { background-color: #E5E7EB; } .dark .btn-action:hover { background-color: #374151; }
                .btn-action-danger { padding: 0.5rem; border-radius: 9999px; color: #DC2626; } .dark .btn-action-danger { color: #F87171; } .btn-action-danger:hover { background-color: #FEE2E2; } .dark .btn-action-danger:hover { background-color: #450A0A; }
            `}</style>
        </div>
    );
};


const SupplierManagement: React.FC = () => {
    const { suppliers, addSupplier, updateSupplier, deleteSupplier, updateProduct } = useData();
    
    // Modal States
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isProductListModalOpen, setIsProductListModalOpen] = useState(false);
    const [isProductFormModalOpen, setIsProductFormModalOpen] = useState(false);

    // Data States for Modals
    const [activeSupplier, setActiveSupplier] = useState<Supplier | null>(null);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);
    
    // Handlers for main supplier actions
    const handleCreate = () => {
        setActiveSupplier(null);
        setIsFormModalOpen(true);
    };
    const handleEdit = (supplier: Supplier) => {
        setActiveSupplier(supplier);
        setIsFormModalOpen(true);
    };
    const handleDeleteRequest = (supplier: Supplier) => {
        setActiveSupplier(supplier);
        setIsDeleteModalOpen(true);
    };
    const handleViewDetails = (supplier: Supplier) => {
        setActiveSupplier(supplier);
        setIsDetailModalOpen(true);
    };
    const handleViewProducts = (supplier: Supplier) => {
        setActiveSupplier(supplier);
        setIsProductListModalOpen(true);
    };

    // Handler for saving from form
    const handleSaveSupplier = (supplierData: Supplier | Omit<Supplier, 'id'>) => {
        if ('id' in supplierData) {
            updateSupplier(supplierData);
        } else {
            addSupplier(supplierData as Omit<Supplier, 'id'>);
        }
        setIsFormModalOpen(false);
    };
    
    // Handler for actual deletion
    const handleDeleteConfirm = () => {
        if (activeSupplier) {
            deleteSupplier(activeSupplier.id);
            setIsDeleteModalOpen(false);
            setActiveSupplier(null);
        }
    };
    
    // Handler for editing a product from the ProductListModal
    const handleEditProduct = (product: Product) => {
        setProductToEdit(product);
        setIsProductListModalOpen(false); // Close product list
        setIsProductFormModalOpen(true); // Open product form
    };

    const handleSaveProduct = (productData: Product | Omit<Product, 'id'>) => {
        if ('id' in productData) {
            updateProduct(productData);
        }
        // We don't handle creating new products from this flow
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Panel de Proveedores</h1>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Buscar proveedor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 whitespace-nowrap"
                    >
                        Nuevo Proveedor
                    </button>
                </div>
            </div>

            {filteredSuppliers.length === 0 ? (
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="text-center py-16">
                        <p className="text-gray-500 dark:text-gray-400">No se encontraron proveedores.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSuppliers.map((supplier) => (
                        <SupplierCard 
                            key={supplier.id} 
                            supplier={supplier}
                            onEdit={handleEdit}
                            onDelete={handleDeleteRequest}
                            onViewDetails={handleViewDetails}
                            onViewProducts={handleViewProducts}
                        />
                    ))}
                </div>
            )}

            <SupplierFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveSupplier}
                supplierToEdit={activeSupplier}
            />
            
            {activeSupplier && (
                 <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleDeleteConfirm}
                    title={`Eliminar a ${activeSupplier.name}`}
                    confirmationText="ELIMINAR"
                >
                    <p>Esta acción es irreversible y eliminará permanentemente al proveedor.</p>
                    <p>El sistema desvinculará automáticamente a este proveedor de todos los productos del catálogo.</p>
                </ConfirmationModal>
            )}

            <SupplierDetailModal
                supplier={activeSupplier}
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
            />
            
            <ProductListModal
                supplier={activeSupplier}
                isOpen={isProductListModalOpen}
                onClose={() => setIsProductListModalOpen(false)}
                onEditProduct={handleEditProduct}
            />
            
            <ProductFormModal 
                isOpen={isProductFormModalOpen}
                onClose={() => {
                    setIsProductFormModalOpen(false);
                    setProductToEdit(null);
                }}
                onSave={handleSaveProduct}
                productToEdit={productToEdit}
            />
        </div>
    );
};

export default SupplierManagement;