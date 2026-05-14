import { differenceInDays, format, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function diffInDays(expirationDate: Date | string): number {
  const today = startOfDay(new Date());
  const exp = startOfDay(
    typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate,
  );
  return differenceInDays(exp, today);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'dd/MM/yyyy', { locale: ptBR });
}

export function getCountdownLabel(expirationDate: Date | string): string {
  const diff = diffInDays(expirationDate);
  if (diff < 0) return `Venceu há ${Math.abs(diff)} dia${Math.abs(diff) !== 1 ? 's' : ''}`;
  if (diff === 0) return 'Vence hoje';
  if (diff === 1) return 'Vence amanhã';
  return `Vence em ${diff} dias`;
}
