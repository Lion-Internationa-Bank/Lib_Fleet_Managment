import React, { useEffect } from 'react';
import { 
  X, Calendar, Truck, FileText, Wrench, DollarSign, 
  MapPin, User, Clock, Info, Tag, ClipboardList
} from 'lucide-react';
import { VehicleMaintenance, getMaintenanceTypeColor } from '../../types/Maintenance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: VehicleMaintenance | null;
}

const VehicleMaintenanceDetailModal: React.FC<Props> = ({ isOpen, onClose, record }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !record) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Not specified';
    return `ETB ${value.toFixed(2)}`;
  };

  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Not specified';
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const InfoRow = ({ icon: Icon, label, value, className = '' }: any) => (
    <div className={`flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg ${className}`}>
      <Icon size={18} className="text-gray-500 mt-0.5" />
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
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

  const typeColor = getMaintenanceTypeColor(record.maintenance_type);

  return (
    <>
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-40 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-white shadow-2xl transform transition-transform duration-300 z-50 overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Wrench size={24} />
            <div>
              <h2 className="text-xl font-semibold">Maintenance Details</h2>
              <p className="text-sm text-blue-100">Invoice: {record.invoice_no}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-blue-500 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="h-full overflow-y-auto pb-24">
          <div className="p-6 space-y-4">
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Truck size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{record.plate_no}</p>
                    <p className="text-sm text-gray-500">{record.vehicle_type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${typeColor}`}>
                  {record.maintenance_type}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <DollarSign size={16} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Total Cost</p>
                  <p className="text-sm font-medium">{formatCurrency(record.total_cost)}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <MapPin size={16} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium truncate">{record.location}</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <SectionDivider title="Basic Information" icon={FileText} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Tag} label="Invoice Number" value={record.invoice_no} />
              <InfoRow icon={Wrench} label="Workshop" value={record.workshop_name || 'Not specified'} />
              <InfoRow icon={User} label="Costed By" value={record.costed_by || 'Not specified'} />
              <InfoRow icon={Truck} label="KM at Service" value={`${formatNumber(record.km_at_service)} km`} />
            </div>

            {/* Dates Section */}
            <SectionDivider title="Service Dates" icon={Calendar} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Clock} label="Date In" value={formatDate(record.date_in)} />
              <InfoRow icon={Clock} label="Date Out" value={formatDate(record.date_out)} />
            </div>

            {/* Financial Summary */}
            <SectionDivider title="Financial Summary" icon={DollarSign} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={DollarSign} label="Labour Cost" value={formatCurrency(record.labour_cost)} />
              <InfoRow icon={DollarSign} label="Spare Parts Cost" value={formatCurrency(record.spare_cost)} />
              <InfoRow icon={DollarSign} label="Total Cost" value={formatCurrency(record.total_cost)} className="col-span-2 bg-blue-50 rounded-lg" />
              {record.km_diff && (
                <>
                  <InfoRow icon={Truck} label="KM Difference" value={`${formatNumber(record.km_diff)} km`} />
                  <InfoRow icon={DollarSign} label="Cost per KM" value={formatCurrency(record.cost_per_km)} />
                </>
              )}
            </div>

            {/* Spare Parts */}
            <SectionDivider title="Spare Parts & Services" icon={ClipboardList} />
            {record.spare_part && record.spare_part.length > 0 ? (
              <div className="space-y-3">
                {record.spare_part.map((part, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">{part.part}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {part.service_type}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p className="text-gray-600">Cost: <span className="font-medium">{formatCurrency(part.cost)}</span></p>
                      <p className="text-gray-600">Provider: <span className="font-medium">{part.service_provider}</span></p>
                      <p className="text-gray-600">Inspected By: <span className="font-medium">{part.inspected_by}</span></p>
                      <p className="text-gray-600">Mileage: <span className="font-medium">{formatNumber(part.mileage)} km</span></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No spare parts recorded</p>
            )}

            {/* Remark */}
            {record.remark && (
              <>
                <SectionDivider title="Remark" icon={Info} />
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700">{record.remark}</p>
                </div>
              </>
            )}

            {/* Metadata */}
            <SectionDivider title="System Information" icon={Clock} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Calendar} label="Created At" value={formatDate(record.createdAt)} />
              <InfoRow icon={Calendar} label="Updated At" value={formatDate(record.updatedAt)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VehicleMaintenanceDetailModal;