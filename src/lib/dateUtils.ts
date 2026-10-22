/**
 * Formats a date string safely to Brazilian Portuguese standard (DD/MM/YYYY).
 * Prevents timezone offset shifting and handles invalid/empty inputs gracefully without crashing.
 */
export function formatDateSafely(dateString: string | undefined | null): string {
  if (!dateString) return 'Não informada';
  try {
    const cleanStr = String(dateString).trim();
    if (!cleanStr) return 'Não informada';
    
    // Fast path: YYYY-MM-DD formatted strings (prevents timezone shifting)
    const parts = cleanStr.split('-');
    if (parts.length === 3) {
      const year = parts[0];
      const month = parts[1];
      const day = parts[2].substring(0, 2);
      if (year.length === 4 && month.length === 2 && day.length === 2) {
        return `${day}/${month}/${year}`;
      }
    }
    
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) {
      return cleanStr;
    }
    // General fallback
    return d.toLocaleDateString('pt-BR');
  } catch (e) {
    return dateString || 'Não informada';
  }
}
