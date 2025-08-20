import { ActivityLogService } from "@/services/activityLog.service";
import { useQuery } from "@tanstack/react-query";

export const useActivityLogs = () => {
  return useQuery({
    queryKey: ["get-activity-logs"],
    queryFn: () => ActivityLogService.getAllLogs(),
    select: (res) => res,
    staleTime: 5000,
  });
};

export const useActivityLogDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ["get-activity-log-detail", id],
    queryFn: () => ActivityLogService.getLogDetail(id),
    select: (res) => res,
    enabled: !!id,
    staleTime: 5000,
  });
};
