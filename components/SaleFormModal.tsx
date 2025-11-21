// This is a new file: components/SaleFormModal.tsx

import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { Sale } from '../types';
import { useData } from '../contexts/DataContext';
import Modal from './Modal';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: Sale | Omit<Sale, 'id'>) => void;
  saleToEdit?: Sale | null;
}

const SaleFormModal: React.FC<SaleFormModalProps> = ({ isOpen, onClose, onSave, saleToEdit }) => {
    const { sales } = useData();
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

    const categorySuggestions = useMemo(() => {
        return [...new Set(sales.map(s => s.category).filter(Boolean))];
    }, [sales]);

    useEffect(() => {
        if (isOpen) {
            if (saleToEdit) {
                setAmount(String(saleToEdit.amount));
                setCategory(saleToEdit.category);
                setDescription(saleToEdit.description);
                setDate(saleToEdit.date.slice(0, 10));
            } else {
                setAmount('');
                setCategory('');
                setDescription('');
                setDate(new Date().toISOString().slice(0, 10));
            }
        }
    }, [saleToEdit, isOpen]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const saleData = {
            amount: parseFloat(amount),
            category,
            description,
            date: new Date(date).toISOString(),
        };

        if (saleToEdit) {
            onSave({ ...saleToEdit, ...saleData });
        } else {
            onSave(saleData as Omit<Sale, 'id'>);
        }
        onClose();
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={saleToEdit ? 'Editar Venta' : 'Nueva Venta'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="label-style">Fecha</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-style"/>
                    </div>
                    <div>
                        <label className="label-style">Importe (€)</label>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="input-style"/>
                    </div>
                </div>
                 <div>
                    <label className="label-style">Categoría</label>
                    <input value={category} onChange={e => setCategory(e.target.value)} required list="category-suggestions" className="input-style" placeholder="Ej: Cafetería, Restaurante, Evento..."/>
                    <datalist id="category-suggestions">
                        {categorySuggestions.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                </div>
                <div>
                    <label className="label-style">Descripción</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input-style"/>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar</button>
                </div>
            </form>
            <style>{`
                .label-style{display:block;margin-bottom:.25rem;font-size:.875rem;font-weight:500}
                .input-style{display:block;width:100%;border-radius:.375rem;padding:.5rem .75rem;border:1px solid #d1d5db}.dark .input-style{background-color:#374151;border-color:#4b5563}
                .btn-primary{padding:.5rem 1rem;color:#fff;background-color:#4f46e5;border-radius:.375rem}
                .btn-secondary{padding:.5rem 1rem;background-color:#f3f4f6;border-radius:.375rem}
            `}</style>
        </Modal>
    );
};

export default SaleFormModal;
