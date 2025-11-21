
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Case, Client, FinancialRecord, Task, Mediation, Invoice, User, UserRole, AuditLog, Permission, Template } from './types';
import { MOCK_CASES, MOCK_CLIENTS, MOCK_FINANCE, MOCK_TASKS, MOCK_MEDIATIONS, CURRENT_USER, MOCK_USERS, MOCK_LOGS, DEFAULT_TEMPLATES, ROLE_PERMISSIONS } from './constants';
import { checkPermission } from './utils';

interface DataContextType {
  cases: Case[];
  clients: Client[];
  finance: FinancialRecord[];
  tasks: Task[];
  mediations: Mediation[];
  invoices: Invoice[];
  users: User[];
  auditLogs: AuditLog[];
  templates: Template[];
  currentUser: User;
  
  // Actions
  addCase: (newCase: Case) => void;
  updateCase: (updatedCase: Case) => void;
  addClient: (client: Client) => void;
  updateClient: (updatedClient: Client) => void;
  addFinanceRecord: (record: FinancialRecord) => void;
  addTask: (task: Task) => void;
  toggleTaskComplete: (taskId: string) => void;
  addMediation: (mediation: Mediation) => void;
  updateMediation: (mediation: Mediation) => void;
  addInvoice: (invoice: Invoice) => void;
  updateTemplate: (template: Template) => void;
  
  // User & Auth
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  hasPermission: (permission: Permission) => boolean;
  logAction: (action: string, details: string, entityType?: any, entityId?: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [finance, setFinance] = useState<FinancialRecord[]>(MOCK_FINANCE);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [mediations, setMediations] = useState<Mediation[]>(MOCK_MEDIATIONS);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_LOGS);
  const [templates, setTemplates] = useState<Template[]>(DEFAULT_TEMPLATES);

  // -- Helpers --
  const hasPermission = (permission: Permission): boolean => {
    return checkPermission(CURRENT_USER.role, permission);
  };

  const logAction = (action: string, details: string, entityType?: any, entityId?: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: CURRENT_USER.id,
      userName: CURRENT_USER.name,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '192.168.1.5', // Simulated current user IP
      entityType,
      entityId
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // --- Actions ---

  const addCase = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
    logAction('CASE_CREATE', `Yeni dava dosyası açıldı: ${newCase.caseNumber}`, 'CASE', newCase.id);
  };

  const updateCase = (updatedCase: Case) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    logAction('CASE_UPDATE', `${updatedCase.caseNumber} dosyası güncellendi`, 'CASE', updatedCase.id);
  };

  const addClient = (client: Client) => {
    setClients(prev => [client, ...prev]);
    logAction('CLIENT_ADD', `Yeni müvekkil eklendi: ${client.name}`, 'CLIENT', client.id);
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    logAction('CLIENT_UPDATE', `Müvekkil bilgileri güncellendi: ${updatedClient.name}`, 'CLIENT', updatedClient.id);
  }

  const addFinanceRecord = (record: FinancialRecord) => {
    setFinance(prev => [record, ...prev]);
    logAction('FINANCE_ADD', `${record.amount} TL ${record.type === 'income' ? 'gelir' : 'gider'} işlendi`, 'FINANCE', record.id);
  };

  const addTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
    logAction('TASK_ADD', `Yeni görev atandı: ${task.title}`);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const addMediation = (mediation: Mediation) => {
    setMediations(prev => [mediation, ...prev]);
    logAction('MEDIATION_ADD', `Arabuluculuk dosyası eklendi: ${mediation.fileNumber}`);
  };

  const updateMediation = (mediation: Mediation) => {
    setMediations(prev => prev.map(m => m.id === mediation.id ? mediation : m));
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    logAction('INVOICE_CREATE', `SMM Kesildi: ${invoice.invoiceNumber}`);
    
    if (invoice.status === 'Ödendi') {
        addFinanceRecord({
            id: `inv-fin-${Date.now()}`,
            type: 'income',
            category: 'Fatura Tahsilatı',
            amount: invoice.totalAmount,
            date: invoice.date,
            description: `Fatura No: ${invoice.invoiceNumber} - ${invoice.clientName}`,
            caseReference: '-'
        });
    }
  };

  const updateTemplate = (template: Template) => {
    setTemplates(prev => prev.map(t => t.id === template.id ? template : t));
    logAction('TEMPLATE_UPDATE', `${template.name} şablonu güncellendi`);
  };

  // User Management
  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
    logAction('USER_ADD', `Yeni kullanıcı eklendi: ${user.name}`, 'USER', user.id);
  };

  const updateUser = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    logAction('USER_UPDATE', `Kullanıcı güncellendi: ${user.name}`, 'USER', user.id);
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    logAction('USER_DELETE', `Kullanıcı silindi ID: ${userId}`, 'USER', userId);
  };

  return (
    <DataContext.Provider value={{
      cases, clients, finance, tasks, mediations, invoices, users, auditLogs, templates,
      currentUser: CURRENT_USER,
      addCase, updateCase, addClient, updateClient, addFinanceRecord, addTask, toggleTaskComplete,
      addMediation, updateMediation, addInvoice, updateTemplate,
      addUser, updateUser, deleteUser, hasPermission, logAction
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};