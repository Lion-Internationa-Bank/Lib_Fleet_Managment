import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Info, Calendar } from 'lucide-react';
import { MaintenanceAgreement, AgreementFormData } from '../../types/Agreement';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AgreementFormData) => Promise<void>;
  agreement?: MaintenanceAgreement | null;
  title: string;
}

const AgreementModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, agreement, title }) => {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<AgreementFormData>({
    defaultValues: {
      service_provider: '',
      contract_renewal_date: '',
      contract_expiry_date: '',
    }
  });

  const expiryDate = watch('contract_expiry_date');
  const [calculatedNewDate, setCalculatedNewDate] = React.useState<string | null>(null);

  useEffect(() => {
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      const newDate = new Date(expiry);
      newDate.setDate(expiry.getDate() - 5);
      setCalculatedNewDate(newDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    } else {
      setCalculatedNewDate(null);
    }
  }, [expiryDate]);

  useEffect(() => {
    if (agreement) {
      reset({
        service_provider: agreement.service_provider,
        contract_renewal_date: agreement.contract_renewal_date ? new Date(agreement.contract_renewal_date).toISOString().slice(0, 10) : '',
        contract_expiry_date: agreement.contract_expiry_date ? new Date(agreement.contract_expiry_date).toISOString().slice(0, 10) : '',
      });
    } else {
      reset({
        service_provider: '',
        contract_renewal_date: '',
        contract_expiry_date: '',
      });
    }
  }, [agreement, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (formData: AgreementFormData) => {
    try {
      if (!formData.service_provider) {
        toast.error('Service provider is required');
        return;
      }
      if (!formData.contract_renewal_date) {
        toast.error('Contract renewal date is required');
        return;
      }
      if (!formData.contract_expiry_date) {
        toast.error('Contract expiry date is required');
        return;
      }

      await onSubmit(formData);
      onClose();
    } catch (error) {
      toast.error('Failed to save agreement');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="space-y-4">
                {/* Service Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Provider <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('service_provider', { 
                      required: 'Service provider is required'
                    })}
                    placeholder="Enter service provider name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.service_provider && (
                    <p className="text-xs text-red-600 mt-1">{errors.service_provider.message}</p>
                  )}
                </div>

                {/* Contract Renewal Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Renewal Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('contract_renewal_date', { 
                        required: 'Contract renewal date is required'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  {errors.contract_renewal_date && (
                    <p className="text-xs text-red-600 mt-1">{errors.contract_renewal_date.message}</p>
                  )}
                </div>

                {/* Contract Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contract Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      {...register('contract_expiry_date', { 
                        required: 'Contract expiry date is required'
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                    <Calendar size={16} className="absolute right-3 top-3 text-gray-400" />
                  </div>
                  {errors.contract_expiry_date && (
                    <p className="text-xs text-red-600 mt-1">{errors.contract_expiry_date.message}</p>
                  )}
                </div>

                {/* Auto-calculated New Contract Date */}
                {calculatedNewDate && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">New contract date:</span> {calculatedNewDate} 
                      (5 days before expiry - auto-calculated)
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                <Info size={18} className="text-yellow-500 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  The new contract date will be automatically set to 5 days before the expiry date.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white pb-2 border-t">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AgreementModal;