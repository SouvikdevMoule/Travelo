"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { 
  Plane, 
  MapPin, 
  DollarSign, 
  Users, 
  Calendar,
  Shield,
  Globe,
  TrendingUp,
  CheckCircle,
  Star,
  Compass,
  Wallet,
  Clock,
  Heart,
  Menu,
  X
} from "lucide-react";

// Testimonial data
const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Digital Nomad",
    image: "👩‍💻",
    text: "Saved me 12 hours of planning for my Japan trip. The budget tracker alone paid for itself.",
    rating: 5
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "Family Traveler",
    image: "👨‍👩‍👧‍👦",
    text: "Planning our family reunion was actually enjoyable. The shared itineraries kept everyone on the same page.",
    rating: 5
  },
  {
    id: 3,
    name: "Alex Thompson",
    role: "Backpacker",
    image: "🧳",
    text: "As a solo traveler, the safety features and local tips are game-changing. Found hidden gems I'd never see otherwise.",
    rating: 4
  }
];

// Feature data
const features = [
  {
    icon: MapPin,
    title: "Smart Itinerary Builder",
    description: "Drag & drop destinations, optimize routes automatically, and get real-time travel time estimates.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: DollarSign,
    title: "Real Budget Tracking",
    description: "Set spending limits, track expenses on the go, and get alerts when you're close to your budget.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Users,
    title: "Group Planning Made Easy",
    description: "Collaborate with travel companions, vote on activities, and split costs automatically.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Shield,
    title: "Travel Safety",
    description: "Get safety alerts, embassy info, and emergency contacts for every destination.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Globe,
    title: "Local Insights",
    description: "Access curated recommendations from locals and seasoned travelers.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: Calendar,
    title: "Seasonal Planning",
    description: "Best times to visit, weather patterns, and crowd predictions for perfect timing.",
    color: "from-amber-500 to-yellow-500"
  }
];

// Popular destinations
const popularDestinations : any = [
  { name: "Bali", country: "Indonesia", travelers: "24.5K", image: "🏝️" },
  { name: "Tokyo", country: "Japan", travelers: "18.2K", image: "🗼" },
  { name: "Paris", country: "France", travelers: "22.1K", image: "🗼" },
  { name: "New York", country: "USA", travelers: "19.8K", image: "🗽" }
];

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const ctaRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });
  const statsInView = useInView(statsRef, { once: true });
  const ctaInView = useInView(ctaRef, { once: true });

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setIsLoading(false);
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants : any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants : any = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  const staggerVariants : any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-4 md:py-6'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-2 md:gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg md:rounded-xl flex items-center justify-center">
              <Plane className="w-4 h-4 md:w-6 md:h-6 text-white transform -rotate-45" />
            </div>
            <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              TripPlanner
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {['Features', 'Destinations', 'Testimonials', 'Pricing'].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm lg:text-base"
                whileHover={{ y: -2 }}
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-2 md:gap-4">
              {!isLoading && !user && (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:block text-gray-600 hover:text-blue-600 font-medium px-3 py-2 transition-colors text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg md:rounded-xl font-medium hover:shadow-lg transition-all text-sm md:text-base"
                  >
                    Get Started
                  </Link>
                </>
              )}
              {user && (
                <Link
                  href="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg md:rounded-xl font-medium hover:shadow-lg transition-all text-sm md:text-base"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-6 space-y-4">
              {['Features', 'Destinations', 'Testimonials', 'Pricing'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-gray-600 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              {!user && (
                <Link
                  href="/login"
                  className="block text-gray-600 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 pt-16 md:pt-0"
      >
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-4 md:left-10 w-48 h-48 md:w-72 md:h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
          <div className="absolute top-1/3 right-4 md:right-10 w-64 h-64 md:w-96 md:h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-75" />
          <div className="absolute bottom-1/4 left-1/4 md:left-1/3 w-56 h-56 md:w-80 md:h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-150" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
          >
            {/* Badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1 md:px-4 md:py-2 mb-6 md:mb-8 shadow-sm"
            >
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
              <span className="text-xs md:text-sm font-medium text-gray-700">
                Trusted by 50,000+ travelers worldwide
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                Plan Your
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Perfect Trip
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              variants={itemVariants}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-4"
            >
              Stop stressing about travel planning. Our AI-powered platform helps you create 
              <span className="font-semibold text-blue-600"> unforgettable experiences </span>
              while saving time and money.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12 px-4"
            >
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="group relative bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden w-full sm:w-auto text-center"
              >
                <span className="relative z-10 flex items-center gap-2 justify-center">
                  Start Planning Free
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              <button className="group flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium px-4 py-3 md:px-6 md:py-4 transition-colors justify-center w-full sm:w-auto">
                <PlayCircle className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">Watch Demo (2 min)</span>
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto px-4"
            >
              {[
                { number: "50K+", label: "Active Travelers" },
                { number: "120+", label: "Countries" },
                { number: "4.9/5", label: "Rating" },
                { number: "24/7", label: "Support" }
              ].map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="text-lg md:text-2xl font-bold text-gray-900">{stat.number}</div>
                  <div className="text-gray-600 text-xs md:text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-gray-400 rounded-full flex justify-center">
            <div className="w-1 h-2 md:h-3 bg-gray-400 rounded-full mt-2" />
          </div>
        </motion.div>
      </motion.section>

      {/* Popular Destinations */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Trending Destinations
            </h2>
            <p className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
              Discover the most popular places our community is exploring right now
            </p>
          </motion.div>

          <div className="grid grid-cols-2 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {popularDestinations.map((destination : any, index : any) => (
              <motion.div
                key={destination.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-gradient-to-br from-white to-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm border border-gray-500 hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover:scale-105 transition-transform duration-300 flex justify-center">
                  {destination.image}
                </div>
                <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-1 text-center">
                  {destination.name}
                </h3>
                <p className="text-gray-600 text-xs md:text-sm mb-2 md:mb-3 text-center">{destination.country}</p>
                <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500 justify-center">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{destination.travelers} travelers</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" ref={featuresRef} className="py-12 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="text-center mb-8 md:mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white rounded-full px-3 py-1 md:px-4 md:py-2 shadow-sm border border-gray-200 mb-3 md:mb-4">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
              <span className="text-xs md:text-sm font-medium text-gray-700">Why Choose Us</span>
            </motion.div>
            <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Everything You Need to Travel Smart
            </motion.h2>
            <motion.p variants={itemVariants} className="text-gray-600 text-sm md:text-lg max-w-2xl mx-auto px-4">
              We've built the tools that actual travelers use every day to make their journeys smoother and more memorable.
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group bg-white rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-gray-600 hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className={`inline-flex p-2 md:p-3 rounded-lg md:rounded-xl bg-gradient-to-r ${feature.color} mb-4 md:mb-6 group-hover:scale-105 transition-transform duration-300`}>
                  <feature.icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-8 md:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
              Loved by Travelers Worldwide
            </h2>
            <p className="text-gray-600 text-sm md:text-lg">
              Don't just take our word for it
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -4 }}
                className="bg-gray-50 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 shadow-sm border border-gray-600 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 md:w-4 md:h-4 ${
                        i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="text-2xl md:text-3xl">{testimonial.image}</div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm md:text-base">{testimonial.name}</div>
                    <div className="text-gray-600 text-xs md:text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" ref={ctaRef} className="py-12 md:py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6"
            >
              Ready to Transform Your Travel Experience?
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-blue-100 text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto"
            >
              Join thousands of travelers who are already planning smarter and creating unforgettable memories.
            </motion.p>
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center"
            >
              <Link
                href={user ? "/dashboard" : "/signup"}
                className="bg-white text-blue-600 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto text-center text-sm md:text-base"
              >
                Start Planning Free
              </Link>
              <button className="text-white border border-white/30 px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-semibold hover:bg-white/10 transition-all duration-300 w-full sm:w-auto text-sm md:text-base">
                Schedule a Demo
              </button>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="mt-6 md:mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-6 lg:gap-8 text-blue-100 text-sm md:text-base"
            >
              {[
                "No credit card required",
                "Free 14-day trial",
                "Cancel anytime"
              ].map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
                  <Plane className="w-3 h-3 md:w-4 md:h-4 text-white transform -rotate-45" />
                </div>
                <span className="text-white font-bold text-lg md:text-xl">TripPlanner</span>
              </div>
              <p className="text-xs md:text-sm">
                Making travel planning effortless and enjoyable for everyone.
              </p>
            </div>
            
            {['Product', 'Company', 'Resources', 'Legal'].map((category) => (
              <div key={category}>
                <h3 className="text-white font-semibold mb-2 md:mb-4 text-sm md:text-base">{category}</h3>
                <ul className="space-y-1 md:space-y-2 text-xs md:text-sm">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <li key={i}>
                      <a href="#" className="hover:text-white transition-colors">
                        Link {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-xs md:text-sm">
            <p>&copy; 2024 TripPlanner. All rights reserved. Built with ❤️ for travelers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Add the missing PlayCircle component
const PlayCircle = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10,8 16,12 10,16" />
  </svg>
);

// Add the missing Sparkles component
const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM21 12h-3.75M12 3.75V21" />
  </svg>
);