export interface ForeclosureVehicle {
  _id: string;
  plate_no: string;
  property_owner: string;
  lender_branch: string;
  parking_place: string;
  date_into: string | null;
  date_out: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ForeclosureVehicleFormData {
  plate_no: string;
  property_owner: string;
  lender_branch: string;
  parking_place: string;
  date_into: string;
  date_out: string | null;
}
export type FilterStatus = '' | 'active' | 'closed';

export interface ForeclosureVehicleFilters {
  plate_no?: string;
  property_owner?: string;
  lender_branch?: string;
  parking_place?: string;
  date_into?: string;
  date_out?: string;
  status?: FilterStatus;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: PaginationInfo;
  data: ForeclosureVehicle[];
}