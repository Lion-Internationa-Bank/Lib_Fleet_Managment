import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { GeneratorFilterParams, GENERATOR_STATUS_OPTIONS } from '../../types/Generator';

interface Props {
  onFilter: (filters: GeneratorFilterParams) => void;
  initialFilters?: GeneratorFilterParams;
}

const GeneratorFilters: React.FC<Props> = ({ onFilter, initialFilters = {} }) => {
  const [filters, setFilters] = useState<GeneratorFilterParams>({
    serial_no: '',
    location: '',
    allocation: '',
    engine_brand: '',
    status: '',
    capacity_min: undefined,
    capacity_max: undefined,
    ...initialFilters
  });

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ 
      ...prev, 
      [name]: value ? Number(value) : undefined 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        acc[key as keyof GeneratorFilterParams] = value;
      }
      return acc;
    }, {} as GeneratorFilterParams);
    
    onFilter(cleanedFilters);
  };

  const handleReset = () => {
    setFilters({
      serial_no: '',
      location: '',
      allocation: '',
      engine_brand: '',
      status: '',
      capacity_min: undefined,
      capacity_max: undefined,
    });
    onFilter({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== '' && v !== undefined);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2 text-gray-700">
          <Search size={20} />
          <span className="font-medium">Filter Generators</span>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial Number
            </label>
            <input
              type="text"
              name="serial_no"
              value={filters.serial_no || ''}
              onChange={handleChange}
              placeholder="Search by serial no..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={filters.location || ''}
              onChange={handleChange}
              placeholder="Search by location..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allocation
            </label>
            <input
              type="text"
              name="allocation"
              value={filters.allocation || ''}
              onChange={handleChange}
              placeholder="Search by allocation..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Engine Brand
            </label>
            <input
              type="text"
              name="engine_brand"
              value={filters.engine_brand || ''}
              onChange={handleChange}
              placeholder="Search by engine brand..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status || ''}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              {GENERATOR_STATUS_OPTIONS.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Capacity (kVA)
            </label>
            <input
              type="number"
              name="capacity_min"
              value={filters.capacity_min || ''}
              onChange={handleNumberChange}
              placeholder="Min capacity"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Capacity (kVA)
            </label>
            <input
              type="number"
              name="capacity_max"
              value={filters.capacity_max || ''}
              onChange={handleNumberChange}
              placeholder="Max capacity"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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

export default GeneratorFilters;