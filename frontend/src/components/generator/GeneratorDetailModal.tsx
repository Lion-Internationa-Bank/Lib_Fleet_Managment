import React, { useEffect } from 'react';
import { 
  X, Calendar, Zap, MapPin, DollarSign, 
  Clock, Info, Gauge, Hash, Tag, Building,
  Wrench, Activity
} from 'lucide-react';
import { Generator, getStatusColor, formatCurrency, formatDateTime, formatNumber } from '../../types/Generator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  generator: Generator | null;
}

const GeneratorDetailModal: React.FC<Props> = ({ isOpen, onClose, generator }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !generator) return null;

  const statusColor = getStatusColor(generator.status);

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
      <Icon size={18} className="text-blue-600" />
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
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <Zap size={24} />
            <div>
              <h2 className="text-xl font-semibold">Generator Details</h2>
              <p className="text-sm text-blue-100">{generator.serial_no}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-blue-500 rounded-full transition-colors"
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
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Zap size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{generator.serial_no}</p>
                    <p className="text-sm text-gray-500">{generator.capacity} kVA</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColor}`}>
                  {generator.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <Gauge size={16} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Hour Meter</p>
                  <p className="text-sm font-medium">{formatNumber(generator.current_hour_meter)} hrs</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <MapPin size={16} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Allocation</p>
                  <p className="text-sm font-medium truncate">{generator.allocation}</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <SectionDivider title="Basic Information" icon={Hash} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Hash} label="Generator ID" value={generator._id} />
              <InfoRow icon={Tag} label="Serial Number" value={generator.serial_no} />
              <InfoRow icon={Activity} label="Capacity" value={`${generator.capacity} kVA`} />
              <InfoRow icon={Building} label="Engine Brand" value={generator.engine_brand} />
              <InfoRow icon={MapPin} label="Location" value={generator.location} />
              <InfoRow icon={MapPin} label="Allocation" value={generator.allocation} />
            </div>

            {/* Status & Hour Meter */}
            <SectionDivider title="Status & Usage" icon={Gauge} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Info} label="Status" value={generator.status} />
              <InfoRow icon={Gauge} label="Current Hour Meter" value={`${formatNumber(generator.current_hour_meter)} hrs`} />
            </div>

            {/* Financial Information */}
            <SectionDivider title="Financial Information" icon={DollarSign} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={DollarSign} label="Acquisition Cost" value={formatCurrency(generator.acquisition_cost)} />
              <InfoRow icon={Calendar} label="Acquisition Date" value={generator.acquisition_date ? formatDateTime(generator.acquisition_date) : 'Not specified'} />
            </div>

            {/* Service Information */}
            <SectionDivider title="Service Information" icon={Wrench} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Calendar} label="Last Service Date" value={generator.last_service_date ? formatDateTime(generator.last_service_date) : 'Not specified'} />
              <InfoRow icon={Calendar} label="Next Service Date" value={generator.next_service_date ? formatDateTime(generator.next_service_date) : 'Not specified'} />
            </div>

            {/* System Information */}
            <SectionDivider title="System Information" icon={Clock} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Clock} label="Created At" value={formatDateTime(generator.createdAt)} />
              <InfoRow icon={Clock} label="Updated At" value={formatDateTime(generator.updatedAt)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default GeneratorDetailModal;