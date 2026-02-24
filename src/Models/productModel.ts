export interface Product {

  _id: string;

  name: string;
  category?: string;
  brand?: string;

  costPrice: number;
  sellingPrice: number;

  currentStock: number;
  lowStockQuantity: number;

  supplierId: {
    _id: string;
    name: string;
  } | null;

  purchaseId: {
    _id: string;
    purchaseCode: string;
  };

  createdAt?: Date;
  updatedAt?: Date;
}