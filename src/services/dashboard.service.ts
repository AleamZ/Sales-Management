import axiosInstance from "./main.service";
export type TimeType =
  | "TODAY"
  | "YESTERDAY"
  | "THIS_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "THIS_QUARTER"
  | "THIS_YEAR"
  | "CUSTOM";
export const DashboardService = {
  getReveune: async () => {
    const response = await axiosInstance.get("/dashboards/revenue");
    return response.data;
  },

  getRevenueByTimeType: async (typeTime: TimeType, customFrom?: string, customTo?: string) => {
    const params: any = { timeType: typeTime };
    if (customFrom) params.customFrom = customFrom;
    if (customTo) params.customTo = customTo;

    const response = await axiosInstance.get("/dashboards/dateTime", { params });
    return response.data;
  },

  getTopProductsByQuantityAndRevenue: async (typeTime: TimeType, customFrom?: string, customTo?: string) => {
    const params: any = { timeType: typeTime };
    if (customFrom) params.customFrom = customFrom;
    if (customTo) params.customTo = customTo;

    const response = await axiosInstance.get("/dashboards/topProduct", { params });
    return response.data; // mock returns { data: { revenue, quantity } }
  },

  getRevenueByYear: async (year: number) => {
    const response = await axiosInstance.get("/dashboards/year", {
      params: {
        year,
      },
    });
    return response.data; // mock returns the object directly
  },

  getCustomerAnalytics: async (typeTime: TimeType, customFrom?: string, customTo?: string) => {
    const params: any = { timeType: typeTime };
    if (customFrom) params.customFrom = customFrom;
    if (customTo) params.customTo = customTo;

    const response = await axiosInstance.get("/dashboards/customers", { params });
    return response.data;
  },

  getCategoryDistribution: async (typeTime: TimeType, customFrom?: string, customTo?: string) => {
    const params: any = { timeType: typeTime };
    if (customFrom) params.customFrom = customFrom;
    if (customTo) params.customTo = customTo;

    const response = await axiosInstance.get("/dashboards/categories", { params });
    return response.data;
  },

  getSalesReport: async (typeTime: TimeType, customFrom?: string, customTo?: string) => {
    const params: any = { timeType: typeTime };
    if (customFrom) params.customFrom = customFrom;
    if (customTo) params.customTo = customTo;

    const response = await axiosInstance.get("/dashboards/sales-report", { params });
    return response.data;
  },

  getSalesReportPDF: async (typeTime: TimeType, customFrom?: string, customTo?: string) => {
    const params: any = { timeType: typeTime };
    if (customFrom) params.customFrom = customFrom;
    if (customTo) params.customTo = customTo;

    const response = await axiosInstance.get("/dashboards/sales-report/pdf", {
      params,
      responseType: "blob"
    });
    return response.data;
  },
};
