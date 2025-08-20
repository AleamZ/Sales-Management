export type ActivityLog = {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  action: 'CREATE_ORDER' | 'IMPORT_PRODUCT' | 'RETURN_ORDER_ITEM' | 'CREATE_PRODUCT' | 'UPDATE_PRODUCT' | 'DELETE_PRODUCT' | 'DELETE_ORDER';
  message: string;
  refId: string | any;
  refType: 'Order' | 'Product';
  metadata?: {
    total?: number;
    productCount?: number;
    originalRevenue?: number;
    originalCostPrice?: number;
    totalAmount?: number;
    wasReturnedOrder?: boolean;
  };
  createdAt: string;
  updatedAt: string;
};
