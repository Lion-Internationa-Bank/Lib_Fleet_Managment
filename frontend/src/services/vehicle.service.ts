import { api } from './api';

// Types
export interface VehicleFilters {
  plate_no?: string;
  location?: string;
  vehicle_allocation?: string;
  vehicle_type?: string;
  fuel_type?: string;
  bolo_expired_date?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface VehicleListItem {
  plate_no: string;
  location: string;
  vehicle_allocation: string;
  vehicle_type: string;
  vehicle_model: string;
  fuel_type: string;
  current_km: number;
  next_service_date: string;
  bolo_expired_date: string;
}

export interface VehicleDetail {
  _id: string;
  plate_no: string;
  location: string;
  vehicle_allocation: string;
  vehicle_type: string;
  body_color: string;
  manufacturing_year: number;
  vehicle_origin: string;
  title_certificate_no?: string;
  vehicle_model: string;
  chassis_no: string;
  engine_no: string;
  seating_capacity: number;
  pay_load?: number;
  total_weight?: number;
  horse_power?: number;
  no_of_cylinder?: number;
  cc?: number;
  drive_type?: string;
  fuel_type: string;
  tyre_size: string;
  original_price?: number;
  total_price?: number;
  delivery_date?: string;
  bolo_expired_date: string;
  supplier_company?: string;
  current_km: number;
  last_service_date?: string;
  next_service_date?: string;
  file_uploads: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface PaginatedResponse<T> {
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
  data: T[];
}

export interface UpdateLocationPayload {
  location?: string;
  vehicle_allocation?: string;
}

export interface UpdateCompliancePayload {
  bolo_expired_date: string;
}

// Vehicle Service
export const vehicleService = {
  // Get all vehicles with filters
  getVehicles: (params?: VehicleFilters) => 
    api.get<PaginatedResponse<VehicleListItem>>('/vehicles', params),

  // Get single vehicle by plate number
  getVehicleByPlate: (plateNo: string) => 
    api.get<{ success: boolean; data: VehicleDetail }>(`/vehicles/${plateNo.toUpperCase()}`),

  // Create new vehicle
  createVehicle: (data: Partial<VehicleDetail>) => 
    api.post<{ success: boolean; message:String, data: VehicleDetail }>('/vehicles', data),

  // Update vehicle location and allocation
  updateVehicleLocation: (plateNo: string, data: UpdateLocationPayload) => 
    api.patch<{ success: boolean; message: string; data: VehicleDetail }>(
      `/vehicles/${plateNo.toUpperCase()}/location`, 
      data
    ),
  // Full update vehicle (PUT)
  updateVehicleFull: (plateNo: string, data: Partial<VehicleDetail>) => 
    api.put<{ success: boolean; message: string; data: VehicleDetail }>(
      `/vehicles/${plateNo.toUpperCase()}`, 
      data
    ), 

  // Update vehicle compliance (BOLO expiry date)
  updateVehicleCompliance: (plateNo: string, data: UpdateCompliancePayload) => 
    api.patch<{ success: boolean; message: string; data: VehicleDetail }>(
      `/vehicles/${plateNo.toUpperCase()}/compliance`, 
      data
    ),

  // Update vehicle
  updateVehicle: (plateNo: string, data: Partial<VehicleDetail>) => 
    api.put<{ success: boolean; data: VehicleDetail }>(`/vehicles/${plateNo.toUpperCase()}`, data),


  // Upload vehicle document
  uploadDocument: (plateNo: string, file: File, documentType?: string) => 
    api.upload<{ success: boolean; data: { fileUrl: string } }>(
      `/vehicles/${plateNo.toUpperCase()}/documents`, 
      file, 
      { documentType }
    ),


};

// Convenience exports
export const {
  getVehicles,
  getVehicleByPlate,
  createVehicle,
  updateVehicle,
  updateVehicleFull,
  updateVehicleCompliance,
  updateVehicleLocation,
  uploadDocument,

} = vehicleService;