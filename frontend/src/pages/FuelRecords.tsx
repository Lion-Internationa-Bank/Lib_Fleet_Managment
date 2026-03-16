import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Plus, MoreVertical, Edit, RefreshCw, Fuel, 
  TrendingDown, TrendingUp, Minus, ChevronLeft, 
  ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import fuelService from '../services/FuelRecord.service';
import { 
  FuelRecord, 
  FuelRecordFormData,
  FuelFilterParams,
  PaginationInfo,
  getFuelConsumptionStatus,
} from '../types/FuelRecord';
import FuelModal from '../components/fuel/FuelRecordModal';
import FuelFilters from '../components/fuel/FuelRecordFilters';
const FuelRecords: React.FC = () => {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FuelRecord | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  });
  
  const [activeFilters, setActiveFilters] = useState<FuelFilterParams>({});
  const [queryParams, setQueryParams] = useState<FuelFilterParams>({
    page: 1,
    limit: 20,
    sort: '-starting_date'
  });
  
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchRecords();
  }, [queryParams]);

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
      const response = await fuelService.getRecords(params);
      

      setRecords(response.data);
      setPagination(response.pagination);
      setTotal(response.total);
    } catch (error) {
      toast.error('Failed to fetch fuel records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: FuelRecordFormData) => {
    try {
      await fuelService.createRecord(data);
      toast.success('Fuel record created successfully');
      fetchRecords();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create record';
      toast.error(message);
      throw error;
    }
  };

  const handleUpdate = async (data: FuelRecordFormData) => {
    if (!selectedRecord) return;
    try {
      await fuelService.updateRecord(selectedRecord._id, data);
      toast.success('Fuel record updated successfully');
      fetchRecords();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update record';
      toast.error(message);
      throw error;
    }
  };

  const handleFilter = (newFilters: FuelFilterParams) => {
    setActiveFilters(newFilters);
    setQueryParams(prev => ({
      ...prev,
      page: 1
    }));
  };

  const handlePageChange = (newPage: number) => {
    setQueryParams(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLimit = Number(e.target.value);
    setQueryParams(prev => ({
      ...prev,
      limit: newLimit,
      page: 1
    }));
  };

  const openCreateModal = () => {
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const openEditModal = (record: FuelRecord) => {
    setSelectedRecord(record);
    setModalOpen(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getStatus = (record: FuelRecord) => {
    return record.ending_km ? 'Completed' : 'Active';
  };

  const getStatusBadgeClass = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getConsumptionIcon = (status: string) => {
    switch (status) {
      case 'Low Consumption':
        return <TrendingDown size={14} className="mr-1" />;
      case 'High Consumption':
        return <TrendingUp size={14} className="mr-1" />;
      default:
        return <Minus size={14} className="mr-1" />;
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const currentPage = pagination.page;
    const totalPages = pagination.totalPages;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1); // Ellipsis
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuel Records</h1>
          <p className="text-sm text-gray-600 mt-1">Total Records: {total}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Fuel Record
        </button>
      </div>

      <FuelFilters onFilter={handleFilter} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plate No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Starting KM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fuel (Birr)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Liters
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ending KM
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KM Diff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  KM/L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw size={20} className="animate-spin mr-2" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-4 text-center text-gray-500">
                    <Fuel size={40} className="mx-auto mb-2 text-gray-400" />
                    No fuel records found
                  </td>
                </tr>
              ) : (
                records.map((record) => {
                  const status = getStatus(record);
                  const consumptionStatus = record.km_per_lit 
                    ? getFuelConsumptionStatus(record.km_per_lit) 
                    : { label: 'N/A', color: 'bg-gray-100 text-gray-800' };
                  
                  return (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.plate_no}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(record.starting_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(record.starting_km)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(record.fuel_in_birr)} Birr
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatNumber(record.liter_used)} L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.fuel_usage_type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.ending_km ? formatNumber(record.ending_km) : 'Pending'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.km_diff ? formatNumber(record.km_diff) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.km_per_lit ? (
                          <div className="flex items-center">
                            <span className={`px-2 py-1 inline-flex items-center text-xs leading-4 font-semibold rounded-full ${consumptionStatus.color}`}>
                              {getConsumptionIcon(consumptionStatus.label)}
                              {formatNumber(record.km_per_lit)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                        <button
                          onClick={(e) => toggleDropdown(e, record._id)}
                          className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {openDropdownId === record._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                            <div className="py-1">
                              <button
                                onClick={() => openEditModal(record)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit size={16} className="mr-2" />
                                Edit Record
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Show</label>
                <select
                  value={queryParams.limit || 20}
                  onChange={handleLimitChange}
                  className="border border-gray-300 rounded-md text-sm px-2 py-1"
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
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="flex items-center space-x-1">
                  {getPageNumbers().map((pageNum, idx) => (
                    pageNum === -1 ? (
                      <span key={`ellipsis-${idx}`} className="px-3 py-2 text-sm text-gray-500">...</span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium ${
                          pagination.page === pageNum
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNext}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>
              </div>

              <div className="text-sm text-gray-700">
                Page <span className="font-medium">{pagination.page}</span> of{' '}
                <span className="font-medium">{pagination.totalPages}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <FuelModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedRecord ? handleUpdate : handleCreate}
        record={selectedRecord}
        title={selectedRecord ? 'Edit Fuel Record' : 'Add New Fuel Record'}
      />
    </div>
  );
};

export default FuelRecords;