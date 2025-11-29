/**
 * Generates a unique report signature
 * Format: CSCP + MMDDYYYYXXXXX
 */
export function generateReportSignature(): string {
  const prefix = 'CSCP'; // Platform name
  const now = new Date();
  
  // Get month (01-12)
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Get day (01-31)
  const day = String(now.getDate()).padStart(2, '0');
  
  // Get year (2025)
  const year = now.getFullYear();
  
  // Generate random 5-digit number (10000-99999)
  const randomId = String(Math.floor(Math.random() * 90000) + 10000);

  return `${prefix}${month}${day}${year}${randomId}`;
}