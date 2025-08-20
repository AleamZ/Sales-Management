import { getAllCustomers } from "@/services/customer.service";
import { useQuery } from "@tanstack/react-query";

export const useCustomerQuery = (keyword: string) => {
  return useQuery({
    queryKey: ["get-customers", keyword],
    queryFn: () => getAllCustomers(keyword),
    select: (res) => res.data,
    staleTime: 5000,
  });
};
