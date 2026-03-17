import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ReminderGroup as ReminderGroupType } from '../../types/Reminder';
import ReminderCard from './ReminderCard';

interface Props {
  group: ReminderGroupType;
  defaultExpanded?: boolean;
}

const ReminderGroup: React.FC<Props> = ({ group, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getGroupColor = () => {
    const hasCritical = group.reminders.some(r => r.urgency === 'Critical');
    const hasWarning = group.reminders.some(r => r.urgency === 'Warning');
    
    if (hasCritical) return 'border-l-4 border-red-500';
    if (hasWarning) return 'border-l-4 border-yellow-500';
    return 'border-l-4 border-blue-500';
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Group Header */}
      <div 
        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${getGroupColor()}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isExpanded ? (
              <ChevronDown size={20} className="text-gray-500" />
            ) : (
              <ChevronRight size={20} className="text-gray-500" />
            )}
            <h2 className="text-lg font-semibold text-gray-800">
              {group.type}
            </h2>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              {group.count} {group.count === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-3 text-sm">
            <span className="text-red-600">
              Critical: {group.reminders.filter(r => r.urgency === 'Critical').length}
            </span>
            <span className="text-yellow-600">
              Warning: {group.reminders.filter(r => r.urgency === 'Warning').length}
            </span>
          </div>
        </div>
      </div>

      {/* Group Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 border-t border-gray-100">
          {group.reminders
            .sort((a, b) => a.days_left - b.days_left)
            .map((reminder) => (
              <ReminderCard key={reminder._id} reminder={reminder} />
            ))}
        </div>
      )}
    </div>
  );
};

export default ReminderGroup;