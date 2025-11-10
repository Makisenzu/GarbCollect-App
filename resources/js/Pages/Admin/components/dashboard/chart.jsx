import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const COLORS = [
  '#16a34a', // green
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

export function CollectionChart({ chartData }) {
  const [timeRange, setTimeRange] = useState('weekly');

  const data = timeRange === 'weekly' ? chartData.weekly : chartData.monthly;
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

export function WasteChart({ chartData, garbageTypes }) {
  const [timeRange, setTimeRange] = useState('weekly');

  const data = timeRange === 'weekly' ? chartData.weeklyWaste : chartData.monthlyWaste;
  const title = timeRange === 'weekly' ? 'Waste Categories (Weekly)' : 'Waste Categories (Monthly)';

  const CustomLegend = () => (
    <div className="flex justify-center gap-6 mt-4 flex-wrap">
      {garbageTypes && garbageTypes.map((type, index) => (
        <div key={type.id} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-sm" 
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          ></div>
          <span className="text-xs font-medium text-gray-700">{type.name}</span>
        </div>
      ))}
    </div>
  );

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
          {garbageTypes && garbageTypes.map((type, index) => (
            <Bar 
              key={type.id}
              dataKey={type.name} 
              fill={COLORS[index % COLORS.length]} 
              radius={[4, 4, 0, 0]} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <CustomLegend />
    </div>
  );
}