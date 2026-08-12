export interface Supplier {
  idSupplier: string;
  ref: string;
  name: string;
  address?: string;
  description?: string;
  providesDelivery: boolean;
  deliveryDelay?: number;
  notes?: string;
  phoneNumber?: string;
  email?: string;
}

export interface SupplierProduct {
  idSupplierProduct: string;
  ref: string;
  name: string;
  actualPrice: number;
  minPurchaseNumber: number;
  idSupplier: string;
  notes?: string;
}

export interface SupplierProductPrice {
  idSupplierProductPrice: string;
  price: number;
  changeDate: string;
  idSupplierProduct: string;
}

export interface SuppliedItem {
  idSuppliedItem: string;
  idItem: string;
  idSupplierProduct: string;
  item?: {
    idItem: string;
    ref: string;
    label: string;
  };
}

export interface SupplierDto {
  name: string;
  address?: string;
  description?: string;
  providesDelivery?: boolean;
  deliveryDelay?: number;
  notes?: string;
  phoneNumber?: string;
  email?: string;
}

export interface SupplierProductDto {
  name: string;
  actualPrice: number;
  minPurchaseNumber?: number;
  idSupplier: string;
  notes?: string;
}

export interface SuppliedItemDto {
  idItem: string;
  idSupplierProduct: string;
}
