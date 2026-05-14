import { z } from 'zod';

export const CATEGORIES = [
  'laticinios',
  'graos',
  'bebidas',
  'carnes',
  'congelados',
  'hortifruti',
  'padaria',
  'enlatados',
  'massas',
  'doces',
  'temperos',
  'outros',
] as const;

export const STORAGE_LOCATIONS = ['despensa', 'geladeira', 'congelador'] as const;

export const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  barcode: z.string().optional(),
  category: z.enum(CATEGORIES, 'Categoria inválida'),
  storage_location: z.enum(STORAGE_LOCATIONS, 'Local inválido'),
  quantity: z.number({ error: 'Informe a quantidade' }).min(0.01, 'Deve ser maior que 0'),
  expiration_date: z.string().min(1, 'Data de validade é obrigatória'),
  image_url: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
