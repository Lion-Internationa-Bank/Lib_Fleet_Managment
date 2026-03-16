import React, { useEffect } from 'react';
import { 
  X, Calendar, User, MapPin, Car, AlertTriangle, 
  DollarSign, Clock, Shield, Wrench, FileText,
 Info,  Gavel,CalendarClock, } from 'lucide-react';
import { Accident, getIntensityBadgeColor } from '../../types/Accident';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: Accident | null;
}

const AccidentDetailModal: React.FC<Props> = ({ isOpen, onClose, record }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
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

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(value);
  };

  const InfoRow = ({ icon: Icon, label, value, className = '' }: { icon: any, label: string, value: string | number | null, className?: string }) => (
    <div className={`flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors ${className}`}>
      <div className="flex-shrink-0 mt-0.5">
        <Icon size={18} className="text-gray-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5 break-words">{value || 'Not specified'}</p>
      </div>
    </div>
  );

  const SectionDivider = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center space-x-2 my-4">
      <Icon size={18} className="text-blue-600" />
      <h3 className="text-md font-semibold text-gray-800">{title}</h3>
      <div className="flex-1 h-px bg-gray-200 ml-2"></div>
    </div>
  );

  const intensityColor = getIntensityBadgeColor(record.accident_intensity);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Modal - Slides from right */}
      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-1/2 lg:w-2/5 bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 overflow-hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 flex justify-between items-center z-10">
          <div className="flex items-center space-x-3">
            <AlertTriangle size={24} />
            <div>
              <h2 className="text-xl font-semibold">Accident Details</h2>
              <p className="text-sm text-blue-100">ID: {record._id.slice(-8)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto pb-24">
          <div className="p-6 space-y-4">
            {/* Vehicle & Driver Info - Summary Card */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Car size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{record.plate_no}</p>
                    <p className="text-sm text-gray-500">{record.driver_name || 'Driver not specified'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${intensityColor}`}>
                  {record.accident_intensity}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <Calendar size={16} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Accident Date</p>
                  <p className="text-sm font-medium">{formatShortDate(record.accident_date)}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <MapPin size={16} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-medium truncate">{record.accident_place || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Accident Details Section */}
            <SectionDivider title="Accident Information" icon={AlertTriangle} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Calendar} label="Accident Date & Time" value={formatDate(record.accident_date)} />
              <InfoRow icon={MapPin} label="Accident Place" value={record.accident_place} />
              <InfoRow icon={User} label="Driver Name" value={record.driver_name} />
              <InfoRow icon={Car} label="Damaged Part" value={record.damaged_part} />
              <InfoRow icon={AlertTriangle} label="Intensity" value={record.accident_intensity} />
              <InfoRow icon={Shield} label="Responsible Party" value={record.responsible_for_accident} />
            </div>

            {/* Important Dates Section */}
            <SectionDivider title="Important Dates" icon={CalendarClock} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Calendar} label="Notified Insurance" value={formatDate(record.date_notified_insurance)} />
              <InfoRow icon={FileText} label="Police Report" value={formatDate(record.date_police_report)} />
              <InfoRow icon={Shield} label="Insurance Surveyor" value={formatDate(record.date_insurance_surveyor)} />
              <InfoRow icon={Gavel} label="Auction Date" value={formatDate(record.date_auction)} />
              <InfoRow icon={Wrench} label="Into Garage" value={formatDate(record.date_into_garage)} />
              <InfoRow icon={Car} label="Out of Garage" value={formatDate(record.date_out_garage)} />
            </div>

            {/* Financial Information Section */}
            <SectionDivider title="Financial Information" icon={DollarSign} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={DollarSign} label="Risk Base Price" value={formatCurrency(record.risk_base_price)} />
              <InfoRow icon={DollarSign} label="Old Age Contribution" value={formatCurrency(record.old_age_contribution)} />
              <InfoRow icon={DollarSign} label="Total Cost" value={formatCurrency(record.total)} />
            </div>

            {/* Status & Actions Section */}
            <SectionDivider title="Status & Actions" icon={FileText} />
            <div className="space-y-1 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Info} label="Current Situation" value={record.current_situation} />
              <InfoRow icon={FileText} label="Action Taken" value={record.action_taken} className="border-t border-gray-200 pt-3 mt-1" />
            </div>

            {/* Metadata Section */}
            <SectionDivider title="System Information" icon={Clock} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Calendar} label="Created At" value={formatDate(record.createdAt)} />
              <InfoRow icon={Calendar} label="Updated At" value={formatDate(record.updatedAt)} />
            </div>
          </div>
        </div>

    
      </div>
    </>
  );
};

export default AccidentDetailModal;