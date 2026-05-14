import { create } from 'zustand';
import type { Enums } from '@/types/database';

export type ScannedProductData = {
  name: string;
  barcode: string;
  category: Enums<'product_category'>;
  image_url?: string;
};

type ScanStore = {
  data: ScannedProductData | null;
  set: (data: ScannedProductData) => void;
  clear: () => void;
};

export const useScanStore = create<ScanStore>((set) => ({
  data: null,
  set: (data) => set({ data }),
  clear: () => set({ data: null }),
}));
