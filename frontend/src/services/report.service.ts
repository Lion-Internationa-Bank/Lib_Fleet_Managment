import { api } from './api';
import { ReportRequest } from '../types/Reports';

class ReportService {
  private readonly baseUrl = '/reports';

  // Foreclosed Vehicles Report
  async generateForeclosedReport(params: ReportRequest): Promise<void> {
    const { format, period, startDate, endDate } = params;
    const queryParams: Record<string, any> = { format };

    if (period && period !== 'custom') {
      queryParams.period = period;
    } else if (startDate && endDate) {
      queryParams.startDate = startDate;
      queryParams.endDate = endDate;
    }

    const filename = `foreclosed_vehicles_${new Date().toISOString().split('T')[0]}.${format}`;
    await api.download(`${this.baseUrl}/foreclosed`, filename, queryParams);
  }

  // Accident Report
  async generateAccidentReport(params: ReportRequest): Promise<void> {
    const { format, period, startDate, endDate } = params;
    const queryParams: Record<string, any> = { format };

    if (period && period !== 'custom') {
      queryParams.period = period;
    } else if (startDate && endDate) {
      queryParams.startDate = startDate;
      queryParams.endDate = endDate;
    }

    const filename = `accident_report_${new Date().toISOString().split('T')[0]}.${format}`;
    await api.download(`${this.baseUrl}/accident`, filename, queryParams);
  }

  // Maintenance Report
  async generateMaintenanceReport(params: ReportRequest): Promise<void> {
    const { format, period, startDate, endDate } = params;
    const queryParams: Record<string, any> = { format };

    if (period && period !== 'custom') {
      queryParams.period = period;
    } else if (startDate && endDate) {
      queryParams.startDate = startDate;
      queryParams.endDate = endDate;
    }

    const filename = `maintenance_report_${new Date().toISOString().split('T')[0]}.${format}`;
    await api.download(`${this.baseUrl}/maintenance`, filename, queryParams);
  }

  // Maintenance Type Report
  async generateMaintenanceTypeReport(params: ReportRequest): Promise<void> {
    const { format, period, startDate, endDate } = params;
    const queryParams: Record<string, any> = { format };

    if (period && period !== 'custom') {
      queryParams.period = period;
    } else if (startDate && endDate) {
      queryParams.startDate = startDate;
      queryParams.endDate = endDate;
    }

    const filename = `maintenance_type_report_${new Date().toISOString().split('T')[0]}.${format}`;
    await api.download(`${this.baseUrl}/maintenance-type`, filename, queryParams);
  }

  // Single Vehicle Maintenance Jacket
  async generateMaintenanceJacket(plateNo: string, format: string): Promise<void> {
    const filename = `maintenance_jacket_${plateNo}_${new Date().toISOString().split('T')[0]}.${format}`;
    await api.download(`${this.baseUrl}/maintenance-jacket/${plateNo}`, filename, { format });
  }

  // Fuel Expense Report
  async generateFuelExpenseReport(params: ReportRequest): Promise<void> {
    const { format, period, startDate, endDate } = params;
    const queryParams: Record<string, any> = { format };

    if (period && period !== 'custom') {
      queryParams.period = period;
    } else if (startDate && endDate) {
      queryParams.startDate = startDate;
      queryParams.endDate = endDate;
    }

    const filename = `fuel_expense_report_${new Date().toISOString().split('T')[0]}.${format}`;
    await api.download(`${this.baseUrl}/fuel-expense`, filename, queryParams);
  }

  // Generator Maintenance Report
  async generateGeneratorMaintenanceReport(params: ReportRequest): Promise<void> {
    const { format, period, startDate, endDate } = params;
    const queryParams: Record<string, any> = { format };

    if (period && period !== 'custom') {
      queryParams.period = period;
    } else if (startDate && endDate) {
      queryParams.startDate = startDate;
      queryParams.endDate = endDate;
    }

    const filename = `generator_maintenance_${new Date().toISOString().split('T')[0]}.${format}`;
    await api.download(`${this.baseUrl}/generator-maintenance`, filename, queryParams);
  }
}

export const reportService = new ReportService();
export default reportService;