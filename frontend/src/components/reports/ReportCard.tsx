import React, { useState } from 'react';
import { Download, Calendar, FileText,  Hash, ChevronDown } from 'lucide-react';
import { ReportOption, ReportFormat, PERIOD_OPTIONS, FORMAT_OPTIONS } from '../../types/Reports';
import { toast } from 'sonner';

interface Props {
  report: ReportOption;
  onGenerate: (params: any) => Promise<void>;
}

const ReportCard: React.FC<Props> = ({ report, onGenerate }) => {
  const [format, setFormat] = useState<ReportFormat>('excel');
  const [period, setPeriod] = useState<string>('monthly');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [plateNo, setPlateNo] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      // Validation
      if (!report.availableFormats.includes(format)) {
        toast.error(`This report doesn't support ${format.toUpperCase()} format`);
        return;
      }

      if (report.requiresPlateNo && !plateNo) {
        toast.error('Please enter a plate number');
        return;
      }

      if (report.requiresDateRange && period === 'custom' && (!startDate || !endDate)) {
        toast.error('Please select both start and end dates');
        return;
      }

      if (report.requiresDateRange && period === 'custom' && new Date(startDate) > new Date(endDate)) {
        toast.error('Start date cannot be after end date');
        return;
      }

      setLoading(true);

      const params: any = { format };
      
      if (report.requiresDateRange) {
        if (period !== 'custom') {
          params.period = period;
        } else {
          params.startDate = startDate;
          params.endDate = endDate;
        }
      }

      if (report.requiresPlateNo) {
        params.plateNo = plateNo;
        await onGenerate({ ...params, plateNo });
      } else {
        await onGenerate(params);
      }

      toast.success('Report generated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // Get a subtle accent color based on report type (very light)
  const getAccentClass = () => {
    switch (report.id) {
      case 'foreclosed':
        return 'from-blue-50 to-white';
      case 'accident':
        return 'from-red-50 to-white';
      case 'maintenance':
        return 'from-green-50 to-white';
      case 'maintenance-type':
        return 'from-purple-50 to-white';
      case 'maintenance-jacket':
        return 'from-orange-50 to-white';
      case 'fuel-expense':
        return 'from-yellow-50 to-white';
      case 'generator-maintenance':
        return 'from-indigo-50 to-white';
      default:
        return 'from-gray-50 to-white';
    }
  };

  // Get icon for selected format
  const getSelectedFormatIcon = () => {
    const option = FORMAT_OPTIONS.find(o => o.value === format);
    return option?.icon || '📄';
  };

  // Get label for selected format
  const getSelectedFormatLabel = () => {
    const option = FORMAT_OPTIONS.find(o => o.value === format);
    return option?.label || 'Excel';
  };

  return (
    <div className={`bg-gradient-to-br ${getAccentClass()} rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden`}>
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start space-x-4">
          {/* Icon - smaller and more subtle */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
              {report.icon}
            </div>
          </div>
          
          {/* Title and Description */}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {report.name}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {report.description}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Format Selection - Dropdown */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
            <FileText size={14} className="inline mr-1 text-gray-400" />
            Export Format
          </label>
          <div className="relative">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ReportFormat)}
              className="w-full appearance-none px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 pr-10"
            >
              {report.availableFormats.map((fmt) => {
                const option = FORMAT_OPTIONS.find(o => o.value === fmt);
                return (
                  <option key={fmt} value={fmt}>
                    {option?.icon} {option?.label}
                  </option>
                );
              })}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
          <div className="mt-1 text-xs text-gray-400">
            Selected: <span className="font-medium">{getSelectedFormatIcon()} {getSelectedFormatLabel()}</span>
          </div>
        </div>

        {/* Date Range Selection */}
        {report.requiresDateRange && (
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              <Calendar size={14} className="inline mr-1 text-gray-400" />
              Time Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {PERIOD_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {period === 'custom' && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500"
                    placeholder="Start"
                  />
                </div>
                <div>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500"
                    placeholder="End"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plate Number Input */}
        {report.requiresPlateNo && (
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              <Hash size={14} className="inline mr-1 text-gray-400" />
              Vehicle Plate
            </label>
            <input
              type="text"
              value={plateNo}
              onChange={(e) => setPlateNo(e.target.value.toUpperCase())}
              placeholder="e.g., ABC-123"
              className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 uppercase"
            />
          </div>
        )}

        {/* Generate Button - Blue */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full mt-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-sm"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Generate Report</span>
            </>
          )}
        </button>

        {/* Format indicators - subtle */}
        <div className="flex items-center justify-end space-x-2 pt-2">
          <span className="text-xs text-gray-400">Available in:</span>
          {report.availableFormats.map(fmt => {
            const option = FORMAT_OPTIONS.find(o => o.value === fmt);
            return (
              <span key={fmt} className="text-xs text-gray-500">
                {option?.icon} {fmt}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReportCard;