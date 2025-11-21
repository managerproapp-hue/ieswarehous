
import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { User, Cycle, Module, Group, Assignment, Supplier, Product, Event, Order, OrderItem, EventType, EventStatus, OrderStatus, CatalogFamily, CatalogCategory, Recipe, ServiceGroup, Service, Sale, BackupRecord, Message, Incident, CompanyInfo, MiniEconomatoItem, Notification, MasterDataExport, TeacherOrdersExport, Role, Classroom, CreatorInfo } from '../types';
import storage from '../services/storageService';
import { DEMO_USERS, DEFAULT_CREATOR_INFO } from '../constants';
import { initialAcademicData } from '../services/academicData';
import { DEMO_SUPPLIERS } from '../services/supplierData';
import { DEMO_PRODUCTS } from '../services/productData';
import { DEFAULT_FAMILIES, DEFAULT_CATEGORIES, DEFAULT_PRODUCT_STATES } from '../services/catalogData';
import { DEMO_RECIPES, DEMO_SERVICE_GROUPS, DEMO_SERVICES } from '../services/serviceData';
import { DEMO_SALES } from '../services/saleData';

const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'IES La Flota',
  cif: 'A12345678',
  phone: '968 23 45 67',
  email: 'info@ieslaflota.es',
  address: 'Calle de la Marina Española, 1, 30007 Murcia',
  logoUI: 'https://via.placeholder.com/200x50.png?text=Logo+UI',
  logoPDF: 'https://via.placeholder.com/200x50.png?text=Logo+PDF',
  primaryColor: '#4f46e5', // Indigo-600
  warehouseManagerId: 'user-juan', // Default manager set to Juan Codina
  defaultBudget: 500,
  eventWeeks: 8,
};

// Helper to generate unique IDs
const generateId = (prefix: string) => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export interface DataContextType {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  getUserById: (userId: string) => User | undefined;
  
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => void;
  
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;

  families: CatalogFamily[];
  addFamily: (name: string) => CatalogFamily;
  deleteFamily: (familyId: string) => void;
  categories: CatalogCategory[];
  addCategory: (category: Omit<CatalogCategory, 'id'>) => CatalogCategory;
  deleteCategory: (categoryId: string) => void;
  productStates: string[];
  addProductState: (state: string) => void;
  
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => Event;
  updateEvent: (event: Event) => void;
  deleteEvent: (eventId: string) => void;

  orders: Order[];
  orderItems: OrderItem[];
  getOrdersByTeacher: (teacherId: string) => Order[];
  getOrderWithItems: (orderId: string) => { order: Order | undefined, items: OrderItem[] };
  saveOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'type'> & {id?: string, type?: 'replenishment'}, items: Omit<OrderItem, 'id' | 'orderId'>[]) => Order;
  deleteOrder: (orderId: string) => void;
  processEventOrders: (eventId: string, modifiedItems: { orderItemId: string, newQuantity: number, teacherId: string }[], senderId: string) => void;
  reopenProcessedOrders: (eventId: string) => void;
  finalizeReception: (eventId: string, verifiedItems: any[]) => void;

  incidents: Incident[];

  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => void;
  updateSale: (sale: Sale) => void;
  deleteSale: (saleId: string) => void;

  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (recipeId: string) => void;

  serviceGroups: ServiceGroup[];
  addServiceGroup: (group: Omit<ServiceGroup, 'id'>) => void;
  updateServiceGroup: (group: ServiceGroup) => void;
  deleteServiceGroup: (groupId: string) => void;
  
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (service: Service) => void;
  deleteService: (serviceId: string) => void;

  backupHistory: BackupRecord[];
  downloadBackupData: () => void;
  restoreApplicationData: (backupFileContent: string) => Promise<void>;
  resetApplicationData: () => void;

  // SYNC FUNCTIONS
  exportMasterData: () => void;
  importMasterData: (jsonContent: string) => Promise<void>;
  exportTeacherOrders: (teacherId: string) => void;
  importTeacherOrders: (jsonContent: string) => Promise<void>;
  importMultipleTeacherOrders: (jsonContents: string[]) => Promise<void>;

  cycles: Cycle[];
  modules: Module[];
  groups: Group[];
  assignments: Assignment[];
  addCycle: (cycle: Omit<Cycle, 'id'>) => void;
  updateCycle: (cycle: Cycle) => void;
  deleteCycle: (cycleId: string) => void;
  addModule: (module: Omit<Module, 'id'>) => void;
  updateModule: (module: Module) => void;
  deleteModule: (moduleId: string) => void;
  addGroup: (group: Omit<Group, 'id'>) => void;
  updateGroup: (group: Group) => void;
  deleteGroup: (groupId: string) => void;
  assignTeacher: (groupId: string, professorId: string | null) => void;

  messages: Message[];
  sendMessage: (messageData: Omit<Message, 'id' | 'timestamp' | 'readBy'>) => void;
  markMessageAsRead: (messageId: string, userId: string) => void;

  notifications: Notification[];
  addNotification: (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;

  companyInfo: CompanyInfo;
  updateCompanyInfo: (info: CompanyInfo) => void;

  miniEconomato: MiniEconomatoItem[];
  updateMiniEconomato: (items: MiniEconomatoItem[]) => void;
  assignExpenseFromMiniEconomato: (productId: string, teacherId: string, quantity: number) => void;

  // Classroom Management
  classrooms: Classroom[];
  addClassroom: (classroom: Omit<Classroom, 'id' | 'students' | 'products' | 'suppliers' | 'events' | 'orders' | 'orderItems' | 'recipes' | 'families' | 'categories' | 'productStates'>) => void;
  updateClassroom: (classroom: Classroom) => void;
  deleteClassroom: (classroomId: string) => void;
  updateClassroomContent: (classroomId: string, key: keyof Classroom, data: any) => void;
  resetClassroom: (classroomId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const generateUpcomingRegularEvents = (existingEvents: Event[], companyInfo: CompanyInfo): Event[] => {
    // ... (implementation remains the same)
    return [];
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [families, setFamilies] = useState<CatalogFamily[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [productStates, setProductStates] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => storage.local.get('companyInfo', DEFAULT_COMPANY_INFO));
  const [miniEconomato, setMiniEconomato] = useState<MiniEconomatoItem[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => storage.local.get('classrooms', []));


  useEffect(() => {
    const initData = <T,>(key: string, demoData: T[]): T[] => {
        const stored = storage.local.get<T[]>(key, []);
        if (stored.length === 0) {
            storage.local.set(key, demoData);
            return demoData;
        }
        return stored;
    };

    const initialUsers = DEMO_USERS.map(({ password, ...user }) => user);
    const storedUsers = storage.local.get<User[]>('users', []);
    if (storedUsers.length === 0) {
        setUsers(initialUsers);
        storage.local.set('users', initialUsers);
        storage.local.set('users_auth', DEMO_USERS);
    } else {
        setUsers(storedUsers);
    }
    
    setCompanyInfo(storage.local.get('companyInfo', DEFAULT_COMPANY_INFO));
    setSuppliers(initData('suppliers', DEMO_SUPPLIERS));
    setProducts(initData('products', DEMO_PRODUCTS));
    setFamilies(initData('families', DEFAULT_FAMILIES));
    setCategories(initData('categories', DEFAULT_CATEGORIES));
    setProductStates(initData('productStates', DEFAULT_PRODUCT_STATES));
    setRecipes(initData('recipes', DEMO_RECIPES));
    setServiceGroups(initData('serviceGroups', DEMO_SERVICE_GROUPS));
    setServices(initData('services', DEMO_SERVICES));
    setSales(initData('sales', DEMO_SALES));
    setBackupHistory(storage.local.get<BackupRecord[]>('backupHistory', []));
    setMessages(initData('messages', []));
    setNotifications(initData('notifications', []));
    setIncidents(initData('incidents', []));
    setMiniEconomato(initData('miniEconomato', []));
    setClassrooms(initData('classrooms', []));

    const storedEvents = storage.local.get<Event[]>('events', []);
    const loadedCompanyInfo = storage.local.get('companyInfo', DEFAULT_COMPANY_INFO);
    const newRegularEvents = generateUpcomingRegularEvents(storedEvents, loadedCompanyInfo);
    const allEvents = [...storedEvents, ...newRegularEvents];
    if (newRegularEvents.length > 0) {
        storage.local.set('events', allEvents);
    }
    setEvents(allEvents);

    setOrders(initData('orders', []));
    setOrderItems(initData('orderItems', []));
    setCycles(initData('cycles', initialAcademicData.cycles));
    setModules(initData('modules', initialAcademicData.modules));
    setGroups(initData('groups', initialAcademicData.groups));
    
    const storedAssignments = storage.local.get<Assignment[]>('assignments', []);
    if(storedAssignments.length === 0) {
        // Update assignment references to use new user IDs
        const initialAssignments: Assignment[] = [
          { id: 'assign-1', professorId: 'user-cristina', groupId: 'group-c1-1-a' },
          { id: 'assign-2', professorId: 'user-juan', groupId: 'group-c1-2-a' },
        ];
        setAssignments(initialAssignments);
        storage.local.set('assignments', initialAssignments);
    } else {
        setAssignments(storedAssignments);
    }

  }, []);
  
  const updateCompanyInfo = (info: CompanyInfo) => {
    setCompanyInfo(info);
    storage.local.set('companyInfo', info);
  };

  const persistUsers = useCallback((updatedUsers: User[]) => {
      setUsers(updatedUsers);
      storage.local.set('users', updatedUsers);
      const authUsers = storage.local.get<User[]>('users_auth', []);
      const updatedAuthUsers = authUsers.map(authUser => {
          const updatedUser = updatedUsers.find(u => u.id === authUser.id);
          return updatedUser ? { ...authUser, ...updatedUser } : authUser;
      });
      updatedUsers.forEach(updatedUser => {
          if (!authUsers.find(u => u.id === updatedUser.id)) {
              updatedAuthUsers.push({ ...updatedUser, password: 'password' });
          }
      });
      storage.local.set('users_auth', updatedAuthUsers);
  }, []);

  const addUser = (userData: Omit<User, 'id'>): User => {
    const newUser: User = { ...userData, id: generateId('user'), mustChangePassword: true };
    const updatedUsers = [...users, newUser];
    persistUsers(updatedUsers);
    return newUser;
  };

  const updateUser = (updatedUser: User) => {
    const updatedUsers = users.map((user) =>
      user.id === updatedUser.id ? updatedUser : user
    );
    persistUsers(updatedUsers);
  };
  
  const deleteUser = (userId: string) => {
    const updatedUsers = users.filter((user) => user.id !== userId);
    persistUsers(updatedUsers);
  };
  
  const getUserById = (userId: string): User | undefined => {
    return users.find(u => u.id === userId);
  };
  
  const addSupplier = (supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...supplierData, id: generateId('supplier') };
    const updatedSuppliers = [...suppliers, newSupplier];
    setSuppliers(updatedSuppliers);
    storage.local.set('suppliers', updatedSuppliers);
  };
  const updateSupplier = (updatedSupplier: Supplier) => {
    const updatedSuppliers = suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s);
    setSuppliers(updatedSuppliers);
    storage.local.set('suppliers', updatedSuppliers);
  };
  const deleteSupplier = (supplierId: string) => {
    const updatedProducts = products.map(p => {
        const isAssociated = p.suppliers.some(s => s.supplierId === supplierId);
        if (isAssociated) {
            return {
                ...p,
                suppliers: p.suppliers.filter(s => s.supplierId !== supplierId)
            };
        }
        return p;
    });
    setProducts(updatedProducts);
    storage.local.set('products', updatedProducts);

    const updatedSuppliers = suppliers.filter(s => s.id !== supplierId);
    setSuppliers(updatedSuppliers);
    storage.local.set('suppliers', updatedSuppliers);
  };

  const addProduct = (productData: Omit<Product, 'id'>) => {
    if (products.some(p => p.reference === productData.reference)) {
        alert('Error: Ya existe un producto con esa referencia.');
        throw new Error('Reference code already exists');
    }
    const newProduct = { ...productData, id: generateId('prod') };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    storage.local.set('products', updatedProducts);
  };
  const updateProduct = (updatedProduct: Product) => {
     if (products.some(p => p.id !== updatedProduct.id && p.reference === updatedProduct.reference)) {
        alert('Error: Ya existe otro producto con esa referencia.');
        throw new Error('Reference code already exists');
    }
    const updatedProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    setProducts(updatedProducts);
    storage.local.set('products', updatedProducts);
  };
  const deleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    storage.local.set('products', updatedProducts);
  };

  const addFamily = (name: string): CatalogFamily => {
    const trimmedName = name.trim();
    if (!trimmedName || families.some(f => f.name.toLowerCase() === trimmedName.toLowerCase())) {
        alert('Error: El nombre de la familia ya existe o está vacío.');
        throw new Error('Family name already exists or is empty.');
    }
    const newFamily: CatalogFamily = { id: generateId('fam'), name: trimmedName };
    const updatedFamilies = [...families, newFamily];
    setFamilies(updatedFamilies);
    storage.local.set('families', updatedFamilies);
    return newFamily;
  };
  
  const deleteFamily = (familyId: string) => {
    const isDefault = DEFAULT_FAMILIES.some(f => f.id === familyId);
    if (isDefault) {
        alert("No se pueden eliminar las familias predefinidas del sistema.");
        return;
    }
    const updatedFamilies = families.filter(f => f.id !== familyId);
    setFamilies(updatedFamilies);
    storage.local.set('families', updatedFamilies);
    
    const updatedCategories = categories.filter(c => c.familyId !== familyId);
    setCategories(updatedCategories);
    storage.local.set('categories', updatedCategories);
    
    const updatedProducts = products.map(p => {
        if (p.family === familyId) {
            return {...p, family: '', category: ''};
        }
        return p;
    });
    setProducts(updatedProducts);
    storage.local.set('products', updatedProducts);
  };

  const addCategory = (categoryData: Omit<CatalogCategory, 'id'>) => {
     if (!categoryData.name.trim() || categories.some(c => c.name.toLowerCase() === categoryData.name.trim().toLowerCase() && c.familyId === categoryData.familyId)) {
        alert('Error: El nombre de la categoría ya existe en esta familia o está vacío.');
        throw new Error('Category name already exists in this family or is empty.');
    }
    const newCategory = { ...categoryData, id: generateId('cat') };
    const updatedCategories = [...categories, newCategory];
    setCategories(updatedCategories);
    storage.local.set('categories', updatedCategories);
    return newCategory;
  };

  const deleteCategory = (categoryId: string) => {
    const isDefault = DEFAULT_CATEGORIES.some(c => c.id === categoryId);
    if (isDefault) {
        alert("No se pueden eliminar las categorías predefinidas del sistema.");
        return;
    }
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    setCategories(updatedCategories);
    storage.local.set('categories', updatedCategories);
    
    const updatedProducts = products.map(p => {
        if (p.category === categoryId) {
            return {...p, category: ''};
        }
        return p;
    });
    setProducts(updatedProducts);
    storage.local.set('products', updatedProducts);
  };

  const addProductState = (newState: string) => {
    if (newState.trim() && !productStates.some(s => s.toLowerCase() === newState.trim().toLowerCase())) {
        const updatedStates = [...productStates, newState.trim()];
        setProductStates(updatedStates);
        storage.local.set('productStates', updatedStates);
    } else {
        alert('El estado del producto ya existe o está vacío.');
    }
  };

  const addEvent = (eventData: Omit<Event, 'id'>): Event => {
    const newEvent = { ...eventData, id: generateId('event') };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    storage.local.set('events', updatedEvents);
    return newEvent;
  };
  const updateEvent = (updatedEvent: Event) => {
    const updatedEvents = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(updatedEvents);
    storage.local.set('events', updatedEvents);
  };
  const deleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(e => e.id !== eventId);
    setEvents(updatedEvents);
    storage.local.set('events', updatedEvents);
  };

  const getOrdersByTeacher = (teacherId: string) => orders.filter(o => o.teacherId === teacherId);
  
  const getOrderWithItems = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    const items = orderItems.filter(i => i.orderId === orderId);
    return { order, items };
  };

  const saveOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'type'> & {id?: string, type?: 'replenishment'}, itemsData: Omit<OrderItem, 'id' | 'orderId'>[]): Order => {
    let orderToSave: Order;
    const now = new Date().toISOString();

    if(orderData.id) { // Update existing order
        const existingOrder = orders.find(o => o.id === orderData.id)!;
        orderToSave = { ...existingOrder, ...orderData, updatedAt: now };
        const updatedOrders = orders.map(o => o.id === orderData.id ? orderToSave : o);
        setOrders(updatedOrders);
        storage.local.set('orders', updatedOrders);
    } else { // Create new order
        orderToSave = { ...orderData, id: generateId('order'), createdAt: now, updatedAt: now };
        const updatedOrders = [...orders, orderToSave];
        setOrders(updatedOrders);
        storage.local.set('orders', updatedOrders);
    }
    
    const otherItems = orderItems.filter(i => i.orderId !== orderToSave.id);
    const newItems = itemsData.map(item => ({...item, id: generateId('item'), orderId: orderToSave.id }));
    const updatedItems = [...otherItems, ...newItems];
    setOrderItems(updatedItems);
    storage.local.set('orderItems', updatedItems);
    return orderToSave;
  };
  
  const deleteOrder = (orderId: string) => {
    const updatedOrders = orders.filter(o => o.id !== orderId);
    const updatedItems = orderItems.filter(i => i.orderId !== orderId);
    setOrders(updatedOrders);
    setOrderItems(updatedItems);
    storage.local.set('orders', updatedOrders);
    storage.local.set('orderItems', updatedItems);
  };

  const addSale = (saleData: Omit<Sale, 'id'>) => {
    const newSale = { ...saleData, id: generateId('sale') };
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    storage.local.set('sales', updatedSales);
  };
  const updateSale = (updatedSale: Sale) => {
    const updated = sales.map(s => s.id === updatedSale.id ? updatedSale : s);
    setSales(updated);
    storage.local.set('sales', updated);
  };
  const deleteSale = (saleId: string) => {
    const updated = sales.filter(s => s.id !== saleId);
    setSales(updated);
    storage.local.set('sales', updated);
  };

  const addRecipe = (recipeData: Omit<Recipe, 'id'>) => {
    const newRecipe = { ...recipeData, id: generateId('recipe') };
    const updated = [...recipes, newRecipe];
    setRecipes(updated);
    storage.local.set('recipes', updated);
  };
  const updateRecipe = (updatedRecipe: Recipe) => {
    const updated = recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r);
    setRecipes(updated);
    storage.local.set('recipes', updated);
  };
  const deleteRecipe = (recipeId: string) => {
    const updated = recipes.filter(r => r.id !== recipeId);
    setRecipes(updated);
    storage.local.set('recipes', updated);
  };

  const addServiceGroup = (groupData: Omit<ServiceGroup, 'id'>) => {
    const newGroup = { ...groupData, id: generateId('sgroup') };
    const updated = [...serviceGroups, newGroup];
    setServiceGroups(updated);
    storage.local.set('serviceGroups', updated);
  };
  const updateServiceGroup = (updatedGroup: ServiceGroup) => {
    const updated = serviceGroups.map(g => g.id === updatedGroup.id ? updatedGroup : g);
    setServiceGroups(updated);
    storage.local.set('serviceGroups', updated);
  };
  const deleteServiceGroup = (groupId: string) => {
    const updated = serviceGroups.filter(g => g.id !== groupId);
    setServiceGroups(updated);
    storage.local.set('serviceGroups', updated);
  };
  
  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService = { ...serviceData, id: generateId('service') };
    const updated = [...services, newService];
    setServices(updated);
    storage.local.set('services', updated);
  };
  const updateService = (updatedService: Service) => {
    const updated = services.map(s => s.id === updatedService.id ? updatedService : s);
    setServices(updated);
    storage.local.set('services', updated);
  };
  const deleteService = (serviceId: string) => {
    const updated = services.filter(s => s.id !== serviceId);
    setServices(updated);
    storage.local.set('services', updated);
  };

  const addCycle = (cycleData: Omit<Cycle, 'id'>) => {
    const newCycle: Cycle = { ...cycleData, id: generateId('cycle')};
    const updatedCycles = [...cycles, newCycle];
    setCycles(updatedCycles);
    storage.local.set('cycles', updatedCycles);
  };
  const updateCycle = (updatedCycle: Cycle) => {
    const updatedCycles = cycles.map(c => c.id === updatedCycle.id ? updatedCycle : c);
    setCycles(updatedCycles);
    storage.local.set('cycles', updatedCycles);
  };
  const deleteCycle = (cycleId: string) => {
    const modulesToDelete = modules.filter(m => m.cycleId === cycleId);
    modulesToDelete.forEach(m => deleteModule(m.id));
    const updatedCycles = cycles.filter(c => c.id !== cycleId);
    setCycles(updatedCycles);
    storage.local.set('cycles', updatedCycles);
  };
  const addModule = (moduleData: Omit<Module, 'id'>) => {
    const newModule: Module = {...moduleData, id: generateId('mod')};
    const updatedModules = [...modules, newModule];
    setModules(updatedModules);
    storage.local.set('modules', updatedModules);
  };
  const updateModule = (updatedModule: Module) => {
    const updatedModules = modules.map(m => m.id === updatedModule.id ? updatedModule : m);
    setModules(updatedModules);
    storage.local.set('modules', updatedModules);
  };
  const deleteModule = (moduleId: string) => {
    const groupsToDelete = groups.filter(g => g.moduleId === moduleId);
    groupsToDelete.forEach(g => deleteGroup(g.id));
    const updatedModules = modules.filter(m => m.id !== moduleId);
    setModules(updatedModules);
    storage.local.set('modules', updatedModules);
  };
  const addGroup = (groupData: Omit<Group, 'id'>) => {
    const newGroup: Group = {...groupData, id: generateId('group')};
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    storage.local.set('groups', updatedGroups);
  };
  const updateGroup = (updatedGroup: Group) => {
    const updatedGroups = groups.map(g => g.id === updatedGroup.id ? updatedGroup : g);
    setGroups(updatedGroups);
    storage.local.set('groups', updatedGroups);
  };
  const deleteGroup = (groupId: string) => {
    const updatedAssignments = assignments.filter(a => a.groupId !== groupId);
    setAssignments(updatedAssignments);
    storage.local.set('assignments', updatedAssignments);
    const updatedGroups = groups.filter(g => g.id !== groupId);
    setGroups(updatedGroups);
    storage.local.set('groups', updatedGroups);
  };
  const assignTeacher = (groupId: string, professorId: string | null) => {
    let updatedAssignments = [...assignments];
    const existingAssignmentIndex = updatedAssignments.findIndex(a => a.groupId === groupId);

    if (professorId) {
      if (existingAssignmentIndex > -1) {
        updatedAssignments[existingAssignmentIndex] = { ...updatedAssignments[existingAssignmentIndex], professorId };
      } else {
        updatedAssignments.push({ id: generateId('assign'), groupId, professorId });
      }
    } else {
      if (existingAssignmentIndex > -1) {
        updatedAssignments.splice(existingAssignmentIndex, 1);
      }
    }
    setAssignments(updatedAssignments);
    storage.local.set('assignments', updatedAssignments);
  };

  const downloadBackupData = () => {
    const allData = {
        users: storage.local.get('users', []),
        creatorInfo: storage.local.get('creatorInfo', {}),
        companyInfo: storage.local.get('companyInfo', {}),
        theme: storage.local.get('theme', 'light'),
        cycles: storage.local.get('cycles', []),
        modules: storage.local.get('modules', []),
        groups: storage.local.get('groups', []),
        assignments: storage.local.get('assignments', []),
        suppliers: storage.local.get('suppliers', []),
        products: storage.local.get('products', []),
        events: storage.local.get('events', []),
        orders: storage.local.get('orders', []),
        orderItems: storage.local.get('orderItems', []),
        sales: storage.local.get('sales', []),
        families: storage.local.get('families', []),
        categories: storage.local.get('categories', []),
        productStates: storage.local.get('productStates', []),
        recipes: storage.local.get('recipes', []),
        serviceGroups: storage.local.get('serviceGroups', []),
        services: storage.local.get('services', []),
        messages: storage.local.get('messages', []),
        notifications: storage.local.get('notifications', []),
        incidents: storage.local.get('incidents', []),
        miniEconomato: storage.local.get('miniEconomato', []),
        classrooms: storage.local.get('classrooms', []),
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const now = new Date();
    const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    const exportFileDefaultName = `backup-${timestamp}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    const newRecord: BackupRecord = {
        date: now.toISOString(),
        filename: exportFileDefaultName,
        size: dataStr.length,
    };
    const currentHistory = storage.local.get<BackupRecord[]>('backupHistory', []);
    const updatedHistory = [newRecord, ...currentHistory].slice(0, 10);
    setBackupHistory(updatedHistory);
    storage.local.set('backupHistory', updatedHistory);
    storage.local.remove('lastBackupDate');
  };

  const restoreApplicationData = (backupFileContent: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            const data = JSON.parse(backupFileContent);
            if (data.users && data.creatorInfo && data.theme) {
                storage.local.set('users', data.users);
                const authUsers = data.users.map((u: User) => ({ ...u, password: 'password' }));
                storage.local.set('users_auth', authUsers);
                storage.local.set('creatorInfo', data.creatorInfo);
                storage.local.set('companyInfo', data.companyInfo || DEFAULT_COMPANY_INFO);
                storage.local.set('theme', data.theme);
                if(data.cycles) storage.local.set('cycles', data.cycles);
                if(data.modules) storage.local.set('modules', data.modules);
                if(data.groups) storage.local.set('groups', data.groups);
                if(data.assignments) storage.local.set('assignments', data.assignments);
                if(data.suppliers) storage.local.set('suppliers', data.suppliers);
                if(data.products) storage.local.set('products', data.products);
                if(data.events) storage.local.set('events', data.events);
                if(data.orders) storage.local.set('orders', data.orders);
                if(data.orderItems) storage.local.set('orderItems', data.orderItems);
                if(data.sales) storage.local.set('sales', data.sales);
                if(data.families) storage.local.set('families', data.families);
                if(data.categories) storage.local.set('categories', data.categories);
                if(data.productStates) storage.local.set('productStates', data.productStates);
                if(data.recipes) storage.local.set('recipes', data.recipes);
                if(data.serviceGroups) storage.local.set('serviceGroups', data.serviceGroups);
                if(data.services) storage.local.set('services', data.services);
                if(data.messages) storage.local.set('messages', data.messages);
                if(data.notifications) storage.local.set('notifications', data.notifications);
                if(data.incidents) storage.local.set('incidents', data.incidents);
                if(data.miniEconomato) storage.local.set('miniEconomato', data.miniEconomato);
                if(data.classrooms) storage.local.set('classrooms', data.classrooms);
                resolve();
            } else {
                reject(new Error("Archivo de copia de seguridad inválido o corrupto."));
            }
        } catch (e) {
            reject(new Error("Error al leer el archivo. Asegúrate de que es un JSON válido."));
        }
    });
  };
  
  const resetApplicationData = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.hash = '/login';
    window.location.reload();
  };

  // --- IMPORT / EXPORT SYSTEM SYNC LOGIC ---

  const exportMasterData = () => {
      const data: MasterDataExport = {
          type: 'MASTER_DATA',
          version: '1.0',
          exportedAt: new Date().toISOString(),
          companyInfo,
          creatorInfo: storage.local.get('creatorInfo', DEFAULT_CREATOR_INFO),
          users,
          products,
          suppliers,
          families,
          categories,
          productStates,
          cycles,
          modules,
          groups,
          assignments,
          events,
          serviceGroups
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `configuracion_maestra_${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
  };

  const importMasterData = (jsonContent: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          try {
              const data: MasterDataExport = JSON.parse(jsonContent);
              if (data.type !== 'MASTER_DATA') {
                  throw new Error("El archivo no es una configuración maestra válida.");
              }

              // Merge logic: We want to update definitions but keep local work (like recipes, orders).
              // Simple strategy: Replace catalogs and users. 
              
              // 1. Update Company & Global Settings
              updateCompanyInfo(data.companyInfo);
              storage.local.set('creatorInfo', data.creatorInfo);
              
              // 2. Merge Users (Keep existing if ID matches, add new)
              // IMPORTANT: Preserve passwords if they exist locally for the same user
              const existingAuthUsers = storage.local.get<User[]>('users_auth', []);
              const mergedUsers = data.users.map(newUser => {
                  const existing = existingAuthUsers.find(u => u.id === newUser.id);
                  return existing ? { ...newUser, password: existing.password } : newUser; 
              });
              // Update auth storage with potentially new users (default password if new)
              const newAuthUsers = mergedUsers.map(u => u.password ? u : { ...u, password: 'password', mustChangePassword: true });
              
              setUsers(mergedUsers);
              storage.local.set('users', mergedUsers);
              storage.local.set('users_auth', newAuthUsers);

              // 3. Replace Catalogs (Master source of truth)
              setSuppliers(data.suppliers); storage.local.set('suppliers', data.suppliers);
              setProducts(data.products); storage.local.set('products', data.products);
              setFamilies(data.families); storage.local.set('families', data.families);
              setCategories(data.categories); storage.local.set('categories', data.categories);
              setProductStates(data.productStates); storage.local.set('productStates', data.productStates);
              
              // 4. Replace Academic Structure
              setCycles(data.cycles); storage.local.set('cycles', data.cycles);
              setModules(data.modules); storage.local.set('modules', data.modules);
              setGroups(data.groups); storage.local.set('groups', data.groups);
              setAssignments(data.assignments); storage.local.set('assignments', data.assignments);
              
              // 5. Update Events (Master schedule)
              // We should replace events to ensure teachers see the correct dates/budgets
              // BUT we must ensure we don't break keys for existing local orders.
              setEvents(data.events); storage.local.set('events', data.events);
              
              setServiceGroups(data.serviceGroups); storage.local.set('serviceGroups', data.serviceGroups);

              resolve();
          } catch (e) {
              reject(e);
          }
      });
  };

  const exportTeacherOrders = (teacherId: string) => {
      const myOrders = orders.filter(o => o.teacherId === teacherId);
      const myOrderIds = new Set(myOrders.map(o => o.id));
      const myItems = orderItems.filter(i => myOrderIds.has(i.orderId));
      const teacher = users.find(u => u.id === teacherId);

      const data: TeacherOrdersExport = {
          type: 'TEACHER_ORDERS',
          exportedAt: new Date().toISOString(),
          teacherId,
          teacherName: teacher ? teacher.name : 'Desconocido',
          orders: myOrders,
          orderItems: myItems
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `pedidos_${teacher?.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
  };

  const importTeacherOrders = (jsonContent: string): Promise<void> => {
      return new Promise((resolve, reject) => {
          try {
              const data: TeacherOrdersExport = JSON.parse(jsonContent);
              if (data.type !== 'TEACHER_ORDERS') {
                  throw new Error("El archivo no es un paquete de pedidos válido.");
              }

              // Merge orders: Add if new, Update if exists (and newer?)
              // For simplicity, we'll overwrite matching IDs or add new ones.
              
              const incomingOrderIds = new Set(data.orders.map(o => o.id));
              
              // 1. Filter out existing local versions of these orders
              const keptOrders = orders.filter(o => !incomingOrderIds.has(o.id));
              const keptItems = orderItems.filter(i => !incomingOrderIds.has(i.orderId));
              
              // 2. Combine
              const newOrders = [...keptOrders, ...data.orders];
              const newItems = [...keptItems, ...data.orderItems];
              
              setOrders(newOrders);
              setOrderItems(newItems);
              storage.local.set('orders', newOrders);
              storage.local.set('orderItems', newItems);
              
              resolve();
          } catch (e) {
              reject(e);
          }
      });
  };

  const importMultipleTeacherOrders = (jsonContents: string[]): Promise<void> => {
      return new Promise((resolve, reject) => {
          try {
              const incomingOrders: Order[] = [];
              const incomingItems: OrderItem[] = [];
              
              jsonContents.forEach(content => {
                  try {
                      const data: TeacherOrdersExport = JSON.parse(content);
                      if (data.type === 'TEACHER_ORDERS') {
                          incomingOrders.push(...data.orders);
                          incomingItems.push(...data.orderItems);
                      }
                  } catch (e) {
                      console.error("Error parsing one of the order files", e);
                  }
              });

              if (incomingOrders.length === 0) {
                  // If no valid files were found or they were empty
                  resolve(); 
                  return;
              }

              const incomingOrderIds = new Set(incomingOrders.map(o => o.id));
              
              // Filter out existing orders that are being updated by the new imports
              const keptOrders = orders.filter(o => !incomingOrderIds.has(o.id));
              const keptItems = orderItems.filter(i => !incomingOrderIds.has(i.orderId));
              
              // Combine
              const newOrders = [...keptOrders, ...incomingOrders];
              const newItems = [...keptItems, ...incomingItems];
              
              setOrders(newOrders);
              setOrderItems(newItems);
              storage.local.set('orders', newOrders);
              storage.local.set('orderItems', newItems);
              
              resolve();
          } catch (e) {
              reject(e);
          }
      });
  };


  // Messaging functions
  const sendMessage = useCallback((messageData: Omit<Message, 'id' | 'timestamp' | 'readBy'>) => {
    const newMessage: Message = {
        ...messageData,
        id: generateId('msg'),
        timestamp: new Date().toISOString(),
        readBy: [messageData.senderId], // Sender has read it by default
    };
    setMessages(prev => {
        const updated = [...prev, newMessage];
        storage.local.set('messages', updated);
        return updated;
    });
  }, []);

  const markMessageAsRead = (messageId: string, userId: string) => {
    const updatedMessages = messages.map(msg => {
        if (msg.id === messageId && !msg.readBy.includes(userId)) {
            return { ...msg, readBy: [...msg.readBy, userId] };
        }
        return msg;
    });
    setMessages(updatedMessages);
    storage.local.set('messages', updatedMessages);
  };

   // Notification functions
   const addNotification = useCallback((notificationData: Omit<Notification, 'id'|'timestamp'|'isRead'>) => {
    const newNotification: Notification = {
        ...notificationData,
        id: generateId('notif'),
        timestamp: new Date().toISOString(),
        isRead: false,
    };
    setNotifications(prev => {
        const updated = [newNotification, ...prev].slice(0, 50); // Keep last 50
        storage.local.set('notifications', updated);
        return updated;
    });
  }, []);

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => {
        const updated = prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n);
        storage.local.set('notifications', updated);
        return updated;
    });
  };
  
  const markAllNotificationsAsRead = (userId: string) => {
    setNotifications(prev => {
        const updated = prev.map(n => n.userId === userId ? { ...n, isRead: true } : n);
        storage.local.set('notifications', updated);
        return updated;
    });
  };

   // Order processing functions
    const processEventOrders = useCallback((eventId: string, modifiedItemsData: { orderItemId: string; newQuantity: number, teacherId: string }[], senderId: string) => {
        const teachersToNotify = new Map<string, { modified: any[] }>();
        const updatedItemsMap = new Map(modifiedItemsData.map(d => [d.orderItemId, d.newQuantity]));

        const newOrderItems = orderItems.map(item => {
            if (updatedItemsMap.has(item.id)) {
                return { ...item, quantity: updatedItemsMap.get(item.id)! };
            }
            return item;
        });

        setOrderItems(newOrderItems);
        storage.local.set('orderItems', newOrderItems);

        const newOrders = orders.map(order => {
            if (order.eventId === eventId && order.status === OrderStatus.SUBMITTED) {
                return { ...order, status: OrderStatus.PROCESSED, updatedAt: new Date().toISOString() };
            }
            return order;
        });
        setOrders(newOrders);
        storage.local.set('orders', newOrders);
        
        // Group notifications by teacher
        modifiedItemsData.forEach(mod => {
            if (!teachersToNotify.has(mod.teacherId)) {
                teachersToNotify.set(mod.teacherId, { modified: [] });
            }
            const originalItem = orderItems.find(i => i.id === mod.orderItemId);
            if(originalItem && originalItem.quantity !== mod.newQuantity) {
                 teachersToNotify.get(mod.teacherId)!.modified.push({
                    name: originalItem.productName,
                    from: originalItem.quantity,
                    to: mod.newQuantity,
                 });
            }
        });

        // Send one message per affected teacher
        teachersToNotify.forEach((data, teacherId) => {
            if (data.modified.length > 0) {
                const eventName = events.find(e => e.id === eventId)?.name || 'un evento';
                const subject = `Modificaciones en tu pedido para ${eventName}`;
                let body = "El gestor de almacén ha realizado los siguientes ajustes en tu pedido:\n\n";
                data.modified.forEach(mod => {
                    body += `- ${mod.name}: Cantidad ajustada de ${mod.from} a ${mod.to}.\n`;
                });
                body += "\nPor favor, revisa tu portal de pedidos para más detalles.";
                sendMessage({ senderId, recipientIds: [teacherId], subject, body });
                addNotification({
                    userId: teacherId,
                    title: `Ajustes en tu pedido para ${eventName}`,
                    message: `El almacén ha modificado tu pedido. Haz clic para revisar.`,
                    link: '/teacher/order-portal'
                });
            }
        });
    }, [orderItems, orders, sendMessage, events, addNotification]);

    const reopenProcessedOrders = useCallback((eventId: string) => {
        const newOrders = orders.map(order => {
            if (order.eventId === eventId && order.status === OrderStatus.PROCESSED) {
                return { ...order, status: OrderStatus.SUBMITTED, updatedAt: new Date().toISOString() };
            }
            return order;
        });
        setOrders(newOrders);
        storage.local.set('orders', newOrders);
    }, [orders]);

    const finalizeReception = useCallback((eventId: string, verifiedItems: any[]) => {
        const newIncidents: Omit<Incident, 'id'>[] = [];
        const itemsWithIssues = new Set<string | null>();

        verifiedItems.forEach(vItem => {
            if (vItem.verificationState === 'partial' || vItem.verificationState === 'incident') {
                itemsWithIssues.add(vItem.productId);
            }
            vItem.incidents.forEach((inc: any) => {
                newIncidents.push({
                    eventId,
                    productId: vItem.productId,
                    productName: vItem.productName,
                    supplierId: inc.supplierId,
                    date: new Date().toISOString(),
                    description: inc.description,
                    orderItemIds: vItem.breakdown.map((bd: any) => bd.orderItemId),
                });
            });
        });

        const createdIncidents = newIncidents.map(inc => ({ ...inc, id: generateId('inc') }));
        const updatedIncidents = [...incidents, ...createdIncidents];
        setIncidents(updatedIncidents);
        storage.local.set('incidents', updatedIncidents);

        const eventOrders = orders.filter(o => o.eventId === eventId && o.status === OrderStatus.PROCESSED);
        const eventOrderIds = new Set(eventOrders.map(o => o.id));
        const eventItems = orderItems.filter(i => eventOrderIds.has(i.orderId));
        
        const affectedOrderIds = new Set<string>();
        eventItems.forEach(item => {
            if (itemsWithIssues.has(item.productId)) {
                affectedOrderIds.add(item.orderId);
            }
        });

        const updatedOrders = orders.map(order => {
            if (eventOrderIds.has(order.id)) {
                return {
                    ...order,
                    status: affectedOrderIds.has(order.id) ? OrderStatus.RECEIVED_PARTIAL : OrderStatus.RECEIVED_OK,
                    updatedAt: new Date().toISOString()
                };
            }
            return order;
        });

        setOrders(updatedOrders);
        storage.local.set('orders', updatedOrders);
    }, [orders, orderItems, incidents]);

  // Mini-Economato Functions
  const updateMiniEconomato = (items: MiniEconomatoItem[]) => {
      setMiniEconomato(items);
      storage.local.set('miniEconomato', items);
  };
  
  const assignExpenseFromMiniEconomato = (productId: string, teacherId: string, quantity: number) => {
      const itemIndex = miniEconomato.findIndex(i => i.productId === productId);
      if (itemIndex === -1) throw new Error("Producto no encontrado en el Mini-Economato.");
      
      const item = miniEconomato[itemIndex];
      if (quantity > item.currentStock) throw new Error("Stock insuficiente.");
  
      const product = products.find(p => p.id === productId);
      if (!product) throw new Error("Definición del producto no encontrada en el catálogo general.");
  
      const activeEvent = events.find(e => e.type === EventType.REGULAR && e.status === EventStatus.ACTIVE);
      if (!activeEvent) throw new Error("No hay un evento de pedido regular activo para imputar el gasto.");
  
      const activeSuppliers = product.suppliers.filter(s => s.status === 'Activo');
      if (activeSuppliers.length === 0) throw new Error("El producto no tiene proveedores activos para determinar un precio.");
  
      const bestPriceSupplier = activeSuppliers.reduce((min, s) => s.price < min.price ? s : min);
      
      const orderItem: Omit<OrderItem, 'id' | 'orderId'> = {
          productId: product.id,
          productName: product.name,
          quantity,
          unit: product.unit,
          isOutOfCatalog: false,
          supplierId: bestPriceSupplier.supplierId,
          unitPrice: bestPriceSupplier.price,
      };
      
      saveOrder({
          eventId: activeEvent.id,
          teacherId,
          status: OrderStatus.PROCESSED,
          notes: `Consumo desde Mini-Economato. Registrado por Almacén.`,
      }, [orderItem]);
  
      const updatedMiniEconomato = [...miniEconomato];
      updatedMiniEconomato[itemIndex] = { ...item, currentStock: item.currentStock - quantity };
      updateMiniEconomato(updatedMiniEconomato);
  };

  const persistClassrooms = useCallback((updated: Classroom[]) => {
      setClassrooms(updated);
      storage.local.set('classrooms', updated);
  }, []);

  const addClassroom = (data: any) => {
      const newClassroom: Classroom = {
          ...data,
          id: generateId('room'),
          students: [],
          products: [], // Usually empty initially or copy of master
          suppliers: [],
          events: [],
          orders: [],
          orderItems: [],
          recipes: [],
          families: [],
          categories: [],
          productStates: []
      };
      persistClassrooms([...classrooms, newClassroom]);
  };

  const updateClassroom = (updated: Classroom) => {
      persistClassrooms(classrooms.map(c => c.id === updated.id ? updated : c));
  };

  const deleteClassroom = (id: string) => {
      persistClassrooms(classrooms.filter(c => c.id !== id));
  };

  const updateClassroomContent = (id: string, key: keyof Classroom, data: any) => {
      const updated = classrooms.map(c => c.id === id ? { ...c, [key]: data } : c);
      persistClassrooms(updated);
  };

  const resetClassroom = (id: string) => {
      const updated = classrooms.map(c => c.id === id ? {
          ...c,
          students: [],
          products: [],
          suppliers: [],
          events: [],
          orders: [],
          orderItems: [],
          recipes: [],
          families: [], 
          categories: [],
          productStates: []
      } : c);
      persistClassrooms(updated);
  };


  return (
    <DataContext.Provider value={{ 
        users, 
        setUsers: persistUsers, 
        addUser, 
        updateUser, 
        deleteUser, 
        getUserById, 
        suppliers, addSupplier, updateSupplier, deleteSupplier,
        products, addProduct, updateProduct, deleteProduct,
        families, addFamily, deleteFamily, categories, productStates, addCategory, deleteCategory, addProductState,
        events, addEvent, updateEvent, deleteEvent,
        orders, orderItems, getOrdersByTeacher, getOrderWithItems, saveOrder, deleteOrder, processEventOrders, reopenProcessedOrders, finalizeReception,
        incidents,
        sales,
        addSale,
        updateSale,
        deleteSale,
        recipes, addRecipe, updateRecipe, deleteRecipe,
        serviceGroups, addServiceGroup, updateServiceGroup, deleteServiceGroup,
        services, addService, updateService, deleteService,
        backupHistory,
        downloadBackupData,
        restoreApplicationData, 
        resetApplicationData,
        // SYNC FUNCTIONS EXPORT
        exportMasterData,
        importMasterData,
        exportTeacherOrders,
        importTeacherOrders,
        importMultipleTeacherOrders,
        cycles,
        modules,
        groups,
        assignments,
        addCycle,
        updateCycle,
        deleteCycle,
        addModule,
        updateModule,
        deleteModule,
        addGroup,
        updateGroup,
        deleteGroup,
        assignTeacher,
        messages,
        sendMessage,
        markMessageAsRead,
        notifications,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        companyInfo,
        updateCompanyInfo,
        miniEconomato,
        updateMiniEconomato,
        assignExpenseFromMiniEconomato,
        classrooms,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        updateClassroomContent,
        resetClassroom,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
