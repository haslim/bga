
import { Case, CaseStatus, Client, FinancialRecord, Task, User, UserRole, Mediation, MediationStatus, Permission, AuditLog, Template } from './types';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: ['CASE_VIEW_ALL', 'CASE_EDIT', 'CASH_VIEW', 'DOC_UPLOAD', 'USER_MANAGE', 'CLIENT_MANAGE', 'REPORT_VIEW'],
  [UserRole.LAWYER]: ['CASE_VIEW_ALL', 'CASE_EDIT', 'CLIENT_MANAGE', 'DOC_UPLOAD'],
  [UserRole.INTERN]: ['CASE_VIEW_ALL', 'DOC_UPLOAD'],
  [UserRole.SECRETARY]: ['CLIENT_MANAGE', 'CASE_VIEW_ALL'],
  [UserRole.FINANCE]: ['CASH_VIEW', 'REPORT_VIEW']
};

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Av. Burak G.',
  email: 'burak@bgaofis.com',
  role: UserRole.ADMIN,
  avatarUrl: 'https://picsum.photos/id/1005/200/200',
  lastLogin: new Date().toISOString()
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  { id: 'u2', name: 'Av. Selin Y.', email: 'selin@bgaofis.com', role: UserRole.LAWYER, avatarUrl: 'https://picsum.photos/id/1011/200/200', lastLogin: '2023-10-24 09:00', ipAddress: '192.168.1.12' },
  { id: 'u3', name: 'Stj. Can K.', email: 'can@bgaofis.com', role: UserRole.INTERN, avatarUrl: 'https://picsum.photos/id/1012/200/200', lastLogin: '2023-10-24 10:15', ipAddress: '192.168.1.15' },
  { id: 'u4', name: 'Ayşe M.', email: 'ayse@bgaofis.com', role: UserRole.SECRETARY, avatarUrl: 'https://picsum.photos/id/1013/200/200', lastLogin: '2023-10-24 08:30', ipAddress: '192.168.1.10' },
];

export const MOCK_LOGS: AuditLog[] = [
  { id: 'l1', userId: 'u1', userName: 'Av. Burak G.', action: 'LOGIN', details: 'Sisteme giriş yapıldı', timestamp: '2023-10-24 08:00', ipAddress: '192.168.1.5' },
  { id: 'l2', userId: 'u2', userName: 'Av. Selin Y.', action: 'CASE_UPDATE', details: '2023/145 E. dosyasına duruşma eklendi', timestamp: '2023-10-24 09:30', ipAddress: '192.168.1.12', entityType: 'CASE', entityId: 'c1' },
  { id: 'l3', userId: 'u1', userName: 'Av. Burak G.', action: 'CLIENT_ADD', details: 'Yeni müvekkil eklendi: Vural Gayrimenkul', timestamp: '2023-10-24 11:00', ipAddress: '192.168.1.5', entityType: 'CLIENT', entityId: 'cl3' }
];

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 't1',
    type: 'Basvuru',
    name: 'Standart Başvuru Formu',
    content: `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; padding: 40px; max-width: 210mm; margin: 0 auto; background: white;">
  <h2 style="text-align: center; font-weight: bold; margin-bottom: 30px; text-decoration: underline;">ARABULUCULUK BAŞVURU FORMU</h2>
  
  <div style="margin-bottom: 20px;">
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">BAŞVURU TARİHİ:</span> {{BASVURU_TARIHI}}</p>
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">DOSYA NO:</span> {{DOSYA_NO}}</p>
  </div>
  
  <div style="margin-bottom: 20px;">
    <p><strong>ARABULUCUYA,</strong></p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">BAŞVURUCU:</span> {{MUVEKKIL}}</p>
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">VEKİLİ:</span> Av. Burak G.</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">KARŞI TARAF:</span> {{KARSI_TARAF}}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">UYUŞMAZLIK KONUSU:</span></p>
    <p style="text-align: justify; text-indent: 30px;">{{KONU}}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>TALEP VE SONUÇ:</strong></p>
    <p style="text-align: justify;">Yukarıda bilgileri verilen uyuşmazlık konusunun, 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu gereğince, dava açılmadan önce veya dava sırasında arabuluculuk yoluyla çözümlenmesini; sürecin başlatılarak karşı tarafa davet mektubu gönderilmesini saygılarımla arz ve talep ederim.</p>
  </div>

  <div style="display: flex; justify-content: space-between; margin-top: 80px;">
    <div style="text-align: center;"></div>
    <div style="text-align: center;">
      <p><strong>Başvurucu Vekili</strong></p>
      <p>Av. Burak G.</p>
      <p>(e-imzalıdır)</p>
    </div>
  </div>
</div>`
  },
  {
    id: 't2',
    type: 'Tutanak',
    name: 'Standart Son Tutanak',
    content: `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; padding: 40px; max-width: 210mm; margin: 0 auto; background: white;">
  <h2 style="text-align: center; font-weight: bold; margin-bottom: 30px; text-decoration: underline;">ARABULUCULUK SON TUTANAĞI</h2>

  <div style="margin-bottom: 20px;">
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">BÜRO DOSYA NO:</span> {{DOSYA_NO}}</p>
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">ARABULUCU:</span> {{ARABULUCU}}</p>
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">TUTANAK TARİHİ:</span> {{BUGUN}}</p>
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">TUTANAK YERİ:</span> Arabuluculuk Ofisi Toplantı Salonu</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>1. TARAFLAR</strong></p>
    <p><strong>Başvurucu:</strong> {{MUVEKKIL}}</p>
    <p><strong>Karşı Taraf:</strong> {{KARSI_TARAF}}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>2. UYUŞMAZLIK KONUSU</strong></p>
    <p>{{KONU}}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>3. SÜREÇ VE SONUÇ</strong></p>
    <p style="text-align: justify; text-indent: 30px;">
      Taraflar, arabulucunun daveti üzerine arabuluculuk görüşmelerine katılmış, süreç hakkında bilgilendirilmiş, gizlilik ilkesine riayet edeceklerini beyan etmişlerdir.
    </p>
    <p style="text-align: justify; text-indent: 30px; margin-top: 10px; background-color: #f0f9ff; padding: 10px; border-left: 4px solid #0284c7;">
      {{SONUC_METNI}}
    </p>
  </div>

  <div style="margin-bottom: 20px;">
    <p>İşbu son tutanak, 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu'nun 17. maddesi uyarınca, tarafların ve arabulucunun serbest iradeleriyle okunup, doğruluğu kabul edilerek imza altına alınmıştır.</p>
  </div>

  <table style="width: 100%; margin-top: 60px; text-align: center;">
    <tr>
      <td style="padding: 20px;">
        <strong>BAŞVURUCU</strong><br/>
        {{MUVEKKIL}}<br/>
        (İmza)
      </td>
      <td style="padding: 20px;">
        <strong>KARŞI TARAF</strong><br/>
        {{KARSI_TARAF}}<br/>
        (İmza)
      </td>
    </tr>
    <tr>
      <td colspan="2" style="padding: 40px;">
        <strong>ARABULUCU</strong><br/>
        {{ARABULUCU}}<br/>
        (İmza)
      </td>
    </tr>
  </table>
</div>`
  },
  {
    id: 't3',
    type: 'Anlasma',
    name: 'Standart Anlaşma Belgesi',
    content: `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; padding: 40px; max-width: 210mm; margin: 0 auto; background: white;">
  <h2 style="text-align: center; font-weight: bold; margin-bottom: 30px; text-decoration: underline;">ARABULUCULUK ANLAŞMA BELGESİ</h2>
  <div style="margin-bottom: 20px;">
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">DOSYA NO:</span> {{DOSYA_NO}}</p>
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">TARİH:</span> {{BUGUN}}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>A. TARAFLAR</strong></p>
    <p><strong>1. {{MUVEKKIL}}</strong></p>
    <p><strong>2. {{KARSI_TARAF}}</strong></p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>B. UYUŞMAZLIK KONUSU</strong></p>
    <p>{{KONU}}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>C. ANLAŞMA ŞARTLARI</strong></p>
    <p>Taraflar, arabuluculuk müzakereleri sonucunda aşağıdaki maddeler üzerinde tam mutabakata varmışlardır:</p>
    <ol style="margin-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 10px;">Karşı Taraf, Başvurucu'ya uyuşmazlığa istinaden brüt <strong>100.000,00 TL</strong> (Yüz Bin Türk Lirası) ödemeyi kabul ve taahhüt eder.</li>
      <li style="margin-bottom: 10px;">Ödeme, işbu belgenin imzalandığı tarihten itibaren 7 (yedi) gün içinde Başvurucu'nun hesabına yapılacaktır.</li>
      <li style="margin-bottom: 10px;">Taraflar, işbu anlaşma belgesinde belirtilen hususlar dışında, birbirlerinden başkaca herhangi bir hak ve alacak talebinde bulunmayacaklarını beyan ederler.</li>
    </ol>
  </div>

  <div style="margin-bottom: 20px;">
    <p><strong>D. HUKUKİ NİTELİK</strong></p>
    <p>İşbu anlaşma belgesi, 6325 sayılı Kanun'un 18. maddesi uyarınca taraflar ve avukatları ile arabulucu tarafından imzalanmış olup, ilam niteliğinde belgedir.</p>
  </div>

  <table style="width: 100%; margin-top: 60px; text-align: center;">
    <tr>
      <td style="padding: 20px;">
        <strong>BAŞVURUCU</strong><br/>
        {{MUVEKKIL}}<br/>
        (İmza)
      </td>
      <td style="padding: 20px;">
        <strong>KARŞI TARAF</strong><br/>
        {{KARSI_TARAF}}<br/>
        (İmza)
      </td>
    </tr>
      <tr>
      <td colspan="2" style="padding: 40px;">
        <strong>ARABULUCU</strong><br/>
        {{ARABULUCU}}<br/>
        (İmza)
      </td>
    </tr>
  </table>
</div>`
  }
];

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
  { id: 'cl1', name: 'Yılmaz Ticaret A.Ş.', type: 'Kurumsal', phone: '0212 555 10 20', email: 'info@yilmaz.com', status: 'Aktif', balance: -15000, tags: ['VIP', 'Kurumsal'], taxNumber: '1234567890', address: 'Şişli, İstanbul' },
  { id: 'cl2', name: 'Mehmet Demir', type: 'Bireysel', phone: '0532 555 20 30', email: 'mehmet@gmail.com', status: 'Aktif', balance: 0, tags: ['Bireysel'], taxNumber: '11111111111', address: 'Kadıköy, İstanbul' },
  { id: 'cl3', name: 'Vural Gayrimenkul', type: 'Kurumsal', phone: '0216 444 30 40', email: 'contact@vural.com', status: 'Aktif', balance: -5000, tags: ['Kurumsal'], taxNumber: '2222222222' },
  { id: 'cl4', name: 'Ayşe Kaya', type: 'Bireysel', phone: '0555 123 45 67', email: 'ayse.kaya@hotmail.com', status: 'Pasif', balance: 0, tags: ['Boşanma', 'Referanslı'] },
];

export const MOCK_FINANCE: FinancialRecord[] = [
  // Current Month (October)
  { id: 'f1', type: 'income', category: 'Vekalet Ücreti', amount: 25000, date: '2023-10-01', description: 'Yılmaz Ticaret Danışmanlık', caseReference: '2023/145 E.' },
  { id: 'f2', type: 'expense', category: 'Harç', amount: 1200, date: '2023-10-03', description: 'Dava Açılış Harcı', caseReference: '2023/89 E.' },
  { id: 'f3', type: 'income', category: 'Tahsilat', amount: 15000, date: '2023-10-05', description: 'İcra Tahsilatı', caseReference: '2022/550 E.' },
  { id: 'f4', type: 'expense', category: 'Ofis Gideri', amount: 3500, date: '2023-10-10', description: 'Kırtasiye ve Aidat' },
  { id: 'f5', type: 'income', category: 'Avans', amount: 5000, date: '2023-10-12', description: 'Yeni Dosya Avansı' },
  
  // September
  { id: 'f6', type: 'income', category: 'Vekalet Ücreti', amount: 45000, date: '2023-09-15', description: 'Eylül Ayı Ödemeleri' },
  { id: 'f7', type: 'expense', category: 'Ofis Gideri', amount: 12000, date: '2023-09-28', description: 'Kira ve Stopaj' },
  
  // August
  { id: 'f8', type: 'income', category: 'Danışmanlık', amount: 32000, date: '2023-08-10', description: 'Ağustos Danışmanlık' },
  { id: 'f9', type: 'expense', category: 'Maaş', amount: 28000, date: '2023-08-31', description: 'Personel Maaşları' },
  
  // July
  { id: 'f10', type: 'income', category: 'Tahsilat', amount: 55000, date: '2023-07-20', description: 'Büyük İcra Tahsilatı' },
  { id: 'f11', type: 'expense', category: 'Harç', amount: 8000, date: '2023-07-05', description: 'Toplu Dava Harçları' },

  // June
  { id: 'f12', type: 'income', category: 'Avans', amount: 28000, date: '2023-06-15', description: 'Haziran Gelirleri' },
  { id: 'f13', type: 'expense', category: 'Vergi', amount: 15000, date: '2023-06-25', description: 'Geçici Vergi' },
  
  // May
  { id: 'f14', type: 'income', category: 'Vekalet Ücreti', amount: 40000, date: '2023-05-10', description: 'Mayıs Ayı' },
  { id: 'f15', type: 'expense', category: 'Ofis Gideri', amount: 10000, date: '2023-05-02', description: 'Ofis Tadilatı' },
];

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Bilirkişi raporuna itiraz dilekçesi', dueDate: threeDaysLater, priority: 'Yüksek', completed: false, assignedTo: 'Av. Burak G.', caseId: 'c1' },
  { id: 't2', title: 'Müvekkil ile toplantı (Yılmaz Tic.)', dueDate: tomorrow, priority: 'Orta', completed: false, assignedTo: 'Av. Burak G.', caseId: 'c1' },
  { id: 't3', title: 'İcra dairesi dosya fotokopisi', dueDate: '2023-10-30', priority: 'Düşük', completed: true, assignedTo: 'Stj. Can K.', caseId: 'c3' },
  { id: 't4', title: 'Uyap kontrolü', dueDate: today, priority: 'Yüksek', completed: true, assignedTo: 'Av. Selin Y.', caseId: 'c2' },
];