import React from 'react';
import { 
  Calendar, Clock, MapPin, Hash, AlertTriangle,
  Shield, Zap, Wrench, FileText, Bell
} from 'lucide-react';
import { 
  ActiveReminder, 
  getUrgencyColor, 
  formatDaysLeft,
  getDaysLeftColor,
} from '../../types/Reminder';

interface Props {
  reminder: ActiveReminder;
}

const ReminderCard: React.FC<Props> = ({ reminder }) => {
  const urgencyColor = getUrgencyColor(reminder.urgency);
  const daysLeftColor = getDaysLeftColor(reminder.days_left);
  
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

  return (
    <div className={`bg-white rounded-lg border-l-4 ${urgencyColor.border} shadow-sm hover:shadow-md transition-shadow p-4`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div className={`p-2 rounded-full ${urgencyColor.bg}`}>
            {getTypeSpecificIcon()}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyColor.bg} ${urgencyColor.text}`}>
                {reminder.reminder_type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyColor.bg} ${urgencyColor.text} font-medium`}>
                {reminder.urgency}
              </span>
            </div>
            
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {/* Days Left - Most Important */}
              <div className="flex items-center space-x-1 text-gray-600">
                <Clock size={14} className="text-gray-400" />
                <span className={daysLeftColor}>
                  {formatDaysLeft(reminder.days_left)}
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
            {reminder.days_left < 0 ? 'OVERDUE' : `${reminder.days_left} days`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReminderCard;