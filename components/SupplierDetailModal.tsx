import React, { useMemo } from 'react';
import { Supplier } from '../types';
import Modal from './Modal';
import { useData } from '../contexts/DataContext';

interface SupplierDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

const SupplierDetailModal: React.FC<SupplierDetailModalProps> = ({ isOpen, onClose, supplier }) => {
  const { incidents } = useData();

  const supplierIncidents = useMemo(() => {
    if (!supplier) return [];
    return incidents
        .filter(i => i.supplierId === supplier.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incidents, supplier]);

  if (!isOpen || !supplier) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Ficha de Proveedor: ${supplier.name}`}>
      <div className="printable-content space-y-6 max-h-[80vh] overflow-y-auto pr-2">
        <div className="print-header hidden print:block text-center mb-4">
          <h1 className="text-2xl font-bold">{supplier.name} - Ficha de Proveedor</h1>
          <p className="text-sm text-gray-500">Generado el {new Date().toLocaleDateString()}</p>
        </div>
        
        <section>
          <h3 className="section-title">Datos Fiscales y Generales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="detail-item"><strong>Nombre Comercial:</strong> {supplier.name}</div>
            <div className="detail-item"><strong>CIF/NIF:</strong> {supplier.cif}</div>
            <div className="detail-item md:col-span-2"><strong>Dirección:</strong> {supplier.address}</div>
            <div className="detail-item"><strong>Estado:</strong> {supplier.status}</div>
          </div>
        </section>

        <section>
          <h3 className="section-title">Información de Contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="detail-item"><strong>Persona de Contacto:</strong> {supplier.contactPerson}</div>
            <div className="detail-item"><strong>Teléfono:</strong> {supplier.phone}</div>
            <div className="detail-item"><strong>Email:</strong> <a href={`mailto:${supplier.email}`} className="text-indigo-500 hover:underline">{supplier.email}</a></div>
            <div className="detail-item"><strong>Sitio Web:</strong> <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{supplier.website}</a></div>
          </div>
        </section>

        <section>
          <h3 className="section-title">Notas Internas</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md whitespace-pre-wrap">
            {supplier.notes || 'No hay notas.'}
          </p>
        </section>

        <section>
          <h3 className="section-title">Historial de Incidencias</h3>
          {supplierIncidents.length > 0 ? (
            <div className="overflow-x-auto mt-2">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="p-2 text-left">Fecha</th>
                    <th className="p-2 text-left">Producto Afectado</th>
                    <th className="p-2 text-left">Problema</th>
                  </tr>
                </thead>
                <tbody>
                  {supplierIncidents.map(inc => (
                    <tr key={inc.id} className="border-b dark:border-gray-700">
                      <td className="p-2">{new Date(inc.date).toLocaleDateString()}</td>
                      <td className="p-2">{inc.productName}</td>
                      <td className="p-2">{inc.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No se han registrado incidencias para este proveedor.</p>
          )}
        </section>

        <div className="flex justify-end space-x-4 pt-4 print:hidden">
          <button type="button" onClick={() => window.print()} className="btn-secondary">Imprimir</button>
          <button type="button" onClick={onClose} className="btn-primary">Cerrar</button>
        </div>
      </div>
      <style>{`
        .section-title { font-size: 1.125rem; font-weight: 600; color: #111827; border-bottom: 2px solid #4F46E5; padding-bottom: 0.25rem; }
        .dark .section-title { color: #F9FAFB; }
        .detail-item { font-size: 0.875rem; color: #4B5563; }
        .dark .detail-item { color: #D1D5DB; }
        .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; }
        .btn-primary:hover { background-color: #4338CA; }
        .btn-secondary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border-radius: 0.375rem; }
        .dark .btn-secondary { background-color: #4B5563; color: #D1D5DB; }
        @media print {
            .printable-content {
                color: black !important;
            }
        }
      `}</style>
    </Modal>
  );
};

export default SupplierDetailModal;