import React, { useEffect, useState } from 'react';
import Hero from './components/HomeComponents/Hero';
import Header from './components/HomeComponents/Header';
import DisplayComponents from './components/HomeComponents/DisplayComponent';
import photo from "@/images/throw.png";
import ecoImage from "@/images/3rs.jpeg";
import CenteredImage from './components/HomeComponents/CenteredImage';
import { Recycle, MapPin, Clock, Users, Sparkles, ArrowRight, Leaf, Truck } from 'lucide-react';

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Header>
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
        <Hero />
        
        {/* Enhanced Features Section */}
        <section className="py-16 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className={`text-center mb-16 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">Why Choose GarbCollect?</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Everything You Need for <span className="text-green-600">Smart Waste Management</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive tools and real-time information to make garbage collection efficient, 
                sustainable, and completely hassle-free for our community.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                {
                  icon: <MapPin className="h-8 w-8" />,
                  title: "Smart Routing",
                  description: "Optimized collection routes for maximum efficiency",
                  color: "text-blue-600 bg-blue-100"
                },
                {
                  icon: <Clock className="h-8 w-8" />,
                  title: "Real-time Updates",
                  description: "Live tracking and schedule notifications",
                  color: "text-green-600 bg-green-100"
                },
                {
                  icon: <Recycle className="h-8 w-8" />,
                  title: "Eco-Friendly",
                  description: "Sustainable waste management practices",
                  color: "text-emerald-600 bg-emerald-100"
                },
                {
                  icon: <Users className="h-8 w-8" />,
                  title: "Community Focus",
                  description: "Designed for San Francisco residents",
                  color: "text-purple-600 bg-purple-100"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl border border-gray-100 hover:border-green-200 transition-all duration-500 transform hover:-translate-y-2 ${mounted ? 'opacity-100' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <DisplayComponents
          title="Intelligent Route Planning"
          description="Our advanced routing system ensures efficient garbage collection across all barangays"
          subtitle="Smart Collection Routes"
          subDescription="Navigate to the nearest garbage collection sites with real-time updates and optimized paths. Our intelligent system reduces waiting times and improves overall collection efficiency for a cleaner community."
          buttonText="Explore Routes"
          buttonAction={() => route('barangay.routes')}
          imageSrc={photo}
          imageAlt="Smart Collection Routes Visualization"
          reverse={true}
        />
        
      </div>
    </Header>
  );
};

export default Home;