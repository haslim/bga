
export enum UserRole {
  ADMIN = 'ADMIN',
  LAWYER = 'AVUKAT',
  INTERN = 'STAJYER',
  SECRETARY = 'SEKRETERYA',
  FINANCE = 'FINANS'
}

export type Permission = 
  | 'CASE_VIEW_ALL' 
  | 'CASE_EDIT' 
  | 'CASH_VIEW' 
  | 'DOC_UPLOAD' 
  | 'USER_MANAGE' 
  | 'CLIENT_MANAGE'
  | 'REPORT_VIEW';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  lastLogin?: string;
  ipAddress?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string; // e.g., 'USER_LOGIN', 'CASE_CREATE'
  details: string;
  timestamp: string;
  ipAddress: string;
  entityType?: 'CASE' | 'CLIENT' | 'FINANCE' | 'USER';
  entityId?: string;
}

export enum CaseStatus {
  OPEN = 'Açık',
  CLOSED = 'Kapalı',
  APPEAL = 'İstinaf',
  WAITING = 'Beklemede'
}

export interface Party {
  id: string;
  name: string;
  role: 'Müvekkil' | 'Karşı Taraf' | 'Vekil' | 'İhbar Olunan';
  tcVkn?: string;
  contactInfo?: string;
}

export interface Hearing {
  id: string;
  date: string;
  type: string; // e.g., 'Ön İnceleme', 'Tahkikat'
  description: string;
  result?: string;
  location?: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  clientName: string;
  type: string; // e.g., 'İcra', 'Boşanma', 'Ticaret'
  status: CaseStatus;
  nextHearingDate?: string;
  description: string;
  assignedTo: string; // User name
  parties?: Party[];
  hearings?: Hearing[];
}

export enum MediationStatus {
  APPLIED = 'Başvuru',
  PROCESS = 'Süreçte',
  AGREEMENT = 'Anlaşma',
  NO_AGREEMENT = 'Anlaşmama',
  CANCELLED = 'İptal'
}

export interface MediationMeeting {
  id: string;
  date: string;
  participants: string;
  notes: string;
  outcome?: 'Olumlu' | 'Olumsuz' | 'Ertelendi';
}

export interface Mediation {
  id: string;
  fileNumber: string; // Arabuluculuk dosya no
  applicationDate: string;
  clientName: string;
  counterParty: string;
  subject: string; // Uyuşmazlık konusu
  mediatorName: string;
  status: MediationStatus;
  meetings: MediationMeeting[];
}

export interface Client {
  id: string;
  name: string;
  type: 'Bireysel' | 'Kurumsal';
  phone: string;
  email: string;
  status: 'Aktif' | 'Pasif';
  balance: number;
  address?: string;
  taxNumber?: string; // TC or VKN
  taxOffice?: string;
  notes?: string;
  tags?: string[]; // 'VIP', 'Riskli', 'Referanslı'
  createdDate?: string;
}

export interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description: string;
  caseReference?: string;
}

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subTotal: number; // Brüt
  vatRate: number; // KDV Oranı (usually 20)
  vatAmount: number; // KDV Tutarı
  stopajRate: number; // Stopaj Oranı (usually 20)
  stopajAmount: number; // Stopaj Tutarı
  totalAmount: number; // Tahsil Edilen (Net + KDV)
  status: 'Ödendi' | 'Bekliyor' | 'İptal';
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'Yüksek' | 'Orta' | 'Düşük';
  completed: boolean;
  assignedTo: string;
  caseId?: string; // Linked case ID
}

export type ViewState = 'dashboard' | 'cases' | 'mediation' | 'clients' | 'finance' | 'tasks' | 'invoices' | 'users';
