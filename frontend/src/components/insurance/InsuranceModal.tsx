import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Info, Calendar, Shield } from 'lucide-react';
import { Insurance, InsuranceFormData } from '../../types/Insurance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsuranceFormData) => Promise<void>;
  insurance?: Insurance | null;
  title: string;
}

const InsuranceModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, insurance, title }) => {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<InsuranceFormData>({
    defaultValues: {
      insurance_provider: '',
      insurance_renewal_date: '',
      insurance_expired_date: '',
    }
  });

  const expiryDate = watch('insurance_expired_date');
  const [calculatedReminder, setCalculatedReminder] = React.useState<string | null>(null);

  useEffect(() => {
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      const reminder = new Date(expiry);
      reminder.setDate(expiry.getDate() - 5);
      setCalculatedReminder(reminder.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }));
    } else {
      setCalculatedReminder(null);
    }
  }, [expiryDate]);

  useEffect(() => {
    if (insurance) {
      reset({
        insurance_provider: insurance.insurance_provider,
        insurance_renewal_date: insurance.insurance_renewal_date ? new Date(insurance.insurance_renewal_date).toISOString().slice(0, 10) : '',
        insurance_expired_date: insurance.insurance_expired_date ? new Date(insurance.insurance_expired_date).toISOString().slice(0, 10) : '',
      });
    } else {
      reset({
        insurance_provider: '',
        insurance_renewal_date: '',
        insurance_expired_date: '',
      });
    }
  }, [insurance, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (formData: InsuranceFormData) => {
    try {
      if (!formData.insurance_provider) {
        toast.error('Insurance provider is required');
        return;
      }
      if (!formData.insurance_renewal_date) {
        toast.error('Insurance renewal date is required');
        return;
      }
      if (!formData.insurance_expired_date) {
        toast.error('Insurance expiry date is required');
        return;
      }

      await onSubmit(formData);
      onClose();
    } catch (error) {
      toast.error('Failed to save insurance record');
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
                {/* Insurance Provider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Provider <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      {...register('insurance_provider', { 
                        required: 'Insurance provider is required'
                      })}
                      placeholder="Enter insurance provider name"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.insurance_provider && (
                    <p className="text-xs text-red-600 mt-1">{errors.insurance_provider.message}</p>
                  )}
                </div>

                {/* Insurance Renewal Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Renewal Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      {...register('insurance_renewal_date', { 
                        required: 'Insurance renewal date is required'
                      })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.insurance_renewal_date && (
                    <p className="text-xs text-red-600 mt-1">{errors.insurance_renewal_date.message}</p>
                  )}
                </div>

                {/* Insurance Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Insurance Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      {...register('insurance_expired_date', { 
                        required: 'Insurance expiry date is required'
                      })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {errors.insurance_expired_date && (
                    <p className="text-xs text-red-600 mt-1">{errors.insurance_expired_date.message}</p>
                  )}
                </div>

                {/* Auto-calculated Reminder Date */}
                {calculatedReminder && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-700">
                      <span className="font-medium">Reminder date:</span> {calculatedReminder} 
                      (5 days before expiry - auto-calculated)
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                <Info size={18} className="text-yellow-500 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  The reminder date will be automatically set to 5 days before the expiry date.
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

export default InsuranceModal;