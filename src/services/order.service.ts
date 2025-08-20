import { Product } from "@/enums/product.enum";
import axiosInstance from "./main.service";

export interface IReturnOrderItem {
  productId: string;
  typeProduct: Product;
  name: string;
  quantity: number;
  serial?: string;
  variableId?: string;
}

export interface IRefund {
  money: number;
  reason: string;
}

export interface IPayloadReturnOrder {
  staffId: string;
  itemOrder: IReturnOrderItem[];
  refund: IRefund;
}
export const OrderService = {
  async create(payload: any) {
    const response = await axiosInstance.post("/orders", payload);
    return response.data;
  },

  async getAll(params?: {
    keyword?: string;
    page?: number;
    limit?: number;
    timeType?: string;
    status?: string[];
  }) {
    const response = await axiosInstance.get("/orders", {
      params,
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v));
          } else {
            searchParams.append(key, value);
          }
        });
        return searchParams.toString();
      },
    });
    return response.data;
  },

  async getOrderById(id: string) {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },

  async exportInvoice(id: string) {
    const response = await axiosInstance.get(`/orders/${id}/invoice`, {
      responseType: "blob",
    });
    return response.data;
  },

  async returnOrder(orderId: string, payload: IPayloadReturnOrder) {
    const response = await axiosInstance.post(
      `/orders/return/${orderId}`,
      payload
    );
    return response.data;
  },

  async customerDept(paylod: { money: number; orderId: string }) {
    const response = await axiosInstance.post(`/orders/customer-dept`, paylod);
    return response.data;
  },

  async softDeleteOrder(orderId: string, userId: string) {
    const response = await axiosInstance.delete(`/orders/${orderId}`, {
      data: { userId }
    });
    return response.data;
  },
};
