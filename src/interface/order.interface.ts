export interface OrderProduct {
    _id: string;
    productId: string;
    name: string;
    barcode: string | null;
    serial: string | null;
    quantity: number;
    sellPrice: number;
    realSellPrice: number;
    variableId: string | null;
    typeProduct: string;
}

export interface OrderDetail {
    _id: string;
    staffId: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    productList: OrderProduct[];
    discountType: 'percent' | 'money';
    discountValue: number;
    totalAmount: number;
    totalCostPrice: number;
    estimatedRevenue: number;
    totalAmountDiscount: number;
    customerPaid: number;
    customerDebt: number;
    paymentStatus: 'paid' | 'partial' | 'unpaid' | 'paid_refund';
    isReturnOrder: boolean;
    reasonRefund: string | null;
    isDelete: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderPayload {
    staffId: string;
    customerId?: string;
    customerName?: string;
    customerPhone?: string;
    customerAddress?: string;
    productList: any[];
    discountType: 'percent' | 'money';
    discountValue: number;
    totalAmount: number;
    totalAmountDiscount: number;
    customerPaid: number;
    saleDate?: string;
} 