
// This is a new file: pages/teacher/RecipeForm.tsx

import React, { useState, useEffect, useMemo, useRef, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Recipe, Product, Allergen, ALLERGENS } from '../../types';
import { TrashIcon, CameraIcon } from '../../components/icons';
import LabelPreviewModal from '../../components/LabelPreviewModal';

const newRecipeTemplate = (creatorId: string): Omit<Recipe, 'id'> => ({
    name: '',
    creatorId,
    isPublic: false,
    photo: '',
    yieldQuantity: 1,
    yieldUnit: 'raciones',
    category: 'Platos Principales',
    ingredients: [],
    instructions: '',
    notes: '',
    customSection: { title: '', content: '' },
    serviceDetails: {
        presentation: '',
        servingTemp: '',
        cutlery: '',
        passTime: '',
        serviceType: 'Emplatado en cocina',
        clientDescription: '',
    },
});

const RecipeForm: React.FC = () => {
    const { recipeId } = useParams<{ recipeId: string }>();
    const navigate = useNavigate();
    const { recipes, products, suppliers, addRecipe, updateRecipe } = useData();
    const { currentUser } = useAuth();
    const photoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Omit<Recipe, 'id'>>(newRecipeTemplate(currentUser?.id || ''));
    const [productSearch, setProductSearch] = useState('');
    const [isLabelModalOpen, setLabelModalOpen] = useState(false);
    
    const pathPrefix = '/teacher';

    useEffect(() => {
        if (recipeId) {
            const recipeToEdit = recipes.find(r => r.id === recipeId);
            if (recipeToEdit) {
                setFormData(recipeToEdit);
            }
        } else if (currentUser) {
            setFormData(newRecipeTemplate(currentUser.id));
        }
    }, [recipeId, recipes, currentUser]);

    // --- Calculations ---
    const { totalCost, allergens } = useMemo(() => {
        const productMap = new Map(products.map(p => [p.id, p]));
        const supplierMap = new Map(suppliers.map(s => [s.id, s]));
        
        let cost = 0;
        const allergenSet = new Set<Allergen>();

        formData.ingredients.forEach(ing => {
            const product = productMap.get(ing.productId);
            if (!product) return;

            product.allergens.forEach(a => allergenSet.add(a));

            const activeSuppliers = product.suppliers.filter(s => s.status === 'Activo' && supplierMap.has(s.supplierId));
            if (activeSuppliers.length > 0) {
                const bestPrice = Math.min(...activeSuppliers.map(s => s.price));
                cost += bestPrice * ing.quantity;
            }
        });
        return { totalCost: cost, allergens: Array.from(allergenSet) };
    }, [formData.ingredients, products, suppliers]);

    const costPerServing = useMemo(() => {
        if (!formData.yieldQuantity || formData.yieldQuantity === 0) return 0;
        return totalCost / formData.yieldQuantity;
    }, [totalCost, formData.yieldQuantity]);

    // --- Handlers ---
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        
        if (name.startsWith('serviceDetails.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, serviceDetails: { ...prev.serviceDetails, [field]: value }}));
        } else if (name.startsWith('customSection.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({ ...prev, customSection: { ...prev.customSection!, [field]: value }}));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        }
    };

    const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({...prev, photo: event.target?.result as string }));
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    // Ingredient Handlers
    const filteredProducts = useMemo(() => 
        productSearch ? products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).slice(0, 5) : [],
    [productSearch, products]);

    const addIngredient = (product: Product) => {
        setFormData(prev => ({ ...prev, ingredients: [...prev.ingredients, { productId: product.id, quantity: 0, unit: product.unit }]}));
        setProductSearch('');
    };
    
    const updateIngredient = (index: number, field: 'quantity' | 'unit', value: string) => {
        const newIngredients = [...formData.ingredients];
        (newIngredients[index] as any)[field] = field === 'quantity' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    };

    const removeIngredient = (index: number) => {
        setFormData(prev => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
    };

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        if (recipeId) {
            updateRecipe({ id: recipeId, ...formData });
        } else {
            addRecipe(formData);
        }
        navigate(`${pathPrefix}/my-recipes`);
    };

    if (!currentUser) return null;

    return (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left/Main Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <input type="file" accept="image/*" className="hidden" ref={photoInputRef} onChange={handlePhotoUpload}/>
                                <div onClick={() => photoInputRef.current?.click()} className="cursor-pointer aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed">
                                    {formData.photo ? <img src={formData.photo} alt="Previsualización" className="w-full h-full object-cover rounded-lg"/> : <CameraIcon className="w-12 h-12 text-gray-400"/>}
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nombre de la Ficha" required className="input-style text-2xl font-bold w-full"/>
                                <div className="flex items-center gap-4">
                                    <label className="label-style">Rendimiento:</label>
                                    <input type="number" name="yieldQuantity" value={formData.yieldQuantity} onChange={handleInputChange} min="0" step="any" className="input-style w-24"/>
                                    <input name="yieldUnit" value={formData.yieldUnit} onChange={handleInputChange} className="input-style w-32"/>
                                </div>
                                 <div>
                                    <label className="label-style">Categoría:</label>
                                    <input name="category" value={formData.category} onChange={handleInputChange} className="input-style w-full"/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h3 className="card-title">Ingredientes</h3>
                        <div className="space-y-2">
                            {formData.ingredients.map((ing, index) => {
                                const product = products.find(p=>p.id === ing.productId);
                                const displayName = product ? product.name : (ing.tempName || 'Ingrediente externo');
                                const isExternal = !product;

                                return (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="flex-grow flex flex-col">
                                            <span>{displayName}</span>
                                            {isExternal && <span className="text-xs text-orange-500">Importado (Sin coste asociado)</span>}
                                        </div>
                                        <input type="number" value={ing.quantity} onChange={e => updateIngredient(index, 'quantity', e.target.value)} className="input-style w-24"/>
                                        <input value={ing.unit} onChange={e => updateIngredient(index, 'unit', e.target.value)} className="input-style w-20"/>
                                        <button type="button" onClick={() => removeIngredient(index)}><TrashIcon className="w-5 h-5 text-red-500"/></button>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-2 relative">
                            <input type="text" value={productSearch} onChange={e => setProductSearch(e.target.value)} placeholder="Buscar producto del catálogo para añadir..." className="input-style w-full"/>
                            {filteredProducts.length > 0 && (
                                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border rounded shadow-lg max-h-40 overflow-y-auto">
                                    {filteredProducts.map(p => <li key={p.id} onClick={() => addIngredient(p)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">{p.name}</li>)}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h3 className="card-title">Elaboración</h3>
                        <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} rows={8} className="input-style w-full"/>
                    </div>
                </div>

                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                         <h3 className="card-title">Instrucciones de Servicio</h3>
                         <div className="grid grid-cols-2 gap-4">
                            <div><label className="label-style">Presentación</label><input name="serviceDetails.presentation" value={formData.serviceDetails.presentation} onChange={handleInputChange} className="input-style"/></div>
                            <div><label className="label-style">Temperatura</label><input name="serviceDetails.servingTemp" value={formData.serviceDetails.servingTemp} onChange={handleInputChange} className="input-style" placeholder="Escriba la temperatura" onFocus={(e) => e.target.select()}/></div>
                            <div><label className="label-style">Marcaje</label><input name="serviceDetails.cutlery" value={formData.serviceDetails.cutlery} onChange={handleInputChange} className="input-style"/></div>
                            <div><label className="label-style">Tiempo de Pase</label><input name="serviceDetails.passTime" value={formData.serviceDetails.passTime} onChange={handleInputChange} className="input-style"/></div>
                            <div className="col-span-2"><label className="label-style">Tipo de Servicio</label><input name="serviceDetails.serviceType" value={formData.serviceDetails.serviceType} onChange={handleInputChange} className="input-style"/></div>
                            <div className="col-span-2"><label className="label-style">Descripción para el Cliente</label><textarea name="serviceDetails.clientDescription" value={formData.serviceDetails.clientDescription} onChange={handleInputChange} rows={2} className="input-style w-full"/></div>
                         </div>
                    </div>
                </div>

                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h3 className="card-title">Notas Importantes</h3>
                        <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} className="input-style w-full"/>
                    </div>
                </div>
                 <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <input name="customSection.title" value={formData.customSection?.title} onChange={handleInputChange} placeholder="Título de sección personalizable" className="input-style font-bold mb-2"/>
                        <textarea name="customSection.content" value={formData.customSection?.content} onChange={handleInputChange} rows={3} className="input-style w-full"/>
                    </div>
                </div>

            </div>

            {/* Right Column */}
            <div className="space-y-6">
                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h3 className="card-title">Análisis de Coste y Alérgenos</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="label-style">Coste Total Materia Prima</p>
                                <p className="text-2xl font-bold">{totalCost.toFixed(2)} €</p>
                            </div>
                             <div>
                                <p className="label-style">Coste por Ración ({formData.yieldUnit})</p>
                                <p className="text-2xl font-bold">{costPerServing.toFixed(2)} €</p>
                            </div>
                             <div>
                                <label className="label-style">Precio de Venta</label>
                                <input type="number" min="0" step="0.01" placeholder="0.00 €" className="input-style w-full"/>
                            </div>
                            <div>
                                <p className="label-style">Alérgenos Detectados</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {allergens.length > 0 ? allergens.map(a => <span key={a} className="badge-red">{a}</span>) : <p className="text-sm text-gray-500">Ninguno</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="h-1.5 bg-indigo-500"></div>
                    <div className="p-6">
                        <h3 className="card-title">Acciones</h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between">
                                <span>Hacer Ficha Pública</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" name="isPublic" checked={formData.isPublic} onChange={handleInputChange} className="sr-only peer"/>
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                                </div>
                            </label>
                            <button type="button" onClick={() => setLabelModalOpen(true)} className="btn-secondary w-full">Generar Etiqueta</button>
                            <button type="submit" className="btn-primary w-full">Guardar Ficha</button>
                            <button type="button" onClick={() => navigate(`${pathPrefix}/my-recipes`)} className="btn-secondary w-full">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <LabelPreviewModal isOpen={isLabelModalOpen} onClose={() => setLabelModalOpen(false)} recipe={formData as Recipe} />
            
            <style>{`
            .card{background-color:#fff;border-radius:.5rem;box-shadow:0 1px 3px 0 rgba(0,0,0,.1); overflow: hidden;}.dark .card{background-color:#1f2937}
            .card-title{font-size:1.125rem;font-weight:600;margin-bottom:1rem}
            .label-style{display:block;margin-bottom:.25rem;font-size:.875rem;font-weight:500}.dark .label-style{color:#d1d5db}
            .input-style{display:block;width:100%;border-radius:.375rem;padding:.5rem .75rem;border:1px solid #d1d5db}.dark .input-style{background-color:#374151;border-color:#4b5563}
            .btn-primary{padding:.5rem 1rem;font-weight:600;color:#fff;background-color:#4f46e5;border-radius:.5rem;width:100%}
            .btn-secondary{padding:.5rem 1rem;font-weight:600;border:1px solid #d1d5db;border-radius:.5rem;width:100%}
            .badge-red{background-color:#fee2e2;color:#991b1b;padding:.25rem .75rem;border-radius:9999px;font-size:.75rem;font-weight:500}
            `}</style>
        </form>
    );
};

export default RecipeForm;
