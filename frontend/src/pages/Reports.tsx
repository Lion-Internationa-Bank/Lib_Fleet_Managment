import React, { useState } from 'react';
import { 
  FileText, Filter, 
  ChevronDown, ChevronUp, Info 
} from 'lucide-react';
import reportService from '../services/report.service';
import { REPORT_TYPES, ReportOption } from '../types/Reports';
import ReportCard from '../components/reports/ReportCard';

const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter reports based on search and type
  const filteredReports = REPORT_TYPES.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || report.id === selectedType;
    return matchesSearch && matchesType;
  });

  const handleGenerateReport = async (report: ReportOption, params: any) => {
    try {
      switch (report.id) {
        case 'foreclosed':
          await reportService.generateForeclosedReport(params);
          break;
        case 'accident':
          await reportService.generateAccidentReport(params);
          break;
        case 'maintenance':
          await reportService.generateMaintenanceReport(params);
          break;
        case 'maintenance-type':
          await reportService.generateMaintenanceTypeReport(params);
          break;
        case 'maintenance-jacket':
          await reportService.generateMaintenanceJacket(params.plateNo, params.format);
          break;
        case 'fuel-expense':
          await reportService.generateFuelExpenseReport(params);
          break;
        case 'generator-maintenance':
          await reportService.generateGeneratorMaintenanceReport(params);
          break;
        default:
          throw new Error('Unknown report type');
      }
    } catch (error: any) {
      console.error('Report generation error:', error);
      throw error;
    }
  };



  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileText className="mr-3 text-blue-600" size={32} />
          Reports Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Generate comprehensive reports in Excel, PDF, or Word format
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600">{REPORT_TYPES.length}</div>
          <div className="text-sm text-gray-600 mt-1">Total Reports</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-600 mt-1">Export Formats</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-purple-600">
            {REPORT_TYPES.filter(r => r.requiresDateRange).length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Date Range Reports</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-orange-600">
            {REPORT_TYPES.filter(r => r.requiresPlateNo).length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Vehicle Specific</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full px-6 py-4 flex items-center justify-between text-left"
        >
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <span className="font-medium text-gray-700">Filters & Search</span>
          </div>
          {showFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showFilters && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Reports
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Reports</option>
                  {REPORT_TYPES.map(report => (
                    <option key={report.id} value={report.id}>{report.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Info size={48} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              onGenerate={(params) => handleGenerateReport(report, params)}
            />
          ))}
        </div>
      )}

      {/* Information Footer */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-800">About Reports</h4>
            <p className="text-sm text-blue-700 mt-1">
              All reports can be generated in Excel, PDF, or Word format. 
              Date range reports support predefined periods (Monthly, Quarterly, etc.) or custom date ranges.
              Vehicle-specific reports require a plate number input.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;