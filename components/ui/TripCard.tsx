// components/ui/TripCard.tsx
"use client";
import { motion } from "framer-motion";
import { MapPin, Calendar, Users, DollarSign, Plane, Train, Car, Bus } from "lucide-react";
import { useRouter } from "next/navigation";

const travelModeIcons = {
  flight: Plane,
  train: Train,
  car: Car,
  bus: Bus,
};

const budgetColors = {
  Low: "from-green-500 to-emerald-500",
  Medium: "from-yellow-500 to-amber-500",
  High: "from-red-500 to-pink-500",
};

export default function TripCard({ trip }: { trip: any }) {
  const router = useRouter();
  const TravelIcon = travelModeIcons[trip.travel_mode as keyof typeof travelModeIcons] || Plane;
  const isUpcoming = new Date(trip.start_date) > new Date();
  const isOngoing = new Date(trip.start_date) <= new Date() && new Date(trip.end_date) >= new Date();

  const handleCardClick = () => {
    router.push(`/trip/${trip.id}`);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    router.push(`/trip/${trip.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when button is clicked
    // Add edit functionality here, for example:
    // router.push(`/dashboard/edit-trip/${trip.id}`);
    console.log('Edit trip:', trip.id);
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={handleCardClick}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
    >
      {/* Header with Gradient */}
      <div className={`bg-gradient-to-r ${budgetColors[trip.budget_segment as keyof typeof budgetColors] || 'from-gray-500 to-gray-600'} p-4 text-white`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold truncate">
              {trip.from_place.split(',')[0]} → {trip.to_place.split(',')[0]}
            </h3>
            <p className="text-white/80 text-sm flex items-center gap-1 mt-1">
              <TravelIcon className="w-4 h-4" />
              <span className="capitalize">{trip.travel_mode}</span>
            </p>
          </div>
          {(isUpcoming || isOngoing) && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              isUpcoming ? 'bg-blue-500/20 text-blue-100' : 'bg-green-500/20 text-green-100'
            }`}>
              {isUpcoming ? 'Upcoming' : 'Ongoing'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Dates */}
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {new Date(trip.start_date).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short',
              year: 'numeric'
            })} - {new Date(trip.end_date).toLocaleDateString('en-IN', { 
              day: 'numeric', 
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>

        {/* Travelers */}
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">{trip.persons} traveler{trip.persons > 1 ? 's' : ''}</span>
        </div>

        {/* Budget */}
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-gray-600" />
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Budget</span>
              <span className={`font-semibold ${
                trip.budget_segment === 'Low' ? 'text-green-600' :
                trip.budget_segment === 'Medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {trip.budget_segment}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  trip.budget_segment === 'Low' ? 'bg-green-500 w-1/3' :
                  trip.budget_segment === 'Medium' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-full'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Additional Trip Info */}
        {(trip.distance_km || trip.estimate_total) && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            {trip.distance_km && (
              <div className="text-center bg-blue-50 rounded-lg p-2">
                <p className="text-xs text-blue-600">Distance</p>
                <p className="text-sm font-semibold text-blue-700">{trip.distance_km} km</p>
              </div>
            )}
            {trip.estimate_total && (
              <div className="text-center bg-green-50 rounded-lg p-2">
                <p className="text-xs text-green-600">Est. Cost</p>
                <p className="text-sm font-semibold text-green-700">₹{trip.estimate_total?.toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button 
            onClick={handleViewDetails}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            View Details
          </button>
          <button 
            onClick={handleEdit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Edit
          </button>
        </div>
      </div>
    </motion.div>
  );
}