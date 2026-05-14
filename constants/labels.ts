import type { Enums } from '@/types/database';

export const CATEGORY_LABELS: Record<Enums<'product_category'>, string> = {
  laticinios: 'Laticínios',
  graos: 'Grãos',
  bebidas: 'Bebidas',
  carnes: 'Carnes',
  congelados: 'Congelados',
  hortifruti: 'Hortifruti',
  padaria: 'Padaria',
  enlatados: 'Enlatados',
  massas: 'Massas',
  doces: 'Doces',
  temperos: 'Temperos',
  outros: 'Outros',
};

export const LOCATION_LABELS: Record<Enums<'storage_location'>, string> = {
  despensa: 'Despensa',
  geladeira: 'Geladeira',
  congelador: 'Congelador',
};

export const LOCATION_ICONS: Record<Enums<'storage_location'>, string> = {
  despensa: '🗄️',
  geladeira: '❄️',
  congelador: '🧊',
};
