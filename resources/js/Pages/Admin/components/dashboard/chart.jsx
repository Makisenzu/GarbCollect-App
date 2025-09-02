import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const collectionData = [
  { name: "Mon", collections: 45 },
  { name: "Tue", collections: 52 },
  { name: "Wed", collections: 48 },
  { name: "Thu", collections: 61 },
  { name: "Fri", collections: 55 },
  { name: "Sat", collections: 38 },
  { name: "Sun", collections: 28 },
];

export function CollectionChart() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Collections</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={collectionData}>
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

const wasteData = [
  { name: "Week 1", organic: 340, recyclable: 280, general: 180 },
  { name: "Week 2", organic: 385, recyclable: 310, general: 220 },
  { name: "Week 3", organic: 420, recyclable: 340, general: 190 },
  { name: "Week 4", organic: 390, recyclable: 285, general: 205 },
];

export function WasteChart() {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Waste Categories</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={wasteData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="name" 
            className="text-gray-600 text-sm"
            axisLine={false}
            tickLine={false}
          />
          {/* <YAxis 
            className="text-gray-600 text-sm"
            axisLine={false}
            tickLine={false}
          /> */}

        <YAxis 
            className="text-gray-600 text-sm"
            axisLine={false}
            tickLine={false}
            domain={[0, 'dataMax + 50']} // Add padding to the max value
//   // or
            //   domain={[0, 500]} // Set a fixed maximum
  // or
            //   domain={['dataMin', 'dataMax']} // Use exact min/max from data
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