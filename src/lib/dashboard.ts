import api from "./api";
import { DashboardData } from "@/types";

export const dashboardApi = {
  getStats: async () => {
    const { data } = await api.get<DashboardData>("/api/dashboard/stats");
    return data;
  },
};
