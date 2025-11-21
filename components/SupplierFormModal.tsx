import React, { useState, useEffect, FormEvent } from 'react';
import { Supplier } from '../types';
import Modal from './Modal';

interface SupplierFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (supplier: Supplier | Omit<Supplier, 'id'>) => void;
  supplierToEdit?: Supplier | null;
}

const initialFormData: Omit<Supplier, 'id'> = {
    name: '',
    cif: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    website: '',
    notes: '',
    status: 'Activo',
    avatar: '',
};

const SupplierFormModal: React.FC<SupplierFormModalProps> = ({ isOpen, onClose, onSave, supplierToEdit }) => {
  const [formData, setFormData] = useState(initialFormData);
  
  useEffect(() => {
    if (isOpen) {
        if (supplierToEdit) {
            setFormData(supplierToEdit);
        } else {
            setFormData({
                ...initialFormData,
                avatar: `https://picsum.photos/seed/supplier-${Date.now()}/200/200`
            });
        }
    }
  }, [supplierToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (supplierToEdit) {
      onSave({ ...supplierToEdit, ...formData });
    } else {
      onSave(formData);
    }
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={supplierToEdit ? 'Editar Proveedor' : 'Añadir Proveedor'}>
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="label-style">Nombre Comercial</label>
                <input name="name" value={formData.name} onChange={handleChange} required className="input-style" />
            </div>
            <div>
                <label className="label-style">CIF / NIF</label>
                <input name="cif" value={formData.cif} onChange={handleChange} required className="input-style" />
            </div>
            <div className="md:col-span-2">
                <label className="label-style">Dirección Postal</label>
                <input name="address" value={formData.address} onChange={handleChange} className="input-style" />
            </div>
        </fieldset>
        
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 dark:border-gray-700">
            <div>
                <label className="label-style">Persona de Contacto</label>
                <input name="contactPerson" value={formData.contactPerson} onChange={handleChange} className="input-style" />
            </div>
            <div>
                <label className="label-style">Teléfono</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input-style" />
            </div>
            <div>
                <label className="label-style">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-style" />
            </div>
             <div>
                <label className="label-style">Página Web</label>
                <input type="url" name="website" value={formData.website} onChange={handleChange} className="input-style" />
            </div>
        </fieldset>

        <fieldset className="border-t pt-4 dark:border-gray-700">
            <div>
                <label className="label-style">Notas Internas</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="input-style"></textarea>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                 <div>
                    <label className="label-style">Estado</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="input-style">
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
                <div>
                    <label className="label-style">URL del Logo (Opcional)</label>
                    <input type="text" name="avatar" value={formData.avatar} onChange={handleChange} className="input-style" />
                </div>
            </div>
        </fieldset>

        <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar</button>
        </div>
      </form>
       <style>{`
            .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
            .dark .label-style { color: #D1D5DB; }
            .input-style { display: block; width: 100%; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } 
            .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
            .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; }
            .btn-primary:hover { background-color: #4338CA; }
            .btn-secondary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border-radius: 0.375rem; }
            .dark .btn-secondary { background-color: #4B5563; color: #D1D5DB; }
        `}</style>
    </Modal>
  );
};

export default SupplierFormModal;