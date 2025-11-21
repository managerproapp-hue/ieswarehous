
import React from 'react';

export enum Role {
  ADMIN = 'ADMIN',
  CREATOR = 'CREATOR',
  MANAGER = 'MANAGER',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should not be stored long-term
  avatar: string;
  roles: Role[];
  activityStatus?: 'active' | 'inactive';
  contractType?: 'Titular' | 'Sustituto';
  mustChangePassword?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  cif: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  notes: string;
  status: 'Activo' | 'Inactivo';
  avatar: string; // Used for logo
}

export interface CreatorInfo {
  appName: string;
  creatorName: string;
  contactEmail: string;
  copyrightText: string;
  logo: string;
  // Simplified Cloud Config - Direct Links
  systemUpdateUrl?: string; // URL to the Google Drive folder for system updates
  ordersFolderUrl?: string; // URL to the Google Drive folder for uploading orders
}

export interface CompanyInfo {
  name: string;
  cif: string;
  phone: string;
  email: string;
  address: string;
  logoUI: string;
  logoPDF: string;
  primaryColor: string;
  warehouseManagerId: string;
  defaultBudget: number;
  eventWeeks: number;
}

export interface NavLink {
  path: string;
  label: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  roles: Role[];
}

// Academic Structure Types
export interface Cycle {
  id: string;
  name: string;
}

export interface Module {
  id: string;
  name: string;
  course: number;
  cycleId: string;
}

export interface Group {
  id: string;
  name: string;
  shift: 'Mañana' | 'Tarde';
  moduleId: string;
}

export interface Assignment {
  id:string;
  professorId: string;
  groupId: string;
}

// Event & Order Management Types
export enum EventType {
  REGULAR = 'Regular',
  EXTRAORDINARY = 'Extraordinario'
}

export enum EventStatus {
  INACTIVE = 'Inactivo',
  SCHEDULED = 'Programado',
  ACTIVE = 'Activo',
  CLOSED = 'Cerrado'
}

export enum OrderStatus {
    DRAFT = 'Borrador',
    SUBMITTED = 'Enviado',
    PROCESSED = 'Procesado',
    RECEIVED_OK = 'Recibido OK',
    RECEIVED_PARTIAL = 'Recibido con incidencias',
}

export interface Event {
  id: string;
  name: string;
  type: EventType;
  status: EventStatus;
  startDate: string; // ISO String
  endDate: string; // ISO String
  budget: number;
  authorizedTeacherIds: string[]; // Empty for regular events
}

export interface ProductSupplier {
  supplierId: string;
  price: number;
  status: 'Activo' | 'Inactivo';
}

export const ALLERGENS = [
    'Gluten', 'Crustáceos', 'Huevos', 'Pescado', 'Cacahuetes', 
    'Soja', 'Lácteos', 'Frutos de cáscara', 'Apio', 'Mostaza', 
    'Sésamo', 'Sulfitos', 'Altramuces', 'Moluscos'
] as const;

export type Allergen = typeof ALLERGENS[number];

export interface CatalogFamily {
    id: string;
    name: string;
}
export interface CatalogCategory {
    id: string;
    name: string;
    familyId: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  reference: string;
  unit: string;
  family: string;
  category: string;
  iva: number;
  suppliers: ProductSupplier[];
  status: 'Activo' | 'Inactivo';
  productState: string;
  warehouseStatus: 'Disponible' | 'Bajo Pedido' | 'Descontinuado';
  allergens: Allergen[];
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId: string | null; // Null for out-of-catalog items
    productName: string; // Custom name if out-of-catalog
    quantity: number;
    unit: string;
    isOutOfCatalog: boolean;
    supplierId?: string; // For BI expense tracking
    unitPrice?: number; // For BI expense tracking
}

export interface Order {
    id: string;
    eventId: string;
    teacherId: string;
    status: OrderStatus;
    notes: string;
    createdAt: string; // ISO String
    updatedAt: string; // ISO String
    type?: 'replenishment';
}

export interface Sale {
    id: string;
    teacherId: string;
    amount: number;
    date: string; // ISO String
    description: string;
    category: string;
}

// Service Planning Types
export interface RecipeIngredient {
  productId: string;
  quantity: number;
  unit: string;
  tempName?: string; // For imported ingredients not in catalog
}

export interface Recipe {
  id: string;
  name: string;
  creatorId: string;
  isPublic: boolean;
  photo?: string; // base64
  yieldQuantity: number;
  yieldUnit: string;
  category: string;
  ingredients: RecipeIngredient[];
  instructions: string;
  notes?: string;
  customSection?: {
    title: string;
    content: string;
  };
  serviceDetails: {
    presentation: string;
    servingTemp: string;
    cutlery: string;
    passTime: string;
    serviceType: string;
    clientDescription: string;
  };
}

export interface ServiceGroup {
  id: string;
  name: string;
  memberIds: string[];
}

export interface ServiceMenuDish {
  id: string; // Unique ID for the menu item itself
  recipeId: string;
}

export type ServiceRole = 'Cocina' | 'Postres' | 'Servicios (Sala)' | 'Cafetería';
export const SERVICE_ROLES: ServiceRole[] = ['Cocina', 'Postres', 'Servicios (Sala)' , 'Cafetería'];

export type ServiceRoleAssignment = Partial<Record<ServiceRole, string>>;

export interface Service {
  id: string;
  name: string;
  date: string; // ISO string for date and time
  serviceGroupId: string;
  menu: ServiceMenuDish[];
  roleAssignments: ServiceRoleAssignment;
  associatedEventId?: string; // To link to the order event
}

// Reception & Incidents
export interface Incident {
    id: string;
    eventId: string;
    productId: string | null;
    productName: string;
    supplierId?: string;
    date: string; // ISO String
    description: string;
    orderItemIds: string[];
}

// Mini-Economato
export interface MiniEconomatoItem {
  productId: string;
  currentStock: number;
  minStock: number;
}

export interface BackupRecord {
    date: string;
    filename: string;
    size: number; // in bytes
}

// --- Messaging Types ---
export interface Message {
    id: string;
    senderId: string;
    recipientIds: string[];
    subject: string;
    body: string;
    timestamp: string; // ISO String
    readBy: string[]; // Array of user IDs who have read the message
}

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    timestamp: string; // ISO String
}

// --- Student & Practice Types ---

export enum SimulatedRole {
    KITCHEN_PROFESSIONAL = 'KITCHEN_PROFESSIONAL',
    WAREHOUSE = 'WAREHOUSE'
}

export interface PracticeStudent {
    id: string;
    name: string;
    email: string;
    password?: string;
    roles: Role[];
    avatar: string;
    simulatedRole: SimulatedRole;
}

export interface Classroom {
    id: string;
    name: string;
    tutorId: string;
    status: 'Activa' | 'Inactiva';
    students: PracticeStudent[];
    // Sandboxed data
    products: Product[];
    suppliers: Supplier[];
    events: Event[];
    orders: Order[];
    orderItems: OrderItem[];
    recipes: Recipe[];
    families: CatalogFamily[];
    categories: CatalogCategory[];
    productStates: string[];
}

// --- Data Exchange Types (For File Imports/Exports) ---

export interface MasterDataExport {
    type: 'MASTER_DATA';
    version: string;
    exportedAt: string;
    companyInfo: CompanyInfo;
    creatorInfo: CreatorInfo;
    users: User[];
    products: Product[];
    suppliers: Supplier[];
    families: CatalogFamily[];
    categories: CatalogCategory[];
    productStates: string[];
    cycles: Cycle[];
    modules: Module[];
    groups: Group[];
    assignments: Assignment[];
    events: Event[]; // Events are part of master config
    serviceGroups: ServiceGroup[];
}

export interface TeacherOrdersExport {
    type: 'TEACHER_ORDERS';
    exportedAt: string;
    teacherId: string;
    teacherName: string;
    orders: Order[];
    orderItems: OrderItem[];
}
