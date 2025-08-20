import { DashboardService, TimeType } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

export const useReveunes = () => {
  return useQuery({
    queryKey: ["get-reveunes "],
    queryFn: () => DashboardService.getReveune(),
    select: (res) => res.data ?? res,
    staleTime: 5000,
  });
};

export const useRevenueByTimeType = (typeTime: TimeType, customFrom?: string, customTo?: string) => {
  return useQuery({
    queryKey: ["get-revenue-time-type", typeTime, customFrom, customTo],
    queryFn: () => DashboardService.getRevenueByTimeType(typeTime, customFrom, customTo),
    select: (res) => res,
    staleTime: 5000,
  });
};

export const useRevenueByYear = (year: number) => {
  return useQuery({
    queryKey: ["get-revenue-year", year],
    queryFn: () => DashboardService.getRevenueByYear(year),
    select: (res) => res,
    staleTime: 5000,
  });
};

export const useTopProductsByQuantityAndRevenue = (typeTime: TimeType, customFrom?: string, customTo?: string) => {
  return useQuery({
    queryKey: ["get-revenue-top-product", typeTime, customFrom, customTo],
    queryFn: async () => {
      try {
        const result = await DashboardService.getTopProductsByQuantityAndRevenue(typeTime, customFrom, customTo);
        return result;
      } catch (error) {
        console.error("❌ API Error:", error);
        throw error;
      }
    },
    select: (res) => res.data || res,
    staleTime: 5000,
    retry: 1
  });
};

export const useCustomerAnalytics = (typeTime: TimeType, customFrom?: string, customTo?: string) => {
  return useQuery({
    queryKey: ["get-customer-analytics", typeTime, customFrom, customTo],
    queryFn: () => DashboardService.getCustomerAnalytics(typeTime, customFrom, customTo),
    select: (res) => res.data,
    staleTime: 5000,
  });
};

export const useCategoryDistribution = (typeTime: TimeType, customFrom?: string, customTo?: string) => {
  return useQuery({
    queryKey: ["get-category-distribution", typeTime, customFrom, customTo],
    queryFn: async () => {
      console.log('🚀 Calling Category API with:', { typeTime, customFrom, customTo });
      try {
        const result = await DashboardService.getCategoryDistribution(typeTime, customFrom, customTo);
        console.log('📊 Category API Response:', result);
        return result;
      } catch (error) {
        console.error('❌ Category API Error:', error);
        throw error;
      }
    },
    select: (res) => res.data,
    staleTime: 5000,
    retry: 1
  });
};

export const useSalesReport = (params: {
  timeType: TimeType;
  customFrom?: Date;
  customTo?: Date;
}) => {
  const customFromISO = params.customFrom?.toISOString();
  const customToISO = params.customTo?.toISOString();

  console.log('🚀 Sales Report Hook called with:', {
    timeType: params.timeType,
    customFromISO,
    customToISO
  });

  return useQuery({
    queryKey: ["get-sales-report", params.timeType, customFromISO, customToISO],
    queryFn: async () => {
      console.log('📡 Calling Sales Report API...');
      const result = await DashboardService.getSalesReport(params.timeType, customFromISO, customToISO);
      console.log('📊 Sales Report API Response:', result);
      return result;
    },
    select: (res) => {
      console.log('🔄 Processing Sales Report data:', res);
      return res.data;
    },
    staleTime: 5000,
  });
};
