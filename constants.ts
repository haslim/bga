
import { Case, CaseStatus, Client, FinancialRecord, Task, User, UserRole, Mediation, MediationStatus, Permission, AuditLog, Template, KnowledgeEntry, MediatorProfile, DeadlineTemplate } from './types';

export const THEME_COLORS: Record<string, { label: string, colors: Record<number, string> }> = {
  blue: {
    label: 'Kurumsal Mavi',
    colors: {
      50: '239 246 255',
      100: '219 234 254',
      200: '191 219 254',
      300: '147 197 253',
      400: '96 165 250',
      500: '59 130 246',
      600: '37 99 235',
      700: '29 78 216',
      800: '30 64 175',
      900: '30 58 138',
      950: '23 37 84',
    }
  },
  red: {
    label: 'Yakut Kırmızısı',
    colors: {
      50: '254 242 242',
      100: '254 226 226',
      200: '254 202 202',
      300: '252 165 165',
      400: '248 113 113',
      500: '239 68 68',
      600: '220 38 38',
      700: '185 28 28',
      800: '153 27 27',
      900: '127 29 29',
      950: '69 10 10',
    }
  },
  green: {
    label: 'Zümrüt Yeşili',
    colors: {
      50: '240 253 244',
      100: '220 252 231',
      200: '187 247 208',
      300: '134 239 172',
      400: '74 222 128',
      500: '34 197 94',
      600: '22 163 74',
      700: '21 128 61',
      800: '22 101 52',
      900: '20 83 45',
      950: '5 46 22',
    }
  },
  purple: {
    label: 'Kraliyet Moru',
    colors: {
      50: '250 245 255',
      100: '243 232 255',
      200: '233 213 255',
      300: '216 180 254',
      400: '192 132 252',
      500: '168 85 247',
      600: '147 51 234',
      700: '126 34 206',
      800: '107 33 168',
      900: '88 28 135',
      950: '59 7 100',
    }
  },
  orange: {
    label: 'Gün Batımı',
    colors: {
      50: '255 247 237',
      100: '255 237 213',
      200: '254 215 170',
      300: '253 186 116',
      400: '251 146 60',
      500: '249 115 22',
      600: '234 88 12',
      700: '194 65 12',
      800: '154 52 18',
      900: '124 45 18',
      950: '67 20 7',
    }
  },
  slate: {
    label: 'Antrasit Gri',
    colors: {
      50: '248 250 252',
      100: '241 245 249',
      200: '226 232 240',
      300: '203 213 225',
      400: '148 163 184',
      500: '100 116 139',
      600: '71 85 105',
      700: '51 65 85',
      800: '30 41 59',
      900: '15 23 42',
      950: '2 6 23',
    }
  }
};

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
  email: 'admin@bgaofis.com',
  password: '123456', // Default password
  role: UserRole.ADMIN,
  avatarUrl: 'https://picsum.photos/id/1005/200/200',
  lastLogin: new Date().toISOString(),
  theme: 'blue'
};

export const DEFAULT_MEDIATOR_PROFILE: MediatorProfile = {
  name: 'Av. Arb. Burak G.',
  registrationNumber: '12345',
  address: 'Adalet Mah. Hukuk Cad. No:1 İstanbul',
  phone: '0555 123 45 67',
  email: 'arabulucu@bgaofis.com',
  iban: 'TR12 0000 0000 0000 0000 0000 00'
};

export const DEFAULT_DEADLINE_TEMPLATES: DeadlineTemplate[] = [
  { id: 'dt1', name: 'Cevap Süresi (HMK)', days: 14, color: 'red' },
  { id: 'dt2', name: 'İstinaf Başvurusu (HMK)', days: 14, color: 'orange' },
  { id: 'dt3', name: 'İcra İtiraz Süresi', days: 7, color: 'red' },
  { id: 'dt4', name: 'Temyiz Başvurusu (CMK)', days: 15, color: 'purple' },
  { id: 'dt5', name: 'İşe İade Dava Açma', days: 30, color: 'blue' },
  { id: 'dt6', name: 'İdari Yargı Dava Açma', days: 60, color: 'slate' },
  { id: 'dt7', name: 'Bilirkişi Raporuna İtiraz', days: 14, color: 'orange' },
];

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  { id: 'u2', name: 'Av. Selin Y.', email: 'avukat@bgaofis.com', password: '123456', role: UserRole.LAWYER, avatarUrl: 'https://picsum.photos/id/1011/200/200', lastLogin: '2025-10-24 09:00', ipAddress: '192.168.1.12', theme: 'purple' },
  { id: 'u3', name: 'Stj. Can K.', email: 'stajyer@bgaofis.com', password: '123456', role: UserRole.INTERN, avatarUrl: 'https://picsum.photos/id/1012/200/200', lastLogin: '2025-10-24 10:15', ipAddress: '192.168.1.15', theme: 'green' },
  { id: 'u4', name: 'Ayşe M.', email: 'sekreter@bgaofis.com', password: '123456', role: UserRole.SECRETARY, avatarUrl: 'https://picsum.photos/id/1013/200/200', lastLogin: '2025-10-24 08:30', ipAddress: '192.168.1.10', theme: 'orange' },
  { id: 'u5', name: 'Mehmet H.', email: 'finans@bgaofis.com', password: '123456', role: UserRole.FINANCE, avatarUrl: 'https://picsum.photos/id/1014/200/200', lastLogin: '2025-10-24 11:30', ipAddress: '192.168.1.20', theme: 'slate' },
];

export const MOCK_LOGS: AuditLog[] = [
  { id: 'l1', userId: 'u1', userName: 'Av. Burak G.', action: 'LOGIN', details: 'Sisteme giriş yapıldı', timestamp: '2025-10-24 08:00', ipAddress: '192.168.1.5' },
  { id: 'l2', userId: 'u2', userName: 'Av. Selin Y.', action: 'CASE_UPDATE', details: '2025/145 E. dosyasına duruşma eklendi', timestamp: '2025-10-24 09:30', ipAddress: '192.168.1.12', entityType: 'CASE', entityId: 'c1' },
  { id: 'l3', userId: 'u1', userName: 'Av. Burak G.', action: 'CLIENT_ADD', details: 'Yeni müvekkil eklendi: Vural Gayrimenkul', timestamp: '2025-10-24 11:00', ipAddress: '192.168.1.5', entityType: 'CLIENT', entityId: 'cl3' }
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
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">BÜRO NO:</span> {{DOSYA_NO}}</p>
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">ARB NO:</span> {{ARB_NO}}</p>
  </div>
  
  <div style="margin-bottom: 20px;">
    <p><strong>ARABULUCUYA,</strong></p>
    <p><strong>Ad Soyad:</strong> {{ARABULUCU}}</p>
    <p><strong>Sicil No:</strong> {{ARABULUCU_SICIL}}</p>
  </div>

  <div style="margin-bottom: 20px;">
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">BAŞVURUCU:</span> {{MUVEKKIL}}</p>
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
      <p><strong>Başvurucu</strong></p>
      <p>{{MUVEKKIL}}</p>
      <p>(İmza)</p>
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
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">ARABULUCU:</span> {{ARABULUCU}} (Sicil No: {{ARABULUCU_SICIL}})</p>
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">TUTANAK TARİHİ:</span> {{BUGUN}}</p>
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">TUTANAK YERİ:</span> {{ARABULUCU_ADRES}}</p>
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
        Sicil No: {{ARABULUCU_SICIL}}<br/>
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
    <p><span style="font-weight: bold; display: inline-block; width: 150px;">ARABULUCU:</span> {{ARABULUCU}} ({{ARABULUCU_SICIL}})</p>
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
  },
  {
    id: 't4',
    type: 'Davet',
    name: 'İlk Toplantı Davet Mektubu',
    content: `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; padding: 40px; max-width: 210mm; margin: 0 auto; background: white;">
  <h2 style="text-align: center; font-weight: bold; margin-bottom: 30px; text-decoration: underline;">ARABULUCULUK İLK OTURUM DAVET MEKTUBU</h2>
  
  <div style="margin-bottom: 20px;">
    <p><strong>Sayın {{KARSI_TARAF}},</strong></p>
    <p>Tarafınız ile {{MUVEKKIL}} arasındaki {{KONU}} konulu uyuşmazlık nedeniyle, 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu gereğince arabuluculuk süreci başlatılmıştır.</p>
  </div>
  
  <div style="margin-bottom: 20px;">
    <p>Bu kapsamda, ilk arabuluculuk toplantısının aşağıda belirtilen tarih ve saatte yapılmasına karar verilmiştir. Katılımınız yasal bir zorunluluk olmamakla birlikte, katılım sağlamamanız durumunda ileride açılacak olası bir davada haklı çıksanız dahi yargılama giderlerinin tamamından sorumlu tutulabileceğinizi (HUAK m. 18/A-11) hatırlatırız.</p>
  </div>

  <div style="background-color: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
    <p><strong>Dosya No:</strong> {{DOSYA_NO}}</p>
    <p><strong>Toplantı Tarihi:</strong> .../.../2025 Saat: 14:00</p>
    <p><strong>Toplantı Yeri:</strong> {{ARABULUCU_ADRES}} (VEYA ONLINE)</p>
    <p><strong>Online Bağlantı:</strong> https://meet.bgaofis.com/{{DOSYA_NO}}</p>
  </div>

  <div style="margin-top: 40px;">
    <p>Saygılarımla,</p>
    <p><strong>Arabulucu {{ARABULUCU}}</strong></p>
    <p>Sicil No: {{ARABULUCU_SICIL}}</p>
    <p>Tel: {{ARABULUCU_TELEFON}}</p>
  </div>
</div>`
  },
  {
    id: 't5',
    type: 'Ucret',
    name: 'Ücret Sözleşmesi',
    content: `
<div style="font-family: 'Times New Roman', serif; line-height: 1.6; color: #000; padding: 40px; max-width: 210mm; margin: 0 auto; background: white;">
  <h2 style="text-align: center; font-weight: bold; margin-bottom: 30px; text-decoration: underline;">ARABULUCULUK ÜCRET SÖZLEŞMESİ</h2>
  
  <p>İşbu sözleşme, Arabulucu {{ARABULUCU}} ile taraflar arasında, {{DOSYA_NO}} numaralı dosya kapsamında yürütülecek arabuluculuk faaliyeti nedeniyle ödenecek ücretin belirlenmesi amacıyla düzenlenmiştir.</p>

  <ol style="margin-top: 20px;">
    <li>Arabuluculuk ücreti, Adalet Bakanlığı Arabuluculuk Asgari Ücret Tarifesi hükümleri saklı kalmak kaydıyla, uyuşmazlık konusu miktar üzerinden <strong>%6</strong> olarak belirlenmiştir.</li>
    <li>Ücret, aksi kararlaştırılmadıkça taraflarca eşit olarak karşılanır.</li>
    <li>Ödemeler, aşağıdaki IBAN numarasına yapılacaktır:<br/>
    <strong>{{ARABULUCU_IBAN}}</strong></li>
  </ol>

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

// ... (Keeping MOCK_KNOWLEDGE_BASE, MOCK_CASES, MOCK_CLIENTS, MOCK_FINANCE, MOCK_TASKS)

export const MOCK_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'kb1',
    title: 'İşe İade Davalarında Arabuluculuk Süreci ve Yargıtay Kararı',
    category: 'İçtihat',
    tags: ['İş Hukuku', 'Yargıtay', 'İşe İade'],
    author: 'Av. Burak G.',
    createdAt: '2025-09-15',
    content: `**Yargıtay 9. Hukuk Dairesi, 2024/1234 E., 2024/5678 K.**

*Özet:* İşe iade davalarında arabuluculuk dava şartı olup, arabulucuya başvurulmadan açılan davaların usulden reddine karar verilmesi gerekir.

*Detay:* Davacı işçi, iş akdinin haksız feshedildiğini iddia ederek doğrudan iş mahkemesine başvurmuştur. Ancak 7036 sayılı İş Mahkemeleri Kanunu'nun 3. maddesi uyarınca, kanuna, bireysel veya toplu iş sözleşmesine dayanan işçi veya işveren alacağı ve tazminatı ile işe iade talebiyle açılan davalarda, arabulucuya başvurulmuş olması dava şartıdır.`
  },
  {
    id: 'kb2',
    title: 'Boşanma Davası Protokol Örneği',
    category: 'Dilekçe',
    tags: ['Aile Hukuku', 'Anlaşmalı Boşanma', 'Protokol'],
    author: 'Av. Selin Y.',
    createdAt: '2025-08-20',
    content: `**ANLAŞMALI BOŞANMA PROTOKOLÜ**

1. **TARAFLAR:** ...
2. **KONU:** Tarafların boşanma ve ferileri konusundaki anlaşmalarını içerir.
3. **HÜKÜMLER:**
   - Taraflar karşılıklı olarak boşanmayı kabul etmişlerdir.
   - Müşterek çocuk ...'nın velayeti anneye verilecektir.
   - Baba, çocuk için aylık 5.000 TL iştirak nafakası ödeyecektir.`
  },
  {
    id: 'kb3',
    title: 'Ofis İçi Dosya Kabul Prosedürü',
    category: 'Not',
    tags: ['Ofis Yönetimi', 'Prosedür'],
    author: 'Av. Burak G.',
    createdAt: '2025-01-10',
    content: `1. Müvekkil ile görüşme yapılır ve notlar CRM modülüne girilir.
2. Vekaletname bilgileri kontrol edilir.
3. Masraf avansı tahsil edilmeden dosya açılışı yapılmaz.
4. Fiziksel dosya oluşturulur ve sırtlık numarası verilir.`
  }
];

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

export const MOCK_CASES: Case[] = [
  {
    id: 'c1',
    caseNumber: '2025/145 E.',
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
      { id: 'h1', date: '2025-09-10 10:00', type: 'Ön İnceleme', location: 'İstanbul 5. Asliye Ticaret', description: 'Tarafların iddiaları incelendi.', result: 'Tahkikat aşamasına geçildi.' },
      { id: 'h2', date: `${today} 14:00`, type: 'Tahkikat', location: 'İstanbul 5. Asliye Ticaret', description: 'Bilirkişi raporu beklenecek.' }
    ],
    deadlines: [
      { id: 'dl1', title: 'Bilirkişi Raporuna İtiraz', triggerDate: '2025-10-20', dueDate: '2025-11-03', isCompleted: false, description: 'Rapora karşı beyan ve itiraz süresi' }
    ]
  },
  {
    id: 'c2',
    caseNumber: '2025/89 E.',
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
    caseNumber: '2024/550 E.',
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
      { id: 'h3', date: '2024-12-20', type: 'Karar', location: 'İş Mahkemesi', result: 'Kısmen kabul kısmen ret.', description: 'Mahkeme kararını açıkladı.' }
    ]
  },
  {
    id: 'c4',
    caseNumber: '2025/12 E.',
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
    caseNumber: '2025/900 E.',
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
    caseNumber: '2025/SOR-21',
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

export const MOCK_CLIENTS: Client[] = [
  {
    id: 'cl1',
    name: 'Yılmaz Ticaret A.Ş.',
    type: 'Kurumsal',
    phone: '0212 111 22 33',
    email: 'info@yilmazticaret.com',
    status: 'Aktif',
    balance: -15000,
    address: 'Maslak Mah. Büyükdere Cad. No:1 Sarıyer/İstanbul',
    taxNumber: '1234567890',
    taxOffice: 'Maslak',
    tags: ['VIP', 'Ticari']
  },
  {
    id: 'cl2',
    name: 'Mehmet Demir',
    type: 'Bireysel',
    phone: '0532 555 44 33',
    email: 'mehmet.demir@gmail.com',
    status: 'Aktif',
    balance: 5000,
    address: 'Beşiktaş/İstanbul',
    tags: ['Referanslı']
  },
  {
    id: 'cl3',
    name: 'Vural Gayrimenkul',
    type: 'Kurumsal',
    phone: '0216 333 44 55',
    email: 'ofis@vuralgayrimenkul.com',
    status: 'Aktif',
    balance: 0,
    tags: ['Riskli']
  }
];

export const MOCK_FINANCE: FinancialRecord[] = [
  {
    id: 'f1',
    type: 'income',
    category: 'Vekalet Ücreti',
    amount: 15000,
    date: '2025-10-15',
    description: 'Yılmaz Ticaret Danışmanlık',
    caseReference: '2025/145 E.'
  },
  {
    id: 'f2',
    type: 'expense',
    category: 'Bilirkişi Ücreti',
    amount: 3000,
    date: '2025-10-18',
    description: 'Demir Ailesi Dosyası Bilirkişi Avansı',
    caseReference: '2025/89 E.'
  },
  {
    id: 'f3',
    type: 'income',
    category: 'İcra Tahsilatı',
    amount: 8500,
    date: '2025-10-20',
    description: 'Kira Alacağı Tahsilatı',
    caseReference: '2025/900 E.'
  },
  {
    id: 'f4',
    type: 'expense',
    category: 'Ofis Masrafı',
    amount: 1500,
    date: '2025-10-21',
    description: 'Kırtasiye ve Toner',
  },
  {
    id: 'f5',
    type: 'income',
    category: 'Danışmanlık',
    amount: 5000,
    date: '2025-10-22',
    description: 'Sözleşme Hazırlama - ABC Ltd.'
  }
];

export const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Yılmaz Ticaret dava dilekçesi hazırlanacak',
    dueDate: '2025-10-25',
    priority: 'Yüksek',
    completed: false,
    assignedTo: 'Av. Burak G.',
    caseId: 'c1'
  },
  {
    id: 't2',
    title: 'Mehmet Demir ile görüşme yapılacak',
    dueDate: '2025-10-26',
    priority: 'Orta',
    completed: false,
    assignedTo: 'Av. Selin Y.',
    caseId: 'c2'
  },
  {
    id: 't3',
    title: 'Bilirkişi raporuna itiraz süresi',
    dueDate: '2025-10-28',
    priority: 'Yüksek',
    completed: false,
    assignedTo: 'Stj. Can K.',
    caseId: 'c1'
  },
  {
    id: 't4',
    title: 'Ofis aidatı ödenecek',
    dueDate: '2025-10-30',
    priority: 'Düşük',
    completed: true,
    assignedTo: 'Ayşe M.'
  }
];

export const MOCK_MEDIATIONS: Mediation[] = [
  {
    id: 'm1',
    fileNumber: '2025/10',
    mediationNumber: 'ARB-2025/45',
    applicationDate: '2025-10-01',
    clientName: 'Ahmet Yılmaz',
    counterParty: 'XYZ Lojistik A.Ş.',
    subject: 'İşçilik Alacakları',
    mediatorName: 'Av. Arb. Burak G.',
    status: MediationStatus.PROCESS,
    documents: [
       { id: 'd1', name: 'Başvuru Formu', type: 'Davet', createdDate: '2025-10-01', status: 'İmzalandı', signedBy: ['Ahmet Yılmaz'] }
    ],
    meetings: [
      {
        id: 'mm1',
        date: '2025-10-10 14:00',
        participants: 'Taraflar ve Vekilleri',
        notes: 'İlk oturum yapıldı, talepler alındı.',
        outcome: 'Ertelendi',
        type: 'Fiziksel',
        location: 'Ofis Toplantı Odası'
      }
    ],
    parties: [
        { name: 'Ahmet Yılmaz', role: 'Başvurucu', phone: '+90 555 111 22 33' },
        { name: 'XYZ Lojistik A.Ş.', role: 'Karşı Taraf', phone: '+90 212 444 55 66' }
    ]
  },
  {
    id: 'm2',
    fileNumber: '2025/12',
    mediationNumber: 'ARB-2025/52',
    applicationDate: '2025-10-12',
    clientName: 'Selin Kaya',
    counterParty: 'Mehmet Öz',
    subject: 'Kira Uyuşmazlığı',
    mediatorName: 'Av. Arb. Burak G.',
    status: MediationStatus.AGREEMENT,
    documents: [],
    meetings: [
      {
        id: 'mm2',
        date: '2025-10-20 10:00',
        participants: 'Taraflar',
        notes: 'Anlaşma sağlandı.',
        outcome: 'Olumlu',
        type: 'Online',
        link: 'https://meet.bgaofis.com/arb-2025-52'
      }
    ],
    parties: [
        { name: 'Selin Kaya', role: 'Başvurucu', phone: '+90 532 999 88 77' },
        { name: 'Mehmet Öz', role: 'Karşı Taraf', phone: '+90 533 666 55 44' }
    ]
  }
];
