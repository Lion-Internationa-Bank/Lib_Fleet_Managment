import React, {  useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, AlertCircle } from 'lucide-react';
import { 
  AccidentFormData, 
  Accident, 
  ACCIDENT_INTENSITY_OPTIONS, 
  RESPONSIBLE_PARTY_OPTIONS 
} from '../../types/Accident';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccidentFormData) => Promise<void>;
  record?: Accident | null;
  title: string;
}

const AccidentModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  record, 
  title 
}) => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AccidentFormData>({
    defaultValues: {
      plate_no: '',
      accident_date: '',
      accident_place: '',
      driver_name: '',
      damaged_part: '',
      accident_intensity: 'Low',
      date_notified_insurance: '',
      date_police_report: '',
      date_insurance_surveyor: '',
      date_auction: '',
      date_into_garage: '',
      date_out_garage: '',
      current_situation: '',
      responsible_for_accident: '',
      risk_base_price: null,
      old_age_contribution: null,
      total: null,
      action_taken: '',
    }
  });

  useEffect(() => {
    if (record) {
      reset({
        plate_no: record.plate_no,
        accident_date: record.accident_date ? new Date(record.accident_date).toISOString().slice(0, 16) : '',
        accident_place: record.accident_place || '',
        driver_name: record.driver_name || '',
        damaged_part: record.damaged_part || '',
        accident_intensity: record.accident_intensity,
        date_notified_insurance: record.date_notified_insurance ? new Date(record.date_notified_insurance).toISOString().slice(0, 16) : '',
        date_police_report: record.date_police_report ? new Date(record.date_police_report).toISOString().slice(0, 16) : '',
        date_insurance_surveyor: record.date_insurance_surveyor ? new Date(record.date_insurance_surveyor).toISOString().slice(0, 16) : '',
        date_auction: record.date_auction ? new Date(record.date_auction).toISOString().slice(0, 16) : '',
        date_into_garage: record.date_into_garage ? new Date(record.date_into_garage).toISOString().slice(0, 16) : '',
        date_out_garage: record.date_out_garage ? new Date(record.date_out_garage).toISOString().slice(0, 16) : '',
        current_situation: record.current_situation || '',
        responsible_for_accident: record.responsible_for_accident || '',
        risk_base_price: record.risk_base_price || null,
        old_age_contribution: record.old_age_contribution || null,
        total: record.total || null,
        action_taken: record.action_taken || '',
      });
    } else {
      reset({
        plate_no: '',
        accident_date: '',
        accident_place: '',
        driver_name: '',
        damaged_part: '',
        accident_intensity: 'Low',
        date_notified_insurance: '',
        date_police_report: '',
        date_insurance_surveyor: '',
        date_auction: '',
        date_into_garage: '',
        date_out_garage: '',
        current_situation: '',
        responsible_for_accident: '',
        risk_base_price: null,
        old_age_contribution: null,
        total: null,
        action_taken: '',
      });
    }
  }, [record, reset]);

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

  if (!isOpen) return null;

  const handleFormSubmit = async (formData: AccidentFormData) => {
    try {
      // Convert empty strings to null for date fields
      const dataToSubmit = {
        ...formData,
        accident_date: formData.accident_date || null,
        date_notified_insurance: formData.date_notified_insurance || null,
        date_police_report: formData.date_police_report || null,
        date_insurance_surveyor: formData.date_insurance_surveyor || null,
        date_auction: formData.date_auction || null,
        date_into_garage: formData.date_into_garage || null,
        date_out_garage: formData.date_out_garage || null,
        risk_base_price: formData.risk_base_price ? Number(formData.risk_base_price) : null,
        old_age_contribution: formData.old_age_contribution ? Number(formData.old_age_contribution) : null,
        total: formData.total ? Number(formData.total) : null,
      };
      
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      toast.error('Failed to save accident record');
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity z-40"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative bg-white rounded-lg w-full max-w-4xl p-6 shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
              <h2 className="text-xl font-semibold">{title}</h2>
              <button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Basic Information */}
                <div className="col-span-full">
                  <h3 className="text-md font-medium text-gray-700 mb-2 pb-1 border-b">Basic Information</h3>
                </div>

                {/* Plate Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Plate Number *
                  </label>
                  <input
                    type="text"
                    {...register('plate_no', { 
                      required: 'Plate number is required',
                      pattern: {
                        value: /^[A-Za-z0-9-]+$/,
                        message: 'Plate number can only contain letters, numbers, and hyphens'
                      }
                    })}
                    placeholder="e.g., ABC-123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.plate_no && (
                    <p className="mt-1 text-sm text-red-600">{errors.plate_no.message}</p>
                  )}
                </div>

                {/* Accident Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accident Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    {...register('accident_date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Accident Place */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accident Place
                  </label>
                  <input
                    type="text"
                    {...register('accident_place')}
                    placeholder="Location of accident"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Driver Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Driver Name
                  </label>
                  <input
                    type="text"
                    {...register('driver_name')}
                    placeholder="Driver's full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Damaged Part */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Damaged Part
                  </label>
                  <input
                    type="text"
                    {...register('damaged_part')}
                    placeholder="e.g., Front bumper, Door"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Accident Intensity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accident Intensity *
                  </label>
                  <select
                    {...register('accident_intensity', { required: 'Accident intensity is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {ACCIDENT_INTENSITY_OPTIONS.map(intensity => (
                      <option key={intensity} value={intensity}>{intensity}</option>
                    ))}
                  </select>
                  {errors.accident_intensity && (
                    <p className="mt-1 text-sm text-red-600">{errors.accident_intensity.message}</p>
                  )}
                </div>

                {/* Responsible Party */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsible Party
                  </label>
                  <select
                    {...register('responsible_for_accident')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select responsible party</option>
                    {RESPONSIBLE_PARTY_OPTIONS.map(party => (
                      <option key={party} value={party}>{party}</option>
                    ))}
                  </select>
                </div>

                {/* Dates Section */}
                <div className="col-span-full mt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-2 pb-1 border-b">Important Dates</h3>
                </div>

                {/* Date Notified Insurance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Notified Insurance
                  </label>
                  <input
                    type="datetime-local"
                    {...register('date_notified_insurance')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date Police Report */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Police Report
                  </label>
                  <input
                    type="datetime-local"
                    {...register('date_police_report')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date Insurance Surveyor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Insurance Surveyor
                  </label>
                  <input
                    type="datetime-local"
                    {...register('date_insurance_surveyor')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date Auction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Auction
                  </label>
                  <input
                    type="datetime-local"
                    {...register('date_auction')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date Into Garage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Into Garage
                  </label>
                  <input
                    type="datetime-local"
                    {...register('date_into_garage')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Date Out Garage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Out Garage
                  </label>
                  <input
                    type="datetime-local"
                    {...register('date_out_garage')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Financial Section */}
                <div className="col-span-full mt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-2 pb-1 border-b">Financial Information</h3>
                </div>

                {/* Risk Base Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Risk Base Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('risk_base_price', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Old Age Contribution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Old Age Contribution
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('old_age_contribution', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Total */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('total', { valueAsNumber: true })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status and Actions */}
                <div className="col-span-full mt-4">
                  <h3 className="text-md font-medium text-gray-700 mb-2 pb-1 border-b">Status & Actions</h3>
                </div>

                {/* Current Situation */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Situation
                  </label>
                  <input
                    type="text"
                    {...register('current_situation')}
                    placeholder="e.g., Under repair, Settled, Pending"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Action Taken */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Action Taken
                  </label>
                  <textarea
                    {...register('action_taken')}
                    rows={2}
                    placeholder="Description of actions taken"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle size={18} className="text-blue-500 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Fill in the accident details. All date fields are optional. Financial fields will be calculated automatically if needed.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white pb-2 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
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

export default AccidentModal;