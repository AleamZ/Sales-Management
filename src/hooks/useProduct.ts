import {
  getProducts,
  getSerialsProduct,
  getVariablesProduct,
} from "@/services/products.service";
import { useQuery } from "@tanstack/react-query";

export const useProductsQuery = (keyword: string) => {
  return useQuery({
    queryKey: ["get-products", keyword],
    queryFn: () => getProducts({ keyword }),
    select: (res) => res,
    staleTime: 5000,
  });
};

export const useGetSerials = (payload: {
  productId: string | undefined;
  variableId: string | undefined;
}) => {
  const isEnabled = !!payload?.productId;

  return useQuery({
    queryKey: ["get-product-serials", payload.productId, payload.variableId],
    queryFn: () => getSerialsProduct({
      productId: payload.productId as string,
      variableId: payload.variableId as string,
    }),
    enabled: isEnabled,
    staleTime: 5000,
    select: (res) => res.data,
  });
};

export const useGetVariables = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["get-product-variables", productId],
    queryFn: () => {
      if (!productId) return Promise.resolve([]);
      return getVariablesProduct(productId);
    },
    enabled: !!productId,
    staleTime: 5000,
    select: (res) => res.data,
  });
};
