export const SCAN_CONFIRMS_NEEDED = 3;

const VALID_GS1_LENGTHS = new Set([8, 12, 13, 14]);

export function isValidGS1(data: string): boolean {
  if (!/^\d+$/.test(data)) return false;
  if (!VALID_GS1_LENGTHS.has(data.length)) return false;

  const digits = data.split('').map(Number);
  const check = digits.pop();
  if (check === undefined) return false;

  const sum = digits.reverse().reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 3 : 1), 0);
  return (10 - (sum % 10)) % 10 === check;
}

export function formatBRL(value: number | null): string | null {
  if (value === null || value === 0) return null;
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
