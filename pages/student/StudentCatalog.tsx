// This is a new file: pages/student/StudentCatalog.tsx
import React from 'react';
import { useData } from '../../contexts/DataContext';

const StudentCatalog: React.FC = () => {
    const { products, suppliers } = useData();
    const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Catálogo del Aula (Solo Lectura)</h1>
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
                <div className="h-1.5 bg-indigo-500"></div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Proveedores</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {products.map(product => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                                        <p className="text-sm text-gray-500">{product.reference}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <ul className="text-sm">
                                            {product.suppliers.map(s => (
                                                <li key={s.supplierId}>
                                                    {supplierMap.get(s.supplierId) || 'N/A'}: {s.price.toFixed(2)}€
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentCatalog;