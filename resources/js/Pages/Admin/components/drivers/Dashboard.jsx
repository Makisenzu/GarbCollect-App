import React from 'react';
import Header from '@/Pages/Admin/components/drivers/Header';
import DriverFilter from '@/Pages/Admin/components/drivers/DriverFilter';
import DriverList from '@/Pages/Admin/components/drivers/DriverList';
import StatCard from '@/Pages/Admin/components/drivers/StatCard';
import FormModal from '@/Components/FormModal';
import { showAlert,  confirmDialog } from '@/SweetAlert'
import { usePage, useForm, router } from '@inertiajs/react';

const Dashboard = () => {
  const { drivers, users, stats } = usePage().props;
  
  const [activeFilter, setActiveFilter] = React.useState('all');
  const [showAddDriverModal, setShowAddDriverModal] = React.useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    user_id: '',
    license_number: '',
    status: 'active',
    current_latitude: null,
    current_longitude: null
  });

  const driverFields = [
    {
      name: 'user_id',
      label: 'Applicant',
      type: 'select',
      required: true,
      options: users && users.length > 0 
        ? users.map(user => ({
            value: user.id,
            label: `${user.name || ''} ${user.lastname || ''} - ${user.email || ''}`
          }))
        : [],
    },
    {
      name: 'license_number',
      label: 'License Number',
      type: 'text',
      required: true,
      placeholder: 'Enter license number'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: "active", label: 'Active' },
        { value: "inactive", label: 'Inactive' },
        { value: "pending", label: 'Pending' },
        { value: "onduty", label: 'On Duty' },
        { value: "resigned", label: 'Resigned' }
      ]
    }
  ];

  const handleAddDriverSubmit = (formData) => {
    post('/admin/Driver/add', {
      data: formData,
      preserveScroll: true,
      onSuccess: (page) => {
        console.log('Success response:', page);
        showAlert('success', 'Added Successfully')
        setShowAddDriverModal(false);
        reset();
        router.reload();
      },
      onError: (errors) => {
        console.log('Errors:', errors);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Header />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
{stats && Array.isArray(stats) && stats.map((stat, index) => (
  <StatCard 
    key={index}
    title={stat.title}
    value={stat.value}
    description={stat.description}
  />
))}
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Active Drivers</h2>
              <p className="text-sm text-gray-600 mt-1">Manage driver schedules and assignments</p>
            </div>
            
            <div className="flex items-center mt-3 sm:mt-0 space-x-2">
              <button 
                onClick={() => setShowAddDriverModal(true)} 
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Driver
              </button>
              <DriverFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            </div>
          </div>

          <DriverList drivers={drivers} activeFilter={activeFilter} />
        </div>

        <FormModal
          show={showAddDriverModal}
          onClose={() => setShowAddDriverModal(false)}
          title="Add New Driver"
          fields={driverFields}
          onSubmit={handleAddDriverSubmit}
          submitText={processing ? 'Adding...' : 'Add Driver'}
          processing={processing}
          errors={errors}
          formData={data}
          onFormChange={setData}
        />
      </div>
    </div>
  );
};

export default Dashboard;