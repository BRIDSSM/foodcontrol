import { differenceInDays, startOfDay } from 'date-fns';

export type ProductStatus = 'expired' | 'warning' | 'safe';

export function getStatus(expirationDate: Date | string, warningDays = 5): ProductStatus {
  const today = startOfDay(new Date());
  const exp = startOfDay(
    typeof expirationDate === 'string' ? new Date(expirationDate) : expirationDate,
  );
  const diff = differenceInDays(exp, today);
  if (diff < 0) return 'expired';
  if (diff <= warningDays) return 'warning';
  return 'safe';
}
