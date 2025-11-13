"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  ArrowLeft,
  Loader,
  Navigation,
  Car,
  Train,
  Ship,
  Bike,
  Search,
  Flag,
  Mountain,
  Palette,
  Sparkles,
  Route
} from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Using a combination of APIs for best Indian location coverage
const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";

interface City {
  name: string;
  state: string;
  country: string;
  display_name: string;
  type: string;
}

export default function NewTrip() {
  const [trip, setTrip] = useState({
    from_place: "",
    to_place: "",
    start_date: undefined as Date | undefined,
    end_date: undefined as Date | undefined,
    travel_mode: "",
    budget_segment: "Medium",
    persons: "1",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromCities, setFromCities] = useState<City[]>([]);
  const [toCities, setToCities] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const router = useRouter();

  const travelModes = [
    { value: "flight", label: "Flight", icon: Plane, color: "from-purple-500 to-pink-500" },
    { value: "train", label: "Train", icon: Train, color: "from-green-500 to-emerald-500" },
    { value: "car", label: "Car", icon: Car, color: "from-blue-500 to-cyan-500" },
    { value: "bus", label: "Bus", icon: Navigation, color: "from-orange-500 to-red-500" },
    { value: "ship", label: "Ship", icon: Ship, color: "from-indigo-500 to-purple-500" },
    { value: "bike", label: "Bike", icon: Bike, color: "from-lime-500 to-green-500" },
  ];

  const budgetOptions = [
    { 
      value: "Low", 
      label: "Budget Explorer", 
      description: "Hostels, local transport, street food", 
      color: "from-green-500 to-emerald-500",
      icon: "🏕️"
    },
    { 
      value: "Medium", 
      label: "Comfort Seeker", 
      description: "Hotels, mix of transport, good restaurants", 
      color: "from-yellow-500 to-amber-500",
      icon: "🏨"
    },
    { 
      value: "Premium", 
      label: "Luxury Traveler", 
      description: "5-star hotels, premium transport, fine dining", 
      color: "from-red-500 to-pink-500",
      icon: "✨"
    },
  ];

  // Comprehensive Indian locations database
  const popularIndianCities: City[] = [
    // Metropolitan Cities
    { name: "Mumbai", state: "Maharashtra", country: "India", display_name: "Mumbai, Maharashtra", type: "Metropolitan" },
    { name: "Delhi", state: "Delhi", country: "India", display_name: "Delhi", type: "Metropolitan" },
    { name: "Bangalore", state: "Karnataka", country: "India", display_name: "Bangalore, Karnataka", type: "Metropolitan" },
    { name: "Hyderabad", state: "Telangana", country: "India", display_name: "Hyderabad, Telangana", type: "Metropolitan" },
    { name: "Chennai", state: "Tamil Nadu", country: "India", display_name: "Chennai, Tamil Nadu", type: "Metropolitan" },
    { name: "Kolkata", state: "West Bengal", country: "India", display_name: "Kolkata, West Bengal", type: "Metropolitan" },
    { name: "Pune", state: "Maharashtra", country: "India", display_name: "Pune, Maharashtra", type: "Metropolitan" },
    
    // Heritage & Tourism
    { name: "Jaipur", state: "Rajasthan", country: "India", display_name: "Jaipur, Rajasthan", type: "Heritage" },
    { name: "Agra", state: "Uttar Pradesh", country: "India", display_name: "Agra, Uttar Pradesh", type: "Heritage" },
    { name: "Varanasi", state: "Uttar Pradesh", country: "India", display_name: "Varanasi, Uttar Pradesh", type: "Spiritual" },
    { name: "Udaipur", state: "Rajasthan", country: "India", display_name: "Udaipur, Rajasthan", type: "Heritage" },
    { name: "Jodhpur", state: "Rajasthan", country: "India", display_name: "Jodhpur, Rajasthan", type: "Heritage" },
    
    // Hill Stations
    { name: "Shimla", state: "Himachal Pradesh", country: "India", display_name: "Shimla, Himachal Pradesh", type: "Hill Station" },
    { name: "Manali", state: "Himachal Pradesh", country: "India", display_name: "Manali, Himachal Pradesh", type: "Hill Station" },
    { name: "Darjeeling", state: "West Bengal", country: "India", display_name: "Darjeeling, West Bengal", type: "Hill Station" },
    { name: "Mussorie", state: "Uttarakhand", country: "India", display_name: "Mussorie, Uttarakhand", type: "Hill Station" },
    
    // Beach Destinations
    { name: "Goa", state: "Goa", country: "India", display_name: "Goa", type: "Beach" },
    { name: "Kochi", state: "Kerala", country: "India", display_name: "Kochi, Kerala", type: "Beach" },
    { name: "Pondicherry", state: "Puducherry", country: "India", display_name: "Pondicherry", type: "Beach" },
    
    // Spiritual
    { name: "Rishikesh", state: "Uttarakhand", country: "India", display_name: "Rishikesh, Uttarakhand", type: "Spiritual" },
    { name: "Haridwar", state: "Uttarakhand", country: "India", display_name: "Haridwar, Uttarakhand", type: "Spiritual" },
    { name: "Amritsar", state: "Punjab", country: "India", display_name: "Amritsar, Punjab", type: "Spiritual" },
  ];

  const searchIndianCities = async (query: string): Promise<City[]> => {
    if (!query || query.length < 2) return [];

    try {
      const response = await fetch(
        `${NOMINATIM_API_URL}?format=json&q=${encodeURIComponent(query + ', India')}&countrycodes=in&limit=10&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        return data.map((item: any) => ({
          name: item.display_name.split(',')[0],
          state: item.address?.state || item.address?.county || 'India',
          country: 'India',
          display_name: item.display_name,
          type: item.type || 'City'
        })).filter((city: City, index: number, self: City[]) => 
          index === self.findIndex(c => c.name === city.name && c.state === city.state)
        );
      }
      
      throw new Error('API failed');
      
    } catch (error) {
      console.error('Error searching cities:', error);
      return popularIndianCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase()) ||
        city.type.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);
    }
  };

  // Debounced search
  useEffect(() => {
    if (fromSearch.length < 2) {
      setFromCities([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const cities = await searchIndianCities(fromSearch);
      setFromCities(cities);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [fromSearch]);

  useEffect(() => {
    if (toSearch.length < 2) {
      setToCities([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const cities = await searchIndianCities(toSearch);
      setToCities(cities);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [toSearch]);

  const handleFromSelect = (city: City) => {
    setTrip({ ...trip, from_place: city.display_name });
    setFromSearch(city.display_name);
    setShowFromDropdown(false);
    setFromCities([]);
    setActiveStep(2);
  };

  const handleToSelect = (city: City) => {
    setTrip({ ...trip, to_place: city.display_name });
    setToSearch(city.display_name);
    setShowToDropdown(false);
    setToCities([]);
    setActiveStep(3);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('#from-search-container')) {
        setShowFromDropdown(false);
      }
      if (!target.closest('#to-search-container')) {
        setShowToDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    // ✅ Basic validation
    if (!trip.start_date || !trip.end_date) {
      throw new Error("Please select both start and end dates");
    }
    if (trip.start_date >= trip.end_date) {
      throw new Error("End date must be after start date");
    }
    if (!trip.from_place || !trip.to_place) {
      throw new Error("Please select both departure and destination");
    }

    // ✅ Ensure user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // ✅ Insert trip into Supabase
    const { data: insertData, error: insertError } = await supabase
      .from("trips")
      .insert([
        {
          ...trip,
          user_id: user.id,
          persons: parseInt(trip.persons) || 1,
          start_date: trip.start_date.toISOString(),
          end_date: trip.end_date.toISOString(),
        },
      ])
      .select()
      .single(); // ✅ get one record directly

    if (insertError) throw insertError;

    const insertedTrip = insertData;

    // ✅ Show enriching state
    setIsLoading(true);
    console.log("🧠 Enriching trip via AI...");

    const enrichRes = await fetch("/api/enrich-trip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tripId: insertedTrip.id }),
    });

    if (!enrichRes.ok) {
      console.error("❌ Enrichment failed:", await enrichRes.text());
    } else {
      console.log("✅ Trip enrichment complete");
    }

    // ✅ Redirect to trip details page
    router.push(`/trip/${insertedTrip.id}`);
  } catch (err: any) {
    console.error(err);
    setError(err.message || "Something went wrong while creating the trip");
  } finally {
    setIsLoading(false);
  }
}


  const getCityTypeIcon = (type: string) => {
    switch (type) {
      case 'Hill Station': return '🏔️';
      case 'Beach': return '🏖️';
      case 'Heritage': return '🏛️';
      case 'Spiritual': return '🕉️';
      case 'Metropolitan': return '🏙️';
      default: return '🏘️';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-75" />
        <div className="absolute bottom-32 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-150" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <Route className="w-8 h-8 text-white" />
              </div>
              <motion.div
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Plan Your Indian Odyssey
          </h1>
          <p className="text-purple-200 text-lg max-w-2xl mx-auto">
            Discover the magic of India - from Himalayan peaks to tropical beaches
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                  step === activeStep 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110' 
                    : step < activeStep
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-purple-200'
                }`}>
                  {step < activeStep ? '✓' : step}
                </div>
                {step < 4 && (
                  <div className={`w-8 h-1 rounded-full transition-all duration-300 ${
                    step < activeStep ? 'bg-green-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-3 rounded-xl mb-6 text-sm backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Journey Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <Route className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Your Journey</h3>
                  <p className="text-purple-200 text-sm">Where does your adventure begin?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* From Place */}
                <div id="from-search-container" className="relative">
                  <label className="block text-sm font-medium text-purple-200 mb-3">
                    🚀 Departure City
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-purple-500/30 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-purple-300 text-white backdrop-blur-sm"
                      type="text"
                      placeholder="Search Indian city..."
                      value={fromSearch}
                      onChange={(e) => {
                        setFromSearch(e.target.value);
                        setShowFromDropdown(true);
                      }}
                      onFocus={() => setShowFromDropdown(true)}
                      required
                    />
                    
                    {showFromDropdown && (fromCities.length > 0 || isSearching) && (
                      <div className="absolute z-10 w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl max-h-80 overflow-auto">
                        {isSearching ? (
                          <div className="flex items-center justify-center p-6">
                            <Loader className="w-5 h-5 animate-spin mr-3 text-purple-400" />
                            <span className="text-purple-200">Discovering Indian destinations...</span>
                          </div>
                        ) : (
                          <>
                            {fromCities.map((city, index) => (
                              <button
                                key={`${city.name}-${city.state}-${index}`}
                                type="button"
                                className="w-full text-left px-4 py-4 hover:bg-purple-500/20 border-b border-purple-500/10 last:border-b-0 transition-all duration-200 group"
                                onClick={() => handleFromSelect(city)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">{getCityTypeIcon(city.type)}</div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-white group-hover:text-purple-200 transition-colors">
                                      {city.name}
                                    </div>
                                    <div className="text-sm text-purple-300">
                                      {city.state} • {city.type}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* To Place */}
                <div id="to-search-container" className="relative">
                  <label className="block text-sm font-medium text-purple-200 mb-3">
                    🌟 Destination City
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-purple-500/30 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 placeholder-purple-300 text-white backdrop-blur-sm"
                      type="text"
                      placeholder="Where to explore?"
                      value={toSearch}
                      onChange={(e) => {
                        setToSearch(e.target.value);
                        setShowToDropdown(true);
                      }}
                      onFocus={() => setShowToDropdown(true)}
                      required
                    />
                    
                    {showToDropdown && (toCities.length > 0 || isSearching) && (
                      <div className="absolute z-10 w-full mt-2 bg-slate-800/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl max-h-80 overflow-auto">
                        {isSearching ? (
                          <div className="flex items-center justify-center p-6">
                            <Loader className="w-5 h-5 animate-spin mr-3 text-purple-400" />
                            <span className="text-purple-200">Discovering Indian destinations...</span>
                          </div>
                        ) : (
                          <>
                            {toCities.map((city, index) => (
                              <button
                                key={`${city.name}-${city.state}-${index}`}
                                type="button"
                                className="w-full text-left px-4 py-4 hover:bg-purple-500/20 border-b border-purple-500/10 last:border-b-0 transition-all duration-200 group"
                                onClick={() => handleToSelect(city)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-2xl">{getCityTypeIcon(city.type)}</div>
                                  <div className="flex-1">
                                    <div className="font-semibold text-white group-hover:text-purple-200 transition-colors">
                                      {city.name}
                                    </div>
                                    <div className="text-sm text-purple-300">
                                      {city.state} • {city.type}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Travel Dates</h3>
                  <p className="text-purple-200 text-sm">When is your adventure?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-3">
                    📅 Start Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-14 bg-white/10 border-purple-500/30 text-white hover:bg-white/20 hover:text-white hover:border-purple-500 rounded-2xl",
                          !trip.start_date && "text-purple-300"
                        )}
                      >
                        <Calendar className="mr-3 h-5 w-5 text-purple-400" />
                        {trip.start_date ? format(trip.start_date, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-800 border-purple-500/30">
                      <CalendarComponent
                        mode="single"
                        selected={trip.start_date}
                        onSelect={(date) => {
                          setTrip({ ...trip, start_date: date });
                          setActiveStep(4);
                        }}
                        initialFocus
                        disabled={(date) => date < new Date()}
                        className="bg-slate-800 text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium text-purple-200 mb-3">
                    📅 End Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-14 bg-white/10 border-purple-500/30 text-white hover:bg-white/20 hover:text-white hover:border-purple-500 rounded-2xl",
                          !trip.end_date && "text-purple-300"
                        )}
                      >
                        <Calendar className="mr-3 h-5 w-5 text-purple-400" />
                        {trip.end_date ? format(trip.end_date, "PPP") : "Pick end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-800 border-purple-500/30">
                      <CalendarComponent
                        mode="single"
                        selected={trip.end_date}
                        onSelect={(date) => setTrip({ ...trip, end_date: date })}
                        initialFocus
                        disabled={(date) => date < (trip.start_date || new Date())}
                        className="bg-slate-800 text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Travel Style Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Travel Style</h3>
                  <p className="text-purple-200 text-sm">How do you want to travel?</p>
                </div>
              </div>

              {/* Travel Mode */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-4">
                  Transportation
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {travelModes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <motion.button
                        key={mode.value}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setTrip({ ...trip, travel_mode: mode.value });
                          setActiveStep(5);
                        }}
                        className={`p-4 border-2 rounded-2xl text-center transition-all duration-300 backdrop-blur-sm ${
                          trip.travel_mode === mode.value
                            ? `bg-gradient-to-r ${mode.color} text-white border-transparent shadow-lg scale-105`
                            : 'bg-white/10 text-purple-200 border-purple-500/30 hover:border-purple-500 hover:bg-white/20'
                        }`}
                      >
                        <Icon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-xs font-medium capitalize">{mode.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Segment */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-4">
                  Budget Style
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {budgetOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setTrip({ ...trip, budget_segment: option.value })}
                      className={`p-5 border-2 rounded-2xl text-left transition-all duration-300 backdrop-blur-sm ${
                        trip.budget_segment === option.value
                          ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg`
                          : 'bg-white/10 text-purple-200 border-purple-500/30 hover:border-purple-500 hover:bg-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.icon}</div>
                      <div className="font-semibold text-lg mb-1">{option.label}</div>
                      <div className="text-sm opacity-90">{option.description}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Travelers */}
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-3">
                  <Users className="w-4 h-4 inline mr-2" />
                  Travel Companions
                </label>
                <div className="relative">
                  <select
                    className="w-full px-4 py-4 bg-white/10 border border-purple-500/30 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-white backdrop-blur-sm appearance-none"
                    value={trip.persons}
                    onChange={(e) => setTrip({ ...trip, persons: e.target.value })}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num} className="bg-slate-800 text-white">
                        {num} {num === 1 ? 'Solo Traveler' : 'Travel Buddies'}
                      </option>
                    ))}
                    <option value="9" className="bg-slate-800 text-white">Large Group (9+)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-6"
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>Creating Your Indian Adventure...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span>Launch Your Journey</span>
                    <Mountain className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </>
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Features Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center"
        >
          {[
            { icon: "🏔️", title: "Hill Stations", desc: "Cool mountain retreats" },
            { icon: "🏖️", title: "Beach Destinations", desc: "Sun, sand & sea" },
            { icon: "🏛️", title: "Heritage Sites", desc: "Rich cultural history" },
          ].map((feature, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="text-2xl mb-2">{feature.icon}</div>
              <div className="font-semibold text-white text-sm">{feature.title}</div>
              <div className="text-purple-300 text-xs">{feature.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}