// app/trip/[id]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Users,
    DollarSign,
    Navigation,
    Hotel,
    Utensils,
    Clock,
    Share2,
    Download,
    Star,
    Route,
    Plane,
    Train,
    Car,
    Bus,
    Ship,
    Bike,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Trip {
    id: string;
    from_place: string;
    to_place: string;
    start_date: string;
    end_date: string;
    travel_mode: string;
    budget_segment: string;
    persons: number;
    distance_km?: number;
    estimate_per_person?: number;
    estimate_total?: number;
    hotels?: any[];
    itinerary?: any[];
}

const travelModeIcons = {
    flight: Plane,
    train: Train,
    car: Car,
    bus: Bus,
    ship: Ship,
    bike: Bike,
};

export default function TripDetail() {
    const params = useParams();
    const router = useRouter();
    const [trip, setTrip] = useState<Trip | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    useEffect(() => {
        fetchTrip();
    }, [params.id]);

    async function fetchTrip() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        const tripId = params.id as string;

        try {
            // Check if user has access to this trip
            const { data: member, error: memberError } = await supabase
                .from("trip_users")
                .select("*")
                .eq("trip_id", tripId)
                .eq("user_id", user.id)
                .maybeSingle();

            if (memberError) {
                console.error('Error checking trip access:', memberError);
                setAccessDenied(true);
                setIsLoading(false);
                return;
            }

            if (!member) {
                setAccessDenied(true);
                setIsLoading(false);
                return;
            }

            // Fetch trip details
            const { data, error } = await supabase
                .from('trips')
                .select('*')
                .eq('id', tripId)
                .single();

            if (error) {
                console.error('Error fetching trip:', error);
                setAccessDenied(true);
            } else {
                setTrip(data);
            }
        } catch (error) {
            console.error('Error in fetchTrip:', error);
            setAccessDenied(true);
        } finally {
            setIsLoading(false);
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getDuration = () => {
        if (!trip?.start_date || !trip?.end_date) return '';
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return `${diffDays} days`;
    };

    const TravelIcon = trip ? travelModeIcons[trip.travel_mode as keyof typeof travelModeIcons] || Navigation : Navigation;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-600">Loading your trip...</p>
                </div>
            </div>
        );
    }

    if (accessDenied || !trip) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center px-4">
                <div className="text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-6">
                        {accessDenied 
                            ? "You don't have permission to view this trip." 
                            : "The trip you're looking for doesn't exist."
                        }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={() => router.push('/dashboard')} className="w-full sm:w-auto">
                            Back to Dashboard
                        </Button>
                        {accessDenied && (
                            <Button 
                                variant="outline" 
                                onClick={() => router.push('/dashboard/new-trip')}
                                className="w-full sm:w-auto"
                            >
                                Create New Trip
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="sr-only sm:not-sr-only sm:inline-block">Back</span>
                            </button>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                    {trip.from_place.split(',')[0]} → {trip.to_place.split(',')[0]}
                                </h1>
                                <p className="text-xs sm:text-sm text-gray-600 truncate">Your travel plan</p>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden sm:flex items-center gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Share2 className="w-4 h-4" />
                                <span className="hidden xs:inline">Share</span>
                            </Button>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                <span className="hidden xs:inline">Export</span>
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="sm:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="sm:hidden border-t border-gray-200 py-4 space-y-3"
                        >
                            <Button variant="outline" className="w-full justify-center gap-2">
                                <Share2 className="w-4 h-4" />
                                Share Trip
                            </Button>
                            <Button variant="outline" className="w-full justify-center gap-2">
                                <Download className="w-4 h-4" />
                                Export Plan
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6 sm:mb-8"
                >
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start sm:items-center gap-3 mb-4 flex-col sm:flex-row">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <TravelIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 flex-1 text-center sm:text-left">
                                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                                            {trip.from_place.split(',')[0]} → {trip.to_place.split(',')[0]}
                                        </h1>
                                        <p className="text-gray-600 text-sm sm:text-base capitalize mt-1">
                                            {trip.travel_mode} • {trip.budget_segment} Budget
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-gray-600">Duration</p>
                                            <p className="font-semibold text-sm sm:text-base truncate">{getDuration()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-gray-600">Travelers</p>
                                            <p className="font-semibold text-sm sm:text-base truncate">
                                                {trip.persons} {trip.persons === 1 ? 'person' : 'people'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-gray-600">Est. Total</p>
                                            <p className="font-semibold text-sm sm:text-base truncate">
                                                ₹{trip.estimate_total?.toLocaleString() || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Route className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs sm:text-sm text-gray-600">Distance</p>
                                            <p className="font-semibold text-sm sm:text-base truncate">
                                                {trip.distance_km ? `${trip.distance_km} km` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-200 w-full lg:w-auto">
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm text-blue-600 mb-1">Travel Dates</p>
                                    <p className="font-semibold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                                        {formatDate(trip.start_date)}
                                    </p>
                                    <p className="text-blue-600 text-xs sm:text-sm my-1">to</p>
                                    <p className="font-semibold text-gray-900 text-sm sm:text-base whitespace-nowrap">
                                        {formatDate(trip.end_date)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex overflow-x-auto bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-sm border border-gray-200 mb-6 sm:mb-8 scrollbar-hide"
                >
                    {[
                        { id: 'overview', label: 'Overview', icon: MapPin },
                        { id: 'itinerary', label: 'Itinerary', icon: Clock },
                        { id: 'hotels', label: 'Hotels', icon: Hotel },
                        { id: 'food', label: 'Food', icon: Utensils },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-all duration-200 flex-shrink-0 min-w-[80px] sm:min-w-0 sm:flex-1 text-center justify-center ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm">{tab.label}</span>
                            </button>
                        );
                    })}
                </motion.div>

                {/* Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && <OverviewTab trip={trip} />}
                    {activeTab === 'itinerary' && <ItineraryTab itinerary={trip.itinerary || []} />}
                    {activeTab === 'hotels' && <HotelsTab hotels={trip.hotels || []} />}
                    {activeTab === 'food' && <FoodTab itinerary={trip.itinerary || []} />}
                </motion.div>
            </div>
        </div>
    );
}

// ... rest of the component functions (OverviewTab, ItineraryTab, HotelsTab, FoodTab) remain the same ...
function OverviewTab({ trip }: { trip: Trip }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Trip Summary */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Trip Summary</h2>
                    <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
                            <span className="text-gray-600 text-sm sm:text-base">From</span>
                            <span className="font-semibold text-sm sm:text-base text-right">{trip.from_place}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
                            <span className="text-gray-600 text-sm sm:text-base">To</span>
                            <span className="font-semibold text-sm sm:text-base text-right">{trip.to_place}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
                            <span className="text-gray-600 text-sm sm:text-base">Travel Mode</span>
                            <span className="font-semibold text-sm sm:text-base capitalize text-right">{trip.travel_mode}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-100">
                            <span className="text-gray-600 text-sm sm:text-base">Budget Segment</span>
                            <span className={`font-semibold text-sm sm:text-base ${trip.budget_segment === 'Low' ? 'text-green-600' :
                                    trip.budget_segment === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {trip.budget_segment}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-2 sm:py-3">
                            <span className="text-gray-600 text-sm sm:text-base">Estimated Cost</span>
                            <span className="font-bold text-lg sm:text-xl text-blue-600">
                                ₹{trip.estimate_total?.toLocaleString() || 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                        <Button className="h-10 sm:h-12 flex items-center gap-2 text-sm sm:text-base">
                            <Hotel className="w-4 h-4" />
                            Book Hotels
                        </Button>
                        <Button variant="outline" className="h-10 sm:h-12 flex items-center gap-2 text-sm sm:text-base">
                            <Navigation className="w-4 h-4" />
                            Get Directions
                        </Button>
                    </div>
                </div>
            </div>

            {/* Budget Breakdown */}
            <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Budget Breakdown</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-600 text-sm sm:text-base">Per Person</span>
                            <span className="font-semibold text-sm sm:text-base">₹{trip.estimate_per_person?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 text-sm sm:text-base">Total Cost</span>
                            <span className="font-bold text-blue-600 text-lg sm:text-xl">₹{trip.estimate_total?.toLocaleString() || 'N/A'}</span>
                        </div>
                        <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-1">
                                <span>Budget Level</span>
                                <span className="capitalize">{trip.budget_segment}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${trip.budget_segment === 'Low' ? 'bg-green-500 w-1/3' :
                                            trip.budget_segment === 'Medium' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-full'
                                        }`}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Travel Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl border border-blue-200 p-4 sm:p-6">
                    <h3 className="font-semibold text-blue-900 text-sm sm:text-base mb-2 sm:mb-3">💡 Travel Tips</h3>
                    <ul className="text-xs sm:text-sm text-blue-800 space-y-1 sm:space-y-2">
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Book accommodations in advance for better rates</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Check local weather forecasts before traveling</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Keep digital copies of important documents</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Learn basic local phrases for better experience</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

function ItineraryTab({ itinerary }: { itinerary: any[] }) {
    if (!itinerary || !Array.isArray(itinerary)) {
        return (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <Clock className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Itinerary Available</h3>
                <p className="text-gray-600 text-sm sm:text-base">Itinerary details will be generated soon.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {itinerary.map((day, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 sm:p-6">
                        <h3 className="text-lg sm:text-xl font-bold text-white">Day {day.day}</h3>
                        <p className="text-blue-100 text-sm sm:text-base">{day.theme || 'Daily Activities'}</p>
                    </div>

                    <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                        {day.places?.map((place: any, placeIndex: number) => (
                            <div key={placeIndex} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-1 sm:gap-2">
                                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{place.name}</h4>
                                        <span className="text-xs sm:text-sm text-gray-500 bg-white px-2 py-1 rounded-full border flex-shrink-0">
                                            {place.time}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-2">{place.description}</p>
                                    {place.food && (
                                        <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-600 bg-amber-50 px-2 sm:px-3 py-1 rounded-full w-fit">
                                            <Utensils className="w-3 h-3" />
                                            Try: {place.food}
                                        </div>
                                    )}
                                    {place.map_link && (
                                        <a
                                            href={place.map_link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm mt-2"
                                        >
                                            <Navigation className="w-3 h-3" />
                                            View on Maps
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function HotelsTab({ hotels }: { hotels: any[] }) {
    if (!hotels || !Array.isArray(hotels) || hotels.length === 0) {
        return (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <Hotel className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Hotels Available</h3>
                <p className="text-gray-600 text-sm sm:text-base">Hotel recommendations will be generated soon.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {hotels.map((hotel, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                    {hotel.image && (
                        <img
                            src={hotel.image}
                            alt={hotel.name}
                            className="w-full h-32 sm:h-48 object-cover"
                        />
                    )}
                    <div className="p-4 sm:p-6">
                        <div className="flex items-start justify-between mb-3 gap-2">
                            <h3 className="font-bold text-gray-900 text-base sm:text-lg line-clamp-2 flex-1">{hotel.name}</h3>
                            <div className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs flex-shrink-0">
                                <Star className="w-3 h-3 fill-current" />
                                {hotel.rating || '4.2'}
                            </div>
                        </div>

                        <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4 flex items-start gap-1 line-clamp-2">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {hotel.address}
                        </p>

                        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                            <div className="min-w-0">
                                <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{hotel.price_per_night?.toLocaleString()}</p>
                                <p className="text-gray-500 text-xs sm:text-sm">per night</p>
                            </div>
                            {hotel.map_link && (
                                <a
                                    href={hotel.map_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm whitespace-nowrap"
                                >
                                    <Navigation className="w-3 h-3 sm:w-4 sm:h-4" />
                                    <span className="hidden xs:inline">View Map</span>
                                </a>
                            )}
                        </div>

                        <Button className="w-full text-sm sm:text-base py-2 sm:py-2">
                            Check Availability
                        </Button>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

function FoodTab({ itinerary }: { itinerary: any[] }) {
    const foodRecommendations = itinerary?.flatMap((day) =>
        day.places?.filter((place: any) => place.food) || []
    ) || [];

    if (foodRecommendations.length === 0) {
        return (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <Utensils className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Food Recommendations</h3>
                <p className="text-gray-600 text-sm sm:text-base">Food suggestions will be added to your itinerary.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {foodRecommendations.map((food, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                    <div className="p-4 sm:p-6">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                            <Utensils className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>

                        <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 line-clamp-2">{food.name}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">{food.description}</p>

                        <div className="bg-amber-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-amber-200">
                            <p className="text-amber-800 font-medium text-xs sm:text-sm">
                                🍽️ Must Try: {food.food}
                            </p>
                        </div>

                        {food.map_link && (
                            <a
                                href={food.map_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 text-xs sm:text-sm mt-3"
                            >
                                <Navigation className="w-3 h-3" />
                                Find this place
                            </a>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}