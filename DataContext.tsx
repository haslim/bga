
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Case, Client, FinancialRecord, Task, Mediation, Invoice, User, UserRole, AuditLog, Permission, Template, KnowledgeEntry, MediatorProfile, SiteSettings } from './types';
import { MOCK_CASES, MOCK_CLIENTS, MOCK_FINANCE, MOCK_TASKS, MOCK_MEDIATIONS, CURRENT_USER, MOCK_USERS, MOCK_LOGS, DEFAULT_TEMPLATES, ROLE_PERMISSIONS, MOCK_KNOWLEDGE_BASE, DEFAULT_MEDIATOR_PROFILE, THEME_COLORS } from './constants';
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
  knowledgeBase: KnowledgeEntry[];
  currentUser: User | null; // Can be null if not logged in
  mediatorProfile: MediatorProfile;
  siteSettings: SiteSettings;
  
  // Actions
  addCase: (newCase: Case) => void;
  updateCase: (updatedCase: Case) => void;
  deleteCase: (id: string) => void; // Added
  addClient: (client: Client) => void;
  updateClient: (updatedClient: Client) => void;
  addFinanceRecord: (record: FinancialRecord) => void;
  addTask: (task: Task) => void;
  toggleTaskComplete: (taskId: string) => void;
  addMediation: (mediation: Mediation) => void;
  updateMediation: (mediation: Mediation) => void;
  deleteMediation: (id: string) => void; // Added
  addInvoice: (invoice: Invoice) => void;
  updateTemplate: (template: Template) => void;
  updateMediatorProfile: (profile: MediatorProfile) => void;
  updateSiteSettings: (settings: SiteSettings) => void;
  updateUserTheme: (theme: string) => void;
  
  // Knowledge Base Actions
  addKnowledgeEntry: (entry: KnowledgeEntry) => void;
  updateKnowledgeEntry: (entry: KnowledgeEntry) => void;
  deleteKnowledgeEntry: (id: string) => void;

  // User & Auth
  login: (email: string, password: string) => boolean;
  logout: () => void;
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
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>(MOCK_KNOWLEDGE_BASE);
  const [mediatorProfile, setMediatorProfile] = useState<MediatorProfile>(DEFAULT_MEDIATOR_PROFILE);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    title: 'BGAofis',
    subtitle: 'Hukuk Otomasyonu',
    logoUrl: ''
  });
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Apply Theme Effect
  useEffect(() => {
    if (currentUser && currentUser.theme && THEME_COLORS[currentUser.theme]) {
        const themeColors = THEME_COLORS[currentUser.theme].colors;
        const root = document.documentElement;
        Object.entries(themeColors).forEach(([shade, value]) => {
             root.style.setProperty(`--color-brand-${shade}`, value);
        });
    } else {
        // Default to blue if no user or no theme
        const themeColors = THEME_COLORS['blue'].colors;
        const root = document.documentElement;
        Object.entries(themeColors).forEach(([shade, value]) => {
             root.style.setProperty(`--color-brand-${shade}`, value);
        });
    }
  }, [currentUser]);

  // -- Helpers --
  const hasPermission = (permission: Permission): boolean => {
    if (!currentUser) return false;
    return checkPermission(currentUser.role, permission);
  };

  const logAction = (action: string, details: string, entityType?: any, entityId?: string) => {
    if (!currentUser) return;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
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

  const login = (email: string, password: string): boolean => {
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
          setCurrentUser(user);
          logAction('LOGIN', `${user.name} sisteme giriş yaptı.`);
          return true;
      }
      return false;
  };

  const logout = () => {
      if (currentUser) {
          logAction('LOGOUT', `${currentUser.name} çıkış yaptı.`);
      }
      setCurrentUser(null);
  };

  const addCase = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
    logAction('CASE_CREATE', `Yeni dava dosyası açıldı: ${newCase.caseNumber}`, 'CASE', newCase.id);
  };

  const updateCase = (updatedCase: Case) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    logAction('CASE_UPDATE', `${updatedCase.caseNumber} dosyası güncellendi`, 'CASE', updatedCase.id);
  };

  const deleteCase = (id: string) => {
    const caseToDelete = cases.find(c => c.id === id);
    setCases(prev => prev.filter(c => c.id !== id));
    logAction('CASE_DELETE', `Dava dosyası silindi: ${caseToDelete?.caseNumber || id}`, 'CASE', id);
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

  const deleteMediation = (id: string) => {
    const mToDelete = mediations.find(m => m.id === id);
    setMediations(prev => prev.filter(m => m.id !== id));
    logAction('MEDIATION_DELETE', `Arabuluculuk dosyası silindi: ${mToDelete?.fileNumber || id}`);
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

  const updateMediatorProfile = (profile: MediatorProfile) => {
    setMediatorProfile(profile);
    logAction('PROFILE_UPDATE', 'Arabulucu profil bilgileri güncellendi.');
  };
  
  const updateSiteSettings = (settings: SiteSettings) => {
    setSiteSettings(settings);
    logAction('SETTINGS_UPDATE', 'Sistem ayarları güncellendi.');
  };

  const updateUserTheme = (theme: string) => {
      if (currentUser) {
          const updatedUser = { ...currentUser, theme };
          setCurrentUser(updatedUser);
          // Also update in users list
          setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
          logAction('THEME_UPDATE', `Kullanıcı teması güncellendi: ${theme}`);
      }
  };

  // Knowledge Base
  const addKnowledgeEntry = (entry: KnowledgeEntry) => {
    setKnowledgeBase(prev => [entry, ...prev]);
    logAction('KNOWLEDGE_ADD', `Bilgi bankası kaydı eklendi: ${entry.title}`);
  };

  const updateKnowledgeEntry = (entry: KnowledgeEntry) => {
    setKnowledgeBase(prev => prev.map(e => e.id === entry.id ? entry : e));
    logAction('KNOWLEDGE_UPDATE', `Bilgi bankası kaydı güncellendi: ${entry.title}`);
  };

  const deleteKnowledgeEntry = (id: string) => {
    setKnowledgeBase(prev => prev.filter(e => e.id !== id));
    logAction('KNOWLEDGE_DELETE', `Bilgi bankası kaydı silindi: ${id}`);
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
      cases, clients, finance, tasks, mediations, invoices, users, auditLogs, templates, knowledgeBase,
      currentUser, mediatorProfile, siteSettings,
      addCase, updateCase, deleteCase, addClient, updateClient, addFinanceRecord, addTask, toggleTaskComplete,
      addMediation, updateMediation, deleteMediation, addInvoice, updateTemplate, updateMediatorProfile, updateSiteSettings, updateUserTheme,
      addKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry,
      addUser, updateUser, deleteUser, hasPermission, logAction,
      login, logout
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