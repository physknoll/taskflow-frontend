import api from './api';
import { ApiResponse } from '@/types';

// ============================================
// Google Chat Integration Types
// ============================================

export interface GoogleChatPreferences {
  morningCheckIn: boolean;
  eveningCheckIn: boolean;
  ticketNotifications: boolean;
  blockerAlerts: boolean;
}

export interface GoogleChatStatus {
  available: boolean;
  connected: boolean;
  googleEmail: string | null;
  connectedAt: string | null;
  preferences: GoogleChatPreferences | null;
}

export interface GoogleChatConnectDto {
  spaceName: string;
  googleEmail: string;
}

export interface GoogleChatConnectResponse {
  googleChat: {
    enabled: boolean;
    spaceName: string;
    googleEmail: string;
    connectedAt: string;
    preferences: GoogleChatPreferences;
  };
}

// ============================================
// Integration Service
// ============================================

export const integrationsService = {
  // ============================================
  // Google Chat
  // ============================================

  /**
   * Get the current Google Chat connection status
   */
  async getGoogleChatStatus(): Promise<GoogleChatStatus> {
    const response = await api.get<ApiResponse<GoogleChatStatus>>(
      '/integrations/google-chat/status'
    );
    return response.data.data;
  },

  /**
   * Connect Google Chat account
   * @param spaceName - The Google Chat space name (from URL param)
   * @param googleEmail - The user's Google email (from URL param)
   */
  async connectGoogleChat(data: GoogleChatConnectDto): Promise<GoogleChatConnectResponse> {
    const response = await api.post<ApiResponse<GoogleChatConnectResponse>>(
      '/integrations/google-chat/connect',
      data
    );
    return response.data.data;
  },

  /**
   * Disconnect Google Chat account
   */
  async disconnectGoogleChat(): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>(
      '/integrations/google-chat/disconnect'
    );
    return response.data.data;
  },

  /**
   * Update Google Chat notification preferences
   * All fields are optional - only include the ones to change
   */
  async updateGoogleChatPreferences(
    preferences: Partial<GoogleChatPreferences>
  ): Promise<{ preferences: GoogleChatPreferences }> {
    const response = await api.patch<ApiResponse<{ preferences: GoogleChatPreferences }>>(
      '/integrations/google-chat/preferences',
      preferences
    );
    return response.data.data;
  },
};


