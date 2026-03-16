import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { AccidentFilterParams, ACCIDENT_INTENSITY_OPTIONS, RESPONSIBLE_PARTY_OPTIONS } from '../../types/Accident';

interface Props {
  onFilter: (filters: AccidentFilterParams) => void;
  initialFilters?: AccidentFilterParams;
}

const AccidentFilters: React.FC<Props> = ({ 
  onFilter, 
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState<AccidentFilterParams>({
    plate_no: '',
    accident_intensity: '',
    responsible_for_accident: '',
    start_date: '',
    end_date: '',
    ...initialFilters
  });

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters
      }));
    }
  }, [initialFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        acc[key as keyof AccidentFilterParams] = value;
      }
      return acc;
    }, {} as AccidentFilterParams);
    
    onFilter(cleanedFilters);
  };

  const handleReset = () => {
    const emptyFilters = {
      plate_no: '',
      accident_intensity: '',
      responsible_for_accident: '',
      start_date: '',
      end_date: '',
    };
    setFilters(emptyFilters);
    onFilter({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== undefined);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <Search size={20} />
          <span className="font-medium">Filter Accident Records</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-red-600 hover:text-red-800 flex items-center"
          >
            <X size={16} className="mr-1" />
            Clear Filters
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Plate Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plate Number
            </label>
            <input
              type="text"
              name="plate_no"
              value={filters.plate_no || ''}
              onChange={handleChange}
              placeholder="Search by plate..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          {/* Accident Intensity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accident Intensity
            </label>
            <select
              name="accident_intensity"
              value={filters.accident_intensity || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Intensities</option>
              {ACCIDENT_INTENSITY_OPTIONS.map(intensity => (
                <option key={intensity} value={intensity}>{intensity}</option>
              ))}
            </select>
          </div>

          {/* Responsible Party */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsible Party
            </label>
            <select
              name="responsible_for_accident"
              value={filters.responsible_for_accident || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Parties</option>
              {RESPONSIBLE_PARTY_OPTIONS.map(party => (
                <option key={party} value={party}>{party}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accident Date From
            </label>
            <input
              type="date"
              name="start_date"
              value={filters.start_date || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accident Date To
            </label>
            <input
              type="date"
              name="end_date"
              value={filters.end_date || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccidentFilters;