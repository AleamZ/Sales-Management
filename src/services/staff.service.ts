import { RegisterRequest } from "./auth.service";
import axiosInstance from "./main.service";

export const StaffService = {
  getAllStaffs: async () => {
    const response = await axiosInstance.get("/auth/staffs");
    return response.data;
  },
  registerService: async (registerData: RegisterRequest) => {
    const response = await axiosInstance.post("/auth/register", registerData);
    return response.data;
  },

  deleteStaff: async (id: string) => {
    const response = await axiosInstance.delete(`/auth/${id}`);
    return response.data;
  },

  updateStaff: async (payload: RegisterRequest, id: string) => {
    const response = await axiosInstance.put(`/auth/${id}`, payload);
    return response.data;
  },
};
