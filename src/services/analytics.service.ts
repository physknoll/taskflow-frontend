import api from './api';
import { 
  IDashboardStats, 
  ITeamMemberStats, 
  IContributionData, 
  IStreakData, 
  IActivitySummary, 
  ILeaderboardData,
  ApiResponse 
} from '@/types';

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

export const analyticsService = {
  async getDashboardStats(): Promise<IDashboardStats> {
    const response = await api.get<ApiResponse<IDashboardStats>>('/analytics/dashboard');
    return response.data.data;
  },

  async getTeamStats(): Promise<{ members: ITeamMemberStats[] }> {
    const response = await api.get<ApiResponse<{ members: ITeamMemberStats[] }>>('/analytics/team');
    return response.data.data;
  },

  async getClientAnalytics(clientId: string): Promise<{
    ticketStats: any;
    assetCount: number;
    activeTickets: any[];
    completedThisMonth: number;
    hoursLogged: number;
  }> {
    const response = await api.get<ApiResponse<any>>(`/analytics/client/${clientId}`);
    return response.data.data;
  },

  async getEmployeeAnalytics(userId: string, dateRange?: DateRange): Promise<{
    overview: {
      totalCompleted: number;
      avgCompletionTime: number;
      reviewPassRate: number;
      currentStreak: number;
    };
    ticketHistory: Array<{
      date: string;
      completed: number;
      hours: number;
    }>;
    performanceByType: Record<string, { completed: number; avgTime: number }>;
  }> {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

    const response = await api.get<ApiResponse<any>>(`/analytics/employee/${userId}?${params.toString()}`);
    return response.data.data;
  },

  async getTicketTrends(dateRange?: DateRange): Promise<{
    daily: Array<{ date: string; created: number; completed: number }>;
    byStatus: Record<string, number>;
    byPriority: Record<string, number>;
    byClient: Array<{ clientId: string; clientName: string; count: number }>;
  }> {
    const params = new URLSearchParams();
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

    const response = await api.get<ApiResponse<any>>(`/analytics/tickets/trends?${params.toString()}`);
    return response.data.data;
  },

  async getReviewMetrics(): Promise<{
    totalReviews: number;
    avgScore: number;
    passRate: number;
    avgTimeToReview: number;
    reviewsByStatus: Record<string, number>;
  }> {
    const response = await api.get<ApiResponse<any>>('/analytics/reviews');
    return response.data.data;
  },

  async exportData(type: 'tickets' | 'reviews' | 'team', format: 'csv' | 'json', dateRange?: DateRange): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('format', format);
    if (dateRange?.startDate) params.append('startDate', dateRange.startDate);
    if (dateRange?.endDate) params.append('endDate', dateRange.endDate);

    const response = await api.get(`/analytics/export?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // GitHub-style contribution calendar
  async getContributions(days: number = 365): Promise<IContributionData> {
    const response = await api.get<ApiResponse<IContributionData>>(`/analytics/contributions?days=${days}`);
    return response.data.data;
  },

  // Streak data
  async getStreaks(): Promise<IStreakData> {
    const response = await api.get<ApiResponse<IStreakData>>('/analytics/streaks');
    return response.data.data;
  },

  // Activity summary
  async getActivitySummary(period: number = 7): Promise<IActivitySummary> {
    const response = await api.get<ApiResponse<IActivitySummary>>(`/analytics/activity-summary?period=${period}`);
    return response.data.data;
  },

  // Leaderboard (manager only)
  async getLeaderboard(period: number = 7): Promise<ILeaderboardData> {
    const response = await api.get<ApiResponse<ILeaderboardData>>(`/analytics/leaderboard?period=${period}`);
    return response.data.data;
  },
};

