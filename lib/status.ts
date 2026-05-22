import { differenceInDays, startOfDay } from 'date-fns';

export type ProductStatus = 'expired' | 'warning' | 'safe';

function parseDate(date: Date | string): Date {
  if (date instanceof Date) return date;
  return new Date(date + 'T12:00:00');
}

export function getStatus(expirationDate: Date | string, warningDays = 5): ProductStatus {
  const today = startOfDay(new Date());
  const exp = startOfDay(parseDate(expirationDate));
  const diff = differenceInDays(exp, today);
  if (diff < 0) return 'expired';
  if (diff <= warningDays) return 'warning';
  return 'safe';
}
