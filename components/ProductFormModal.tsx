import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import { Product, ProductSupplier, Allergen, ALLERGENS, CatalogCategory, CatalogFamily } from '../types';
import { useData } from '../contexts/DataContext';
import Modal from './Modal';
import { TrashIcon } from './icons';
import { DEFAULT_FAMILIES, DEFAULT_CATEGORIES } from '../services/catalogData';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product | Omit<Product, 'id'>) => void;
  productToEdit?: Product | null;
}

const initialFormData: Omit<Product, 'id'> = {
    name: '',
    description: '',
    reference: '',
    unit: 'kg',
    family: '',
    category: '',
    iva: 21,
    suppliers: [],
    status: 'Activo',
    productState: 'Fresco',
    warehouseStatus: 'Disponible',
    allergens: [],
};

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
    const { products, suppliers: allSuppliers, families, categories, productStates, addFamily, deleteFamily, addCategory, deleteCategory, addProductState: addNewGlobalState } = useData();
    const [formData, setFormData] = useState<Omit<Product, 'id'>>(initialFormData);
    const [newFamilyName, setNewFamilyName] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newProductState, setNewProductState] = useState('');
    
    const uniqueUnits = useMemo(() => [...new Set(products.map(p => p.unit).filter(Boolean))], [products]);
    const filteredCategories = useMemo(() => categories.filter(c => c.familyId === formData.family), [categories, formData.family]);

    const isDefaultFamily = useMemo(() => DEFAULT_FAMILIES.some(f => f.id === formData.family), [formData.family]);
    const isDefaultCategory = useMemo(() => DEFAULT_CATEGORIES.some(c => c.id === formData.category), [formData.category]);

    useEffect(() => {
        if (isOpen) {
            if (productToEdit) {
                setFormData(productToEdit);
            } else {
                setFormData(initialFormData);
            }
            setNewFamilyName('');
            setNewCategoryName('');
            setNewProductState('');
        }
    }, [productToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'family') {
            setFormData(prev => ({ ...prev, family: value, category: '' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddNewFamily = () => {
        if (newFamilyName.trim()) {
            try {
                const newFam = addFamily(newFamilyName);
                setFormData(prev => ({ ...prev, family: newFam.id, category: '' }));
                setNewFamilyName('');
            } catch (error) {
                console.error(error);
            }
        }
    };
    
    const handleAddNewCategory = () => {
        if (newCategoryName.trim() && formData.family) {
            try {
                const newCat = addCategory({ name: newCategoryName, familyId: formData.family });
                setFormData(prev => ({ ...prev, category: newCat.id }));
                setNewCategoryName('');
            } catch (error) {
                console.error(error);
            }
        }
    };
    
    const handleAddNewProductState = () => {
        if (newProductState.trim()) {
            addNewGlobalState(newProductState);
            setFormData(prev => ({ ...prev, productState: newProductState }));
            setNewProductState('');
        }
    };
    
    const handleDeleteFamily = () => {
        if (formData.family && window.confirm(`¿Seguro que quieres eliminar la familia "${families.find(f => f.id === formData.family)?.name}"?`)) {
            deleteFamily(formData.family);
            setFormData(prev => ({ ...prev, family: '', category: '' }));
        }
    };

    const handleDeleteCategory = () => {
        if (formData.category && window.confirm(`¿Seguro que quieres eliminar la categoría "${categories.find(c => c.id === formData.category)?.name}"?`)) {
            deleteCategory(formData.category);
            setFormData(prev => ({...prev, category: ''}));
        }
    };

    const handleSupplierChange = (index: number, field: keyof ProductSupplier | 'status', value: string | number) => {
        const newSuppliers = [...formData.suppliers];
        newSuppliers[index] = { ...newSuppliers[index], [field]: field === 'price' ? parseFloat(value as string) : value };
        setFormData(prev => ({ ...prev, suppliers: newSuppliers }));
    };

    const addSupplier = () => {
        const newSupplier: ProductSupplier = { supplierId: '', price: 0, status: 'Activo' };
        setFormData(prev => ({ ...prev, suppliers: [...prev.suppliers, newSupplier] }));
    };

    const removeSupplier = (index: number) => {
        setFormData(prev => ({ ...prev, suppliers: prev.suppliers.filter((_, i) => i !== index) }));
    };
    
    const handleAllergenToggle = (allergen: Allergen) => {
        setFormData(prev => {
            const newAllergens = prev.allergens.includes(allergen)
                ? prev.allergens.filter(a => a !== allergen)
                : [...prev.allergens, allergen];
            return { ...prev, allergens: newAllergens };
        });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        try {
            onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={productToEdit ? 'Editar Producto' : 'Nuevo Producto'}>
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label-style">Nombre</label>
                        <input name="name" value={formData.name} onChange={handleChange} required className="input-style" />
                    </div>
                     <div>
                        <label className="label-style">IVA (%)</label>
                        <input type="number" name="iva" value={formData.iva} onChange={handleChange} required className="input-style" />
                    </div>
                </fieldset>
                
                <fieldset className="border-t pt-4 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="label-style">Familia</label>
                            <div className="flex items-center gap-2">
                                <select name="family" value={formData.family} onChange={handleChange} required className="input-style flex-grow">
                                    <option value="">-- Selecciona --</option>
                                    {families.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                </select>
                                {!isDefaultFamily && formData.family && <button type="button" onClick={handleDeleteFamily} className="p-2 text-red-500"><TrashIcon className="w-4 h-4"/></button>}
                            </div>
                            <div className="flex gap-2 mt-2">
                                <input value={newFamilyName} onChange={e => setNewFamilyName(e.target.value)} placeholder="Añadir nueva familia..." className="input-style text-sm flex-grow" />
                                <button type="button" onClick={handleAddNewFamily} className="btn-secondary text-sm" disabled={!newFamilyName.trim()}>Añadir</button>
                            </div>
                        </div>
                         <div>
                            <label className="label-style">Categoría</label>
                            <div className="flex items-center gap-2">
                                <select name="category" value={formData.category} onChange={handleChange} required className="input-style flex-grow" disabled={!formData.family}>
                                    <option value="">-- Selecciona --</option>
                                    {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {!isDefaultCategory && formData.category && <button type="button" onClick={handleDeleteCategory} className="p-2 text-red-500"><TrashIcon className="w-4 h-4"/></button>}
                            </div>
                             <div className="flex gap-2 mt-2">
                                <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Añadir nueva categoría..." className="input-style text-sm flex-grow" disabled={!formData.family} />
                                <button type="button" onClick={handleAddNewCategory} className="btn-secondary text-sm" disabled={!formData.family || !newCategoryName.trim()}>Añadir</button>
                            </div>
                        </div>
                    </div>
                </fieldset>
                
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 dark:border-gray-700">
                    <div>
                        <label className="label-style">Condición del Producto</label>
                         <select name="productState" value={formData.productState} onChange={handleChange} required className="input-style">
                            {productStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                         <div className="flex gap-2 mt-2">
                            <input value={newProductState} onChange={e => setNewProductState(e.target.value)} placeholder="Añadir nueva condición..." className="input-style text-sm flex-grow" />
                            <button type="button" onClick={handleAddNewProductState} className="btn-secondary text-sm" disabled={!newProductState.trim()}>Añadir</button>
                        </div>
                    </div>
                     <div>
                        <label className="label-style">Referencia</label>
                        <input name="reference" value={formData.reference} onChange={handleChange} required className="input-style" />
                    </div>
                     <div>
                        <label className="label-style">Unidad de Medida</label>
                        <input name="unit" value={formData.unit} onChange={handleChange} list="units" required className="input-style" />
                        <datalist id="units">{uniqueUnits.map(u => <option key={u} value={u} />)}</datalist>
                    </div>
                     <div>
                        <label className="label-style">Descripción</label>
                        <input name="description" value={formData.description} onChange={handleChange} className="input-style" />
                    </div>
                </fieldset>
                
                <fieldset className="border-t pt-4 dark:border-gray-700">
                    <label className="label-style mb-2">Proveedores y Precios</label>
                    <div className="space-y-2">
                    {formData.suppliers.map((sup, index) => (
                        <div key={index} className="grid grid-cols-[1fr,auto,auto,auto] gap-2 items-center p-2 bg-gray-50 dark:bg-gray-900/50 rounded-md">
                            <select value={sup.supplierId} onChange={(e) => handleSupplierChange(index, 'supplierId', e.target.value)} required className="input-style">
                                <option value="">-- Proveedor --</option>
                                {allSuppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input type="number" value={sup.price} onChange={(e) => handleSupplierChange(index, 'price', e.target.value)} min="0" step="0.01" required className="input-style w-28" placeholder="Precio €"/>
                             <select value={sup.status} onChange={(e) => handleSupplierChange(index, 'status', e.target.value)} required className="input-style">
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                            <button type="button" onClick={() => removeSupplier(index)} className="p-2 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    ))}
                    </div>
                    <button type="button" onClick={addSupplier} className="mt-2 text-sm text-indigo-600 hover:underline">+ Añadir proveedor</button>
                </fieldset>
                
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4 dark:border-gray-700">
                     <div>
                        <label className="label-style">Estado del Catálogo</label>
                        <select name="status" value={formData.status} onChange={handleChange} required className="input-style">
                            <option value="Activo">Activo</option>
                            <option value="Inactivo">Inactivo</option>
                        </select>
                    </div>
                     <div>
                        <label className="label-style">Disponibilidad Almacén</label>
                        <select name="warehouseStatus" value={formData.warehouseStatus} onChange={handleChange} required className="input-style">
                            <option>Disponible</option>
                            <option>Bajo Pedido</option>
                            <option>Descontinuado</option>
                        </select>
                    </div>
                </fieldset>

                <fieldset className="border-t pt-4 dark:border-gray-700">
                    <label className="label-style">Alérgenos</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {ALLERGENS.map(allergen => (
                            <label key={allergen} className="flex items-center space-x-2 text-sm">
                                <input type="checkbox" checked={formData.allergens.includes(allergen)} onChange={() => handleAllergenToggle(allergen)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-gray-700 dark:text-gray-300">{allergen}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>

                <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                    <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary">Guardar Producto</button>
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

export default ProductFormModal;