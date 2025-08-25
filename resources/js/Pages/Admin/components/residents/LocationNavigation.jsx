import { useState, useEffect, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import FormModal from '@/Components/FormModal';
import PrimaryButton from '@/Components/PrimaryButton';
import { IoMdAddCircleOutline } from "react-icons/io";
import { FaRegEye } from "react-icons/fa";
import { FaRegTrashCan } from "react-icons/fa6";
import { CiEdit } from "react-icons/ci";
import { showAlert, confirmDialog } from '@/SweetAlert';

export default function LocationNavigation() {
  const { municipalities = [], baranggays = [], puroks = [] } = usePage().props;

  const [activeTab, setActiveTab] = useState('municipality');
  const [selectedMunicipality, setSelectedMunicipality] = useState('');
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState(null);

  const [selectedBarangayId, setSelectedBarangayId] = useState(null);
  const [selectedBarangayName, setSelectedBarangayName] = useState('');

  const [selectedPurokId, setSelectedPurokId] = useState(null);

  const [municipalityData, setMunicipalityData] = useState(municipalities);
  const [baranggayData, setBaranggayData] = useState(baranggays);
  const [purokData, setPurokData] = useState(puroks);

  useEffect(() => setMunicipalityData(municipalities), [municipalities]);
  useEffect(() => setBaranggayData(baranggays), [baranggays]);
  useEffect(() => setPurokData(puroks), [puroks]);

  const [showAddBarangayModal, setShowAddBarangayModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [showPurokModal, setShowAddPurokModal] = useState(false);
  const [purokProcessing, setPurokProcessing] = useState(false);

  const [showEditPurokModal, setShowEditPurokModal] = useState(false);
  const [editPurokProcessing, setEditPurokProcessing] = useState(false);
  const [editingPurok, setEditingPurok] = useState(null);

  const [showEditBarangayModal, setShowEditBarangayModal] = useState(false);
  const [editBarangayProcessing, setEditBarangayProcessing] = useState(false);
  const [editingBarangay, setEditingBarangay] = useState(null);

  const barangayFields = useMemo(() => ([
    { name: 'baranggay_name', label: 'Barangay Name', type: 'text', required: true },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'Urban', label: 'Urban' },
        { value: 'Rural', label: 'Rural' }
      ],
      required: true
    }
  ]), []);

  const purokFields = useMemo(() => ([
    { name: 'purok_name', label: 'Purok Name', type: 'text', required: true }
  ]), []);

  const editBarangayFields = barangayFields;
  const editPurokFields = purokFields;

  const [addBarangayFormData, setAddBarangayFormData] = useState({});
  const [addPurokFormData, setAddPurokFormData] = useState({});
  const [editBarangayFormData, setEditBarangayFormData] = useState({});
  const [editPurokFormData, setEditPurokFormData] = useState({});

  const openAddBarangay = () => {
    setAddBarangayFormData({});
    setShowAddBarangayModal(true);
  };
  const closeAddBarangay = () => {
    setShowAddBarangayModal(false);
    setAddBarangayFormData({});
  };

  const openAddPurok = () => {
    setAddPurokFormData({});
    setShowAddPurokModal(true);
  };
  const closeAddPurok = () => {
    setShowAddPurokModal(false);
    setAddPurokFormData({});
  };

  const openEditBarangay = (b) => {
    setEditingBarangay(b);
    setEditBarangayFormData({
      baranggay_name: b.baranggay_name,
      type: b.type
    });
    setShowEditBarangayModal(true);
  };
  
  const closeEditBarangay = () => {
    setShowEditBarangayModal(false);
    setEditingBarangay(null);
    setEditBarangayFormData({});
  };

  const openEditPurok = (p) => {
    setEditingPurok(p);
    setEditPurokFormData({
      purok_name: p.purok_name
    });
    setShowEditPurokModal(true);
  };
  
  const closeEditPurok = () => {
    setShowEditPurokModal(false);
    setEditingPurok(null);
    setEditPurokFormData({});
  };

  const handleAddBarangaySubmit = (formData) =>
    new Promise((resolve, reject) => {
      setProcessing(true);
      router.post('/municipality/baranggay/addBarangay',
        { ...formData, municipality_id: selectedMunicipalityId },
        {
          onSuccess: () => {
            showAlert('success', 'Barangay added successfully');
            resolve();
          },
          onError: (errors) => {
            console.error(errors);
            showAlert('error', 'Failed to add barangay');
            reject(errors);
          },
          onFinish: () => {
            setProcessing(false);
          }
        }
      );
    });

  const handleAddPurokSubmit = (formData) =>
    new Promise((resolve, reject) => {
      setPurokProcessing(true);
      router.post('/municipality/baranggay/purok/addPurok',
        { ...formData, baranggay_id: selectedBarangayId },
        {
          onSuccess: () => {
            showAlert('success', 'Purok added successfully');
            resolve();
          },
          onError: (errors) => {
            showAlert('error', 'Failed to add purok');
            reject(errors);
          },
          onFinish: () => setPurokProcessing(false)
        }
      );
    });

  const handleEditBarangaySubmit = (formData) =>
    new Promise((resolve, reject) => {
      setEditBarangayProcessing(true);
      router.put(`/municipality/barangay/editBarangay/${selectedBarangayId}`,
        formData,
        {
          onSuccess: () => {
            showAlert('success', 'Barangay updated successfully');
            resolve();
          },
          onError: (errors) => {
            showAlert('error', 'Failed to update barangay');
            reject(errors);
          },
          onFinish: () => setEditBarangayProcessing(false)
        }
      );
    });

  const handleEditPurokSubmit = (formData) =>
    new Promise((resolve, reject) => {
      setEditPurokProcessing(true);
      router.put(`/municipality/barangay/editPurok/${selectedPurokId}`,
        formData,
        {
          onSuccess: () => {
            showAlert('success', 'Purok updated successfully');
            resolve();
          },
          onError: (errors) => {
            showAlert('error', 'Failed to update purok');
            reject(errors);
          },
          onFinish: () => setEditPurokProcessing(false)
        }
      );
    });

  const handleDeleteBarangay = async (id) => {
    const confirmed = await confirmDialog(
      'Are you sure?',
      'This will delete the barangay permanently!',
      'Yes, delete it'
    );
    if (!confirmed) return;

    router.delete(`/municipality/barangay/${id}/delete`, {
      onSuccess: () => showAlert('success', 'Barangay deleted successfully'),
      onError: () => showAlert('error', 'Failed to delete barangay'),
    });
  };

  const handleDeletePurok = async (id) => {
    const confirmed = await confirmDialog(
      'Are you sure?',
      'This will delete the purok permanently!',
      'Yes, delete it'
    );
    if (!confirmed) return;

    router.delete(`/municipality/barangay/purok/${id}/delete`, {
      onSuccess: () => showAlert('success', 'Purok deleted successfully'),
      onError: () => showAlert('error', 'Failed to delete purok'),
    });
  };

  const renderTable = () => {
    switch (activeTab) {
      case 'municipality':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Municipality</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barangays</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {municipalityData.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{m.municipality_name}</td>
                    <td className="px-6 py-4">{m.baranggays_count}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedMunicipality(m.municipality_name);
                          setSelectedMunicipalityId(m.id);
                          router.get(
                            `/municipalities/${m.id}/barangay`,
                            {},
                            { preserveState: true, replace: true }
                          );
                          setActiveTab('barangay');
                        }}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <FaRegEye size={20}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'barangay':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setActiveTab('municipality')} className="text-blue-500">
                ← Back
              </button>
              <PrimaryButton onClick={openAddBarangay}>
                <IoMdAddCircleOutline className="mr-2" /> Add Barangay
              </PrimaryButton>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Barangay</th>
                  <th className="px-6 py-3">Puroks</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {baranggayData.map((b) => (
                  <tr key={b.id}>
                    <td className="px-6 py-4">{b.baranggay_name}</td>
                    <td className="px-6 py-4">{b.puroks_count}</td>
                    <td className="px-6 py-4">{b.type}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBarangayId(b.id);
                          setSelectedBarangayName(b.baranggay_name);
                          router.get(
                            `/baranggay/${b.id}/purok`,
                            {},
                            { preserveState: true, replace: true }
                          );
                          setActiveTab('purok');
                        }}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <FaRegEye size={20}/>
                      </button>
                      <button
                        onClick={() => openEditBarangay(b)}
                        className="text-gray-600 hover:text-green-600"
                      >
                        <CiEdit size={20}/>
                      </button>
                      <button onClick={() => handleDeleteBarangay(b.id)} className="text-red-600">
                        <FaRegTrashCan size={20}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'purok':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setActiveTab('barangay')} className="text-blue-500">
                ← Back
              </button>
              <PrimaryButton onClick={openAddPurok}>
                <IoMdAddCircleOutline className="mr-2"/> Add Purok
              </PrimaryButton>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3">Purok</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purokData.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4">{p.purok_name}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => setSelectedPurokId(p.id)} className="text-blue-600">
                        <FaRegEye size={20}/>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPurokId(p.id);
                          openEditPurok(p);
                        }}
                        className="text-green-600"
                      >
                        <CiEdit size={20}/>
                      </button>
                      <button onClick={() => handleDeletePurok(p.id)} className="text-red-600">
                        <FaRegTrashCan size={20}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="py-6">
      <div className="bg-white shadow-sm rounded-lg overflow-hidden p-6">
        <h3 className="text-lg font-medium mb-4">
          {activeTab === 'municipality' && 'Municipalities'}
          {activeTab === 'barangay' && `Barangays in ${selectedMunicipality}`}
          {activeTab === 'purok' && `Puroks in ${selectedBarangayName}`}
        </h3>
        {renderTable()}
      </div>

      <FormModal
        show={showAddBarangayModal}
        onClose={closeAddBarangay}
        title="Add Barangay"
        fields={barangayFields}
        onSubmit={handleAddBarangaySubmit}
        submitText={processing ? 'Adding...' : 'Add Barangay'}
        processing={processing}
        formData={addBarangayFormData}
        onFormChange={setAddBarangayFormData}
        key={`add-brgy-${showAddBarangayModal}`}
      />

      <FormModal
        show={showPurokModal}
        onClose={closeAddPurok}
        title="Add Purok"
        fields={purokFields}
        onSubmit={handleAddPurokSubmit}
        submitText={purokProcessing ? 'Adding...' : 'Add Purok'}
        processing={purokProcessing}
        formData={addPurokFormData}
        onFormChange={setAddPurokFormData}
        key={`add-purok-${showPurokModal}`}
      />

      <FormModal
        show={showEditBarangayModal}
        onClose={closeEditBarangay}
        title="Edit Barangay"
        initialData={editingBarangay}
        fields={editBarangayFields}
        onSubmit={handleEditBarangaySubmit}
        submitText={editBarangayProcessing ? 'Saving...' : 'Save Changes'}
        processing={editBarangayProcessing}
        formData={editBarangayFormData}
        onFormChange={setEditBarangayFormData}
        key={`edit-brgy-${editingBarangay?.id || 'none'}`}
      />

      <FormModal
        show={showEditPurokModal}
        onClose={closeEditPurok}
        title="Edit Purok"
        initialData={editingPurok}
        fields={editPurokFields}
        onSubmit={handleEditPurokSubmit}
        submitText={editPurokProcessing ? 'Saving...' : 'Save Changes'}
        processing={editPurokProcessing}
        formData={editPurokFormData}
        onFormChange={setEditPurokFormData}
        key={`edit-purok-${editingPurok?.id || 'none'}`}
      />
    </div>
  );
}
