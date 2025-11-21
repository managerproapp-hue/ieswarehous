
import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Recipe, RecipeIngredient } from '../../types';
import ConfirmationModal from '../../components/ConfirmationModal';
import { EditIcon, TrashIcon, DownloadIcon, UploadIcon, Share2Icon, PlusCircleIcon } from '../../components/icons';

const MyRecipes: React.FC = () => {
    const { recipes, addRecipe, updateRecipe, deleteRecipe, products, users } = useData();
    const { currentUser } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [recipeToDelete, setRecipeToDelete] = useState<Recipe | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const productMap = useMemo(() => new Map(products.map(p => [p.id, p.name])), [products]);
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);
    
    const pathPrefix = '/teacher';

    const { myRecipes, publicRecipes } = useMemo(() => {
        if (!currentUser) return { myRecipes: [], publicRecipes: [] };
        
        const searchFilter = (r: Recipe) => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.ingredients.some(i => productMap.get(i.productId)?.toLowerCase().includes(searchTerm.toLowerCase()));

        const filteredMyRecipes = recipes.filter(r => r.creatorId === currentUser.id && searchFilter(r));
        const filteredPublicRecipes = recipes.filter(r => r.isPublic && r.creatorId !== currentUser.id && searchFilter(r));

        return { myRecipes: filteredMyRecipes, publicRecipes: filteredPublicRecipes };
    }, [recipes, currentUser, searchTerm, productMap]);

    // --- CRUD Handlers ---
    const handleCreate = () => navigate(`${pathPrefix}/recipe/new`);
    const handleEdit = (recipe: Recipe) => navigate(`${pathPrefix}/recipe/edit/${recipe.id}`);
    const handleDeleteRequest = (recipe: Recipe) => { setRecipeToDelete(recipe); setDeleteModalOpen(true); };
    const handleDeleteConfirm = () => { if (recipeToDelete) { deleteRecipe(recipeToDelete.id); setDeleteModalOpen(false); setRecipeToDelete(null); } };
    const handleTogglePublic = (recipe: Recipe) => { updateRecipe({ ...recipe, isPublic: !recipe.isPublic }); };
    const handleMakeMine = (recipeToCopy: Recipe) => {
        if (!currentUser) return;
        const newRecipeData: Omit<Recipe, 'id'> = { ...JSON.parse(JSON.stringify(recipeToCopy)), name: `${recipeToCopy.name} (Copia)`, creatorId: currentUser.id, isPublic: false };
        addRecipe(newRecipeData);
        alert(`'${recipeToCopy.name}' ha sido copiada a 'Mis Fichas'.`);
    };

    // --- Import/Export Handlers ---
    const handleExportSingle = (recipe: Recipe) => {
        const dataStr = JSON.stringify(recipe, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receta_${recipe.name.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportAll = () => {
        const dataStr = JSON.stringify(myRecipes, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mi-recetario.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => fileInputRef.current?.click();

    const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentUser) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                const recipesToImport = Array.isArray(data) ? data : [data];
                
                const notFoundIngredients = new Set<string>();
                let importedCount = 0;

                recipesToImport.forEach((importedRecipe: any) => {
                    if (!importedRecipe.name || !importedRecipe.ingredients) return;

                    const newIngredients: RecipeIngredient[] = importedRecipe.ingredients.map((ing: any) => {
                        // Normalize ingredient name from student app (ing.name) or legacy (ing.productName)
                        const ingName = ing.name || ing.productName || '';
                        
                        // Try to find product in current catalog
                        const product = products.find(p => 
                            p.id === ing.productId || 
                            (ingName && p.name.toLowerCase() === ingName.toLowerCase())
                        );
                        
                        // If product exists, use its ID. If not, create a temp ID and store the original name.
                        if (!product && ingName) notFoundIngredients.add(ingName);
                        
                        return { 
                            productId: product?.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
                            quantity: parseFloat(ing.quantity) || 0, 
                            unit: ing.unit || 'uds',
                            tempName: product ? undefined : ingName // Store the name if not found in catalog
                        };
                    });

                    addRecipe({
                        name: `${importedRecipe.name} (Importada)`,
                        creatorId: currentUser.id,
                        isPublic: false,
                        ingredients: newIngredients,
                        instructions: importedRecipe.instructions || '',
                        serviceDetails: importedRecipe.serviceDetails || { presentation: '', servingTemp: '', cutlery: '', passTime: '', serviceType: '', clientDescription: '' },
                        yieldQuantity: importedRecipe.yieldQuantity || 1,
                        yieldUnit: importedRecipe.yieldUnit || 'ración',
                        category: importedRecipe.category || 'Importadas',
                        photo: importedRecipe.photo,
                        notes: importedRecipe.notes,
                        customSection: importedRecipe.customSection
                    });
                    importedCount++;
                });
                
                let summary = `${importedCount} receta(s) importada(s) con éxito.`;
                if (notFoundIngredients.size > 0) {
                    summary += `\n\nAtención: Los siguientes ingredientes no se encontraron en tu catálogo:\n- ${Array.from(notFoundIngredients).join('\n- ')}\n\nSe han importado con su nombre original.`;
                }
                alert(summary);

            } catch (error) {
                console.error(error);
                alert('Error al leer el archivo. Asegúrate de que es un archivo JSON válido.');
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    if (!currentUser) return null;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestión de Recetas</h1>
                <div className="flex items-center gap-2">
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nombre o ingrediente..." className="input-style w-full sm:w-64"/>
                    <button onClick={handleImportClick} className="btn-secondary whitespace-nowrap"><UploadIcon className="w-5 h-5 mr-2"/> Importar (JSON)</button>
                    <button onClick={handleCreate} className="btn-primary whitespace-nowrap">Nueva Receta</button>
                </div>
            </div>

            {/* My Recipes */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Mis Fichas</h2>
                    <button onClick={handleExportAll} disabled={myRecipes.length === 0} className="btn-secondary text-sm disabled:opacity-50"><DownloadIcon className="w-4 h-4 mr-2"/>Exportar mi recetario</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myRecipes.map(recipe => (
                        <div key={recipe.id} className="card">
                            <div className="h-1.5 bg-indigo-500"></div>
                            <div className="p-5 flex-grow">
                                <div className="flex justify-between items-start">
                                    <h3 className="card-title">{recipe.name}</h3>
                                    <span className={`badge ${recipe.isPublic ? 'badge-green' : 'badge-gray'}`}>{recipe.isPublic ? 'Pública' : 'Privada'}</span>
                                </div>
                                <div className="card-content">
                                    <h4>Ingredientes:</h4>
                                    <ul>{recipe.ingredients.slice(0, 3).map((ing, i) => <li key={i}>{productMap.get(ing.productId) || ing.tempName || 'Desconocido'}</li>)}</ul>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button onClick={() => handleExportSingle(recipe)} className="btn-action" title="Descargar JSON"><DownloadIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleTogglePublic(recipe)} className="btn-action" title={recipe.isPublic ? 'Hacer privada' : 'Compartir'}><Share2Icon className="w-5 h-5"/></button>
                                <button onClick={() => handleEdit(recipe)} className="btn-action" title="Editar"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDeleteRequest(recipe)} className="btn-action-danger" title="Eliminar"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
                {myRecipes.length === 0 && <p className="text-center py-8 text-gray-500">No has creado ninguna receta.</p>}
            </section>

            {/* Public Recipes */}
            <section>
                 <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Fichas Públicas de Compañeros</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {publicRecipes.map(recipe => (
                         <div key={recipe.id} className="card">
                            <div className="h-1.5 bg-indigo-500"></div>
                            <div className="p-5 flex-grow">
                                <h3 className="card-title">{recipe.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-2 mb-3">de {userMap.get(recipe.creatorId)}</p>
                                <div className="card-content">
                                    <h4>Ingredientes:</h4>
                                    <ul>{recipe.ingredients.slice(0, 3).map((ing, i) => <li key={i}>{productMap.get(ing.productId) || ing.tempName || 'Desconocido'}</li>)}</ul>
                                </div>
                            </div>
                            <div className="card-footer justify-end">
                                <button onClick={() => handleMakeMine(recipe)} className="btn-secondary text-sm"><PlusCircleIcon className="w-5 h-5 mr-2"/> Hacer Mía</button>
                            </div>
                        </div>
                    ))}
                 </div>
                 {publicRecipes.length === 0 && <p className="text-center py-8 text-gray-500">No hay recetas públicas de otros profesores.</p>}
            </section>

            <input type="file" ref={fileInputRef} onChange={handleFileSelected} accept=".json,.recipe" className="hidden" />
            {recipeToDelete && <ConfirmationModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} title={`Eliminar Receta: ${recipeToDelete.name}`} confirmationText="ELIMINAR"><p>Esta acción es irreversible.</p></ConfirmationModal>}
            
            <style>{`
                .input-style { background-color: white; border: 1px solid #D1D5DB; border-radius: 0.5rem; padding: 0.5rem 0.75rem; }
                .dark .input-style { background-color: #374151; border-color: #4B5563; }
                .btn-primary { display:flex; align-items:center; padding: 0.5rem 1rem; font-weight: 500; color: white; background-color: #4F46E5; border-radius: 0.5rem; }
                .btn-secondary { display:flex; align-items:center; padding: 0.5rem 1rem; font-weight: 500; border: 1px solid #D1D5DB; border-radius: 0.5rem; }
                .card { background-color: white; box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1); border-radius: 0.75rem; overflow: hidden; display: flex; flex-direction: column; }
                .dark .card { background-color: #1F2937; }
                .card-title { font-weight: 700; font-size: 1.125rem; color: #111827; } .dark .card-title { color: #F9FAFB; }
                .card-content h4 { font-weight: 600; font-size: 0.875rem; color: #4B5563; } .dark .card-content h4 { color: #9CA3AF; }
                .card-content ul { list-style: disc; list-style-position: inside; padding-left: 0.5rem; font-size: 0.875rem; color: #6B7280; } .dark .card-content ul { color: #D1D5DB; }
                .card-footer { background-color: #F9FAFB; padding: 0.5rem 1rem; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F3F4F6; }
                .dark .card-footer { background-color: #374151; border-top-color: #4B5563; }
                .btn-action { padding: 0.5rem; color: #6B7280; border-radius: 9999px; } .dark .btn-action { color: #9CA3AF; }
                .btn-action:hover { background-color: #F3F4F6; } .dark .btn-action:hover { background-color: #4B5563; }
                .btn-action-danger { padding: 0.5rem; color: #EF4444; border-radius: 9999px; } .dark .btn-action-danger { color: #F87171; }
                .btn-action-danger:hover { background-color: #FEE2E2; } .dark .btn-action-danger:hover { background-color: #450A0A; }
                .badge { font-size: 0.75rem; font-weight: 600; padding: 0.125rem 0.625rem; border-radius: 9999px; }
                .badge-green { background-color: #D1FAE5; color: #065F46; } .dark .badge-green { background-color: #064E3B; color: #A7F3D0; }
                .badge-gray { background-color: #F3F4F6; color: #4B5563; } .dark .badge-gray { background-color: #374151; color: #D1D5DB; }
            `}</style>
        </div>
    );
};

export default MyRecipes;
