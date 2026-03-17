import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Plus, MoreVertical, Edit, Eye, RefreshCw, Zap,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MapPin, Gauge,
} from 'lucide-react';
import generatorService from '../services/generator.service';
import { 
  Generator, 
  GeneratorFormData,
  GeneratorFilterParams,
  PaginationInfo,
  getStatusColor,
  formatDate,
  formatNumber
} from '../types/Generator';
import GeneratorFilters from '../components/generator/GeneratorFilters';
import GeneratorModal from '../components/generator/GeneratorModal';
import GeneratorDetailModal from '../components/generator/GeneratorDetailModal';

const Generators: React.FC = () => {
  const [generators, setGenerators] = useState<Generator[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGenerator, setSelectedGenerator] = useState<Generator | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingGenerator, setViewingGenerator] = useState<Generator | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  
  const [activeFilters, setActiveFilters] = useState<GeneratorFilterParams>({});
  const [queryParams, setQueryParams] = useState<GeneratorFilterParams>({
    page: 1,
    limit: 20,
    sort: 'serial_no'
  });
  
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchGenerators();
  }, [queryParams, activeFilters]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchGenerators = async () => {
    try {
      setLoading(true);
      const params = {
        ...queryParams,
        ...activeFilters
      };
      const response = await generatorService.getGenerators(params);
      setGenerators(response.data);
      setPagination(response.pagination);
      setTotal(response.total);
    } catch (error) {
      toast.error('Failed to fetch generators');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: GeneratorFormData) => {
    try {
      await generatorService.createGenerator(data);
      toast.success('Generator created successfully');
      fetchGenerators();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create generator';
      toast.error(message);
      throw error;
    }
  };

  const handleUpdate = async (data: GeneratorFormData) => {
    if (!selectedGenerator) return;
    try {
      await generatorService.updateGenerator(selectedGenerator._id, data);
      toast.success('Generator updated successfully');
      fetchGenerators();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update generator';
      toast.error(message);
      throw error;
    }
  };

  const handleFilter = (newFilters: GeneratorFilterParams) => {
    setActiveFilters(newFilters);
    setQueryParams(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    setQueryParams(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const openCreateModal = () => {
    setSelectedGenerator(null);
    setModalOpen(true);
  };

  const openEditModal = (generator: Generator) => {
    setSelectedGenerator(generator);
    setModalOpen(true);
    setOpenDropdownId(null);
  };

  const openDetailModal = (generator: Generator) => {
    setViewingGenerator(generator);
    setDetailModalOpen(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generators</h1>
          <p className="text-sm text-gray-600 mt-1">Total Records: {total}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Generator
        </button>
      </div>

      <GeneratorFilters onFilter={handleFilter} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allocation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hour Meter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw size={20} className="animate-spin mr-2" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : generators.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    <Zap size={40} className="mx-auto mb-2 text-gray-400" />
                    No generators found
                  </td>
                </tr>
              ) : (
                generators.map((generator) => {
                  const statusColor = getStatusColor(generator.status);
                  
                  return (
                    <tr key={generator._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {generator.serial_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {generator.capacity} kVA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin size={14} className="mr-1 text-gray-400" />
                          {generator.allocation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Gauge size={14} className="mr-1 text-gray-400" />
                          {formatNumber(generator.current_hour_meter)} hrs
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                          {generator.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {generator.next_service_date ? formatDate(generator.next_service_date) : 'Not scheduled'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDetailModal(generator)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(e, generator._id)}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
                              title="More Actions"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openDropdownId === generator._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => openEditModal(generator)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  >
                                    <Edit size={16} className="mr-2" />
                                    Edit Generator
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Show</span>
              <select
                value={queryParams.limit}
                onChange={handleLimitChange}
                className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-700">entries</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrev}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="text-sm text-gray-700 px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNext}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <GeneratorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedGenerator ? handleUpdate : handleCreate}
        generator={selectedGenerator}
        title={selectedGenerator ? 'Edit Generator' : 'Add New Generator'}
      />

      <GeneratorDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setViewingGenerator(null);
        }}
        generator={viewingGenerator}
      />
    </div>
  );
};

export default Generators;