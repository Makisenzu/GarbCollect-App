import React from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import Header from './components/Header';

const Home = () => {
  return (
    <Header
    >
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Hero />
        <Features />
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 gap-8">

        </div>
      </div>
    </Header>
  );
};

export default Home;