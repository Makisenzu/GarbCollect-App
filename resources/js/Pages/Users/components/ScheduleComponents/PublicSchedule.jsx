import { useState, useEffect } from "react";
import ResidentMap from "../ResidentComponents/ResidentMap";
import { Calendar, Clock, ChevronLeft, ChevronRight, CalendarDays, Menu, X, MapPin, Truck } from "lucide-react";
import Select from 'react-select';
import axios from 'axios';
import ClientPagination from "@/Components/ClientPagination";
import ScheduleHero from "./ScheduleHero";

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
  const [showResidentMap, setShowResidentMap] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);

  const [selectedBarangay, setSelectedBarangay] = useState(null);
  const [barangayOptions, setBarangayOptions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [loadingBarangays, setLoadingBarangays] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [loadingTodaySchedules, setLoadingTodaySchedules] = useState(true);
  const [currentDate] = useState(new Date());
  const [viewMonth, setViewMonth] = useState(currentDate.getMonth());
  const [viewYear, setViewYear] = useState(currentDate.getFullYear());
  const [activeTab, setActiveTab] = useState("today");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

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
    const fetchTodaySchedules = async () => {
      try {
        setLoadingTodaySchedules(true);
        const response = await axios.get('/getBarangay/schedule/today/all');
        
        if (response.data.success) {
          setTodaySchedules(response.data.schedules || []);
        }
      } catch (error) {
        console.error('Error fetching today\'s schedules:', error);
        setTodaySchedules([]);
      } finally {
        setLoadingTodaySchedules(false);
      }
    };

    fetchTodaySchedules();
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
          setCurrentPage(1);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Cleanup effect: restore scroll when component unmounts or fullscreen closes
  useEffect(() => {
    return () => {
      // Ensure body scroll is restored on unmount
      document.body.style.overflow = 'auto';
    };
  }, []);

  // NEW: Enhanced schedule status detection
  const getScheduleStatus = (schedule) => {
    const now = new Date();
    const collectionDate = new Date(schedule.collection_date);
    const today = new Date().toDateString();
    const scheduleDay = new Date(schedule.collection_date).toDateString();

    // If it's not today, check if it's in the future
    if (today !== scheduleDay) {
        if (collectionDate < now) {
            return schedule.status === 'completed' ? "completed" : "failed";
        }
        return "upcoming"; // Changed from "active" to "upcoming" for clarity
    }

    // For today's schedule
    if (schedule.collection_time) {
        const [hours, minutes] = schedule.collection_time.split(':');
        collectionDate.setHours(parseInt(hours), parseInt(minutes), 0);
    } else {
        collectionDate.setHours(8, 0, 0);
    }
    
    const endTime = new Date(collectionDate);
    endTime.setHours(endTime.getHours() + 4);
    
    if (now < collectionDate) return "upcoming";
    if (now >= collectionDate && now <= endTime) {
        return schedule.status === 'in_progress' ? "in_progress" : "active";
    }
    if (now > endTime && schedule.status === 'completed') return "completed";
    if (now > endTime && schedule.status !== 'completed') return "failed";
    
    return "upcoming";
  };

  // NEW: Filter to only show active and ongoing schedules
  const isActiveOrOngoingSchedule = (schedule) => {
    const status = getScheduleStatus(schedule);
    return status === 'active' || status === 'in_progress';
  };

  const handleTrackSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    
    // If barangay isn't already selected and we have barangay info from schedule
    if (!selectedBarangay && schedule.barangay_id) {
      const barangayOption = barangayOptions.find(opt => opt.value === schedule.barangay_id);
      if (barangayOption) {
        setSelectedBarangay(barangayOption);
      }
    }
    
    setShowResidentMap(true);
    setIsFullscreenMap(true);
    
    document.body.style.overflow = 'hidden';
  };

  const handleCloseMap = () => {
    setShowResidentMap(false);
    setIsFullscreenMap(false);
    
    // Re-enable body scroll
    document.body.style.overflow = 'auto';
  };

  // UPDATED: Get today's active schedules only
  const getTodayActiveSchedules = () => {
    return getTodaySchedule().filter(schedule => 
      isActiveOrOngoingSchedule(schedule.originalData)
    );
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

  const getTimeRemaining = (schedule) => {
    const now = new Date();
    const collectionDate = new Date(schedule.collection_date);

    if (schedule.collection_time) {
      const [hours, minutes] = schedule.collection_time.split(':');
      collectionDate.setHours(parseInt(hours), parseInt(minutes), 0);
    } else {
      collectionDate.setHours(8, 0, 0);
    }

    const timeDiff = collectionDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isActive: true };
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isActive: false };
  };

  const transformScheduleData = () => {
    if (!schedules.length) {
      return [];
    }
    
    return schedules.map(schedule => {
      const status = getScheduleStatus(schedule);
      const formattedDate = formatScheduleDate(schedule.collection_date);
      const formattedTime = formatTime(schedule.collection_time);
      const timeRemaining = getTimeRemaining(schedule);

      return {
        id: schedule.id,
        formattedDate,
        time: formattedTime,
        status,
        timeRemaining,
        collection_date: schedule.collection_date,
        collection_time: schedule.collection_time,
        barangay_name: schedule.barangay?.baranggay_name || 'Unknown',
        barangay_id: schedule.barangay_id,
        originalData: schedule
      };
    });
  };

  const transformTodayScheduleData = () => {
    if (!todaySchedules.length) {
      return [];
    }
    
    return todaySchedules.map(schedule => {
      const status = getScheduleStatus(schedule);
      const formattedDate = formatScheduleDate(schedule.collection_date);
      const formattedTime = formatTime(schedule.collection_time);
      const timeRemaining = getTimeRemaining(schedule);

      return {
        id: schedule.id,
        formattedDate,
        time: formattedTime,
        status,
        timeRemaining,
        collection_date: schedule.collection_date,
        collection_time: schedule.collection_time,
        barangay_name: schedule.barangay?.baranggay_name || 'Unknown',
        barangay_id: schedule.barangay_id,
        originalData: schedule
      };
    });
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-700 border-green-400/30";
      case "in_progress": return "bg-yellow-500/20 text-yellow-700 border-yellow-400/30";
      case "completed": return "bg-blue-500/20 text-blue-700 border-blue-400/30";
      case "failed": return "bg-red-500/20 text-red-700 border-red-400/30";
      case "upcoming": return "bg-purple-500/20 text-purple-700 border-purple-400/30";
      default: return "bg-gray-500/20 text-gray-700 border-gray-400/30";
    }
  };

  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (data) => Math.ceil(data.length / itemsPerPage);

  // UPDATED: Filter today's schedule to only show active/ongoing
  const getTodaySchedule = () => {
    if (!selectedBarangay) {
      // Show all today's schedules if no barangay is selected
      return transformTodayScheduleData().filter(s => 
        isActiveOrOngoingSchedule(s.originalData)
      );
    }
    const today = new Date().toDateString();
    return transformScheduleData().filter(s => 
      new Date(s.collection_date).toDateString() === today && 
      isActiveOrOngoingSchedule(s.originalData)
    );
  };

  // UPDATED: Get week schedules (show all future schedules, not just active)
  const getWeekSchedule = () => {
    if (!selectedBarangay) return [];
    
    const now = new Date();
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(now.getDate() + 7);
    
    return transformScheduleData().filter(schedule => {
      const scheduleDate = new Date(schedule.collection_date);
      return scheduleDate >= now && scheduleDate <= oneWeekFromNow;
    });
  };

  // UPDATED: Get month schedules (show all schedules in the month)
  const getMonthSchedule = () => {
    if (!selectedBarangay) {
      return [];
    }
    
    const transformedData = transformScheduleData();
    
    const currentMonthSchedules = transformedData
      .filter(schedule => {
        const scheduleDate = new Date(schedule.collection_date);
        const isInCurrentMonth = scheduleDate.getMonth() === viewMonth && scheduleDate.getFullYear() === viewYear;
        
        return isInCurrentMonth;
      })
      .map(schedule => {
        const scheduleDate = new Date(schedule.collection_date);
        return {
          ...schedule,
          date: scheduleDate.getDate(),
          dayName: scheduleDate.toLocaleDateString('en-US', { weekday: 'long' })
        };
      });

    return currentMonthSchedules;
  };

  const previousMonth = () => {
    setViewMonth(prev => prev === 0 ? 11 : prev - 1);
    if (viewMonth === 0) setViewYear(prev => prev - 1);
  };

  const nextMonth = () => {
    setViewMonth(prev => prev === 11 ? 0 : prev + 1);
    if (viewMonth === 11) setViewYear(prev => prev + 1);
  };

  const renderMonthCalendar = () => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const monthSchedule = getMonthSchedule();
    
    const calendarDays = [];
    
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="min-h-20 bg-gray-100/30 rounded-lg opacity-50">
          <div className="text-sm text-gray-400 p-2">
            {getDaysInMonth(viewMonth === 0 ? viewYear - 1 : viewYear, viewMonth === 0 ? 11 : viewMonth - 1) - firstDay + i + 1}
          </div>
        </div>
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
          className={`min-h-20 p-2 rounded-lg border transition-all ${
            isToday ? "bg-green-500/20 border-green-500" : "bg-white border-gray-200 hover:border-green-300"
          }`}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? "text-green-700" : "text-gray-900"}`}>
            {date}
          </div>
          <div className="space-y-1">
            {daySchedules.map((schedule, idx) => (
              <div key={idx}>
                <span className={`text-xs px-2 py-1 rounded border block truncate ${getStatusStyles(schedule.status)}`}>
                  {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const totalCells = 42;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    
    for (let i = 0; i < remainingCells; i++) {
      calendarDays.push(
        <div key={`next-${i}`} className="min-h-20 bg-gray-100/30 rounded-lg opacity-50">
          <div className="text-sm text-gray-400 p-2">
            {i + 1}
          </div>
        </div>
      );
    }
    
    return calendarDays;
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      height: '52px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      fontSize: '1rem',
      boxShadow: '0 2px 10px -3px rgba(0, 0, 0, 0.1)',
      '&:hover': { borderColor: '#10b981' }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#10b981' : state.isFocused ? '#ecfdf5' : 'white',
      color: state.isSelected ? 'white' : '#374151',
    })
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (loadingBarangays) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading barangays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <ScheduleHero/>

      <main className="container mx-auto px-4 py-12 -mt-12">
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Find Collection Schedules</h2>
              <p className="text-gray-600 text-lg">Select your barangay to view collection schedules</p>
            </div>
            <Select
              value={selectedBarangay}
              onChange={setSelectedBarangay}
              options={barangayOptions}
              placeholder="Choose your barangay..."
              styles={customStyles}
              isSearchable
              isClearable
              isLoading={loadingBarangays}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-6xl mx-auto">
          {/* TABS SECTION */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl shadow-md p-1">
              <button
                onClick={() => setActiveTab("today")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === "today"
                    ? "bg-green-500 text-white shadow-lg"
                    : "text-gray-700 hover:text-green-600"
                }`}
              >
                Today
              </button>
              {selectedBarangay && (
                <>
                  <button
                    onClick={() => setActiveTab("week")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === "week"
                        ? "bg-green-500 text-white shadow-lg"
                        : "text-gray-700 hover:text-green-600"
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setActiveTab("month")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                      activeTab === "month"
                        ? "bg-green-500 text-white shadow-lg"
                        : "text-gray-700 hover:text-green-600"
                    }`}
                  >
                    Month
                  </button>
                </>
              )}
            </div>
          </div>

          {/* TODAY TAB - ALWAYS VISIBLE */}
          {activeTab === "today" && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedBarangay ? `Today's Active Collections - ${selectedBarangay.label}` : "Today's Active Collections - All Barangays"}
                </h2>
                <p className="text-gray-600">{currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}</p>
              </div>
              <div className="p-6">
                {loadingTodaySchedules || (selectedBarangay && loadingSchedules) ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading today's schedules...</p>
                  </div>
                ) : getTodaySchedule().length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {getPaginatedData(getTodaySchedule()).map((schedule, index) => (
                        <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-800">{schedule.formattedDate}</h3>
                                {!selectedBarangay && (
                                  <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full font-medium">
                                    {schedule.barangay_name}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 flex items-center gap-2 mt-1">
                                <Clock className="h-4 w-4" />
                                Start - {schedule.time}
                              </p>
                              <span className={`text-xs px-3 py-1 rounded-full mt-2 inline-block ${getStatusStyles(schedule.status)}`}>
                                {schedule.status === 'in_progress' ? 'In Progress' : 'Active'}
                              </span>
                            </div>
                            <div className="text-right">
                              <button 
                                onClick={() => handleTrackSchedule(schedule)}
                                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                              >
                                <MapPin className="h-4 w-4" />
                                Track Live
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <ClientPagination
                      currentPage={currentPage}
                      totalPages={getTotalPages(getTodaySchedule())}
                      onPageChange={setCurrentPage}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-600">No active collections for today</p>
                    <p className="text-gray-500 mt-2">
                      {!selectedBarangay ? "There are no scheduled collections for today across all barangays" : "Check back later for updates"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WEEK TAB - ONLY WHEN BARANGAY SELECTED */}
          {selectedBarangay && activeTab === "week" && !loadingSchedules && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">This Week's Collections - {selectedBarangay.label}</h2>
                <p className="text-gray-600">Schedules for the next 7 days</p>
              </div>
              <div className="p-6">
                      {getWeekSchedule().length > 0 ? (
                        <>
                          <div className="space-y-4">
                            {getPaginatedData(getWeekSchedule()).map((schedule, index) => (
                              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{schedule.formattedDate}</h3>
                                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                                      <Clock className="h-4 w-4" />
                                      Start - {schedule.time}
                                    </p>
                                    <span className={`text-xs px-3 py-1 rounded-full mt-2 inline-block ${getStatusStyles(schedule.status)}`}>
                                      {schedule.status === 'in_progress' ? 'In Progress' : 
                                       schedule.status === 'active' ? 'Active' :
                                       schedule.status === 'upcoming' ? 'Upcoming' :
                                       schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    {(schedule.status === 'active' || schedule.status === 'in_progress') ? (
                                      <button 
                                        onClick={() => handleTrackSchedule(schedule)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                                      >
                                        <MapPin className="h-4 w-4" />
                                        Track Live
                                      </button>
                                    ) : (
                                      <div className="text-gray-500 text-sm">
                                        {schedule.timeRemaining.days > 0 && `${schedule.timeRemaining.days}d `}
                                        {schedule.timeRemaining.hours}h {schedule.timeRemaining.minutes}m
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <ClientPagination
                            currentPage={currentPage}
                            totalPages={getTotalPages(getWeekSchedule())}
                            onPageChange={setCurrentPage}
                          />
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-xl font-semibold text-gray-600">No collections scheduled this week</p>
                          <p className="text-gray-500 mt-2">Check the month view for upcoming schedules</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedBarangay && activeTab === "month" && !loadingSchedules && (
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-800">Monthly Schedule - {selectedBarangay.label}</h2>
                          <p className="text-gray-600">{monthNames[viewMonth]} {viewYear}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-7 gap-2 mb-4">
                        {dayNames.map(day => (
                          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {renderMonthCalendar()}
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Collection Schedule for {monthNames[viewMonth]} {viewYear}</h3>
                        {getMonthSchedule().length > 0 ? (
                          <div className="space-y-4">
                            {getMonthSchedule().map((schedule, index) => (
                              <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-800">{schedule.formattedDate}</h3>
                                    <p className="text-gray-600 flex items-center gap-2 mt-1">
                                      <Clock className="h-4 w-4" />
                                      Start - {schedule.time}
                                    </p>
                                    <span className={`text-xs px-3 py-1 rounded-full mt-2 inline-block ${getStatusStyles(schedule.status)}`}>
                                      {schedule.status === 'in_progress' ? 'In Progress' : 
                                       schedule.status === 'active' ? 'Active' :
                                       schedule.status === 'upcoming' ? 'Upcoming' :
                                       schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    {(schedule.status === 'active' || schedule.status === 'in_progress') ? (
                                      <button 
                                        onClick={() => handleTrackSchedule(schedule)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                                      >
                                        <MapPin className="h-4 w-4" />
                                        Track Live
                                      </button>
                                    ) : (
                                      <div className="text-gray-500 text-sm">
                                        {schedule.timeRemaining.days > 0 && `${schedule.timeRemaining.days}d `}
                                        {schedule.timeRemaining.hours}h {schedule.timeRemaining.minutes}m
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-lg font-semibold text-gray-600">No collections scheduled for {monthNames[viewMonth]} {viewYear}</p>
                            <p className="text-gray-500 mt-2">Try navigating to other months</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

          {/* Resident Map Section */}
          {showResidentMap && selectedSchedule && selectedSchedule.barangay_id && (
            <div 
              id="resident-map-section" 
              className={`${
                isFullscreenMap 
                  ? 'fixed inset-0 z-[9999] bg-white' 
                  : 'mt-12'
              }`}
            >
              {isFullscreenMap ? (
                // Fullscreen Mode
                <div className="w-full h-full flex flex-col">
                  {/* Fullscreen Header with Back Button */}
                  <div className="bg-black px-4 py-3 sm:px-6 sm:py-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handleCloseMap}
                        className="flex items-center gap-2 text-white hover:bg-white/20 px-3 py-2 rounded-lg transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="font-semibold">Back</span>
                      </button>
                      <div className="flex-1 text-center px-4">
                        <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                          {selectedSchedule.barangay_name}
                        </h2>
                        <p className="text-xs sm:text-sm text-white/90 hidden sm:block">
                          {selectedSchedule.formattedDate} at {selectedSchedule.time}
                              </p>
                            </div>
                            <div className="w-20"></div> {/* Spacer for centering */}
                          </div>
                        </div>

                        {/* Fullscreen Map */}
                        <div className="flex-1 relative overflow-hidden">
                          <ResidentMap 
                            mapboxKey={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                            barangayId={selectedSchedule.barangay_id}
                            scheduleId={selectedSchedule.id}
                            isFullscreen={true}
                          />
                        </div>
                      </div>
                    ) : (
                      // Normal Mode (Embedded)
                      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <h2 className="text-2xl font-bold text-gray-800">Live Collection Map</h2>
                              <p className="text-gray-600">
                                Real-time tracking for {selectedSchedule.barangay_name} - {selectedSchedule.formattedDate}
                              </p>
                            </div>
                            <button
                              onClick={handleCloseMap}
                              className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-6">
                          <ResidentMap 
                            mapboxKey={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN}
                            barangayId={selectedSchedule.barangay_id}
                            scheduleId={selectedSchedule.id}
                            isFullscreen={false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
        </div>
      </main>
    </div>
  );
};

export default PublicSchedule;