import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Plus, MoreVertical, Edit, Eye, RefreshCw, Building,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Calendar, Clock, AlertTriangle, CheckCircle
} from 'lucide-react';
import agreementService from '../../services/agreement.service';
import { 
  MaintenanceAgreement, 
  AgreementFormData,
  AgreementFilterParams,
  PaginationInfo,
  formatDate,
  getExpiryStatus,
  calculateDaysRemaining
} from '../../types/Agreement';
import AgreementFilters from '../../components/agreement/AgreementFilters';
import AgreementModal from '../../components/agreement/AgreementModal';
import AgreementDetailModal from '../../components/agreement/AgreementDetailModal';

const MaintenanceAgreements: React.FC = () => {
  const [agreements, setAgreements] = useState<MaintenanceAgreement[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<MaintenanceAgreement | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewingAgreement, setViewingAgreement] = useState<MaintenanceAgreement | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    totalPages: 1,
    total: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const [activeFilters, setActiveFilters] = useState<AgreementFilterParams>({});
  const [queryParams, setQueryParams] = useState<AgreementFilterParams>({
    page: 1,
    limit: 20,
    sort: '-contract_expiry_date'
  });
  
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAgreements();
  }, [queryParams, activeFilters]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const params = {
        ...queryParams,
        ...activeFilters
      };
      const response = await agreementService.getAgreements(params);
      setAgreements(response.data);
      setPagination(response.pagination);
      setTotal(response.total);
    } catch (error) {
      toast.error('Failed to fetch agreements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: AgreementFormData) => {
    try {
      await agreementService.createAgreement(data);
      toast.success('Agreement created successfully');
      fetchAgreements();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create agreement';
      toast.error(message);
      throw error;
    }
  };

  const handleUpdate = async (data: AgreementFormData) => {
    if (!selectedAgreement) return;
    try {
      await agreementService.updateAgreement(selectedAgreement._id, data);
      toast.success('Agreement updated successfully');
      fetchAgreements();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update agreement';
      toast.error(message);
      throw error;
    }
  };

  const handleFilter = (newFilters: AgreementFilterParams) => {
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
    setSelectedAgreement(null);
    setModalOpen(true);
  };

  const openEditModal = (agreement: MaintenanceAgreement) => {
    setSelectedAgreement(agreement);
    setModalOpen(true);
    setOpenDropdownId(null);
  };

  const openDetailModal = (agreement: MaintenanceAgreement) => {
    setViewingAgreement(agreement);
    setDetailModalOpen(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle size={14} className="mr-1 text-green-600" />;
      case 'Expiring Soon':
      case 'Near Expiry':
        return <Clock size={14} className="mr-1 text-yellow-600" />;
      case 'Expired':
        return <AlertTriangle size={14} className="mr-1 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Agreements</h1>
          <p className="text-sm text-gray-600 mt-1">Total Records: {total}</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Agreement
        </button>
      </div>

      <AgreementFilters onFilter={handleFilter} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Renewal Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Left
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
              ) : agreements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    <Building size={40} className="mx-auto mb-2 text-gray-400" />
                    No maintenance agreements found
                  </td>
                </tr>
              ) : (
                agreements.map((agreement) => {
                  const expiryStatus = getExpiryStatus(agreement.contract_expiry_date);
                  const daysRemaining = calculateDaysRemaining(agreement.contract_expiry_date);
                  
                  return (
                    <tr key={agreement._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <Building size={16} className="mr-2 text-gray-400" />
                          {agreement.service_provider}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {formatDate(agreement.contract_renewal_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1 text-gray-400" />
                          {formatDate(agreement.contract_expiry_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {agreement.new_contract_date ? (
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1 text-gray-400" />
                            {formatDate(agreement.new_contract_date)}
                          </div>
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex items-center text-xs rounded-full ${expiryStatus.color}`}>
                          {getStatusIcon(expiryStatus.label)}
                          {expiryStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {daysRemaining >= 0 ? (
                          <span className={daysRemaining <= 30 ? 'text-red-600 font-medium' : ''}>
                            {daysRemaining} days
                          </span>
                        ) : (
                          <span className="text-red-600 font-medium">Expired</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openDetailModal(agreement)}
                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(e, agreement._id)}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
                              title="More Actions"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openDropdownId === agreement._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                <div className="py-1">
                                  <button
                                    onClick={() => openEditModal(agreement)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  >
                                    <Edit size={16} className="mr-2" />
                                    Edit Agreement
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
                className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:ring-2 focus:ring-green-500"
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

      <AgreementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={selectedAgreement ? handleUpdate : handleCreate}
        agreement={selectedAgreement}
        title={selectedAgreement ? 'Edit Agreement' : 'Add New Agreement'}
      />

      <AgreementDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setViewingAgreement(null);
        }}
        agreement={viewingAgreement}
      />
    </div>
  );
};

export default MaintenanceAgreements;