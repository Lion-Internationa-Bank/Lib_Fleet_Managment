import React, { useEffect } from 'react';
import { 
  X, Calendar, Shield, Clock, Info, 
  AlertTriangle, CheckCircle, Bell
} from 'lucide-react';
import { 
  Insurance, 
  formatDate, 
  formatDateTime,
  calculateDaysRemaining,
  getInsuranceStatus,
  getReminderStatus
} from '../../types/Insurance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  insurance: Insurance | null;
}

const InsuranceDetailModal: React.FC<Props> = ({ isOpen, onClose, insurance }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen || !insurance) return null;

  const daysRemaining = calculateDaysRemaining(insurance.insurance_expired_date);
  const insuranceStatus = getInsuranceStatus(insurance.insurance_expired_date);
  const reminderStatus = getReminderStatus(insurance.reminder_date);

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
            <Shield size={24} />
            <div>
              <h2 className="text-xl font-semibold">Insurance Details</h2>
              <p className="text-sm text-blue-100">{insurance.insurance_provider}</p>
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
                    <Shield size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{insurance.insurance_provider}</p>
                    <p className="text-sm text-gray-500">Insurance Provider</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${insuranceStatus.color}`}>
                  {insuranceStatus.label}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <Calendar size={16} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Days Remaining</p>
                  <p className="text-sm font-medium">
                    {daysRemaining >= 0 ? daysRemaining : 'Expired'}
                  </p>
                </div>
                <div className="bg-gray-100 p-2 rounded-lg text-center">
                  <Bell size={16} className="mx-auto text-gray-600 mb-1" />
                  <p className="text-xs text-gray-500">Reminder</p>
                  <p className="text-sm font-medium">
                    {reminderStatus?.label || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <SectionDivider title="Insurance Information" icon={Shield} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Shield} label="Provider" value={insurance.insurance_provider} />
              <InfoRow icon={Info} label="Policy ID" value={insurance._id} />
            </div>

            {/* Important Dates */}
            <SectionDivider title="Important Dates" icon={Calendar} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Calendar} label="Renewal Date" value={formatDate(insurance.insurance_renewal_date)} />
              <InfoRow icon={Calendar} label="Expiry Date" value={formatDate(insurance.insurance_expired_date)} />
              <InfoRow icon={Bell} label="Reminder Date" value={insurance.reminder_date ? formatDate(insurance.reminder_date) : 'Not set'} />
            </div>

            {/* Status Information */}
            <SectionDivider title="Status Information" icon={Info} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow 
                icon={daysRemaining >= 0 ? CheckCircle : AlertTriangle} 
                label="Days Until Expiry" 
                value={daysRemaining >= 0 ? `${daysRemaining} days` : 'Expired'} 
              />
              <InfoRow icon={Info} label="Insurance Status" value={insuranceStatus.label} />
              {reminderStatus && (
                <InfoRow icon={Bell} label="Reminder Status" value={reminderStatus.label} />
              )}
            </div>

            {/* System Information */}
            <SectionDivider title="System Information" icon={Clock} />
            <div className="grid grid-cols-1 md:grid-cols-2 bg-gray-50 rounded-xl p-3">
              <InfoRow icon={Clock} label="Created At" value={formatDateTime(insurance.createdAt)} />
              <InfoRow icon={Clock} label="Updated At" value={formatDateTime(insurance.updatedAt)} />
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

export default InsuranceDetailModal;