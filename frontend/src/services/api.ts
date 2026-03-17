import axios, { AxiosInstance, AxiosRequestConfig} from 'axios';
// import { toast } from 'sonner';

// Extend AxiosRequestConfig to include our custom properties
// interface CustomAxiosRequestConfig extends AxiosRequestConfig {
//   _retry?: boolean;
// }

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  private constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Singleton pattern
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Generic GET method for JSON responses
  public async get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get(url, { ...config, params });
    return response.data;
  }

  // Special method for file downloads - returns the full response
  public async getForDownload(url: string, params?: any, config?: AxiosRequestConfig): Promise<Blob> {
    const response = await this.api.get(url, {
      ...config,
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Generic POST method
  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post(url, data, config);
    return response.data;
  }

  // Generic PUT method
  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put(url, data, config);
    return response.data;
  }

  // Generic PATCH method
  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch(url, data, config);
    return response.data;
  }

  // Generic DELETE method
  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete(url, config);
    return response.data;
  }

  // Upload file method
  public async upload<T = any>(url: string, file: File, additionalData?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const response = await this.api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data;
  }

  // Download file method - FIXED VERSION
  public async download(url: string, filename?: string, params?: any): Promise<void> {
    try {
      // Build the full URL with query parameters
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      const fullUrl = `${import.meta.env.VITE_API_URL}${url}${queryString}`;
      
      console.log('Downloading from:', fullUrl); // For debugging
      
      // Create an anchor element and trigger download
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  }

  // Alternative method using fetch for more control
  public async downloadWithFetch(url: string, filename?: string, params?: any): Promise<void> {
    try {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
      const fullUrl = `${import.meta.env.VITE_API_URL}${url}${queryString}`;
      
      const response = await fetch(fullUrl);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Download failed');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);
      
    } catch (error: any) {
      console.error('Download error:', error);
      throw error;
    }
  }

  // Set auth token manually
  public setAuthToken(token: string | null) {
    if (token) {
      localStorage.setItem('accessToken', token);
      this.api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      localStorage.removeItem('accessToken');
      delete this.api.defaults.headers.common.Authorization;
    }
  }

  // Get the axios instance (for custom configurations)
  public getInstance(): AxiosInstance {
    return this.api;
  }
}

// Export singleton instance
export const api = ApiService.getInstance();

// Also export the class for testing or custom instances
export default ApiService;