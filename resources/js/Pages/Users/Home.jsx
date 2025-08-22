import React from 'react';
import Hero from './components/HomeComponents/Hero';
import Features from './components/HomeComponents/Features';
import Header from './components/HomeComponents/Header';
import DisplayComponents from './components/HomeComponents/DisplayComponent';
import photo from "@/images/throw.png";
import ecoImage from "@/images/3rs.jpeg";
import CenteredImage from './components/HomeComponents/CenteredImage';

const Home = () => {
  return (
    <Header
    >
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <Hero />
          <DisplayComponents
            title="Everything You Need for Waste Management"
            description="Comprehensive tools and information to make garbage collection efficient and hassle-free"
            subtitle="Routes"
            subDescription="Helps you navigate nearest garbage collection sites for your convenience"
            buttonText="Show Sites"
            buttonAction={() => alert("Showing sites...")}
            imageSrc={photo}
            imageAlt="Collection Routes Map"
            reverse
          />

          <CenteredImage
          imageSrc={ecoImage}
          imageAlt="Eco City Illustration"
          description="Building a cleaner, greener, and more sustainable community starts with proper waste management. 
                       Together, we can create a future where urban growth and environmental care go hand in hand."
          />
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