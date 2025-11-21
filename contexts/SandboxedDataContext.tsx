
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Classroom, Order, OrderItem, Recipe, Product, Supplier, Event } from '../types';
import { useData as useGlobalData } from './DataContext';

// This context will mirror the structure of the global DataContext,
// but all its data and functions will be scoped to a single classroom.

// We can omit many properties that are not relevant for the student sandbox
type SandboxedDataContextType = ReturnType<typeof useGlobalData>;

const SandboxedDataContext = createContext<SandboxedDataContextType | undefined>(undefined);

interface SandboxedDataProviderProps {
  children: ReactNode;
  classroom: Classroom;
}

export const SandboxedDataProvider: React.FC<SandboxedDataProviderProps> = ({ children, classroom }) => {
    const globalData = useGlobalData();
    const [sandboxedData, setSandboxedData] = useState<Classroom>(classroom);

    useEffect(() => {
        setSandboxedData(classroom);
    }, [classroom]);

    const updateClassroomData = <K extends keyof Classroom>(key: K, data: Classroom[K]) => {
        const updatedClassroom = { ...sandboxedData, [key]: data };
        setSandboxedData(updatedClassroom);
        globalData.updateClassroom(updatedClassroom);
    };
    
    // --- Overridden functions that operate on the classroom's data ---

    const saveOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }, itemsData: Omit<OrderItem, 'id' | 'orderId'>[]): Order => {
        let orderToSave: Order;
        const now = new Date().toISOString();
        let updatedOrders: Order[];
        
        if (orderData.id) { // Update
            const existingOrder = sandboxedData.orders.find(o => o.id === orderData.id)!;
            orderToSave = { ...existingOrder, ...orderData, updatedAt: now };
            updatedOrders = sandboxedData.orders.map(o => o.id === orderData.id ? orderToSave : o);
        } else { // Create
            orderToSave = { ...orderData, id: `order-${Date.now()}`, createdAt: now, updatedAt: now };
            updatedOrders = [...sandboxedData.orders, orderToSave];
        }

        const otherItems = sandboxedData.orderItems.filter(i => i.orderId !== orderToSave.id);
        const newItems = itemsData.map(item => ({...item, id: `item-${Date.now()}-${Math.random()}`, orderId: orderToSave.id }));
        const updatedItems = [...otherItems, ...newItems];

        updateClassroomData('orders', updatedOrders);
        updateClassroomData('orderItems', updatedItems);
        return orderToSave;
    };
    
    const getOrdersByTeacher = (teacherId: string) => sandboxedData.orders.filter(o => o.teacherId === teacherId);

    const getOrderWithItems = (orderId: string) => {
        const order = sandboxedData.orders.find(o => o.id === orderId);
        const items = sandboxedData.orderItems.filter(i => i.orderId === orderId);
        return { order, items };
    };

    const addRecipe = (recipeData: Omit<Recipe, 'id'>) => {
        const newRecipe = { ...recipeData, id: `recipe-${Date.now()}` };
        updateClassroomData('recipes', [...sandboxedData.recipes, newRecipe]);
    };

    const updateRecipe = (updatedRecipe: Recipe) => {
        updateClassroomData('recipes', sandboxedData.recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
    };

    const deleteRecipe = (recipeId: string) => {
        updateClassroomData('recipes', sandboxedData.recipes.filter(r => r.id !== recipeId));
    };
    
    // Create the sandboxed context value
    const contextValue: SandboxedDataContextType = {
        ...globalData, // Pass through global functions that are not overridden

        // Override data with sandboxed data
        products: sandboxedData.products,
        suppliers: sandboxedData.suppliers,
        events: sandboxedData.events,
        orders: sandboxedData.orders,
        orderItems: sandboxedData.orderItems,
        recipes: sandboxedData.recipes,
        families: sandboxedData.families,
        categories: sandboxedData.categories,
        productStates: sandboxedData.productStates,

        // Override functions to operate on sandboxed data
        saveOrder,
        getOrdersByTeacher,
        getOrderWithItems,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        
        // Disable functions that should not be available in sandbox
        addUser: () => { throw new Error("Not implemented in sandbox"); },
        addSupplier: () => { throw new Error("Not implemented in sandbox"); },
        addProduct: () => { throw new Error("Not implemented in sandbox"); },
        addEvent: (eventData: Omit<Event, 'id'>) => { 
            const newEvent = { ...eventData, id: `event-sb-${Date.now()}`};
            updateClassroomData('events', [...sandboxedData.events, newEvent]);
            return newEvent;
        },
    };

    return (
        <SandboxedDataContext.Provider value={contextValue}>
            {children}
        </SandboxedDataContext.Provider>
    );
};

// This custom hook will be used by all components. If they are inside a sandbox,
// they will get the sandboxed context. Otherwise, they get the global one.
export const useData = (): SandboxedDataContextType => {
  return useContext(SandboxedDataContext) || useGlobalData();
};
