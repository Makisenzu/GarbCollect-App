import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

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
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">Track collection performance over time</p>
        </div>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setTimeRange('weekly')}
            className={`px-3 py-1.5 text-xs font-medium border ${
              timeRange === 'weekly'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } rounded-l-md transition-colors`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange('monthly')}
            className={`px-3 py-1.5 text-xs font-medium border-t border-b border-r ${
              timeRange === 'monthly'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } rounded-r-md transition-colors`}
          >
            Monthly
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              fontSize: "12px"
            }}
            labelStyle={{ color: '#374151', fontWeight: 600 }}
          />
          <Line 
            type="monotone" 
            dataKey="collections" 
            stroke="#111827" 
            strokeWidth={2}
            dot={{ fill: "#111827", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const weeklyWasteData = [
  { name: "Week 1", organic: 340, recyclable: 280, general: 180 },
  { name: "Week 2", organic: 385, recyclable: 310, general: 220 },
  { name: "Week 3", organic: 420, recyclable: 340, general: 190 },
  { name: "Week 4", organic: 390, recyclable: 285, general: 205 },
];

const monthlyWasteData = [
  { name: "Jan", organic: 1450, recyclable: 1180, general: 820 },
  { name: "Feb", organic: 1580, recyclable: 1250, general: 890 },
  { name: "Mar", organic: 1620, recyclable: 1320, general: 910 },
  { name: "Apr", organic: 1520, recyclable: 1210, general: 850 },
  { name: "May", organic: 1680, recyclable: 1350, general: 940 },
  { name: "Jun", organic: 1720, recyclable: 1420, general: 980 },
];

const CustomLegend = () => (
  <div className="flex justify-center gap-6 mt-4">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-green-600"></div>
      <span className="text-xs font-medium text-gray-700">Organic</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
      <span className="text-xs font-medium text-gray-700">Recyclable</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-sm bg-gray-400"></div>
      <span className="text-xs font-medium text-gray-700">General</span>
    </div>
  </div>
);

export function WasteChart() {
  const [timeRange, setTimeRange] = useState('weekly');

  const data = timeRange === 'weekly' ? weeklyWasteData : monthlyWasteData;
  const title = timeRange === 'weekly' ? 'Waste Categories (Weekly)' : 'Waste Categories (Monthly)';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">Breakdown by waste type</p>
        </div>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setTimeRange('weekly')}
            className={`px-3 py-1.5 text-xs font-medium border ${
              timeRange === 'weekly'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } rounded-l-md transition-colors`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeRange('monthly')}
            className={`px-3 py-1.5 text-xs font-medium border-t border-b border-r ${
              timeRange === 'monthly'
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } rounded-r-md transition-colors`}
          >
            Monthly
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
              fontSize: "12px"
            }}
            labelStyle={{ color: '#374151', fontWeight: 600 }}
          />
          <Bar dataKey="organic" fill="#16a34a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="recyclable" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="general" fill="#9ca3af" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <CustomLegend />
    </div>
  );
}