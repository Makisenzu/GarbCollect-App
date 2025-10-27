import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Barangay from './components/residents/Barangay';
import Reviews from './components/residents/Reviews';

export default function Residents() {
  const { baranggays, categories, reviews, average_rating } = usePage().props;
  
  const barangaysData = baranggays.data || baranggays;
  const paginationLinks = baranggays.links || null;

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Residents Dashboard</h2>}
    >
      <Head title="Residents" />

      <div className="py-1">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Barangay 
            barangays={barangaysData} 
            links={paginationLinks}
            mapBoxKey={import.meta.env.VITE_MAPBOX_ACCESS_TOKEN} 
          />
          <Reviews reviews={reviews} average_rating={average_rating} />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}