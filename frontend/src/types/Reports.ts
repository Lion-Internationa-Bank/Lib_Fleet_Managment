export type ReportFormat = 'excel' | 'pdf' | 'word';
export type ReportPeriod = 'monthly' | 'quarterly' | 'halfyear' | '9month' | 'yearly' | 'custom';

export interface ReportRequest {
  format: ReportFormat;
  period?: ReportPeriod;
  startDate?: string;
  endDate?: string;
}

export interface ReportOption {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  icon: string;
  availableFormats: ReportFormat[];
  requiresDateRange: boolean;
  requiresPlateNo?: boolean;
  color: string;
  bgColor: string;
}

export const REPORT_TYPES: ReportOption[] = [
  {
    id: 'foreclosed',
    name: 'Foreclosed Vehicles Report',
    description: 'Detailed report of foreclosed vehicles with handover and takeover statistics',
    endpoint: '/reports/foreclosed',
    icon: '🚗',
    availableFormats: ['excel', 'pdf', 'word'],
    requiresDateRange: true,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    id: 'accident',
    name: 'Accident Report',
    description: 'Comprehensive accident records with vehicle and driver details',
    endpoint: '/reports/accident',
    icon: '⚠️',
    availableFormats: ['excel', 'pdf', 'word'],
    requiresDateRange: true,
    color: 'text-red-600',
    bgColor: 'bg-red-100'
  },
  {
    id: 'maintenance',
    name: 'Maintenance Report',
    description: 'Aggregated vehicle maintenance records by plate number',
    endpoint: '/reports/maintenance',
    icon: '🔧',
    availableFormats: ['excel', 'pdf', 'word'],
    requiresDateRange: true,
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    id: 'maintenance-type',
    name: 'Maintenance Type Report',
    description: 'Maintenance records grouped by type (Preventive, Corrective, etc.)',
    endpoint: '/reports/maintenance-type',
    icon: '📊',
    availableFormats: ['excel', 'pdf', 'word'],
    requiresDateRange: true,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    id: 'maintenance-jacket',
    name: 'Vehicle Maintenance Jacket',
    description: 'Complete maintenance history for a specific vehicle',
    endpoint: '/reports/maintenance-jacket',
    icon: '📁',
    availableFormats: ['excel', 'pdf', 'word'],
    requiresDateRange: false,
    requiresPlateNo: true,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    id: 'fuel-expense',
    name: 'Fuel Expense Report',
    description: 'Fuel consumption and expenses grouped by fuel type',
    endpoint: '/reports/fuel-expense',
    icon: '⛽',
    availableFormats: ['excel', 'pdf', 'word'],
    requiresDateRange: true,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  },
  {
    id: 'generator-maintenance',
    name: 'Generator Maintenance Report',
    description: 'Generator service records with maintenance details',
    endpoint: '/reports/generator-maintenance',
    icon: '⚡',
    availableFormats: ['excel', 'pdf', 'word'],
    requiresDateRange: true,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  }
];

export const PERIOD_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'halfyear', label: 'Half Year' },
  { value: '9month', label: '9 Months' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'custom', label: 'Custom Range' }
];

export const FORMAT_OPTIONS = [
  { value: 'excel', label: 'Excel', icon: '📊' },
  { value: 'pdf', label: 'PDF', icon: '📄' },
  { value: 'word', label: 'Word', icon: '📝' }
];