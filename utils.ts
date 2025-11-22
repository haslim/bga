
import { Mediation, MediationStatus, UserRole, Permission, MediatorProfile } from './types';
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

/**
 * Replaces placeholders in a template string with actual data from the Mediation object.
 */
export const processTemplate = (templateContent: string, data: Mediation, profile: MediatorProfile): string => {
  const today = new Date().toLocaleDateString('tr-TR');
  
  // Determine result text for Minutes (Tutanak)
  let outcomeText = '';
  if (data.status === MediationStatus.AGREEMENT) {
    outcomeText = `Taraflar, yapılan müzakereler sonucunda, işbu tutanağın ekinde yer alan / aşağıda belirtilen hususlarda tam bir mutabakata vararak <strong>ANLAŞMIŞLARDIR</strong>.`;
  } else if (data.status === MediationStatus.NO_AGREEMENT) {
    outcomeText = `Taraflar, yapılan müzakereler sonucunda, uyuşmazlık konusu talepler ve miktarlar üzerinde ortak bir noktada buluşamamış ve <strong>ANLAŞAMAMIŞLARDIR</strong>.`;
  } else {
    outcomeText = `Arabuluculuk süreci devam etmekte olup, tarafların iradeleri doğrultusunda süreç sonlandırılmıştır (Diğer).`;
  }

  // Generate Detailed Parties HTML
  let partiesDetailedHtml = '<ol style="margin-left: 20px;">';
  if (data.parties && data.parties.length > 0) {
      data.parties.forEach(p => {
          let row = `<li><strong>${p.role.toUpperCase()}:</strong> ${p.name}`;
          if (p.representative) {
              row += ` — <strong>Vekili:</strong> ${p.representative}`;
          }
          row += `</li>`;
          partiesDetailedHtml += row;
      });
  } else {
      // Fallback if party array not populated (Legacy)
      partiesDetailedHtml += `<li><strong>BAŞVURUCU:</strong> ${data.clientName}</li>`;
      partiesDetailedHtml += `<li><strong>KARŞI TARAF:</strong> ${data.counterParty}</li>`;
  }
  partiesDetailedHtml += '</ol>';

  // Replace Placeholders
  return templateContent
    .replace(/{{DOSYA_NO}}/g, data.fileNumber || '.....')
    .replace(/{{ARB_NO}}/g, data.mediationNumber || '.....') // Added Mediation Number
    .replace(/{{BASVURU_TARIHI}}/g, data.applicationDate || '.....')
    .replace(/{{MUVEKKIL}}/g, data.clientName || '.....')
    .replace(/{{KARSI_TARAF}}/g, data.counterParty || '.....')
    .replace(/{{KONU}}/g, data.subject || '.....')
    .replace(/{{TARAFLAR_DETAYLI}}/g, partiesDetailedHtml)
    // Use data from Mediator Profile
    .replace(/{{ARABULUCU}}/g, profile.name || '.....')
    .replace(/{{ARABULUCU_SICIL}}/g, profile.registrationNumber || '.....')
    .replace(/{{ARABULUCU_BURO}}/g, profile.officeName || '.....')
    .replace(/{{ARABULUCU_ADRES}}/g, profile.address || '.....')
    .replace(/{{ARABULUCU_IBAN}}/g, profile.iban || '.....')
    .replace(/{{ARABULUCU_TELEFON}}/g, profile.phone || '.....')
    .replace(/{{ARABULUCU_EMAIL}}/g, profile.email || '.....')
    .replace(/{{BUGUN}}/g, today)
    .replace(/{{TARIH}}/g, today)
    .replace(/{{SONUC_METNI}}/g, outcomeText);
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
