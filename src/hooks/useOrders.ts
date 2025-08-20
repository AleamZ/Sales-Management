import { IPayloadReturnOrder, OrderService } from "@/services/order.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useOrders = (params?: {
  keyword?: string;
  page?: number;
  limit?: number;
  timeType?: string;
  status?: string[];
}) => {
  return useQuery({
    queryKey: ["get-orders", params],
    queryFn: () => OrderService.getAll(params),
    select: (res) => res.data,
    staleTime: 5000,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => OrderService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-orders"] });
    },
  });
};

export const useReturnOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: IPayloadReturnOrder;
    }) => OrderService.returnOrder(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-orders"] });
    },
  });
};

export const useCustomerDept = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { money: number; orderId: string }) =>
      OrderService.customerDept(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-orders"] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, userId }: { orderId: string; userId: string }) =>
      OrderService.softDeleteOrder(orderId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-orders"] });
    },
  });
};
