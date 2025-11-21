
import { Case, CaseStatus, Client, FinancialRecord, Task, User, UserRole, Mediation, MediationStatus } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Av. Burak G.',
  email: 'burak@bgaofis.com',
  role: UserRole.ADMIN,
  avatarUrl: 'https://picsum.photos/id/1005/200/200'
};

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

export const MOCK_CASES: Case[] = [
  {
    id: 'c1',
    caseNumber: '2023/145 E.',
    title: 'Yılmaz Ticaret vs. ABC Ltd. Şti.',
    clientName: 'Yılmaz Ticaret A.Ş.',
    type: 'Ticaret Hukuku',
    status: CaseStatus.OPEN,
    nextHearingDate: today, // Hearing Today
    description: 'Alacak davası süreci devam ediyor.',
    assignedTo: 'Av. Burak G.',
    parties: [
      { id: 'p1', name: 'Yılmaz Ticaret A.Ş.', role: 'Müvekkil', tcVkn: '1234567890' },
      { id: 'p2', name: 'ABC Ltd. Şti.', role: 'Karşı Taraf', tcVkn: '0987654321' },
      { id: 'p3', name: 'Av. Karşı Taraf Vekili', role: 'Vekil', contactInfo: '05550000000' }
    ],
    hearings: [
      { id: 'h1', date: '2023-09-10 10:00', type: 'Ön İnceleme', location: 'İstanbul 5. Asliye Ticaret', description: 'Tarafların iddiaları incelendi.', result: 'Tahkikat aşamasına geçildi.' },
      { id: 'h2', date: `${today} 14:00`, type: 'Tahkikat', location: 'İstanbul 5. Asliye Ticaret', description: 'Bilirkişi raporu beklenecek.' }
    ]
  },
  {
    id: 'c2',
    caseNumber: '2023/89 E.',
    title: 'Demir Ailesi Veraset',
    clientName: 'Mehmet Demir',
    type: 'Miras Hukuku',
    status: CaseStatus.WAITING,
    nextHearingDate: threeDaysLater,
    description: 'Bilirkişi raporu bekleniyor.',
    assignedTo: 'Av. Selin Y.',
    parties: [
      { id: 'p4', name: 'Mehmet Demir', role: 'Müvekkil', tcVkn: '11111111111' },
      { id: 'p5', name: 'Ali Demir', role: 'Karşı Taraf', tcVkn: '22222222222' }
    ],
    hearings: []
  },
  {
    id: 'c3',
    caseNumber: '2022/550 E.',
    title: 'İş Kazası Tazminat',
    clientName: 'Ahmet Yılmaz',
    type: 'İş Hukuku',
    status: CaseStatus.APPEAL,
    description: 'İstinaf başvurusu yapıldı.',
    assignedTo: 'Stj. Can K.',
    parties: [
      { id: 'p6', name: 'Ahmet Yılmaz', role: 'Müvekkil' },
      { id: 'p7', name: 'İnşaat Yapı A.Ş.', role: 'Karşı Taraf' }
    ],
    hearings: [
      { id: 'h3', date: '2022-12-20', type: 'Karar', location: 'İş Mahkemesi', result: 'Kısmen kabul kısmen ret.', description: 'Mahkeme kararını açıkladı.' }
    ]
  },
  {
    id: 'c4',
    caseNumber: '2023/12 E.',
    title: 'Boşanma Protokolü',
    clientName: 'Ayşe Kaya',
    type: 'Aile Hukuku',
    status: CaseStatus.OPEN,
    nextHearingDate: tomorrow,
    description: 'Anlaşmalı boşanma süreci.',
    assignedTo: 'Av. Burak G.',
    parties: [],
    hearings: []
  },
  {
    id: 'c5',
    caseNumber: '2023/900 E.',
    title: 'Kira Tahliye',
    clientName: 'Vural Gayrimenkul',
    type: 'Borçlar Hukuku',
    status: CaseStatus.CLOSED,
    description: 'Tahliye gerçekleşti, dosya kapandı.',
    assignedTo: 'Av. Selin Y.',
    parties: [],
    hearings: []
  },
  {
    id: 'c6',
    caseNumber: '2023/SOR-21',
    title: 'Savcılık Şikayeti',
    clientName: 'Mehmet Demir',
    type: 'Ceza Hukuku',
    status: CaseStatus.OPEN,
    assignedTo: 'Av. Burak G.',
    description: 'İfade süreci bekleniyor.',
    parties: [],
    hearings: []
  }
];

export const MOCK_MEDIATIONS: Mediation[] = [
  {
    id: 'm1',
    fileNumber: 'ARB-2023/104',
    applicationDate: '2023-10-01',
    clientName: 'Yılmaz Ticaret A.Ş.',
    counterParty: 'Hızlı Lojistik Ltd.',
    subject: 'Fatura Alacağı ve Ticari Uyuşmazlık',
    mediatorName: 'Arb. Ahmet Hukukçu',
    status: MediationStatus.PROCESS,
    meetings: [
      { id: 'mm1', date: '2023-10-10 14:00', participants: 'Müvekkil, Karşı Taraf Vekili', notes: 'İlk oturum yapıldı, talepler iletildi.', outcome: 'Ertelendi' }
    ]
  },
  {
    id: 'm2',
    fileNumber: 'ARB-2023/098',
    applicationDate: '2023-09-15',
    clientName: 'Ayşe Kaya',
    counterParty: 'Mehmet Kaya',
    subject: 'Mal Rejimi Tasfiyesi',
    mediatorName: 'Arb. Zeynep Yılmaz',
    status: MediationStatus.AGREEMENT,
    meetings: [
      { id: 'mm2', date: '2023-09-20 10:00', participants: 'Taraflar Bizzat', notes: 'Anlaşma sağlandı, protokol imzalandı.', outcome: 'Olumlu' }
    ]
  },
  {
    id: 'm3',
    fileNumber: 'ARB-2023/112',
    applicationDate: '2023-10-20',
    clientName: 'Mehmet Demir',
    counterParty: 'Sigorta Şirketi A.Ş.',
    subject: 'Değer Kaybı Tazminatı',
    mediatorName: 'Arb. Canan H.',
    status: MediationStatus.APPLIED,
    meetings: []
  }
];

export const MOCK_CLIENTS: Client[] = [
  { id: 'cl1', name: 'Yılmaz Ticaret A.Ş.', type: 'Kurumsal', phone: '0212 555 10 20', email: 'info@yilmaz.com', status: 'Aktif', balance: -15000 },
  { id: 'cl2', name: 'Mehmet Demir', type: 'Bireysel', phone: '0532 555 20 30', email: 'mehmet@gmail.com', status: 'Aktif', balance: 0 },
  { id: 'cl3', name: 'Vural Gayrimenkul', type: 'Kurumsal', phone: '0216 444 30 40', email: 'contact@vural.com', status: 'Aktif', balance: -5000 },
  { id: 'cl4', name: 'Ayşe Kaya', type: 'Bireysel', phone: '0555 123 45 67', email: 'ayse.kaya@hotmail.com', status: 'Pasif', balance: 0 },
];

export const MOCK_FINANCE: FinancialRecord[] = [
  { id: 'f1', type: 'income', category: 'Vekalet Ücreti', amount: 25000, date: '2023-10-01', description: 'Yılmaz Ticaret Danışmanlık', caseReference: '2023/145 E.' },
  { id: 'f2', type: 'expense', category: 'Harç', amount: 1200, date: '2023-10-03', description: 'Dava Açılış Harcı', caseReference: '2023/89 E.' },
  { id: 'f3', type: 'income', category: 'Tahsilat', amount: 15000, date: '2023-10-05', description: 'İcra Tahsilatı', caseReference: '2022/550 E.' },
  { id: 'f4', type: 'expense', category: 'Ofis Gideri', amount: 3500, date: '2023-10-10', description: 'Kırtasiye ve Aidat' },
  { id: 'f5', type: 'income', category: 'Avans', amount: 5000, date: '2023-10-12', description: 'Yeni Dosya Avansı' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Bilirkişi raporuna itiraz dilekçesi', dueDate: threeDaysLater, priority: 'Yüksek', completed: false, assignedTo: 'Av. Burak G.', caseId: 'c1' },
  { id: 't2', title: 'Müvekkil ile toplantı (Yılmaz Tic.)', dueDate: tomorrow, priority: 'Orta', completed: false, assignedTo: 'Av. Burak G.', caseId: 'c1' },
  { id: 't3', title: 'İcra dairesi dosya fotokopisi', dueDate: '2023-10-30', priority: 'Düşük', completed: true, assignedTo: 'Stj. Can K.', caseId: 'c3' },
  { id: 't4', title: 'Uyap kontrolü', dueDate: today, priority: 'Yüksek', completed: true, assignedTo: 'Av. Selin Y.', caseId: 'c2' },
];
