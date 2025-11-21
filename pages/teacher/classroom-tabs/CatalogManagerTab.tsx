import React, { useState } from 'react';
import { Classroom, Product, Supplier } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import ProductFormModal from '../../../components/ProductFormModal';
import SupplierFormModal from '../../../components/SupplierFormModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { EditIcon, TrashIcon } from '../../../components/icons';

interface CatalogManagerTabProps {
  classroom: Classroom;
}

const CatalogManagerTab: React.FC<CatalogManagerTabProps> = ({ classroom }) => {
    const { updateClassroomContent } = useData();
    const [view, setView] = useState<'products' | 'suppliers'>('products');
    
    // Modal states
    const [isProductFormOpen, setProductFormOpen] = useState(false);
    const [isSupplierFormOpen, setSupplierFormOpen] = useState(false);
    const [productToEdit, setProductToEdit] = useState<Product | null>(null);
    const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'supplier', data: any } | null>(null);

    // Save handlers
    const handleSaveProduct = (productData: Product | Omit<Product, 'id'>) => {
        let updatedProducts;
        if ('id' in productData) {
            updatedProducts = classroom.products.map(p => p.id === productData.id ? productData : p);
        } else {
            const newProduct = { ...productData, id: `sb-prod-${Date.now()}` };
            updatedProducts = [...classroom.products, newProduct];
        }
        updateClassroomContent(classroom.id, 'products', updatedProducts);
    };

    const handleSaveSupplier = (supplierData: Supplier | Omit<Supplier, 'id'>) => {
        let updatedSuppliers;
        if ('id' in supplierData) {
            updatedSuppliers = classroom.suppliers.map(s => s.id === supplierData.id ? supplierData : s);
        } else {
            const newSupplier = { ...supplierData, id: `sb-sup-${Date.now()}` };
            updatedSuppliers = [...classroom.suppliers, newSupplier];
        }
        updateClassroomContent(classroom.id, 'suppliers', updatedSuppliers);
    };

    // Delete handlers
    const handleDeleteRequest = (type: 'product' | 'supplier', data: any) => {
        setItemToDelete({ type, data });
    };

    const handleDeleteConfirm = () => {
        if (!itemToDelete) return;
        if (itemToDelete.type === 'product') {
            const updatedProducts = classroom.products.filter(p => p.id !== itemToDelete.data.id);
            updateClassroomContent(classroom.id, 'products', updatedProducts);
        } else {
            const updatedSuppliers = classroom.suppliers.filter(s => s.id !== itemToDelete.data.id);
            updateClassroomContent(classroom.id, 'suppliers', updatedSuppliers);
        }
        setItemToDelete(null);
    };

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <div className="flex space-x-1 bg-gray-200 dark:bg-gray-700 p-1 rounded-lg">
                    <button onClick={() => setView('products')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${view === 'products' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Productos</button>
                    <button onClick={() => setView('suppliers')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${view === 'suppliers' ? 'bg-white dark:bg-gray-800 shadow' : ''}`}>Proveedores</button>
                </div>
                <button onClick={() => view === 'products' ? setProductFormOpen(true) : setSupplierFormOpen(true)} className="btn-primary">
                    {view === 'products' ? 'Nuevo Producto' : 'Nuevo Proveedor'}
                </button>
            </div>
            
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                {view === 'products' ? (
                    <table className="min-w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50"><tr><th className="th-style">Nombre</th><th className="th-style">Referencia</th><th className="th-style">Unidad</th><th className="th-style"></th></tr></thead>
                        <tbody>
                            {classroom.products.map(p => (
                                <tr key={p.id} className="border-t dark:border-gray-700">
                                    <td className="p-3 font-medium">{p.name}</td>
                                    <td className="p-3 text-sm text-gray-500">{p.reference}</td>
                                    <td className="p-3 text-sm">{p.unit}</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => { setProductToEdit(p); setProductFormOpen(true); }} className="btn-action"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteRequest('product', p)} className="btn-action-danger"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="min-w-full">
                         <thead className="bg-gray-50 dark:bg-gray-700/50"><tr><th className="th-style">Nombre</th><th className="th-style">Contacto</th><th className="th-style"></th></tr></thead>
                        <tbody>
                            {classroom.suppliers.map(s => (
                                <tr key={s.id} className="border-t dark:border-gray-700">
                                    <td className="p-3 font-medium">{s.name}</td>
                                    <td className="p-3 text-sm text-gray-500">{s.contactPerson} ({s.email})</td>
                                    <td className="p-3 text-right">
                                        <button onClick={() => { setSupplierToEdit(s); setSupplierFormOpen(true); }} className="btn-action"><EditIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteRequest('supplier', s)} className="btn-action-danger"><TrashIcon className="w-5 h-5"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <ProductFormModal isOpen={isProductFormOpen} onClose={() => setProductFormOpen(false)} onSave={handleSaveProduct} productToEdit={productToEdit}/>
            <SupplierFormModal isOpen={isSupplierFormOpen} onClose={() => setSupplierFormOpen(false)} onSave={handleSaveSupplier} supplierToEdit={supplierToEdit}/>
            
            {itemToDelete && (
                <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleDeleteConfirm} title={`Eliminar ${itemToDelete.type === 'product' ? 'Producto' : 'Proveedor'}`} confirmationText="ELIMINAR">
                    <p>Se eliminará "{itemToDelete.data.name}" del catálogo de esta aula.</p>
                </ConfirmationModal>
            )}
             <style>{`
                .btn-primary { padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.5rem; }
                .th-style{padding:0.75rem;text-align:left;font-size:0.75rem;}.btn-action{padding:0.5rem;}.btn-action-danger{padding:0.5rem;color:#DC2626;}
            `}</style>
        </div>
    );
};

export default CatalogManagerTab;