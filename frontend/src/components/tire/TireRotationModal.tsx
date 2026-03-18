import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { X, RotateCw, Gauge, Calendar, AlertCircle } from 'lucide-react';
import { Tire, } from '../../types/Tire';
import tireService from '../../services/tire.service';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehiclePlate: string;
  tires: Tire[];
  currentKm: number;
  onSuccess?: () => void;
}

export const TireRotationModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  vehiclePlate,
  tires,
  currentKm,
  onSuccess 
}) => {
  const [fromTireId, setFromTireId] = useState<string>('');
  const [toTireId, setToTireId] = useState<string>('');
  const [rotationDate, setRotationDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [kmAtRotation, setKmAtRotation] = useState<number>(currentKm);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ from: Tire | null; to: Tire | null }>({ from: null, to: null });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setKmAtRotation(currentKm);
    } else {
      document.body.style.overflow = 'unset';
      // Reset form on close
      setFromTireId('');
      setToTireId('');
      setReason('');
      setPreview({ from: null, to: null });
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, currentKm]);

  useEffect(() => {
    // Update preview when selections change
    const fromTire = tires.find(t => t._id === fromTireId) || null;
    const toTire = tires.find(t => t._id === toTireId) || null;
    setPreview({ from: fromTire, to: toTire });
  }, [fromTireId, toTireId, tires]);

  if (!isOpen) return null;

  const handleRotate = async () => {
    try {
      // Validation
      if (!fromTireId || !toTireId) {
        toast.error('Please select both tires to rotate');
        return;
      }

      if (fromTireId === toTireId) {
        toast.error('Cannot rotate a tire with itself');
        return;
      }

      const fromTire = tires.find(t => t._id === fromTireId);
      const toTire = tires.find(t => t._id === toTireId);

      if (!fromTire || !toTire) {
        toast.error('Selected tires not found');
        return;
      }

      if (fromTire.position === toTire.position) {
        toast.error('Cannot rotate tires to the same position');
        return;
      }

      if (kmAtRotation < 0) {
        toast.error('KM at rotation must be positive');
        return;
      }

      setLoading(true);

      const rotationData = {
        from_tire_id: fromTireId,
        to_tire_id: toTireId,
        rotation_date: rotationDate,
        km_at_rotation: kmAtRotation,
        reason: reason || 'Tire rotation for even wear'
      };

      await tireService.rotateTires(rotationData);
      toast.success('Tires rotated successfully');
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to rotate tires');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-lg w-full max-w-lg p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <RotateCw className="mr-2 text-blue-600" size={20} />
                Rotate Tires
              </h2>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Vehicle Info */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">
                  Vehicle: <span className="font-medium text-gray-900">{vehiclePlate}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Current KM: <span className="font-medium text-gray-900">{currentKm.toLocaleString()} km</span>
                </p>
              </div>

              {/* From Tire Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Position
                </label>
                <select
                  value={fromTireId}
                  onChange={(e) => setFromTireId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select tire to move</option>
                  {tires.map(tire => (
                    <option key={tire._id} value={tire._id}>
                      {tire.position} - {tire.make} ({tire.serial_no})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Tire Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Position
                </label>
                <select
                  value={toTireId}
                  onChange={(e) => setToTireId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select target position</option>
                  {tires.map(tire => (
                    <option key={tire._id} value={tire._id}>
                      {tire.position} - {tire.make} ({tire.serial_no})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rotation Preview */}
              {preview.from && preview.to && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <AlertCircle size={16} className="mr-1" />
                    Rotation Preview
                  </h3>
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">From:</span>
                      <span className="font-medium">{preview.from.position} → {preview.to.position}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">To:</span>
                      <span className="font-medium">{preview.to.position} → {preview.from.position}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Rotation Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Rotation Date
                </label>
                <input
                  type="date"
                  value={rotationDate}
                  onChange={(e) => setRotationDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* KM at Rotation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Gauge size={16} className="inline mr-1" />
                  KM at Rotation
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={kmAtRotation}
                  onChange={(e) => setKmAtRotation(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason (Optional)
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Even wear, Seasonal change"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                <AlertCircle size={18} className="text-yellow-500 mt-0.5" />
                <p className="text-xs text-yellow-700">
                  Rotating tires will swap their positions. This action cannot be undone. 
                  Make sure both tires are active and in good condition.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white pb-2 border-t">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRotate}
                  disabled={loading || !fromTireId || !toTireId || fromTireId === toTireId} 
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Rotating...
                    </>
                  ) : (
                    <>
                      <RotateCw size={16} className="mr-2" />
                      Rotate Tires
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};