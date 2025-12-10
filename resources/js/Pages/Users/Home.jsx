import React, { useEffect, useState } from 'react';
import Hero from './components/HomeComponents/Hero';
import Header from './components/HomeComponents/Header';
import DisplayComponents from './components/HomeComponents/DisplayComponent';
import CenteredImage from './components/HomeComponents/CenteredImage';
import photo from "@/images/collection.jpg";
import ecoImage from "@/images/sanfrance.jpg";
import { Recycle, MapPin, Clock, Users, Star, Calendar, Navigation, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react';
import { router } from '@inertiajs/react';

const Home = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Header>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Decorative Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <Hero />
          
          {/* Features Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className={`text-center mb-16 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Smart Waste Management Solutions
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Comprehensive tools and real-time information to make garbage collection efficient 
                  and sustainable for our community
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    icon: <MapPin className="h-6 w-6" />,
                    title: "Smart Routing",
                    description: "Optimized collection routes for maximum efficiency",
                    iconBg: "bg-blue-100",
                    iconColor: "text-blue-600"
                  },
                  {
                    icon: <Clock className="h-6 w-6" />,
                    title: "Real-time Updates",
                    description: "Live tracking and schedule notifications",
                    iconBg: "bg-green-100",
                    iconColor: "text-green-600"
                  },
                  {
                    icon: <Recycle className="h-6 w-6" />,
                    title: "Eco-Friendly",
                    description: "Sustainable waste management practices",
                    iconBg: "bg-emerald-100",
                    iconColor: "text-emerald-600"
                  },
                  {
                    icon: <Users className="h-6 w-6" />,
                    title: "Community Focus",
                    description: "Designed for San Francisco residents",
                    iconBg: "bg-purple-100",
                    iconColor: "text-purple-600"
                  }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className={`bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 ${mounted ? 'opacity-100' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <div className={`${feature.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                      <div className={feature.iconColor}>
                        {feature.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* What You Can Do */}
          <section className="py-20 relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">
                  What You Can Do
                </h2>
                <p className="text-gray-600">
                  Everything you need in one place
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-16">
                {/* Nearest Site */}
                <div 
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-400 transition-all cursor-pointer"
                  onClick={() => router.visit('/site')}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'all 0.6s ease-out 0.1s'
                  }}
                >
                  <div className="absolute -top-3 -right-3 w-24 h-24 bg-blue-400 rounded-full opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-300"></div>
                  
                  <div className="relative">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-400 group-hover:rotate-12 transition-all">
                      <Navigation className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                      Find Nearest Site
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      See collection sites near you on the map
                    </p>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>View distances</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span>Get directions</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div 
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-green-400 transition-all cursor-pointer"
                  onClick={() => router.visit('/barangay/schedule/show')}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'all 0.6s ease-out 0.2s'
                  }}
                >
                  <div className="absolute -top-3 -right-3 w-24 h-24 bg-green-400 rounded-full opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-300"></div>
                  
                  <div className="relative">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-400 group-hover:rotate-12 transition-all">
                      <Calendar className="w-6 h-6 text-green-600 group-hover:text-white transition-colors" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-green-600 transition-colors">
                      Collection Schedule
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      Check the truck distance to your area
                    </p>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span>Your barangay's days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span>View barangay's collection schedules</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div 
                  className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-amber-400 transition-all cursor-pointer"
                  onClick={() => router.visit('/reviews')}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(30px)',
                    transition: 'all 0.6s ease-out 0.3s'
                  }}
                >
                  <div className="absolute -top-3 -right-3 w-24 h-24 bg-amber-400 rounded-full opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-300"></div>
                  
                  <div className="relative">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-400 group-hover:rotate-12 transition-all">
                      <Star className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-amber-600 transition-colors">
                      Reviews & Feedback
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      Share your thoughts on the service
                    </p>

                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                        <span>Rate collectors</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                        <span>Read experiences</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <style>{`
              @keyframes slideUp {
                from {
                  opacity: 0;
                  transform: translateY(30px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
            `}</style>
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
      </div>
    </Header>
  );
};

export default Home;