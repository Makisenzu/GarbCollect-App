import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const weeklyData = [
  { name: "Mon", collections: 45 },
  { name: "Tue", collections: 52 },
  { name: "Wed", collections: 48 },
  { name: "Thu", collections: 61 },
  { name: "Fri", collections: 55 },
  { name: "Sat", collections: 38 },
  { name: "Sun", collections: 28 },
];

const monthlyData = [
  { name: "Week 1", collections: 320 },
  { name: "Week 2", collections: 380 },
  { name: "Week 3", collections: 410 },
  { name: "Week 4", collections: 370 },
];

export function CollectionChart() {
  const [timeRange, setTimeRange] = useState('weekly');

  const data = timeRange === 'weekly' ? weeklyData : monthlyData;
  const title = timeRange === 'weekly' ? 'Weekly Collections' : 'Monthly Collections';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('weekly')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'weekly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange('monthly')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            className="text-gray-600 text-sm"
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            className="text-gray-600 text-sm"
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontSize: "14px"
            }}
          />
          <Line 
            type="monotone" 
            dataKey="collections" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Weekly waste data
const weeklyWasteData = [
  { name: "Week 1", organic: 340, recyclable: 280, general: 180 },
  { name: "Week 2", organic: 385, recyclable: 310, general: 220 },
  { name: "Week 3", organic: 420, recyclable: 340, general: 190 },
  { name: "Week 4", organic: 390, recyclable: 285, general: 205 },
];

// Monthly waste data (aggregated by month)
const monthlyWasteData = [
  { name: "Jan", organic: 1450, recyclable: 1180, general: 820 },
  { name: "Feb", organic: 1580, recyclable: 1250, general: 890 },
  { name: "Mar", organic: 1620, recyclable: 1320, general: 910 },
  { name: "Apr", organic: 1520, recyclable: 1210, general: 850 },
  { name: "May", organic: 1680, recyclable: 1350, general: 940 },
  { name: "Jun", organic: 1720, recyclable: 1420, general: 980 },
];

export function WasteChart() {
  const [timeRange, setTimeRange] = useState('weekly');

  const data = timeRange === 'weekly' ? weeklyWasteData : monthlyWasteData;
  const title = timeRange === 'weekly' ? 'Waste Categories (Weekly)' : 'Waste Categories (Monthly)';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setTimeRange('weekly')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'weekly'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange('monthly')}
            className={`px-3 py-1 text-sm rounded-md ${
              timeRange === 'monthly'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            className="text-gray-600 text-sm"
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            className="text-gray-600 text-sm"
            axisLine={false}
            tickLine={false}
            domain={[0, 'dataMax + 100']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              fontSize: "14px"
            }}
          />
          <Bar dataKey="organic" fill="#16a34a" radius={[1, 1, 0, 0]} />
          <Bar dataKey="recyclable" fill="#40CED3" radius={[1, 1, 0, 0]} />
          <Bar dataKey="general" fill="#F56D6F" radius={[1, 1, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}