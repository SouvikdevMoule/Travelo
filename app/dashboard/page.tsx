"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign,
  LogOut,
  User,
  Loader,
  Menu,
  X
} from "lucide-react";
import TripCard from "@/components/ui/TripCard";
import Link from "next/link";

interface Trip {
  id: string;
  from_place: string;
  to_place: string;
  start_date: string;
  end_date: string;
  travel_mode: string;
  budget_segment: string;
  persons: number;
  user_id: string;
  inserted_at: string;
}

interface TripUser {
  trip_id: string;
  trips: Trip;
}

export default function Dashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getTrips();
    getUser();
  }, []);

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

async function getTrips() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return router.push("/login");

  try {
    // Fetch trips from trip_users table with joined trip data
    const { data: tripUsers, error } = await supabase
      .from("trip_users")
      .select(`
        trip_id, 
        trips (
          id,
          from_place,
          to_place,
          start_date,
          end_date,
          travel_mode,
          budget_segment,
          persons,
          user_id,
          inserted_at
        )
      `)
      .eq("user_id", user.id)
      .order("inserted_at", { ascending: false });

    if (error) {
      console.error("Error fetching trips:", error);
      setTrips([]);
      return;
    }

    // Safely extract trips with null checks
    const userTrips: Trip[] = [];
    
    if (tripUsers && Array.isArray(tripUsers)) {
      tripUsers.forEach((item: any) => {
        if (item.trips && typeof item.trips === 'object') {
          userTrips.push(item.trips);
        }
      });
    }
    
    setTrips(userTrips);
  } catch (error) {
    console.error("Error in getTrips:", error);
    setTrips([]);
  } finally {
    setIsLoading(false);
  }
}

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.from_place?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.to_place?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterMode === "all" || 
      trip.travel_mode?.toLowerCase() === filterMode.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const travelModes = ["all", "flight", "train", "car", "bus"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants : any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600 text-center">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
                <motion.div 
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.05, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Plane className="w-4 h-4 sm:w-6 sm:h-6 text-white transform -rotate-45" />
                </motion.div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  TripPlanner
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden xs:flex items-center gap-4 sm:gap-6">
              {/* Dashboard Link */}
              <Link 
                href="/dashboard"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200 text-sm sm:text-base flex items-center gap-2"
              >
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                Dashboard
              </Link>

              {/* User Profile */}
              <div className="flex items-center gap-3">
                <Link 
                  href="/profile"
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="relative">
                    <img
                      src={
                        user?.user_metadata?.avatar_url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&background=6366f1&color=fff&bold=true`
                      }
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-blue-100 transition-colors"
                      alt="Profile"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                      {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px]">
                      {user?.email}
                    </p>
                  </div>
                </Link>

                {/* Sign Out Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 text-sm"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </motion.button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 xs:hidden">
              {/* Mobile Sign Out Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xs:hidden border-t border-gray-200 pt-4 pb-3 space-y-3"
            >
              {/* User Info */}
              <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                <img
                  src={
                    user?.user_metadata?.avatar_url ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'User')}&background=6366f1&color=fff&bold=true`
                  }
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  alt="Profile"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <Link 
                  href="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium">Dashboard</span>
                </Link>

                <Link 
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 w-full p-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="font-medium">My Profile</span>
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                {[
                  { label: "Trips", value: trips.length, icon: Plane },
                  { label: "Upcoming", value: trips.filter(t => new Date(t.start_date) > new Date()).length, icon: Calendar },
                  { label: "Shared", value: "0", icon: Users },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <div className="text-sm font-bold text-blue-600">{stat.value}</div>
                      <div className="text-xs text-blue-500">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, Traveler!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg px-2">
              Manage your trips and plan new adventures
            </p>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
            {[
              { icon: MapPin, label: "Total Trips", value: trips.length, color: "blue", bgColor: "bg-blue-100", textColor: "text-blue-600" },
              { icon: Calendar, label: "Upcoming", value: trips.filter(t => new Date(t.start_date) > new Date()).length, color: "green", bgColor: "bg-green-100", textColor: "text-green-600" },
              { icon: Users, label: "Travelers", value: trips.reduce((acc, trip) => acc + (trip.persons || 1), 0), color: "purple", bgColor: "bg-purple-100", textColor: "text-purple-600" },
              { icon: DollarSign, label: "Shared Trips", value: "0", color: "amber", bgColor: "bg-amber-100", textColor: "text-amber-600" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-1 sm:p-2 rounded-lg ${stat.bgColor} mb-2`}>
                  <stat.icon className={`w-3 h-3 sm:w-4 sm:h-5 ${stat.textColor}`} />
                </div>
                <div className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-600 truncate">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Action Bar */}
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-white/50 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-stretch lg:items-center justify-between">
              <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 flex-1 w-full">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder="Search trips..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm sm:text-base"
                  />
                </div>

                {/* Filter - Horizontal scroll on mobile */}
                <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                  {travelModes.map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFilterMode(mode)}
                      className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-medium capitalize transition-all duration-200 whitespace-nowrap text-xs sm:text-sm ${
                        filterMode === mode
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-600 border border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {mode === 'all' ? 'All' : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create Trip Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard/new-trip")}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base justify-center mt-2 lg:mt-0"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>New Trip</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Trips Grid */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                Your Trips <span className="text-blue-600">({filteredTrips.length})</span>
              </h2>
            </div>

            <AnimatePresence mode="wait">
              {filteredTrips.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-8 sm:py-12 bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/50"
                >
                  <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Plane className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                    No trips found
                  </h3>
                  <p className="text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
                    {searchTerm || filterMode !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start planning your first adventure by creating a new trip.'
                    }
                  </p>
                  {!searchTerm && filterMode === 'all' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push("/dashboard/new-trip")}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-1 sm:gap-2 mx-auto text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Create Your First Trip
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
                >
                  <AnimatePresence>
                    {filteredTrips.map((trip, index) => (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        layout
                      >
                        <TripCard trip={trip} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}