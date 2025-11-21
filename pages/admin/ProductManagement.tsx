import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Product } from '../../types';
import { EditIcon, TrashIcon, DownloadIcon } from '../../components/icons';
import ProductFormModal from '../../components/ProductFormModal';
import ConfirmationModal from '../../components/ConfirmationModal';

const ProductManagement: React.FC = () => {
    const { products, suppliers, addProduct, updateProduct, deleteProduct, families } = useData();
    
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [familyFilter, setFamilyFilter] = useState('');

    const supplierMap = useMemo(() => new Map(suppliers.map(s => [s.id, s.name])), [suppliers]);

    const processedProducts = useMemo(() => {
        return products.map(product => {
            const activeSuppliers = product.suppliers.filter(s => s.status === 'Activo');
            if (activeSuppliers.length === 0) {
                return { ...product, bestPrice: null, mainSupplierName: 'Ninguno Activo', otherSuppliersCount: 0 };
            }

            const bestPriceSupplier = activeSuppliers.reduce((min, s) => s.price < min.price ? s : min, activeSuppliers[0]);
            
            return {
                ...product,
                bestPrice: bestPriceSupplier.price,
                mainSupplierName: supplierMap.get(bestPriceSupplier.supplierId) || 'Desconocido',
                otherSuppliersCount: activeSuppliers.length - 1
            };
        });
    }, [products, supplierMap]);

    const filteredProducts = useMemo(() => {
        return processedProducts.filter(product => {
            const matchesSearch = searchTerm === '' || product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFamily = familyFilter === '' || product.family === familyFilter;
            return matchesSearch && matchesFamily;
        });
    }, [processedProducts, searchTerm, familyFilter]);
    
    const openCreateModal = () => {
        setProductToEdit(null);
        setFormModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setProductToEdit(product);
        setFormModalOpen(true);
    };
    
    const openDeleteModal = (product: Product) => {
        setProductToDelete(product);
        setDeleteModalOpen(true);
    };

    const handleSaveProduct = (productData: Product | Omit<Product, 'id'>) => {
        if ('id' in productData) {
            updateProduct(productData);
        } else {
            addProduct(productData);
        }
    };
    
    const handleDelete = () => {
        if (productToDelete) {
            deleteProduct(productToDelete.id);
            setDeleteModalOpen(false);
            setProductToDelete(null);
        }
    };

    const exportToCsv = () => {
        const headers = ['reference', 'name', 'status', 'iva', 'unit', 'family', 'category', 'productState', 'warehouseStatus', 'allergens', 'suppliers'];
        const csvRows = [headers.join(',')];

        for (const product of products) {
            const values = headers.map(header => {
                let value = (product as any)[header];
                if (Array.isArray(value)) {
                    if (header === 'suppliers') {
                        value = value.map(s => `${supplierMap.get(s.supplierId)}:${s.price}:${s.status}`).join('|');
                    } else {
                        value = value.join('|');
                    }
                }
                return `"${String(value || '').replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `catalogo_productos_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Catálogo</h1>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <button onClick={exportToCsv} className="btn-secondary flex items-center justify-center gap-2"><DownloadIcon className="w-4 h-4"/> Exportar CSV</button>
                    <button onClick={openCreateModal} className="btn-primary">Nuevo Producto</button>
                </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
                 <input
                    type="text"
                    placeholder="Buscar producto por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-style flex-grow"
                />
                <select value={familyFilter} onChange={e => setFamilyFilter(e.target.value)} className="input-style sm:w-64">
                    <option value="">Todas las familias</option>
                    {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="th-style">Nombre</th>
                                <th className="th-style">Mejor Precio</th>
                                <th className="th-style">Proveedor Principal</th>
                                <th className="th-style">Estado</th>
                                <th className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {product.bestPrice !== null 
                                            ? `${product.bestPrice.toFixed(2)}€`
                                            : <span className="text-xs text-gray-500 italic">Ninguno Activo</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {product.mainSupplierName}
                                        {product.otherSuppliersCount > 0 && 
                                            <span className="ml-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">+{product.otherSuppliersCount}</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-3">
                                            <button onClick={() => openEditModal(products.find(p => p.id === product.id)!)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400" title="Editar"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => openDeleteModal(product)} className="text-red-600 hover:text-red-900 dark:text-red-400" title="Eliminar"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSave={handleSaveProduct}
                productToEdit={productToEdit}
            />
            
            {productToDelete && (
                 <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleDelete}
                    title={`Eliminar Producto: ${productToDelete.name}`}
                    confirmationText="ELIMINAR"
                >
                    <p>Esta acción es irreversible y eliminará permanentemente el producto del catálogo.</p>
                </ConfirmationModal>
            )}
             <style>{`
                .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; color: white; background-color: #4F46E5; border-radius: 0.5rem; transition: background-color 0.2s; }
                .btn-primary:hover { background-color: #4338CA; }
                .btn-secondary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 600; color: #374151; background-color: #F3F4F6; border: 1px solid #D1D5DB; border-radius: 0.5rem; transition: background-color 0.2s; }
                .dark .btn-secondary { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                .btn-secondary:hover { background-color: #E5E7EB; }
                .dark .btn-secondary:hover { background-color: #4B5563; }
                .input-style { background-color: white; border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.5rem 0.75rem; }
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                .th-style { padding: 0.75rem 1.5rem; text-align: left; font-size: 0.75rem; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
                .dark .th-style { color: #9CA3AF; }
            `}</style>
        </div>
    );
};

export default ProductManagement;