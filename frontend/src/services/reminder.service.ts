import { api } from './api';
import { ReminderResponse, ReminderFilterParams } from "../types/Reminder" ;


class ReminderService {
  private readonly baseUrl = '/reminders';

  // Get active reminders with filters
  async getActiveReminders(filters?: ReminderFilterParams): Promise<ReminderResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ReminderResponse>(`${this.baseUrl}/active`, params);
      return response;
    } catch (error) {
      console.error('Error fetching active reminders:', error);
      throw error;
    }
  }

  // Build query parameters from filters
  private buildQueryParams(filters?: ReminderFilterParams): Record<string, any> {
    if (!filters) return {};

    const params: Record<string, any> = {};
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params[key] = value;
      }
    });

    return params;
  }
}

export const reminderService = new ReminderService();
export default reminderService;