export interface ProductPrice {
  idProductPrice: string;
  idMenu: string; specialPrice?: number; idRoomType?: string; idEvent?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductPriceDto {
  idMenu: string; specialPrice?: number; idRoomType?: string; idEvent?: string;
}
