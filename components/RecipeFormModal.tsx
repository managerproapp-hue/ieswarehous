
import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { Recipe, RecipeIngredient, Product } from '../types';
import { useData } from '../contexts/DataContext';
import Modal from './Modal';
import { TrashIcon } from './icons';

interface RecipeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: Recipe | Omit<Recipe, 'id'>) => void;
  recipeToEdit?: Recipe | null;
  creatorId: string;
}

const initialFormData: Omit<Recipe, 'id' | 'creatorId'> = {
    name: '',
    isPublic: false,
    ingredients: [],
    instructions: '',
    // Fix: Added missing properties category, yieldQuantity, and yieldUnit to match the Recipe type.
    category: 'Platos Principales',
    yieldQuantity: 1,
    yieldUnit: 'raciones',
    // Fix: Replaced 'platingNotes' with 'presentation' and added all required fields to match the type definition.
    serviceDetails: { presentation: '', servingTemp: '', cutlery: '', passTime: '', serviceType: '', clientDescription: '' },
};

const RecipeFormModal: React.FC<RecipeFormModalProps> = ({ isOpen, onClose, onSave, recipeToEdit, creatorId }) => {
    const { products } = useData();
    const [formData, setFormData] = useState(initialFormData);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (recipeToEdit) {
                setFormData(recipeToEdit);
            } else {
                setFormData(initialFormData);
            }
        }
    }, [recipeToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleServiceDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            serviceDetails: { ...prev.serviceDetails, [name]: value }
        }));
    };
    
    const handleAddIngredient = (product: Product) => {
        const newIngredient: RecipeIngredient = {
            productId: product.id,
            quantity: 1,
            unit: product.unit,
        };
        setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, newIngredient] }));
        setProductSearch('');
    };

    const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: string | number) => {
        const newIngredients = [...formData.ingredients];
        const currentIngredient = newIngredients[index];
        
        if (field === 'productId') {
            const product = products.find(p => p.id === value);
            currentIngredient.productId = value as string;
            currentIngredient.unit = product?.unit || '';
        } else if (field === 'quantity') {
            currentIngredient.quantity = parseFloat(value as string) || 0;
        } else {
            currentIngredient.unit = value as string;
        }
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };
    
    const handleRemoveIngredient = (index: number) => {
        setFormData(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, creatorId });
        onClose();
    };

    const filteredProducts = useMemo(() => 
        productSearch 
        ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5)
        : [],
    [productSearch, products]);
    
    const getProductName = (productId: string) => products.find(p => p.id === productId)?.name || 'Desconocido';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={recipeToEdit ? 'Editar Receta' : 'Nueva Receta'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label-style">Nombre de la Receta</label>
                        <input name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                    </div>
                     <div className="flex items-end pb-2">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleChange} className="rounded text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">Hacer pública para otros profesores</span>
                        </label>
                    </div>
                </div>

                <fieldset className="border-t pt-4 dark:border-gray-700">
                    <label className="label-style">Ingredientes</label>
                    <div className="mt-2 space-y-2">
                        {formData.ingredients.map((ing, index) => (
                             <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                                <span className="flex-grow font-medium text-sm text-gray-800 dark:text-gray-200">{getProductName(ing.productId)}</span>
                                <input type="number" value={ing.quantity} onChange={e => handleIngredientChange(index, 'quantity', e.target.value)} min="0" step="any" className="input-style w-24" placeholder="Cant."/>
                                <input type="text" value={ing.unit} onChange={e => handleIngredientChange(index, 'unit', e.target.value)} className="input-style w-20" placeholder="Unidad"/>
                                <button type="button" onClick={() => handleRemoveIngredient(index)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                    </div>
                     <div className="mt-2 relative">
                        <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Buscar producto para añadir..." className="input-style w-full"/>
                         {filteredProducts.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg max-h-40 overflow-y-auto">
                                {filteredProducts.map(p => <li key={p.id} onClick={() => handleAddIngredient(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">{p.name}</li>)}
                            </ul>
                        )}
                    </div>
                </fieldset>
                
                <div>
                    <label className="label-style">Instrucciones / Elaboración</label>
                    <textarea name="instructions" value={formData.instructions} onChange={handleChange} rows={5} className="input-style w-full" />
                </div>

                <fieldset className="border-t pt-4 dark:border-gray-700">
                    <h3 className="label-style">Detalles para Orden de Servicio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                        <div><label className="text-xs">Temp. de Servicio</label><input name="servingTemp" value={formData.serviceDetails.servingTemp} onChange={handleServiceDetailsChange} className="input-style text-sm"/></div>
                        {/* Fix: Renamed input name and value from 'platingNotes' to 'presentation' to match type. */}
                        <div><label className="text-xs">Notas de Emplatado</label><input name="presentation" value={formData.serviceDetails.presentation} onChange={handleServiceDetailsChange} className="input-style text-sm"/></div>
                        <div><label className="text-xs">Tiempo de Pase</label><input name="passTime" value={formData.serviceDetails.passTime} onChange={handleServiceDetailsChange} className="input-style text-sm"/></div>
                    </div>
                </fieldset>
                
                <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Receta</button>
                </div>
            </form>
            <style>{`
                .label-style { display: block; margin-bottom: 0.25rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
                .dark .label-style { color: #D1D5DB; }
                .input-style { display: block; width: 100%; background-color: white; border: 1px solid #D1D5DB; border-radius: 0.375rem; padding: 0.5rem 0.75rem; } 
                .dark .input-style { background-color: #374151; border-color: #4B5563; color: #F9FAFB; }
                .btn-primary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.375rem; }
                .btn-secondary { padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border-radius: 0.375rem; }
                .dark .btn-secondary { background-color: #4B5563; color: #D1D5DB; }
            `}</style>
        </Modal>
    );
};

export default RecipeFormModal;
