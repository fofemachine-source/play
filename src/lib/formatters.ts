/**
 * Brazilian Localization, Numbers, Dates, and Business Helpers
 * Portal Vida Fit
 */

/**
 * Normalizes input name or username to student login:
 * First name only, lowercase, without accents/special chars.
 * Examples:
 *   "Mariana Costa" -> "mariana"
 *   "MARIANA" -> "mariana"
 *   "João Pedro" -> "joao"
 *   "william" -> "william"
 */
export function extractUsername(input: string): string {
  if (!input) return '';
  const firstWord = input.trim().split(/\s+/)[0];
  return firstWord
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Formats a number to Brazilian decimal format (e.g., 74,4)
 * Empty/invalid values return "—"
 */
export function formatNumberBr(val: number | string | null | undefined, decimals = 1): string {
  if (val === null || val === undefined || val === '') return '—';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
  if (isNaN(num)) return '—';
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formats weight to "74,4 kg" or "—"
 */
export function formatKg(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '—';
  const formatted = formatNumberBr(val, 1);
  return formatted === '—' ? '—' : `${formatted} kg`;
}

/**
 * Formats calories to "1.510 kcal" or "—"
 */
export function formatKcal(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '—';
  const num = typeof val === 'number' ? Math.round(val) : Math.round(parseFloat(String(val)));
  if (isNaN(num)) return '—';
  return `${num.toLocaleString('pt-BR')} kcal`;
}

/**
 * Formats percentage to "14,5%" or "—"
 */
export function formatPercent(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '—';
  const formatted = formatNumberBr(val, 1);
  return formatted === '—' ? '—' : `${formatted}%`;
}

/**
 * Formats height to "1,75 m" or "—"
 */
export function formatHeight(val: number | string | null | undefined): string {
  if (val === null || val === undefined || val === '') return '—';
  const formatted = formatNumberBr(val, 2);
  return formatted === '—' ? '—' : `${formatted} m`;
}

/**
 * Formats date safely to Brazilian format "dd/mm/aaaa"
 * Returns "—" for empty or invalid dates
 */
export function formatDateBr(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  const cleanStr = String(dateString).trim();
  if (!cleanStr || cleanStr === 'N/A' || cleanStr === 'N/D') return '—';

  try {
    // Fast path: YYYY-MM-DD
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
    if (isNaN(d.getTime())) return cleanStr;
    return d.toLocaleDateString('pt-BR');
  } catch (e) {
    return '—';
  }
}

/**
 * Replaces empty, null, undefined, "N/A", "N/D", "na", "nd" with "—"
 */
export function formatEmpty(val: string | null | undefined): string {
  if (!val) return '—';
  const trimmed = val.trim();
  if (!trimmed) return '—';
  const lower = trimmed.toLowerCase();
  if (lower === 'n/a' || lower === 'n/d' || lower === 'na' || lower === 'nd' || lower === 'não informada') {
    return '—';
  }
  return trimmed;
}

/**
 * Standard WHO / ABRAN IMC classification
 */
export interface ImcClassification {
  label: 'Abaixo do peso' | 'Peso adequado' | 'Sobrepeso' | 'Obesidade';
  colorClass: string;
  badgeBg: string;
}

export function getImcClassification(imc: number | null | undefined): ImcClassification | null {
  if (!imc || isNaN(imc) || imc <= 0) return null;
  if (imc < 18.5) {
    return {
      label: 'Abaixo do peso',
      colorClass: 'text-sky-600 dark:text-sky-400 border-sky-400/30',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/40',
    };
  }
  if (imc < 25) {
    return {
      label: 'Peso adequado',
      colorClass: 'text-teal-700 dark:text-teal-300 border-teal-500/30',
      badgeBg: 'bg-teal-50 dark:bg-teal-950/40',
    };
  }
  if (imc < 30) {
    return {
      label: 'Sobrepeso',
      colorClass: 'text-amber-700 dark:text-amber-400 border-amber-500/30',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    };
  }
  return {
    label: 'Obesidade',
    colorClass: 'text-rose-700 dark:text-rose-400 border-rose-500/30',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
  };
}
