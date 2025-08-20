import axiosInstance from "./main.service"

export const ActivityLogService = {
    getAllLogs: async () => {
        const response = await axiosInstance.get('/activity-logs')
        return response.data
    },
    getLogDetail: async (id: string | undefined) => {
        const response = await axiosInstance.get(`/activity-logs/${id}`)
        return response.data
    },
}