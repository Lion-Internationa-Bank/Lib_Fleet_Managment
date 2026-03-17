import { api } from './api';
import { 
  MaintenanceAgreement, 
  AgreementFormData, 
  AgreementFilterParams,
  ApiResponse 
} from '../types/Agreement';

class AgreementService {
  private readonly baseUrl = '/agreements';

  // Get all agreements with filters
  async getAgreements(filters?: AgreementFilterParams): Promise<ApiResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ApiResponse>(this.baseUrl, params);
      return response;
    } catch (error) {
      console.error('Error fetching agreements:', error);
      throw error;
    }
  }

  // Get single agreement by ID
  async getAgreementById(id: string): Promise<{ data: MaintenanceAgreement }> {
    try {
      const response = await api.get<{ data: MaintenanceAgreement }>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching agreement:', error);
      throw error;
    }
  }

  // Create new agreement
  async createAgreement(data: AgreementFormData): Promise<{ data: MaintenanceAgreement }> {
    try {
      const response = await api.post<{ data: MaintenanceAgreement }>(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating agreement:', error);
      throw error;
    }
  }

  // Update agreement
  async updateAgreement(id: string, data: Partial<AgreementFormData>): Promise<{ data: MaintenanceAgreement }> {
    try {
      const response = await api.patch<{ data: MaintenanceAgreement }>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating agreement:', error);
      throw error;
    }
  }

  // Build query parameters from filters
  private buildQueryParams(filters?: AgreementFilterParams): Record<string, any> {
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

export const agreementService = new AgreementService();
export default agreementService;