import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Zap, Clock, AlertCircle } from 'lucide-react';
import { ReminderGroup as ReminderGroupType, isGeneratorReminder } from '../../types/Reminder';
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

  // Get generator-specific stats
  const getGeneratorStats = () => {
    const generatorReminders = group.reminders.filter(r => isGeneratorReminder(r));
    if (generatorReminders.length === 0) return null;
    
    const criticalHours = generatorReminders.filter(r => 
      r.metadata.hours_remaining !== undefined && r.metadata.hours_remaining <= 5
    ).length;
    
    const warningHours = generatorReminders.filter(r => 
      r.metadata.hours_remaining !== undefined && 
      r.metadata.hours_remaining > 5 && 
      r.metadata.hours_remaining <= 10
    ).length;
    
    return { criticalHours, warningHours, total: generatorReminders.length };
  };

  const generatorStats = getGeneratorStats();

  // Sort reminders: Critical first, then Warning, then Info, and within same urgency, sort by remaining time
  const sortedReminders = [...group.reminders].sort((a, b) => {
    const urgencyOrder = { Critical: 0, Warning: 1, Info: 2 };
    const urgencyDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    if (urgencyDiff !== 0) return urgencyDiff;
    
    // For generator reminders, sort by hours remaining
    const aIsGenerator = isGeneratorReminder(a);
    const bIsGenerator = isGeneratorReminder(b);
    
    if (aIsGenerator && bIsGenerator) {
      const aHours = a.metadata.hours_remaining ?? Infinity;
      const bHours = b.metadata.hours_remaining ?? Infinity;
      return aHours - bHours;
    }
    
    // For date-based reminders, sort by days left
    return a.days_left - b.days_left;
  });

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
            
            {/* Generator badge */}
            {group.type === 'Generator Maintenance' && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
                <Zap size={12} />
                Hour-based tracking
              </span>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-3 text-sm">
            {generatorStats && (
              <div className="flex items-center space-x-2 mr-3">
                {generatorStats.criticalHours > 0 && (
                  <span className="text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {generatorStats.criticalHours} urgent hrs
                  </span>
                )}
                {generatorStats.warningHours > 0 && (
                  <span className="text-orange-600 flex items-center gap-1">
                    <Clock size={14} />
                    {generatorStats.warningHours} warning hrs
                  </span>
                )}
              </div>
            )}
            <span className="text-red-600">
              Critical: {group.reminders.filter(r => r.urgency === 'Critical').length}
            </span>
            <span className="text-yellow-600">
              Warning: {group.reminders.filter(r => r.urgency === 'Warning').length}
            </span>
          </div>
        </div>
        
        {/* Additional info for generator group */}
        {group.type === 'Generator Maintenance' && (
          <div className="mt-2 text-xs text-gray-500 ml-7">
            ⚡ Generators require service every 200 hours • Alerts when &le;15 hours remaining
          </div>
        )}
      </div>

      {/* Group Content */}
      {isExpanded && (
        <div className="p-4 space-y-3 border-t border-gray-100">
          {sortedReminders.length > 0 ? (
            sortedReminders.map((reminder) => (
              <ReminderCard key={reminder._id} reminder={reminder} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No reminders in this category
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReminderGroup;