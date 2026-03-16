import { api } from './api';
import { 
  VehicleMaintenance, 
  VehicleMaintenanceFormData, 
  VehicleMaintenanceFilterParams 
} from '../types/Maintenance';

interface ApiResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: VehicleMaintenance[];
}

class MaintenanceService {
  private readonly baseUrl = '/maintenance/vehicles';

  // Get all vehicle maintenance records
  async getRecords(filters?: VehicleMaintenanceFilterParams): Promise<ApiResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ApiResponse>(this.baseUrl, params);
      return response;
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
      throw error;
    }
  }

  // Get maintenance history for a specific vehicle
  async getVehicleHistory(plateNo: string, filters?: VehicleMaintenanceFilterParams): Promise<ApiResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ApiResponse>(`${this.baseUrl}/history/${plateNo}`, params);
      return response;
    } catch (error) {
      console.error('Error fetching vehicle history:', error);
      throw error;
    }
  }

  // Get single maintenance record by ID
  async getRecordById(id: string): Promise<{ data: VehicleMaintenance }> {
    try {
      const response = await api.get<{ data: VehicleMaintenance }>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching maintenance record:', error);
      throw error;
    }
  }

  // Create new maintenance record
  async createRecord(data: VehicleMaintenanceFormData): Promise<{ data: VehicleMaintenance }> {
    try {
      const response = await api.post<{ data: VehicleMaintenance }>(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating maintenance record:', error);
      throw error;
    }
  }

  // Update maintenance record
  async updateRecord(id: string, data: Partial<VehicleMaintenanceFormData>): Promise<{ data: VehicleMaintenance }> {
    try {
      const response = await api.patch<{ data: VehicleMaintenance }>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      throw error;
    }
  }

  // Build query parameters
  private buildQueryParams(filters?: VehicleMaintenanceFilterParams): Record<string, any> {
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

export const maintenanceService = new MaintenanceService();
export default maintenanceService;