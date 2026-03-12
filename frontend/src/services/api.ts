import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
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
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // this.setupInterceptors();
  }

  // Singleton pattern
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

//   private setupInterceptors() {
//     // Request interceptor - adds token to every request
//     this.api.interceptors.request.use(
//       (config: InternalAxiosRequestConfig) => {
//         // Get token from localStorage (or your preferred storage)
//         const token = localStorage.getItem('accessToken');
        
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }

//         // Log requests in development
//         if (import.meta.env.DEV) {
//           console.log(`🚀 ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, {
//             params: config.params,
//             data: config.data,
//           });
//         }

//         return config;
//       },
//       (error) => {
//         return Promise.reject(error);
//       }
//     );

//     // Response interceptor - handles errors and token refresh
//     this.api.interceptors.response.use(
//       (response) => {
//         // Log responses in development
//         if (import.meta.env.DEV) {
//           console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
//         }
//         return response;
//       },
//       async (error) => {
//         const originalRequest = error.config as CustomAxiosRequestConfig;

//         // Handle 401 Unauthorized - token expired
//         if (error.response?.status === 401 && !originalRequest._retry) {
//           originalRequest._retry = true;

//           try {
//             // Attempt to refresh token
//             const refreshToken = localStorage.getItem('refreshToken');
//             if (refreshToken) {
//               const response = await this.api.post('/auth/refresh', {
//                 refreshToken,
//               });

//               const { accessToken } = response.data;
//               localStorage.setItem('accessToken', accessToken);

//               // Retry original request with new token
//               originalRequest.headers.Authorization = `Bearer ${accessToken}`;
//               return this.api(originalRequest);
//             }
//           } catch (refreshError) {
//             // Refresh failed - redirect to login
//             localStorage.removeItem('accessToken');
//             localStorage.removeItem('refreshToken');
//             window.location.href = '/login';
//           }
//         }

//         // Handle other errors
//         const message = error.response?.data?.message || error.message || 'An error occurred';
//         toast.error(message);

//         // Log errors in development
//         if (import.meta.env.DEV) {
//           console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
//             status: error.response?.status,
//             data: error.response?.data,
//             message: error.message,
//           });
//         }

//         return Promise.reject(error);
//       }
//     );
//   }

  // Generic GET method
  public get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.get(url, { ...config, params }).then(response => response.data);
  }

  // Generic POST method
  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.post(url, data, config).then(response => response.data);
  }

  // Generic PUT method
  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.put(url, data, config).then(response => response.data);
  }

  // Generic PATCH method
  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.api.patch(url, data, config).then(response => response.data);
  }

  // Generic DELETE method
  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.api.delete(url, config).then(response => response.data);
  }

  // Upload file method
  public upload<T = any>(url: string, file: File, additionalData?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    return this.api.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    }).then(response => response.data);
  }

  // Download file method
  public async download(url: string, filename?: string, config?: AxiosRequestConfig): Promise<void> {
    const response = await this.api.get(url, {
      ...config,
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
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