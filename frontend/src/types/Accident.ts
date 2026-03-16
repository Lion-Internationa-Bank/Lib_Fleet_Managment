export interface Accident {
  _id: string;
  plate_no: string;
  accident_date: string | null;
  accident_place: string;
  driver_name: string;
  damaged_part: string;
  accident_intensity: 'Low' | 'Medium' | 'High' | 'Critical';
  date_notified_insurance: string | null;
  date_police_report: string | null;
  date_insurance_surveyor: string | null;
  date_auction: string | null;
  date_into_garage: string | null;
  date_out_garage: string | null;
  current_situation: string;
  responsible_for_accident: '3rd Party' | 'Bank' | '';
  risk_base_price?: number | null;
  old_age_contribution?: number | null;
  total?: number | null;
  action_taken: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccidentFormData {
  plate_no: string;
  accident_date: string | null;
  accident_place: string;
  driver_name: string;
  damaged_part: string;
  accident_intensity: 'Low' | 'Medium' | 'High' | 'Critical';
  date_notified_insurance: string | null;
  date_police_report: string | null;
  date_insurance_surveyor: string | null;
  date_auction: string | null;
  date_into_garage: string | null;
  date_out_garage: string | null;
  current_situation: string;
  responsible_for_accident: '3rd Party' | 'Bank' | '';
  risk_base_price?: number | null;
  old_age_contribution?: number | null;
  total?: number | null;
  action_taken: string;
}

export interface AccidentFilterParams {
  plate_no?: string;
  accident_intensity?: string;
  responsible_for_accident?: string;
  start_date?: string;
  end_date?: string;
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
  data: Accident[];
}

// Accident intensity options
export const ACCIDENT_INTENSITY_OPTIONS = [
  'Low',
  'Medium', 
  'High',
  'Critical'
] as const;

// Responsible party options
export const RESPONSIBLE_PARTY_OPTIONS = [
  '3rd Party',
  'Bank'
] as const;

// Helper function to get intensity badge color
export const getIntensityBadgeColor = (intensity: string): string => {
  switch (intensity) {
    case 'Low':
      return 'bg-green-100 text-green-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'High':
      return 'bg-orange-100 text-orange-800';
    case 'Critical':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};