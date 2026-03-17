import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Info } from 'lucide-react';
import { GeneratorService, GeneratorServiceFormData, GENERATOR_MAINTENANCE_TYPES, GENERATOR_STATUS_OPTIONS } from '../../types/GeneratorMentenance';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GeneratorServiceFormData) => Promise<void>;
  record?: GeneratorService | null;
  title: string;
}

const GeneratorServiceModal: React.FC<Props> = ({ isOpen, onClose, onSubmit, record, title }) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GeneratorServiceFormData>({
    defaultValues: {
      generatorSerialNo: '',
      hour_meter_reading: 0,
      next_service_hour: 0,
      maintenance_type: 'Preventive',
      description: '',
      service_provider: '',
      service_date: '',
      cost: 0,
      status: 'Operational',
    }
  });

  useEffect(() => {
    if (record) {
      // For existing record - populate all fields
      const generatorSerialNo = typeof record.generatorId === 'string' 
        ? record.generatorId 
        : record.generatorId?.serial_no || '';
      
      reset({
        generatorSerialNo: generatorSerialNo,
        hour_meter_reading: record.hour_meter_reading,
        next_service_hour: record.next_service_hour,
        maintenance_type: record.maintenance_type,
        description: record.description || '',
        service_provider: record.service_provider,
        service_date: record.service_date ? new Date(record.service_date).toISOString().slice(0, 16) : '',
        cost: record.cost,
        status: record.status,
      });
    } else {
      // For new record - reset all fields
      reset({
        generatorSerialNo: '',
        hour_meter_reading: 0,
        next_service_hour: 0,
        maintenance_type: 'Preventive',
        description: '',
        service_provider: '',
        service_date: '',
        cost: 0,
        status: 'Operational',
      });
    }
  }, [record, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = async (formData: GeneratorServiceFormData) => {
    try {
      if (!formData.generatorSerialNo) {
        toast.error('Generator serial number is required');
        return;
      }
      
      const dataToSubmit = {
        ...formData,
        generatorSerialNo: formData.generatorSerialNo.toUpperCase(),
        hour_meter_reading: Number(formData.hour_meter_reading),
        next_service_hour: Number(formData.next_service_hour),
        cost: Number(formData.cost),
      };
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      toast.error('Failed to save service record');
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-2xl p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Generator Serial Number - Simple Text Input */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Generator Serial Number <span className="text-red-500">*</span>
                  </label>
                  
                  <input
                    type="text"
                    {...register('generatorSerialNo', { 
                      required: 'Generator serial number is required',
                      pattern: {
                        value: /^[A-Za-z0-9-]+$/,
                        message: 'Serial number can only contain letters, numbers, and hyphens'
                      }
                    })}
                    placeholder="Enter generator serial number (e.g., GEN-001)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                  
                  {errors.generatorSerialNo && (
                    <p className="text-xs text-red-600 mt-1">{errors.generatorSerialNo.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hour Meter Reading *</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('hour_meter_reading', { 
                      required: 'Hour meter reading is required',
                      min: { value: 0, message: 'Reading must be positive' },
                      valueAsNumber: true
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                  {errors.hour_meter_reading && <p className="text-xs text-red-600 mt-1">{errors.hour_meter_reading.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Next Service Hour *</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('next_service_hour', { 
                      required: 'Next service hour is required',
                      min: { value: 0, message: 'Hour must be positive' },
                      valueAsNumber: true
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                  {errors.next_service_hour && <p className="text-xs text-red-600 mt-1">{errors.next_service_hour.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Type *</label>
                  <select
                    {...register('maintenance_type', { required: 'Maintenance type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {GENERATOR_MAINTENANCE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.maintenance_type && <p className="text-xs text-red-600 mt-1">{errors.maintenance_type.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    {...register('status', { required: 'Status is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    {GENERATOR_STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider *</label>
                  <input
                    type="text"
                    {...register('service_provider', { required: 'Service provider is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Provider name"
                  />
                  {errors.service_provider && <p className="text-xs text-red-600 mt-1">{errors.service_provider.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Date *</label>
                  <input
                    type="datetime-local"
                    {...register('service_date', { required: 'Service date is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.service_date && <p className="text-xs text-red-600 mt-1">{errors.service_date.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('cost', { 
                      required: 'Cost is required',
                      min: { value: 0, message: 'Cost must be positive' },
                      valueAsNumber: true
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  {errors.cost && <p className="text-xs text-red-600 mt-1">{errors.cost.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Description of service performed"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                <Info size={18} className="text-blue-500 mt-0.5" />
                <p className="text-xs text-blue-700">
                  The generator's next service date and hour meter will be automatically updated based on this service record.
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default GeneratorServiceModal;