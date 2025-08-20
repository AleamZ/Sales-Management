export interface Attribute {
  key: string;
  value: string;
  _id: string;
}

export interface IVariable {
  _id: string;
  attribute: Attribute[];
  costPrice: number;
  sellPrice: number;
  stock: number;
  mainImage: string;
  listImage: string[];
  isSerial: boolean;
  serials: string[];
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  _id: string;
  productId: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  description: string;
  brandId: string;
  categoryId: string;
  variables: IVariable[];
  isVariable: boolean;
  mainImage: string;
  listImage: string[];
  isSerial: boolean;
  serials: string[];
  isDelete: boolean;
  barcode: string;
  createdAt: string;
  updatedAt: string;
}
