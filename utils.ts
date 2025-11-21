
import { Mediation, MediationStatus } from './types';

// --- TEMPLATE GENERATION UTILS ---

export const generateMediationTemplate = (type: 'Basvuru' | 'Tutanak' | 'Anlasma', data: Mediation): string => {
  const today = new Date().toLocaleDateString('tr-TR');
  
  const baseStyles = `
    font-family: 'Times New Roman', serif;
    line-height: 1.5;
    color: #000;
    padding: 40px;
  `;

  let content = '';
  let title = '';

  if (type === 'Basvuru') {
    title = 'ARABULUCULUK BAŞVURU FORMU';
    content = `
      <p><strong>Başvuru Tarihi:</strong> ${data.applicationDate}</p>
      <p><strong>Dosya No:</strong> ${data.fileNumber}</p>
      <br/>
      <p><strong>BAŞVURUCU (Müvekkil):</strong> ${data.clientName}</p>
      <p><strong>KARŞI TARAF:</strong> ${data.counterParty}</p>
      <br/>
      <p><strong>UYUŞMAZLIK KONUSU:</strong></p>
      <p>${data.subject}</p>
      <br/>
      <p><strong>TALEP:</strong></p>
      <p>Yukarıda belirtilen uyuşmazlık konusunun, 6325 sayılı Hukuk Uyuşmazlıklarında Arabuluculuk Kanunu gereğince, arabuluculuk yoluyla çözümlenmesini talep ederim.</p>
      <br/><br/>
      <div style="display: flex; justify-content: space-between;">
        <div></div>
        <div style="text-align: center;">
          <p><strong>Başvurucu Vekili</strong></p>
          <p>Av. Burak G.</p>
          <p>(İmza)</p>
        </div>
      </div>
    `;
  } else if (type === 'Tutanak') {
    title = 'ARABULUCULUK SON TUTANAĞI';
    const outcomeText = data.status === MediationStatus.AGREEMENT 
      ? 'Taraflar arabuluculuk müzakereleri sonucunda ANLAŞMIŞLARDIR.' 
      : 'Taraflar arabuluculuk müzakereleri sonucunda ANLAŞAMAMIŞLARDIR.';

    content = `
      <p><strong>Arabuluculuk Bürosu Dosya No:</strong> ${data.fileNumber}</p>
      <p><strong>Tutanak Tarihi:</strong> ${today}</p>
      <br/>
      <p><strong>ARABULUCU:</strong> ${data.mediatorName}</p>
      <p><strong>TARAF 1:</strong> ${data.clientName}</p>
      <p><strong>TARAF 2:</strong> ${data.counterParty}</p>
      <br/>
      <p><strong>ARABULUCULUK SÜRECİ VE SONUCU:</strong></p>
      <p>Taraflar, ${data.applicationDate} tarihinde başlayan arabuluculuk sürecinde, uyuşmazlık konusu olan <strong>${data.subject}</strong> hakkında görüşmelerini tamamlamışlardır.</p>
      <p>${outcomeText}</p>
      <br/>
      <p>İşbu tutanak, 6325 sayılı Kanun'un 17. maddesi uyarınca taraflarca ve arabulucu tarafından imza altına alınmıştır.</p>
      <br/><br/>
      <div style="display: flex; justify-content: space-between; margin-top: 50px;">
        <div><strong>Taraf 1 (İmza)</strong></div>
        <div><strong>Taraf 2 (İmza)</strong></div>
        <div><strong>Arabulucu (İmza)</strong></div>
      </div>
    `;
  } else if (type === 'Anlasma') {
    title = 'ARABULUCULUK ANLAŞMA BELGESİ';
    content = `
      <h3 style="text-align: center;">ANLAŞMA BELGESİ</h3>
      <p><strong>Dosya No:</strong> ${data.fileNumber}</p>
      <br/>
      <p><strong>1. TARAFLAR</strong></p>
      <p>Bir tarafta <strong>${data.clientName}</strong> ile diğer tarafta <strong>${data.counterParty}</strong> aralarında aşağıdaki şartlarda anlaşmışlardır.</p>
      <br/>
      <p><strong>2. UYUŞMAZLIK KONUSU</strong></p>
      <p>${data.subject}</p>
      <br/>
      <p><strong>3. ANLAŞMA ŞARTLARI</strong></p>
      <ol>
        <li>Karşı taraf, başvurucuya 100.000 TL ödemeyi kabul eder.</li>
        <li>Ödeme, işbu belgenin imzalanmasından itibaren 5 iş günü içinde yapılacaktır.</li>
        <li>Taraflar, işbu uyuşmazlık konusunda birbirlerini gayrikabili rücu ibra ederler.</li>
      </ol>
      <br/>
      <p>İşbu anlaşma belgesi, ilam niteliğindedir.</p>
      <br/><br/>
      <div style="display: flex; justify-content: space-between; margin-top: 50px;">
        <div><strong>${data.clientName}</strong></div>
        <div><strong>${data.counterParty}</strong></div>
      </div>
    `;
  }

  return `
    <div style="${baseStyles}">
      <h2 style="text-align: center; text-decoration: underline;">${title}</h2>
      <br/>
      ${content}
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
