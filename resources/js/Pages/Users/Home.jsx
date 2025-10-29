import React, { useEffect, useState } from 'react';
import Hero from './components/HomeComponents/Hero';
import Header from './components/HomeComponents/Header';
import DisplayComponents from './components/HomeComponents/DisplayComponent';
import CenteredImage from './components/HomeComponents/CenteredImage';
import photo from "@/images/throw.png";
import ecoImage from "@/images/3rs.jpeg";
import { Recycle, MapPin, Clock, Users, Sparkles, ArrowRight, Leaf, Truck } from 'lucide-react';

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Header>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-blue-50">
        <Hero />
        
        {/* Enhanced Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-16 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="h-4 w-4" />
                Smart Features
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need for{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Smart Waste Management
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive tools and real-time information to make garbage collection efficient, 
                sustainable, and hassle-free for our community.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: <MapPin className="h-7 w-7" />,
                  title: "Smart Routing",
                  description: "Optimized collection routes for maximum efficiency",
                  color: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-50",
                  iconColor: "text-blue-600"
                },
                {
                  icon: <Clock className="h-7 w-7" />,
                  title: "Real-time Updates",
                  description: "Live tracking and schedule notifications",
                  color: "from-green-500 to-green-600",
                  bgColor: "bg-green-50",
                  iconColor: "text-green-600"
                },
                {
                  icon: <Recycle className="h-7 w-7" />,
                  title: "Eco-Friendly",
                  description: "Sustainable waste management practices",
                  color: "from-emerald-500 to-emerald-600",
                  bgColor: "bg-emerald-50",
                  iconColor: "text-emerald-600"
                },
                {
                  icon: <Users className="h-7 w-7" />,
                  title: "Community Focus",
                  description: "Designed for San Francisco residents",
                  color: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-50",
                  iconColor: "text-purple-600"
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className={`group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl border border-gray-100 hover:border-transparent transition-all duration-500 transform hover:-translate-y-2 ${mounted ? 'opacity-100' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  {/* Gradient Border on Hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl`}></div>
                  
                  <div className={`${feature.bgColor} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={feature.iconColor}>
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  
                  {/* Arrow indicator */}
                  <div className="mt-4 flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-900 transition-colors">
                    Learn more
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
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
        
        <CenteredImage
          imageSrc={ecoImage}
          imageAlt="3Rs of Waste Management"
          description="Join us in building a sustainable future through responsible waste management. Together, we can make San Francisco, Agusan del Sur a cleaner, greener place to live."
        />
      </div>
    </Header>
  );
};

export default Home;