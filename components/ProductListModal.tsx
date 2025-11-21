import React, { useMemo } from 'react';
import { Supplier, Product } from '../types';
import { useData } from '../contexts/DataContext';
import Modal from './Modal';
import { EditIcon } from './icons';

interface ProductListModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
  onEditProduct: (product: Product) => void;
}

const ProductListModal: React.FC<ProductListModalProps> = ({ isOpen, onClose, supplier, onEditProduct }) => {
  const { products } = useData();

  const associatedProducts = useMemo(() => {
    if (!supplier) return [];
    return products
      .filter(p => p.suppliers.some(s => s.supplierId === supplier.id))
      .map(p => ({
          ...p,
          price: p.suppliers.find(s => s.supplierId === supplier.id)?.price || 0,
      }));
  }, [products, supplier]);

  if (!isOpen || !supplier) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Productos de ${supplier.name}`}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {associatedProducts.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="th-style">Producto</th>
                <th className="th-style">Precio</th>
                <th className="th-style">Estado</th>
                <th className="relative px-4 py-2"><span className="sr-only">Editar</span></th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {associatedProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{product.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{product.price.toFixed(2)}€</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.status === 'Activo' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                        {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onEditProduct(product)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1">
                      <EditIcon className="w-4 h-4" /> Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Este proveedor no tiene productos asociados en el catálogo.</p>
        )}
      </div>
       <div className="flex justify-end pt-4 mt-4 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="btn-primary">Cerrar</button>
        </div>
      <style>{`
        .th-style { padding: 0.5rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 500; color: #6B7280; text-transform: uppercase; }
        .dark .th-style { color: #9CA3AF; }
        .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; }
      `}</style>
    </Modal>
  );
};

export default ProductListModal;
