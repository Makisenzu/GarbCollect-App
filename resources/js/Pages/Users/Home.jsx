import React from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import Header from './components/Header';
import TrackTrucks from './components/TrackTrucks';

const Home = () => {
  return (
    <Header
    >
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Hero />
        <TrackTrucks/>
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        </div>
        <footer className="bg-green-800 text-white py-8 mt-12 -mb-8">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p>© 2025 GarbCollect. All rights reserved.</p>
            <p className="mt-2 text-green-200">San Francisco Garbage Collection Routing</p>
          </div>
        </footer>
      </div>
    </Header>
  );
};

export default Home;