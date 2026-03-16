import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Plus, MoreVertical, Edit, Eye, RefreshCw, Zap,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import generatorService from '../../services/generator.service';
import { 
  GeneratorService, 
  GeneratorServiceFormData,
  GeneratorServiceFilterParams,
  PaginationInfo
} from '../../types/Generator';
import GeneratorServiceFilters from '../../components/generator/GeneratorServiceFilters';
import GeneratorServiceModal from '../../components/generator/GeneratorServiceModal';
import GeneratorServiceDetailModal from '../../components/generator/GeneratorServiceDetailModal';

const GeneratorServiceRecords: React.FC = () => {
  const [records, setRecords] = useState<GeneratorService[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GeneratorService | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingRecord, setViewingRecord] = useState<GeneratorService | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  
  const [activeFilters, setActiveFilters] = useState<GeneratorServiceFilterParams>({});
  const [queryParams, setQueryParams] = useState<GeneratorServiceFilterParams>({
    page: 1,
    limit: 20,
    sort: '-service_date'
  });
  
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRecords();
  }, [queryParams, activeFilters]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = {
        ...queryParams,
        ...activeFilters
      };
      const response = await generatorService.getRecords(params);
      setRecords(response.data);
      setPagination(response.pagination);
      setTotal(response.total);
    } catch (error) {
      toast.error('Failed to fetch service records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: GeneratorServiceFormData) => {
    try {
      await generatorService.createRecord(data);
      toast.success('Service record created successfully');
      fetchRecords();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create record';
      toast.error(message);
      throw error;
    }
  };

  const handleUpdate = async (data: GeneratorServiceFormData) => {
    if (!selectedRecord) return;
    try {
      // Remove generatorSerialNo from update data since it shouldn't be updated
      const { generatorSerialNo, ...updateData } = data;
      await generatorService.updateRecord(selectedRecord._id, updateData);
      toast.success('Service record updated successfully');
      fetchRecords();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update record';
      toast.error(message);
      throw error;
    }
  };

  const handleFilter = (newFilters: GeneratorServiceFilterParams) => {
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
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const openEditModal = (record: GeneratorService) => {
    setSelectedRecord(record);
    setModalOpen(true);
    setOpenDropdownId(null);
  };

  const openDetailModal = (record: GeneratorService) => {
    setViewingRecord(record);
    setDetailModalOpen(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return `ETB ${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    return value?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // Helper function to safely get generator serial number
  const getGeneratorSerial = (record: GeneratorService): string => {
    if (!record.generatorId) return 'N/A';
    if (typeof record.generatorId === 'object') {
      return record.generatorId.serial_no || 'N/A';
    }
    return 'N/A';
  };

  // Helper function to safely get generator capacity
  const getGeneratorCapacity = (record: GeneratorService): number => {
    if (!record.generatorId) return 0;
    if (typeof record.generatorId === 'object') {
      return record.generatorId.capacity || 0;
    }
    return 0;
  };

  const getMaintenanceTypeColor = (type: string) => {
    switch (type) {
      case 'Preventive': return 'bg-green-100 text-green-800';
      case 'Corrective': return 'bg-yellow-100 text-yellow-800';
      case 'Breakdown': return 'bg-red-100 text-red-800';
      case 'Body & Paint': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational': return 'bg-green-100 text-green-800';
      case 'Under Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Faulty': return 'bg-red-100 text-red-800';
      case 'Decommissioned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generator Service Records</h1>
          <p className="text-sm text-gray-600 mt-1">Total Records: {total}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Service Record
        </button>
      </div>

      <GeneratorServiceFilters onFilter={handleFilter} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generator Serial
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hour Meter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw size={20} className="animate-spin mr-2" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                    <Zap size={40} className="mx-auto mb-2 text-gray-400" />
                    No service records found
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const typeColor = getMaintenanceTypeColor(record.maintenance_type);
                  const statusColor = getStatusColor(record.status);
                  
                  return (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {getGeneratorSerial(record)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getGeneratorCapacity(record)} kVA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.service_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${typeColor}`}>
                          {record.maintenance_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(record.hour_meter_reading)} hrs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(record.next_service_hour)} hrs
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(record.cost)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${statusColor}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.service_provider}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDetailModal(record)}
                            className="text-purple-600 hover:text-purple-800 p-1 rounded-full hover:bg-purple-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(e, record._id)}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
                              title="More Actions"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openDropdownId === record._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => openEditModal(record)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  >
                                    <Edit size={16} className="mr-2" />
                                    Edit Record
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
                className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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

      <GeneratorServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedRecord ? handleUpdate : handleCreate}
        record={selectedRecord}
        title={selectedRecord ? 'Edit Service Record' : 'Add New Service Record'}
      />

      <GeneratorServiceDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setViewingRecord(null);
        }}
        record={viewingRecord}
      />
    </div>
  );
};

export default GeneratorServiceRecords;