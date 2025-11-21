import React, { useMemo } from 'react';
import { Recipe } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';

interface SelectRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (recipe: Recipe) => void;
  currentMenuRecipeIds: string[];
}

const SelectRecipeModal: React.FC<SelectRecipeModalProps> = ({ isOpen, onClose, onSelect, currentMenuRecipeIds }) => {
    const { recipes, users } = useData();
    const { currentUser } = useAuth();
    
    const userMap = useMemo(() => new Map(users.map(u => [u.id, u.name])), [users]);

    const availableRecipes = useMemo(() => {
        if (!currentUser) return [];
        return recipes.filter(r => 
            (r.creatorId === currentUser.id || r.isPublic) && !currentMenuRecipeIds.includes(r.id)
        );
    }, [recipes, currentUser, currentMenuRecipeIds]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Receta para el Menú">
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {availableRecipes.map(recipe => (
                    <button
                        key={recipe.id}
                        onClick={() => { onSelect(recipe); onClose(); }}
                        className="w-full text-left p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{recipe.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Creado por: {userMap.get(recipe.creatorId) || 'Desconocido'}
                        </p>
                    </button>
                ))}
            </div>
            <div className="flex justify-end pt-4 mt-4 border-t dark:border-gray-700">
                <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
            </div>
             <style>{`.btn-secondary { padding: 0.5rem 1rem; font-weight: 500; color: #374151; background-color: #F3F4F6; border-radius: 0.375rem; }`}</style>
        </Modal>
    );
};

export default SelectRecipeModal;
