import { differenceInDays, format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Converte string YYYY-MM-DD para um Date representando o início
 * do dia em hora local, usando T12:00:00 para evitar bugs de timezone
 * que atravessam a meia-noite.
 */
function parseDate(date: Date | string): Date {
  if (date instanceof Date) return date;
  return new Date(date + 'T12:00:00');
}

export function diffInDays(expirationDate: Date | string): number {
  const today = startOfDay(new Date());
  const exp = startOfDay(parseDate(expirationDate));
  return differenceInDays(exp, today);
}

export function formatDate(date: Date | string): string {
  return format(parseDate(date), 'dd/MM/yyyy', { locale: ptBR });
}

export function getCountdownLabel(expirationDate: Date | string): string {
  const diff = diffInDays(expirationDate);
  if (diff < 0) return `Venceu há ${Math.abs(diff)} dia${Math.abs(diff) !== 1 ? 's' : ''}`;
  if (diff === 0) return 'Vence hoje';
  if (diff === 1) return 'Vence amanhã';
  return `Vence em ${diff} dias`;
}
