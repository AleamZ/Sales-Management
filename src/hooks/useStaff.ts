import { RegisterRequest } from "@/services/auth.service";
import { StaffService } from "@/services/staff.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useStaffs = () => {
  return useQuery({
    queryKey: ["get-staffs"],
    queryFn: () => StaffService.getAllStaffs(),
    select: (res) => res.data,
    staleTime: 5000,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => StaffService.registerService(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-staffs"] });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => StaffService.deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-staffs"] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RegisterRequest }) =>
      StaffService.updateStaff(payload, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get-staffs"] });
    },
  });
};
