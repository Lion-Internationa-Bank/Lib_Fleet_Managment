import React from 'react';
import { 
  Calendar, Clock, MapPin, Hash, AlertTriangle,
  Shield, Zap, Wrench, FileText, Bell, Activity, Gauge
} from 'lucide-react';
import { 
  ActiveReminder, 
  getUrgencyColor, 
  formatDaysLeft,
  getDaysLeftColor,
  isGeneratorReminder,
  formatHoursRemaining,
  getHoursLeftColor,
  getGeneratorProgress
} from '../../types/Reminder';

interface Props {
  reminder: ActiveReminder;
}

const ReminderCard: React.FC<Props> = ({ reminder }) => {
  const urgencyColor = getUrgencyColor(reminder.urgency);
  const isGenerator = isGeneratorReminder(reminder);
  
  // For generator reminders, use hours-based color, otherwise use days-based
  const daysLeftColor = isGenerator && reminder.metadata.hours_remaining !== undefined
    ? getHoursLeftColor(reminder.metadata.hours_remaining)
    : getDaysLeftColor(reminder.days_left);
  
  const getTypeSpecificIcon = () => {
    switch (reminder.reminder_type) {
      case 'Bolo':
        return <AlertTriangle size={20} className={urgencyColor.icon} />;
      case 'Vehicle Maintenance':
        return <Wrench size={20} className={urgencyColor.icon} />;
      case 'Generator Maintenance':
        return <Zap size={20} className={urgencyColor.icon} />;
      case 'Insurance':
        return <Shield size={20} className={urgencyColor.icon} />;
      case 'Maintenance Agreement':
        return <FileText size={20} className={urgencyColor.icon} />;
      default:
        return <Bell size={20} className={urgencyColor.icon} />;
    }
  };

  const getRemainingText = () => {
    if (isGenerator && reminder.metadata.hours_remaining !== undefined) {
      return formatHoursRemaining(reminder.metadata.hours_remaining);
    }
    return formatDaysLeft(reminder.days_left);
  };

  const getRemainingValue = () => {
    if (isGenerator && reminder.metadata.hours_remaining !== undefined) {
      return `${reminder.metadata.hours_remaining} hours`;
    }
    return `${reminder.days_left} days`;
  };

  return (
    <div className={`bg-white rounded-lg border-l-4 ${urgencyColor.border} shadow-sm hover:shadow-md transition-shadow p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`p-2 rounded-full ${urgencyColor.bg}`}>
            {getTypeSpecificIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyColor.bg} ${urgencyColor.text}`}>
                {reminder.reminder_type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyColor.bg} ${urgencyColor.text} font-medium`}>
                {reminder.urgency}
              </span>
              {isGenerator && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                  Hour-based
                </span>
              )}
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {/* Time Remaining - Shows hours for generators, days for others */}
              <div className="flex items-center space-x-1 text-gray-600">
                <Clock size={14} className="text-gray-400" />
                <span className={daysLeftColor}>
                  {getRemainingText()}
                </span>
              </div>
              
              {/* Due Date */}
              <div className="flex items-center space-x-1 text-gray-600">
                <Calendar size={14} className="text-gray-400" />
                <span>{new Date(reminder.due_date).toLocaleDateString()}</span>
              </div>

              {/* Identifier (Plate/Serial/Provider) */}
              {reminder.metadata.identifier && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Hash size={14} className="text-gray-400" />
                  <span className="font-mono">{reminder.metadata.identifier}</span>
                </div>
              )}

              {/* Provider for Insurance/Agreements */}
              {reminder.metadata.provider && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Shield size={14} className="text-gray-400" />
                  <span>{reminder.metadata.provider}</span>
                </div>
              )}

              {/* Generator-specific: Current Hours */}
              {isGenerator && reminder.metadata.current_hours !== undefined && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Activity size={14} className="text-gray-400" />
                  <span>Current: {reminder.metadata.current_hours} hrs</span>
                </div>
              )}

              {/* Generator-specific: Next Service Hour */}
              {isGenerator && reminder.metadata.next_service_hour !== undefined && (
                <div className="flex items-center space-x-1 text-gray-600">
                  <Gauge size={14} className="text-gray-400" />
                  <span>Next: {reminder.metadata.next_service_hour} hrs</span>
                </div>
              )}

              {/* Location/Allocation */}
              {(reminder.metadata.location || reminder.metadata.allocation) && (
                <div className="flex items-center space-x-1 text-gray-600 col-span-2">
                  <MapPin size={14} className="text-gray-400" />
                  <span>
                    {[reminder.metadata.location, reminder.metadata.allocation]
                      .filter(Boolean)
                      .join(' • ')}
                  </span>
                </div>
              )}
            </div>

            {/* Generator Progress Bar */}
            {isGenerator && reminder.metadata.current_hours !== undefined && 
             reminder.metadata.next_service_hour !== undefined && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Service interval progress (200 hrs)</span>
                  <span className="font-medium">
                    {Math.round(getGeneratorProgress(
                      reminder.metadata.current_hours,
                      reminder.metadata.next_service_hour
                    ))}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      (reminder.metadata.hours_remaining || 0) <= 5 ? 'bg-red-500' :
                      (reminder.metadata.hours_remaining || 0) <= 10 ? 'bg-orange-500' :
                      (reminder.metadata.hours_remaining || 0) <= 15 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ 
                      width: `${Math.min(100, Math.max(0, getGeneratorProgress(
                        reminder.metadata.current_hours,
                        reminder.metadata.next_service_hour
                      )))}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{(reminder.metadata.next_service_hour || 0) - 200} hrs</span>
                  <span className="font-medium text-gray-700">{reminder.metadata.next_service_hour} hrs</span>
                </div>
              </div>
            )}

            {/* Expiry Date if available */}
            {reminder.metadata.expiry && (
              <div className="mt-2 text-xs text-gray-500 border-t pt-2">
                Expires: {new Date(reminder.metadata.expiry).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Urgency Indicator */}
        <div className="ml-4 flex flex-col items-end">
          <span className={`text-xs font-medium px-2 py-1 rounded ${urgencyColor.bg} ${urgencyColor.text}`}>
            {reminder.days_left < 0 && !isGenerator ? 'OVERDUE' : getRemainingValue()}
          </span>
          {isGenerator && reminder.metadata.hours_remaining !== undefined && (
            <span className="text-xs text-gray-500 mt-1">
              {reminder.metadata.hours_remaining <= 15 ? '⚠️ Schedule soon' : 'On track'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;