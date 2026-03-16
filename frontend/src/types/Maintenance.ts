export interface SparePart {
  part: string;
  service_type: 'replace' | 'clean' | 'repair' | 'inspect and clean' | 'inspect' | 'rotation' | 'lubricate and clean';
  cost: number;
  service_provider: string;
  inspected_by: string;
  mileage: number;
}

export interface VehicleMaintenance {
  _id: string;
  plate_no: string;
  vehicle_type: string;
  invoice_no: string;
  location: string;
  workshop_name?: string;
  maintenance_type: 'Preventive' | 'Corrective' | 'Breakdown' | 'Body & Paint';
  labour_cost: number;
  spare_cost: number;
  total_cost: number;
  km_diff?: number | null;
  cost_per_km?: number | null;
  costed_by?: string;
  spare_part: SparePart[];
  km_at_service: number;
  date_in?: string | null;
  date_out?: string | null;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleMaintenanceFormData {
  plate_no: string;
  invoice_no: string;
  workshop_name?: string;
  maintenance_type: 'Preventive' | 'Corrective' | 'Breakdown' | 'Body & Paint';
  labour_cost: number;
  costed_by?: string;
  spare_part: SparePart[];
  km_at_service: number;
  date_in?: string | null;
  date_out?: string | null;
  remark?: string;
}

export interface VehicleMaintenanceFilterParams {
  plate_no?: string;
  maintenance_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export const MAINTENANCE_TYPES = [
  'Preventive',
  'Corrective', 
  'Breakdown',
  'Body & Paint'
] as const;

export interface PaginationInfo {
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}


export const SERVICE_TYPES = [
  'replace',
  'clean',
  'repair',
  'inspect and clean',
  'inspect',
  'rotation',
  'lubricate and clean'
] as const;

export const getMaintenanceTypeColor = (type: string): string => {
  switch (type) {
    case 'Preventive':
      return 'bg-green-100 text-green-800';
    case 'Corrective':
      return 'bg-yellow-100 text-yellow-800';
    case 'Breakdown':
      return 'bg-red-100 text-red-800';
    case 'Body & Paint':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};