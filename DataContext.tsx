
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Case, Client, FinancialRecord, Task, Mediation, Invoice, User, UserRole, AuditLog, Permission, Template, KnowledgeEntry, MediatorProfile, SiteSettings, DeadlineTemplate } from './types';
import { MOCK_CASES, MOCK_CLIENTS, MOCK_FINANCE, MOCK_TASKS, MOCK_MEDIATIONS, CURRENT_USER, MOCK_USERS, MOCK_LOGS, DEFAULT_TEMPLATES, ROLE_PERMISSIONS, MOCK_KNOWLEDGE_BASE, DEFAULT_MEDIATOR_PROFILE, THEME_COLORS, DEFAULT_DEADLINE_TEMPLATES } from './constants';
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
  deadlineTemplates: DeadlineTemplate[];
  
  // Actions
  addCase: (newCase: Case) => void;
  updateCase: (updatedCase: Case) => void;
  deleteCase: (id: string) => void;
  addClient: (client: Client) => void;
  updateClient: (updatedClient: Client) => void;
  addFinanceRecord: (record: FinancialRecord) => void;
  addTask: (task: Task) => void;
  toggleTaskComplete: (taskId: string) => void;
  addMediation: (mediation: Mediation) => void;
  updateMediation: (mediation: Mediation) => void;
  deleteMediation: (id: string) => void;
  addInvoice: (invoice: Invoice) => void;
  updateTemplate: (template: Template) => void;
  updateMediatorProfile: (profile: MediatorProfile) => void;
  updateSiteSettings: (settings: SiteSettings) => void;
  updateUserTheme: (theme: string) => void;
  
  // Deadline Actions
  addDeadlineTemplate: (template: DeadlineTemplate) => void;
  deleteDeadlineTemplate: (id: string) => void;
  
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

// Helper to load from local storage or fall back to default
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const storedItem = localStorage.getItem(key);
    if (storedItem) {
      return JSON.parse(storedItem);
    }
  } catch (error) {
    console.warn(`Error loading ${key} from localStorage`, error);
  }
  return defaultValue;
}

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state from LocalStorage to persist data across refreshes
  const [cases, setCases] = useState<Case[]>(() => loadFromStorage('BGA_CASES', MOCK_CASES));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('BGA_CLIENTS', MOCK_CLIENTS));
  const [finance, setFinance] = useState<FinancialRecord[]>(() => loadFromStorage('BGA_FINANCE', MOCK_FINANCE));
  const [tasks, setTasks] = useState<Task[]>(() => loadFromStorage('BGA_TASKS', MOCK_TASKS));
  const [mediations, setMediations] = useState<Mediation[]>(() => loadFromStorage('BGA_MEDIATIONS', MOCK_MEDIATIONS));
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadFromStorage('BGA_INVOICES', []));
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('BGA_USERS', MOCK_USERS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('BGA_LOGS', MOCK_LOGS));
  const [templates, setTemplates] = useState<Template[]>(() => loadFromStorage('BGA_TEMPLATES', DEFAULT_TEMPLATES));
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeEntry[]>(() => loadFromStorage('BGA_KNOWLEDGE', MOCK_KNOWLEDGE_BASE));
  const [mediatorProfile, setMediatorProfile] = useState<MediatorProfile>(() => loadFromStorage('BGA_PROFILE', DEFAULT_MEDIATOR_PROFILE));
  const [deadlineTemplates, setDeadlineTemplates] = useState<DeadlineTemplate[]>(() => loadFromStorage('BGA_DEADLINE_TEMPLATES', DEFAULT_DEADLINE_TEMPLATES));
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => loadFromStorage('BGA_SETTINGS', {
    title: 'BGAofis',
    subtitle: 'Hukuk Otomasyonu',
    logoUrl: ''
  }));
  
  // Auth State (Try to restore session)
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadFromStorage('BGA_SESSION', null));

  // -- PERSISTENCE EFFECTS --
  // Automatically save changes to LocalStorage
  useEffect(() => localStorage.setItem('BGA_CASES', JSON.stringify(cases)), [cases]);
  useEffect(() => localStorage.setItem('BGA_CLIENTS', JSON.stringify(clients)), [clients]);
  useEffect(() => localStorage.setItem('BGA_FINANCE', JSON.stringify(finance)), [finance]);
  useEffect(() => localStorage.setItem('BGA_TASKS', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('BGA_MEDIATIONS', JSON.stringify(mediations)), [mediations]);
  useEffect(() => localStorage.setItem('BGA_INVOICES', JSON.stringify(invoices)), [invoices]);
  useEffect(() => localStorage.setItem('BGA_USERS', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('BGA_LOGS', JSON.stringify(auditLogs)), [auditLogs]);
  useEffect(() => localStorage.setItem('BGA_TEMPLATES', JSON.stringify(templates)), [templates]);
  useEffect(() => localStorage.setItem('BGA_KNOWLEDGE', JSON.stringify(knowledgeBase)), [knowledgeBase]);
  useEffect(() => localStorage.setItem('BGA_PROFILE', JSON.stringify(mediatorProfile)), [mediatorProfile]);
  useEffect(() => localStorage.setItem('BGA_SETTINGS', JSON.stringify(siteSettings)), [siteSettings]);
  useEffect(() => localStorage.setItem('BGA_DEADLINE_TEMPLATES', JSON.stringify(deadlineTemplates)), [deadlineTemplates]);
  useEffect(() => {
      if (currentUser) {
          localStorage.setItem('BGA_SESSION', JSON.stringify(currentUser));
      } else {
          localStorage.removeItem('BGA_SESSION');
      }
  }, [currentUser]);


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
          // Also update in users list to persist for next login
          setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
          logAction('THEME_UPDATE', `Kullanıcı teması güncellendi: ${theme}`);
      }
  };

  // Deadline Templates
  const addDeadlineTemplate = (template: DeadlineTemplate) => {
    setDeadlineTemplates(prev => [...prev, template]);
    logAction('DEADLINE_TEMPLATE_ADD', `Yeni süre şablonu eklendi: ${template.name}`);
  };

  const deleteDeadlineTemplate = (id: string) => {
    setDeadlineTemplates(prev => prev.filter(t => t.id !== id));
    logAction('DEADLINE_TEMPLATE_DELETE', `Süre şablonu silindi: ${id}`);
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
      currentUser, mediatorProfile, siteSettings, deadlineTemplates,
      addCase, updateCase, deleteCase, addClient, updateClient, addFinanceRecord, addTask, toggleTaskComplete,
      addMediation, updateMediation, deleteMediation, addInvoice, updateTemplate, updateMediatorProfile, updateSiteSettings, updateUserTheme,
      addKnowledgeEntry, updateKnowledgeEntry, deleteKnowledgeEntry,
      addUser, updateUser, deleteUser, hasPermission, logAction,
      login, logout, addDeadlineTemplate, deleteDeadlineTemplate
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
