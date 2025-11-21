
import { Mediation, MediationStatus, UserRole, Permission } from './types';
import { ROLE_PERMISSIONS } from './constants';

// --- PERMISSION UTILS ---

export const checkPermission = (role: UserRole, requiredPermission: Permission): boolean => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? permissions.includes(requiredPermission) : false;
};

// --- VALIDATION UTILS ---

export const validateTaxNumber = (number: string): boolean => {
  // Simple TCKN (11 digits) or VKN (10 digits) check
  const cleanNum = number.replace(/\D/g, '');
  return cleanNum.length === 10 || cleanNum.length === 11;
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('tr-TR');
};

// --- TEMPLATE GENERATION UTILS ---

export const generateMediationTemplate = (type: 'Basvuru' | 'Tutanak' | 'Anlasma', data: Mediation): string => {
  const today = new Date().toLocaleDateString('tr-TR');
  
  const baseStyles = `
    font-family: 'Times New Roman', serif;
    line-height: 1.6;
    color: #000;
    padding: 40px;
    max-width: 210mm;
    margin: 0 auto;
    background: white;
  `;

  const headerStyle = `text-align: center; font-weight: bold; margin-bottom: 30px; text-decoration: underline;`;
  const sectionStyle = `margin-bottom: 20px;`;
  const boldLabel = `font-weight: bold; display: inline-block; width: 150px;`;

  let content = '';
  let title = '';

  if (type === 'Basvuru') {
    title = 'ARABULUCULUK BAŞVURU FORMU';
    content = `
      <div style="${sectionStyle}">
        <p><span style="${boldLabel}">BAŞVURU TARİHİ:</span> ${data.applicationDate}</p>
        <p><span style="${boldLabel}">DOSYA NO:</span> ${data.fileNumber}</p>
      </div>
      
      <div style="${sectionStyle}">
        <p><strong>ARABULUCUYA,</strong></p>
      </div>

      <div style="${sectionStyle}">
        <p><span style="${boldLabel}">BAŞVURUCU:</span> ${data.clientName}</p>
        <p><span style="${boldLabel}">VEKİLİ:</span> Av. Burak G.</p>
      </div>

      <div style="${sectionStyle}">
        <p><span style="${boldLabel}">KARŞI TARAF:</span> ${data.counterParty}</p>
      </div>

      <div style="${sectionStyle}">
        <p><span style="${boldLabel}">UYUŞMAZLIK KONUSU:</span></p>
        <p style="text-align: justify; text-indent: 30px;">${data.subject}</p>
      </div>

      <div style="${sectionStyle}">
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
    `;
  } else if (type === 'Tutanak') {
    title = 'ARABULUCULUK SON TUTANAĞI';
    
    let outcomeText = '';
    if (data.status === MediationStatus.AGREEMENT) {
      outcomeText = `Taraflar, yapılan müzakereler sonucunda, işbu tutanağın ekinde yer alan / aşağıda belirtilen hususlarda tam bir mutabakata vararak <strong>ANLAŞMIŞLARDIR</strong>.`;
    } else if (data.status === MediationStatus.NO_AGREEMENT) {
      outcomeText = `Taraflar, yapılan müzakereler sonucunda, uyuşmazlık konusu talepler ve miktarlar üzerinde ortak bir noktada buluşamamış ve <strong>ANLAŞAMAMIŞLARDIR</strong>.`;
    } else {
      outcomeText = `Arabuluculuk süreci devam etmekte olup, tarafların iradeleri doğrultusunda süreç sonlandırılmıştır (Diğer).`;
    }

    content = `
      <div style="${sectionStyle}">
        <p><span style="${boldLabel}">BÜRO DOSYA NO:</span> ${data.fileNumber}</p>
        <p><span style="${boldLabel}">ARABULUCU:</span> ${data.mediatorName} (Sicil No: 12345)</p>
        <p><span style="${boldLabel}">TUTANAK TARİHİ:</span> ${today}</p>
        <p><span style="${boldLabel}">TUTANAK YERİ:</span> Arabuluculuk Ofisi Toplantı Salonu</p>
      </div>

      <div style="${sectionStyle}">
        <p><strong>1. TARAFLAR</strong></p>
        <p><strong>Başvurucu:</strong> ${data.clientName}</p>
        <p><strong>Karşı Taraf:</strong> ${data.counterParty}</p>
      </div>

      <div style="${sectionStyle}">
        <p><strong>2. UYUŞMAZLIK KONUSU</strong></p>
        <p>${data.subject}</p>
      </div>

      <div style="${sectionStyle}">
        <p><strong>3. SÜREÇ VE SONUÇ</strong></p>
        <p style="text-align: justify; text-indent: 30px;">
          Taraflar, arabulucunun daveti üzerine arabuluculuk görüşmelerine katılmış, süreç hakkında bilgilendirilmiş, gizlilik ilkesine riayet edeceklerini beyan etmişlerdir.
        </p>
        <p style="text-align: justify; text-indent: 30px; margin-top: 10px;">
          ${outcomeText}
        </p>
      </div>

      <div style="${sectionStyle}">
        <p>İşbu son tutanak, 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu'nun 17. maddesi uyarınca, tarafların ve arabulucunun serbest iradeleriyle okunup, doğruluğu kabul edilerek imza altına alınmıştır.</p>
      </div>

      <table style="width: 100%; margin-top: 60px; text-align: center;">
        <tr>
          <td style="padding: 20px;">
            <strong>BAŞVURUCU</strong><br/>
            ${data.clientName}<br/>
            (İmza)
          </td>
          <td style="padding: 20px;">
            <strong>KARŞI TARAF</strong><br/>
            ${data.counterParty}<br/>
            (İmza)
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 40px;">
            <strong>ARABULUCU</strong><br/>
            ${data.mediatorName}<br/>
            (İmza)
          </td>
        </tr>
      </table>
    `;
  } else if (type === 'Anlasma') {
    title = 'ARABULUCULUK ANLAŞMA BELGESİ';
    content = `
      <div style="${sectionStyle}">
        <p><span style="${boldLabel}">DOSYA NO:</span> ${data.fileNumber}</p>
        <p><span style="${boldLabel}">TARİH:</span> ${today}</p>
      </div>

      <div style="${sectionStyle}">
        <p><strong>A. TARAFLAR</strong></p>
        <p><strong>1. ${data.clientName}</strong> (TCKN/VKN: ...)</p>
        <p><strong>2. ${data.counterParty}</strong> (TCKN/VKN: ...)</p>
      </div>

      <div style="${sectionStyle}">
        <p><strong>B. UYUŞMAZLIK KONUSU</strong></p>
        <p>${data.subject}</p>
      </div>

      <div style="${sectionStyle}">
        <p><strong>C. ANLAŞMA ŞARTLARI</strong></p>
        <p>Taraflar, arabuluculuk müzakereleri sonucunda aşağıdaki maddeler üzerinde tam mutabakata varmışlardır:</p>
        <ol style="margin-left: 20px; margin-top: 10px;">
          <li style="margin-bottom: 10px;">Karşı Taraf, Başvurucu'ya uyuşmazlığa istinaden brüt <strong>100.000,00 TL</strong> (Yüz Bin Türk Lirası) ödemeyi kabul ve taahhüt eder.</li>
          <li style="margin-bottom: 10px;">Ödeme, işbu belgenin imzalandığı tarihten itibaren 7 (yedi) gün içinde Başvurucu'nun TR...................... IBAN numaralı hesabına yapılacaktır.</li>
          <li style="margin-bottom: 10px;">Ödemenin zamanında yapılmaması halinde, işleyecek yasal faiz ve icra masrafları Karşı Taraf'a ait olacaktır.</li>
          <li style="margin-bottom: 10px;">Taraflar, işbu anlaşma belgesinde belirtilen hususlar dışında, birbirlerinden başkaca herhangi bir hak ve alacak talebinde bulunmayacaklarını, birbirlerini gayrikabili rücu ibra ettiklerini beyan ederler.</li>
        </ol>
      </div>

      <div style="${sectionStyle}">
        <p><strong>D. HUKUKİ NİTELİK</strong></p>
        <p>İşbu anlaşma belgesi, 6325 sayılı Kanun'un 18. maddesi uyarınca taraflar ve avukatları ile arabulucu tarafından imzalanmış olup, ilam niteliğinde belgedir.</p>
      </div>

      <table style="width: 100%; margin-top: 60px; text-align: center;">
        <tr>
          <td style="padding: 20px;">
            <strong>BAŞVURUCU</strong><br/>
            ${data.clientName}<br/>
            (İmza)
          </td>
          <td style="padding: 20px;">
            <strong>KARŞI TARAF</strong><br/>
            ${data.counterParty}<br/>
            (İmza)
          </td>
        </tr>
         <tr>
          <td colspan="2" style="padding: 40px;">
            <strong>ARABULUCU</strong><br/>
            ${data.mediatorName}<br/>
            (İmza)
          </td>
        </tr>
      </table>
    `;
  }

  return `
    <div style="${baseStyles}">
      <h2 style="${headerStyle}">${title}</h2>
      ${content}
      <div style="margin-top: 50px; font-size: 10px; text-align: center; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
        Bu belge BGAofis Hukuk Otomasyon Sistemi tarafından otomatik oluşturulmuştur.
      </div>
    </div>
  `;
};

// --- CALENDAR UTILS ---

export const getDaysInMonth = (year: number, month: number) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
};
