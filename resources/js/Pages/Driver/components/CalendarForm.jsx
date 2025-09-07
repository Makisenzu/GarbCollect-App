import React, { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  addWeeks,
  subWeeks,
  startOfDay,
  isSameDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

const CalendarForm = ({ scheduleData }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getDaysToShow = () => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    } else if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else { // day view
      return [startOfDay(currentDate)];
    }
  };

  const navigateDate = (direction) => {
    if (viewMode === 'week') {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else if (viewMode === 'month') {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    } else { // day view
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : subDays(prev, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDayBackgroundColor = (day, schedules) => {
    if (schedules.length === 0) return 'bg-white';
    
    const hasOverdue = schedules.some(s => s.status === 'overdue');
    const hasPending = schedules.some(s => s.status === 'pending');
    const allCompleted = schedules.every(s => s.status === 'completed');
    
    if (hasOverdue) return 'bg-red-100 border border-red-300';
    if (hasPending) return 'bg-yellow-100 border border-yellow-300';
    if (allCompleted) return 'bg-green-100 border border-green-300';
    
    return 'bg-white';
  };

  const days = getDaysToShow();
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const shortWeekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="space-y-4 p-2 sm:space-y-6 sm:p-4">
      <div className="hidden">
        <div className="bg-red-100 border-red-300"></div>
        <div className="bg-yellow-100 border-yellow-300"></div>
        <div className="bg-green-100 border-green-300"></div>
        <div className="bg-red-200 text-red-800"></div>
        <div className="bg-yellow-200 text-yellow-800"></div>
        <div className="bg-green-200 text-green-800"></div>
        <div className="bg-gray-200 text-gray-700"></div>
      </div>

      <div className="sm:hidden flex justify-end">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 ${isMobileMenuOpen ? 'block' : 'hidden sm:flex'}`}>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-initial">
            <button 
              className="p-1 sm:p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="h-4 w-4 sm:h-4 sm:w-4" />
            </button>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 min-w-[120px] sm:min-w-[200px] text-center mx-2 sm:mx-0">
              {viewMode === 'week' 
                ? `Week of ${format(days[0], 'MMM d')}`
                : viewMode === 'day'
                ? format(currentDate, 'MMM d, yyyy')
                : format(currentDate, 'MMMM yyyy')
              }
            </h2>
            <button 
              className="p-1 sm:p-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-colors"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="h-4 w-4 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start mt-2 sm:mt-0">
          <button
            className="px-3 py-1 rounded-md text-sm border border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => {
              goToToday();
              setIsMobileMenuOpen(false);
            }}
          >
            Back
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            onClick={() => {
              setViewMode('day');
              setIsMobileMenuOpen(false);
            }}
          >
            Day
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            onClick={() => {
              setViewMode('week');
              setIsMobileMenuOpen(false);
            }}
          >
            Week
          </button>
          <button
            className={`px-3 py-1 rounded-md text-sm ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-100'}`}
            onClick={() => {
              setViewMode('month');
              setIsMobileMenuOpen(false);
            }}
          >
            Month
          </button>
        </div>
      </div>

      {(viewMode === 'week' || viewMode === 'month') && (
        <div className="bg-white rounded-lg shadow-md p-2 sm:p-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-0 mb-2 sm:mb-4 min-w-[500px] sm:min-w-0">
            {(window.innerWidth < 640 ? shortWeekDays : weekDays).map((day, index) => (
              <div
                key={index}
                className="p-1 sm:p-3 text-center font-semibold text-gray-500 bg-gray-100 border-r border-b border-gray-300 last:border-r-0 text-xs sm:text-sm"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-300 min-w-[500px] sm:min-w-0">
            {days.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const daySchedules = scheduleData[dateKey] || [];
              const isCurrentMonth = viewMode === 'week' || isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={dateKey}
                  className={`
                    min-h-[80px] sm:min-h-[120px] p-1 sm:p-2
                    ${getDayBackgroundColor(day, daySchedules)}
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                    ${isCurrentDay ? 'ring-1 sm:ring-2 ring-blue-500 ring-inset' : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <span className={`
                      text-xs sm:text-sm font-medium
                      ${isCurrentDay ? 'bg-blue-600 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center' : 'text-gray-900'}
                      ${!isCurrentMonth ? 'text-gray-400' : ''}
                    `}>
                      {format(day, 'd')}
                    </span>
                    {daySchedules.length > 0 && (
                      <span className="bg-gray-200 text-gray-700 text-xs px-1 sm:px-2 py-0.5 rounded-full">
                        {daySchedules.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5 sm:space-y-1">
                    {daySchedules.slice(0, window.innerWidth < 640 ? 1 : 3).map((schedule) => {
                      let statusColor = 'bg-gray-200 text-gray-700';
                      if (schedule.status === 'completed') statusColor = 'bg-green-200 text-green-800';
                      if (schedule.status === 'pending') statusColor = 'bg-yellow-200 text-yellow-800';
                      if (schedule.status === 'overdue') statusColor = 'bg-red-200 text-red-800';

                      return (
                        <div
                          key={schedule.id}
                          className={`text-xs p-0.5 sm:p-1 rounded truncate ${statusColor}`}
                          title={`${schedule.time} - ${schedule.address} (${schedule.status})`}
                        >
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <span className="hidden xs:inline">{schedule.time}</span>
                            <span className="truncate flex-1 text-xs">{schedule.address}</span>
                          </div>
                        </div>
                      );
                    })}
                    {daySchedules.length > (window.innerWidth < 640 ? 1 : 3) && (
                      <div className="text-xs text-gray-500 text-center">
                        +{daySchedules.length - (window.innerWidth < 640 ? 1 : 3)} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'day' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-xl font-bold mb-4 text-center">
            {format(currentDate, 'EEEE, MMMM d, yyyy')}
          </div>
          <div className="space-y-3">
            {(scheduleData[format(currentDate, 'yyyy-MM-dd')] || []).map((schedule) => {
              let statusColor = 'bg-gray-100 text-gray-800';
              if (schedule.status === 'completed') statusColor = 'bg-green-100 text-green-800';
              if (schedule.status === 'pending') statusColor = 'bg-yellow-100 text-yellow-800';
              if (schedule.status === 'overdue') statusColor = 'bg-red-100 text-red-800';

              return (
                <div
                  key={schedule.id}
                  className={`p-3 rounded-lg ${statusColor}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold">{schedule.time}</div>
                      <div className="text-sm mt-1">{schedule.address}</div>
                      <div className="text-xs mt-2 capitalize">{schedule.type}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      schedule.status === 'completed' ? 'bg-green-200 text-green-800' :
                      schedule.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                    }`}>
                      {schedule.status}
                    </span>
                  </div>
                </div>
              );
            })}
            {(!scheduleData[format(currentDate, 'yyyy-MM-dd')] || scheduleData[format(currentDate, 'yyyy-MM-dd')].length === 0) && (
              <div className="text-center text-gray-500 py-8">
                No schedules for this day
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-200 rounded"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-yellow-200 rounded"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-200 rounded"></div>
          <span>Overdue</span>
        </div>
      </div>
    </div>
  );
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const subDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

export default CalendarForm;