import { api } from './api';
import { 
  Insurance, 
  InsuranceFormData, 
  InsuranceFilterParams,
  ApiResponse 
} from '../types/Insurance';

class InsuranceService {
  private readonly baseUrl = '/insurances';

  // Get all insurance records
  async getInsurances(filters?: InsuranceFilterParams): Promise<ApiResponse> {
    try {
      const params = this.buildQueryParams(filters);
      const response = await api.get<ApiResponse>(this.baseUrl, params);
      return response;
    } catch (error) {
      console.error('Error fetching insurances:', error);
      throw error;
    }
  }

  // Get single insurance by ID
  async getInsuranceById(id: string): Promise<{ data: Insurance }> {
    try {
      const response = await api.get<{ data: Insurance }>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching insurance:', error);
      throw error;
    }
  }

  // Create new insurance
  async createInsurance(data: InsuranceFormData): Promise<{ data: Insurance }> {
    try {
      const response = await api.post<{ data: Insurance }>(this.baseUrl, data);
      return response;
    } catch (error) {
      console.error('Error creating insurance:', error);
      throw error;
    }
  }

  // Update insurance
  async updateInsurance(id: string, data: Partial<InsuranceFormData>): Promise<{ data: Insurance }> {
    try {
      const response = await api.patch<{ data: Insurance }>(`${this.baseUrl}/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating insurance:', error);
      throw error;
    }
  }

  // Build query parameters from filters
  private buildQueryParams(filters?: InsuranceFilterParams): Record<string, any> {
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

export const insuranceService = new InsuranceService();
export default insuranceService;