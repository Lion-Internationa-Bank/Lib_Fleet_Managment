import React, { useEffect } from 'react';
import { 
  X, Calendar, Zap, FileText, Wrench, DollarSign, 
  User, Clock, Gauge, Activity, MapPin, Hash
} from 'lucide-react';
import { GeneratorService } from '../../types/Generator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: GeneratorService | null;
}

const GeneratorServiceDetailModal: React.FC<Props> = ({ isOpen, onClose, record }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !record) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return `ETB ${value.toFixed(2)}`;
  };

  const formatNumber = (value: number) => {
    return value?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
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

  // Helper function to get generator info safely
  const getGeneratorInfo = () => {
    if (typeof record.generatorId === 'object' && record.generatorId !== null) {
      return {
        id: record.generatorId._id,
        serial_no: record.generatorId.serial_no,
        capacity: record.generatorId.capacity,
        allocation: record.generatorId.allocation
      };
    }
    return {
      id: '',
      serial_no: 'N/A',
      capacity: 0,
      allocation: record.allocation || 'N/A'
    };
  };

  const generatorInfo = getGeneratorInfo();

  const InfoRow = ({ icon: Icon, label, value, className = '' }: any) => (
    <div className={`flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors ${className}`}>
      <Icon size={18} className="text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5 break-words">{value || 'Not specified'}</p>
      </div>
    </div>
  );

  const SectionDivider = ({ title, icon: Icon }: any) => (
    <div className="flex items-center space-x-2 my-4">
      <Icon size={18} className="text-purple-600" />
      <h3 className="text-md font-semibold text-gray-800">{title}</h3>
      <div className="flex-1 h-px bg-gray-200 ml-2" />
    </div>
  );

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <Zap size={24} />
            <div>
              <h2 className="text-xl font-semibold">Generator Service Details</h2>
              <p className="text-sm text-purple-100">Service Record</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-purple-500 rounded-full transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto pb-24">
          <div className="p-6 space-y-4">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Zap size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{generatorInfo.serial_no}</p>
                    <p className="text-sm text-gray-500">{generatorInfo.capacity} kVA</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getMaintenanceTypeColor(record.maintenance_type)}`}>
                    {record.maintenance_type}
                  </span>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <DollarSign size={16} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Cost</p>
                  <p className="text-sm font-medium">{formatCurrency(record.cost)}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <MapPin size={16} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Allocation</p>
                  <p className="text-sm font-medium truncate">{generatorInfo.allocation}</p>
                </div>
              </div>
            </div>

            {/* Generator Information */}
            <SectionDivider title="Generator Information" icon={Hash} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Hash} label="Generator ID" value={generatorInfo.id} />
              <InfoRow icon={Zap} label="Serial Number" value={generatorInfo.serial_no} />
              <InfoRow icon={Activity} label="Capacity" value={`${generatorInfo.capacity} kVA`} />
              <InfoRow icon={MapPin} label="Allocation" value={generatorInfo.allocation} />
            </div>

            {/* Service Information */}
            <SectionDivider title="Service Information" icon={Wrench} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Gauge} label="Hour Meter Reading" value={`${formatNumber(record.hour_meter_reading)} hrs`} />
              <InfoRow icon={Activity} label="Next Service Hour" value={`${formatNumber(record.next_service_hour)} hrs`} />
              <InfoRow icon={User} label="Service Provider" value={record.service_provider} />
            </div>

            {/* Date Information */}
            <SectionDivider title="Date Information" icon={Calendar} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Clock} label="Service Date" value={formatDate(record.service_date)} />
              <InfoRow icon={Clock} label="Created At" value={formatDate(record.createdAt)} />
              <InfoRow icon={Clock} label="Updated At" value={formatDate(record.updatedAt)} />
            </div>

            {/* Description */}
            <SectionDivider title="Description" icon={FileText} />
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{record.description || 'No description provided'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default GeneratorServiceDetailModal;