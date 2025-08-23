// import React, { useState } from 'react';
// import Header from '@/Pages/Admin/components/drivers/Header';
// import DriverFilter from '@/Pages/Admin/components/drivers/DriverFilter';
// import DriverList from '@/Pages/Admin/components/drivers/DriverList';
// import StatCard from '@/Pages/Admin/components/drivers/StatCard';
// import { drivers, stats } from '@/Pages/Admin/components/drivers/driverdata';

// const Dashboard = () => {
//   const [activeFilter, setActiveFilter] = useState('all');

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         <Header />
        
//         <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//         {stats.map((stat, index) => (
//               <StatCard 
//                 key={index}
//                 title={stat.title}
//                 value={stat.value}
//                 description={stat.description}
//                 change={stat.change}
//               />
//             ))}
//             <div className="lg:col-span-1">
//               <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//                 <h2 className="text-lg font-semibold mb-2">Active Drivers</h2>
//                 <p className="text-gray-600 text-sm mb-4">Manage driver schedules and barangay assignments</p>
    
//                 <DriverFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
//                 <DriverList drivers={drivers} activeFilter={activeFilter} />
//               </div>
//             </div>
          
//           {/* <div className="space-y-6">
//             {stats.map((stat, index) => (
//               <StatCard 
//                 key={index}
//                 title={stat.title}
//                 value={stat.value}
//                 description={stat.description}
//                 change={stat.change}
//               />
//             ))}
            
//            <div className="bg-white rounded-lg shadow-md p-6">
//               <h3 h3 className="font-semibold mb-4">2 On-Duty Filter</h3>
//               <div className="space-y-4">
//                 {drivers.filter(driver => driver.status === 'active' || driver.status === 'on duty').map(driver => (
//                   <div key={driver.id} className="flex items-start">
//                     <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-1">
//                       {driver.initials}
//                     </div>
//                     <div>
//                       <h4 className="font-medium">{driver.name} <span className="text-green-600 text-sm">{driver.status}</span></h4>
//                       <p className="text-sm text-gray-600">{driver.email}</p>
//                       <p className="text-sm text-gray-600">{driver.phone}</p>
//                       <p className="text-sm text-gray-600">{driver.barangay}</p>
//                       <p className="text-sm text-gray-600">{driver.schedule}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

import React, { useState } from 'react';
import Header from '@/Pages/Admin/components/drivers/Header';
import DriverFilter from '@/Pages/Admin/components/drivers/DriverFilter';
import DriverList from '@/Pages/Admin/components/drivers/DriverList';
import StatCard from '@/Pages/Admin/components/drivers/StatCard';
import { drivers, stats } from '@/Pages/Admin/components/drivers/driverdata';

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        {/* Stats cards row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard 
              key={index}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              change={stat.change}
            />
          ))}
        </div>
        
        {/* Main content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Active Drivers</h2>
              <p className="text-sm text-gray-600 mt-1">Manage driver schedules and barangay assignments</p>
            </div>
            
            {/* Add Driver Button (optional) */}
            <button className="mt-3 sm:mt-0 flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Driver
            </button>
          </div>
  
          <DriverFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          <DriverList drivers={drivers} activeFilter={activeFilter} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;