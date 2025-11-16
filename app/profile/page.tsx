"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/uploadImage";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Edit2,
  Save,
  Camera,
  LogOut,
  Loader,
  Calendar,
  Plane,
  MapPin,
  Settings,
  Bell,
  Shield,
  X,
  Check,
  Menu
} from "lucide-react";
import Link from "next/link";

interface UserData {
  email: string;
  name: string;
  avatar: string;
  joined_date?: string;
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [stats, setStats] = useState({
    totalTrips: 0,
    upcomingTrips: 0,
    countriesVisited: 0
  });

  const router = useRouter();

  useEffect(() => {
    loadUserData();
    loadUserStats();
  }, []);

  // -------------------------------------------------
  // Load User Profile Data
  // -------------------------------------------------
  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setLoading(false);

    setUserData({
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name || "Travel Explorer",
      avatar: user.user_metadata?.avatar_url || "",
      joined_date: new Date(user.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });

    setEditedName(user.user_metadata?.full_name || user.user_metadata?.name || "Travel Explorer");
    setLoading(false);
  };

  // -------------------------------------------------
  // Upload & Update Avatar
  // -------------------------------------------------
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageUploading(true);

    try {
      const uploadedUrl = await uploadToCloudinary(file);

      if (uploadedUrl) {
        // Update Supabase metadata
        const { error } = await supabase.auth.updateUser({
          data: { avatar_url: uploadedUrl }
        });

        if (!error && userData) {
          setUserData({ ...userData, avatar: uploadedUrl });
        } else {
          alert('Failed to update avatar');
        }
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image');
    }

    setImageUploading(false);
  };

  // -------------------------------------------------
  // Save Profile Changes
  // -------------------------------------------------
  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      alert('Please enter a valid name');
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: editedName.trim() }
      });

      if (!error && userData) {
        setUserData({ ...userData, name: editedName.trim() });
        setIsEditing(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    }

    setSaving(false);
  };

  // -------------------------------------------------
  // Logout
  // -------------------------------------------------
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // -------------------------------------------------
  // Load Stats
  // -------------------------------------------------
  const loadUserStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { count: trips } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      const { count: upcoming } = await supabase
        .from("trips")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gt("start_date", new Date().toISOString());

      setStats({
        totalTrips: trips || 0,
        upcomingTrips: upcoming || 0,
        countriesVisited: Math.floor(Math.random() * 9) + 1
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // --------------------------------------------
  // UI Rendering Starts Here
  // --------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-6">Sign in to view your profile</p>
          <button 
            onClick={() => router.push('/login')}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 ">
      <div className="max-w-full ">
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
                <Link href={"/profile"}><span className="truncate max-w-[120px] sm:max-w-none">{userData?.email}</span></Link>
                <Link href={"/dashboard"}><span className="truncate max-w-[120px] sm:max-w-none">Dashboard</span></Link>
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
                <img
                src={
                  userData.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`
                }
                className="w-10 h-10 rounded-full object-cover shadow-lg"
              />
                 <Link href={"/profile"}><span className="truncate max-w-[120px] sm:max-w-none">{userData?.email}</span></Link>
              </div>
                              <Link href={"/dashboard"}><span className="truncate max-w-[120px] sm:max-w-none">Dashboard</span></Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6"
            >
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <img
                    src={
                      userData.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=6366f1&color=fff&size=128&bold=true`
                    }
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl object-cover shadow-lg"
                  />
                  <label className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    imageUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  }`}>
                    {imageUploading ? (
                      <Loader className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange} 
                      disabled={imageUploading}
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* Name & Email */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {userData.name}
                </h2>
                <p className="text-gray-600 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  {userData.email}
                </p>

                {/* Join Date */}
                <div className="mt-3 text-sm text-gray-500">
                  Joined {userData.joined_date}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                {[
                  { label: "Trips", value: stats.totalTrips, icon: Plane },
                  { label: "Upcoming", value: stats.upcomingTrips, icon: Calendar },
                  { label: "Countries", value: stats.countriesVisited, icon: MapPin },
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="text-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                      <div className="text-xs text-gray-600">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {[
                  { icon: Settings, label: "Settings", onClick: () => {} },
                  { icon: Bell, label: "Notifications", onClick: () => {} },
                  { icon: Shield, label: "Privacy", onClick: () => {} },
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{action.label}</span>
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors duration-200 mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Edit Profile */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Profile Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditedName(userData.name);
                        }}
                        className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-gray-900">{userData.name}</p>
                    </div>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-gray-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {userData.email}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Email cannot be changed for security reasons
                  </p>
                </div>

                {/* Travel Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Travel Preferences
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Preferred Travel Mode", value: "Flight" },
                      { label: "Budget Preference", value: "Medium" },
                      { label: "Favorite Destination", value: "Mountains" },
                      { label: "Travel Style", value: "Adventure" },
                    ].map((pref, index) => (
                      <div key={pref.label} className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <p className="text-sm text-blue-700 font-medium">{pref.label}</p>
                        <p className="text-blue-900 font-semibold">{pref.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { action: "Created new trip", detail: "Goa Beach Vacation", time: "2 hours ago" },
                  { action: "Updated profile", detail: "Changed name", time: "1 day ago" },
                  { action: "Completed trip", detail: "Himalayan Trek", time: "1 week ago" },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Plane className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.detail}</p>
                    </div>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sign Out</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>
            <div className="flex gap-3">
              <button
                onClick={handleSignOut}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Sign Out
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}