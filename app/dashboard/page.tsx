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

export default function Dashboard() {
  const [trips, setTrips] = useState<any[]>([]);
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

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("inserted_at", { ascending: false });

    if (error) console.error(error);
    else setTrips(data || []);
    setIsLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.from_place.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.to_place.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterMode === "all" || 
      trip.travel_mode.toLowerCase() === filterMode.toLowerCase();
    
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
        className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Plane className="w-4 h-4 sm:w-6 sm:h-6 text-white transform -rotate-45" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                TripPlanner
              </span>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden xs:flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate max-w-[120px] sm:max-w-none">{user?.email}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  className="hidden xs:flex items-center gap-1 sm:gap-2 text-gray-600 hover:text-red-600 transition-colors px-2 sm:px-3 py-1 sm:py-2 rounded-lg hover:bg-red-50 text-xs sm:text-sm"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:block">Sign Out</span>
                </motion.button>

                {/* Mobile menu button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="xs:hidden p-2 text-gray-600 hover:text-gray-900"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="xs:hidden border-t border-gray-200 py-3"
            >
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <User className="w-4 h-4" />
                <span className="truncate">{user?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors py-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
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
              { icon: DollarSign, label: "Avg Budget", value: "Medium", color: "amber", bgColor: "bg-amber-100", textColor: "text-amber-600" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-sm border border-white/50 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-1 sm:p-2 rounded-lg ${stat.bgColor} mb-2`}>
                  <stat.icon className={`w-3 h-3 sm:w-4 sm:h-5 text-${stat.color}-600`} />
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