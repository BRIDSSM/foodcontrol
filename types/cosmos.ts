export type ScannedBarcode = {
  type: string;
  data: string;
  scannedAt: Date;
};

export type CosmosProduct = {
  description: string;
  gtin: number;
  thumbnail: string | null;
  avg_price: number | null;
  min_price: number | null;
  max_price: number | null;
  net_weight: number | null;
  gross_weight: number | null;
  brand: { name: string; picture: string } | null;
  category: { description: string } | null;
  ncm: { code: string; description: string } | null;
  gtins: { commercial_unit: { type_packaging: string; quantity_packaging: number } }[];
};
