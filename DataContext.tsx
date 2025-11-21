
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Case, Client, FinancialRecord, Task, Mediation, Invoice, User, UserRole } from './types';
import { MOCK_CASES, MOCK_CLIENTS, MOCK_FINANCE, MOCK_TASKS, MOCK_MEDIATIONS, CURRENT_USER } from './constants';

interface DataContextType {
  cases: Case[];
  clients: Client[];
  finance: FinancialRecord[];
  tasks: Task[];
  mediations: Mediation[];
  invoices: Invoice[];
  currentUser: User;
  
  // Actions
  addCase: (newCase: Case) => void;
  updateCase: (updatedCase: Case) => void;
  addClient: (client: Client) => void;
  addFinanceRecord: (record: FinancialRecord) => void;
  addTask: (task: Task) => void;
  toggleTaskComplete: (taskId: string) => void;
  addMediation: (mediation: Mediation) => void;
  updateMediation: (mediation: Mediation) => void;
  addInvoice: (invoice: Invoice) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize state with Mock Data
  const [cases, setCases] = useState<Case[]>(MOCK_CASES);
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [finance, setFinance] = useState<FinancialRecord[]>(MOCK_FINANCE);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [mediations, setMediations] = useState<Mediation[]>(MOCK_MEDIATIONS);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // --- Actions ---

  const addCase = (newCase: Case) => {
    setCases(prev => [newCase, ...prev]);
  };

  const updateCase = (updatedCase: Case) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  const addClient = (client: Client) => {
    setClients(prev => [client, ...prev]);
  };

  const addFinanceRecord = (record: FinancialRecord) => {
    setFinance(prev => [record, ...prev]);
    
    // Also update client balance if applicable
    // In a real app, this logic is complex. Simplified here.
    // If it's income, client owes less (or pays debt).
  };

  const addTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t));
  };

  const addMediation = (mediation: Mediation) => {
    setMediations(prev => [mediation, ...prev]);
  };

  const updateMediation = (mediation: Mediation) => {
    setMediations(prev => prev.map(m => m.id === mediation.id ? mediation : m));
  };

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    
    // Automatically add to Finance as income (Pending or Paid)
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

  return (
    <DataContext.Provider value={{
      cases,
      clients,
      finance,
      tasks,
      mediations,
      invoices,
      currentUser: CURRENT_USER,
      addCase,
      updateCase,
      addClient,
      addFinanceRecord,
      addTask,
      toggleTaskComplete,
      addMediation,
      updateMediation,
      addInvoice
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
