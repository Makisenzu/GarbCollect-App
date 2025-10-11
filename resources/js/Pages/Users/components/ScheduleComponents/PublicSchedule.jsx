import { useState, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight, CalendarDays, Sparkles, Menu, X } from "lucide-react";
import Select from 'react-select';
import axios from 'axios';

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

const PublicSchedule = () => {
  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loadingBarangays, setLoadingBarangays] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [currentDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [activeTab, setActiveTab] = useState("week");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchBarangays = async () => {
      try {
        setLoadingBarangays(true);
        const response = await axios.get('/getBarangay');
        
        if (response.data.success) {
          const barangaysData = response.data.barangay_data;
          
          const options = barangaysData.map(barangay => ({
            value: barangay.id,
            label: barangay.baranggay_name
          }));
          setBarangayOptions(options);
        }
      } catch (error) {
        console.error('Error fetching barangays:', error);
      } finally {
        setLoadingBarangays(false);
      }
    };

    fetchBarangays();
  }, []);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedBarangay) {
        setSchedules([]);
        return;
      }

      try {
        setLoadingSchedules(true);
        const response = await axios.get(`/getBarangay/schedule/${selectedBarangay.value}`);
        
        if (response.data.success) {
          setSchedules(response.data.barangaySchedule || []);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        setSchedules([]);
      } finally {
        setLoadingSchedules(false);
      }
    };

    fetchSchedules();
  }, [selectedBarangay]);

  const getScheduleStatus = (schedule) => {
    const now = new Date();
    const collectionDate = new Date(schedule.collection_date);

    if (schedule.collection_time) {
      const [hours, minutes] = schedule.collection_time.split(':');
      collectionDate.setHours(parseInt(hours), parseInt(minutes), 0);
    } else {
      collectionDate.setHours(8, 0, 0);
    }
    
    const endTime = new Date(collectionDate);
    endTime.setHours(endTime.getHours() + 4);
    
    if (now < collectionDate) {
      return "active";
    } else if (now >= collectionDate && now <= endTime) {
      return "progress";
    } else if (now > endTime && schedule.status === 'completed') {
      return "completed";
    } else if (now > endTime && schedule.status !== 'completed') {
      return "failed";
    } else {
      return "active";
    }
  };

  const formatScheduleDate = (collectionDate) => {
    const date = new Date(collectionDate);
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return `${month} ${day} - ${dayName}`;
  };

  const formatTime = (time) => {
    if (!time) return '8:00 AM';
    
    try {
      if (typeof time === 'string' && time.includes(':')) {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      }
    } catch (error) {
      console.error('Error formatting time:', error);
    }
    
    return '8:00 AM';
  };

  const transformScheduleData = () => {
    if (!schedules.length) return [];
    
    return schedules.map(schedule => {
      const status = getScheduleStatus(schedule);
      const formattedDate = formatScheduleDate(schedule.collection_date);
      const formattedTime = formatTime(schedule.collection_time);

      return {
        formattedDate: formattedDate,
        time: formattedTime,
        status: status,
        collection_date: schedule.collection_date,
        collection_time: schedule.collection_time,
        originalData: schedule
      };
    });
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTodaySchedule = () => {
    if (!selectedBarangay) return [];
    const today = new Date().toDateString();
    const barangaySchedules = transformScheduleData();
    return barangaySchedules.filter(s => 
      new Date(s.collection_date).toDateString() === today
    );
  };

  const getWeekSchedule = () => {
    if (!selectedBarangay) return [];
    return transformScheduleData();
  };

  const getMonthSchedule = () => {
    if (!selectedBarangay) return [];
    
    const barangaySchedules = transformScheduleData();
    const monthSchedule = [];
    
    barangaySchedules.forEach(schedule => {
      const scheduleDate = new Date(schedule.collection_date);
      
      if (scheduleDate.getMonth() === viewMonth && scheduleDate.getFullYear() === viewYear) {
        const date = scheduleDate.getDate();
        monthSchedule.push({
          ...schedule,
          date: date,
          dayName: scheduleDate.toLocaleDateString('en-US', { weekday: 'long' })
        });
      }
    });
    
    return monthSchedule;
  };

  const previousMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const renderMonthCalendar = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const monthSchedule = getMonthSchedule();
    
    const calendarDays = [];
    
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="min-h-20 md:min-h-24 bg-gray-100/30 rounded-lg"></div>
      );
    }
    
    for (let date = 1; date <= daysInMonth; date++) {
      const daySchedules = monthSchedule.filter(s => s.date === date);
      const isToday = date === currentDate.getDate() && 
                      viewMonth === currentDate.getMonth() && 
                      viewYear === currentDate.getFullYear();
      
      calendarDays.push(
        <div
          key={date}
          className={`min-h-20 md:min-h-24 p-1 md:p-2 rounded-lg border transition-all ${
            isToday 
              ? "bg-blue-100 border-blue-500" 
              : "bg-white border-gray-200 hover:border-blue-300"
          }`}
        >
          <div className={`text-xs md:text-sm font-semibold mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>
            {date}
          </div>
          <div className="space-y-0.5">
            {daySchedules.map((schedule, idx) => (
              <div key={idx} className="space-y-0.5">
                <span
                  className={`text-[10px] md:text-xs px-1 py-0.5 rounded border block truncate ${getStatusStyles(schedule.status)}`}
                >
                  {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                </span>
                <div className="text-[10px] md:text-xs text-gray-600 truncate">
                  {schedule.time.replace('Start - ', '')}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return calendarDays;
  };

  const getMonthlyListView = () => {
    if (!selectedBarangay) return [];
    const monthSchedule = getMonthSchedule();
    return monthSchedule.sort((a, b) => a.date - b.date);
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '48px',
      border: '2px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      backgroundColor: state.isDisabled ? '#f9fafb' : 'white',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    option: (base, state) => ({
      ...base,
      fontSize: '1rem',
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#374151',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: state.isSelected ? '#3b82f6' : '#eff6ff'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }),
    loadingMessage: (base) => ({
      ...base,
      color: '#6b7280',
      fontSize: '0.875rem'
    }),
    noOptionsMessage: (base) => ({
      ...base,
      color: '#6b7280',
      fontSize: '0.875rem'
    })
  };

  if (loadingBarangays) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading barangays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-green-500 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMy4zMTQgMi42ODYtNiA2LTZoMTJjMy4zMTQgMCA2IDIuNjg2IDYgNnYxMmMwIDMuMzE0LTIuNjg2IDYtNiA2SDQyYy0zLjMxNCAwLTYtMi42ODYtNi02VjE2em0tMTIgMGMwLTMuMzE0IDIuNjg2LTYgNi02aDEyYzMuMzE0IDAgNiAyLjY4NiA2IDZ2MTJjMCAzLjMzMTQtMi42ODYgNi02IDZIMzBjLTMuMzE0IDAtNi0yLjY4Ni02LTZWMTZ6bTAgMGMwLTMuMzE0IDIuNjg2LTYgNi02aDEyYzMuMzE0IDAgNiAyLjY4NiA2IDZ2MTJjMCAzLjMzMTQtMi42ODYgNi02IDZIMzBjLTMuMzE0IDAtNi0yLjY4Ni02LTZWMTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-12 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 md:px-4 md:py-2 rounded-full mb-4 md:mb-6">
              <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-white animate-bounce" />
              <span className="text-xs md:text-sm text-white font-medium">Smart Waste Management</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Barangay Collection
              <br />
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Schedule System
              </span>
            </h1>
            
            <p className="text-sm md:text-lg lg:text-xl text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Stay informed about waste collection times in your area. Plan ahead and contribute to a cleaner, greener community.
            </p>
            
            <div className="flex flex-wrap gap-3 md:gap-4 justify-center text-xs md:text-sm text-white/80">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-white"></div>
                Real-time Updates
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-white"></div>
                Multiple View Modes
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-white"></div>
                Easy to Navigate
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 md:py-12 -mt-6 md:-mt-8 relative z-20">
        {/* Barangay Selector */}
        <div className="max-w-2xl mx-auto mb-6 md:mb-8">
          <div className="bg-white border border-gray-200 md:border-2 rounded-lg md:rounded-xl shadow-lg">
            <div className="p-4 md:p-6 border-b border-gray-200">
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                Select Your Barangay
              </h2>
              <p className="text-gray-600 mt-1 text-sm md:text-base">Choose your barangay to view the collection schedule</p>
            </div>
            <div className="p-4 md:p-6">
              <Select
                value={selectedBarangay}
                onChange={setSelectedBarangay}
                options={barangayOptions}
                placeholder="Choose a barangay..."
                styles={customStyles}
                isSearchable
                isClearable
                isLoading={loadingBarangays}
                loadingMessage={() => "Loading barangays..."}
                noOptionsMessage={() => "No barangays found"}
              />
            </div>
          </div>
        </div>

        {/* Schedule Display */}
        {selectedBarangay && (
          <div className="max-w-6xl mx-auto">
            {/* Loading State for Schedules */}
            {loadingSchedules && (
              <div className="text-center py-6 md:py-8">
                <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600 text-sm md:text-base">Loading schedule for {selectedBarangay.label}...</p>
              </div>
            )}

            {/* Schedule Content */}
            {!loadingSchedules && (
              <>
                {/* Mobile Tab Menu Button */}
                <div className="md:hidden mb-4">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <span className="font-medium text-gray-900">
                      {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View
                    </span>
                    {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                  </button>
                  
                  {isMobileMenuOpen && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      {["today", "week", "month"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveTab(tab);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left font-medium transition-colors border-b border-gray-100 last:border-b-0 ${
                            activeTab === tab
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Tabs */}
                <div className="hidden md:flex justify-center mb-6">
                  <div className="bg-white rounded-lg shadow-md p-1">
                    <div className="flex space-x-1">
                      {["today", "week", "month"].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 lg:px-6 py-2 rounded-md font-medium transition-colors text-sm lg:text-base ${
                            activeTab === tab
                              ? "bg-blue-600 text-white"
                              : "text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Today View */}
                {activeTab === "today" && (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 md:border-2 rounded-lg md:rounded-xl shadow-lg">
                      <div className="p-4 md:p-6 border-b border-gray-200">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Today's Schedule</h2>
                        <p className="text-gray-600 text-sm md:text-base">
                          {currentDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="p-4 md:p-6">
                        {getTodaySchedule().length > 0 ? (
                          <div className="space-y-3 md:space-y-4">
                            {getTodaySchedule().map((schedule, index) => (
                              <div key={index} className="bg-white border border-gray-200 md:border-2 rounded-lg shadow-sm hover:shadow-lg transition-all p-4 md:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                                      <h3 className="text-base md:text-lg font-semibold text-gray-900 break-words">
                                        {schedule.formattedDate}
                                      </h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                      <span className="text-gray-600 text-sm md:text-base">Start - {schedule.time}</span>
                                    </div>
                                  </div>
                                  <span className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border ${getStatusStyles(schedule.status)} self-start sm:self-auto`}>
                                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 md:py-12">
                            <Calendar className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                            <p className="text-base md:text-lg font-medium text-gray-600">No collection scheduled for today</p>
                            <p className="text-sm text-gray-500 mt-2">Check the weekly or monthly view for upcoming schedules</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Week View */}
                {activeTab === "week" && (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 md:border-2 rounded-lg md:rounded-xl shadow-lg">
                      <div className="p-4 md:p-6 border-b border-gray-200">
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedBarangay.label}</h2>
                        <p className="text-gray-600 text-sm md:text-base">Weekly collection schedule</p>
                      </div>
                      <div className="p-4 md:p-6">
                        {getWeekSchedule().length > 0 ? (
                          <div className="space-y-3 md:space-y-4">
                            {getWeekSchedule().map((schedule, index) => (
                              <div
                                key={index}
                                className="bg-white border border-gray-200 md:border-2 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4 md:p-6"
                              >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                                      <h3 className="text-base md:text-lg font-semibold text-gray-900 break-words">
                                        {schedule.formattedDate}
                                      </h3>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                      <span className="text-gray-600 text-sm md:text-base">Start - {schedule.time}</span>
                                    </div>
                                  </div>
                                  <span className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border ${getStatusStyles(schedule.status)} self-start sm:self-auto`}>
                                    {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 md:py-12">
                            <Calendar className="h-12 w-12 md:h-16 md:w-16 text-gray-400 mx-auto mb-3 md:mb-4" />
                            <p className="text-base md:text-lg font-medium text-gray-600">No schedules found for {selectedBarangay.label}</p>
                            <p className="text-sm text-gray-500 mt-2">Please check back later for updated schedules</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Month View */}
                {activeTab === "month" && (
                  <div className="space-y-4">
                    <div className="bg-white border border-gray-200 md:border-2 rounded-lg md:rounded-xl shadow-lg">
                      <div className="p-4 md:p-6 border-b border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div>
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{selectedBarangay.label}</h2>
                            <p className="text-gray-600 text-sm md:text-base">
                              {monthNames[viewMonth]} {viewYear} - Calendar View
                            </p>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={previousMonth}
                              className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <ChevronLeft className="h-3 w-3 md:h-4 md:w-4" />
                            </button>
                            <div className="min-w-[120px] md:min-w-[140px] text-center">
                              <div className="text-base md:text-lg font-semibold text-gray-900">{monthNames[viewMonth]}</div>
                              <div className="text-xs md:text-sm text-gray-600">{viewYear}</div>
                            </div>
                            <button
                              onClick={nextMonth}
                              className="h-8 w-8 md:h-10 md:w-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <ChevronRight className="h-3 w-3 md:h-4 md:w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 md:p-6">
                        {/* Calendar Grid */}
                        <div className="mb-4">
                          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                            {dayNames.map(day => (
                              <div key={day} className="text-center text-xs md:text-sm font-semibold text-gray-600 py-1 md:py-2">
                                {day}
                              </div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {renderMonthCalendar()}
                          </div>
                        </div>

                        {/* Monthly List View */}
                        <div className="mt-6 md:mt-8">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 md:mb-4">
                            {monthNames[viewMonth]} {viewYear} - List View
                          </h3>
                          {getMonthlyListView().length > 0 ? (
                            <div className="space-y-2 md:space-y-3">
                              {getMonthlyListView().map((schedule, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-1">
                                        <Calendar className="h-3 w-3 md:h-4 md:w-4 text-blue-600 flex-shrink-0" />
                                        <span className="font-medium text-gray-900 text-sm md:text-base">
                                          {schedule.formattedDate}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <Clock className="h-3 w-3 md:h-4 md:w-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-600 text-xs md:text-sm">Start - {schedule.time}</span>
                                      </div>
                                    </div>
                                    <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs font-medium border ${getStatusStyles(schedule.status)} self-start sm:self-auto`}>
                                      {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-6 md:py-8 text-gray-500 text-sm md:text-base">
                              No schedules found for {monthNames[viewMonth]} {viewYear}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedBarangay && (
          <div className="max-w-2xl mx-auto text-center py-12 md:py-16">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-full h-24 w-24 md:h-32 md:w-32 flex items-center justify-center mx-auto mb-4 md:mb-6">
              <CalendarDays className="h-12 w-12 md:h-16 md:w-16 text-blue-600" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-3">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 text-base md:text-lg">
              Select your barangay from the dropdown above to view your personalized waste collection schedule.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default PublicSchedule;