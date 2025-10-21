import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { updateProfile, updateEmail } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Sidebar from "../components/Sidebar";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: ""
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Load user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setFormData({
              displayName: currentUser.displayName || "",
              email: currentUser.email || "",
              phone: userData.phone || "",
              address: userData.address || "",
              city: userData.city || "",
              postalCode: userData.postalCode || ""
            });
          } else {
            // Initialize with auth data if no Firestore record exists
            setFormData({
              displayName: currentUser.displayName || "",
              email: currentUser.email || "",
              phone: "",
              address: "",
              city: "",
              postalCode: ""
            });
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
        
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    
    try {
      // Update auth profile (name and email)
      if (user.displayName !== formData.displayName) {
        await updateProfile(user, {
          displayName: formData.displayName
        });
      }
      
      if (user.email !== formData.email) {
        await updateEmail(user, formData.email);
      }
      
      // Save additional data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        lastUpdated: new Date()
      }, { merge: true });
      
      setMessage("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage(`Error: ${error.message}`);
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row">
        {/* Show page sidebar only on small screens to avoid duplication when layout already provides one */}
        <div className="w-full md:w-64 flex-shrink-0 md:hidden">
          <Sidebar />
        </div>
        <div className="flex-1 p-6 md:p-8 min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF]">
          <div className="flex justify-center items-center h-48 md:h-64">
            <div className="flex items-center gap-3 text-[#004F74]">
              <div className="w-5 h-5 border-2 border-[#002E4D] border-t-transparent rounded-full animate-spin"></div>
              Loading your profile...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col md:flex-row">
        {/* Show page sidebar only on small screens to avoid duplication when layout already provides one */}
        <div className="w-full md:w-64 flex-shrink-0 md:hidden">
          <Sidebar />
        </div>
        <div className="flex-1 p-6 md:p-8 min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF]">
          <div className="max-w-md mx-auto">
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-4 text-[#002E4D]">Authentication Required</h2>
              <p className="text-[#004F74] mb-6">Please sign in to access your profile.</p>
              <a 
                href="/login" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Go to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row">
      {/* Show page sidebar only on small screens to avoid duplication when layout already provides one */}
      <div className="w-full md:w-64 flex-shrink-0 md:hidden">
        <Sidebar />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] relative overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/5 via-transparent to-[#81BBDF]/10"></div>
        <div className="absolute top-0 right-0 w-48 md:w-72 h-48 md:h-72 bg-[#002E4D]/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-[#81BBDF]/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Profile Card */}
            <div className="relative">
              {/* Card Glow Effect */}
              <div className="absolute -inset-3 md:-inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-10"></div>
              
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                {/* Profile Header with Avatar */}
                <div className="bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-white/20 rounded-full blur-sm"></div>
                        <div className="bg-white text-[#002E4D] w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full font-bold text-2xl md:text-3xl shadow-lg relative">
                          {user.displayName 
                            ? user.displayName[0].toUpperCase() 
                            : user.email[0].toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-semibold">
                          {user.displayName || "No Name"}
                        </h2>
                        <p className="text-[#CEE2FF] text-sm md:text-lg">{user.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs md:text-sm text-[#CEE2FF]">Account Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-[#CEE2FF]">Member Since</div>
                      <div className="text-white font-semibold text-sm md:text-base">
                        {user.metadata?.creationTime ? 
                          new Date(user.metadata.creationTime).toLocaleDateString() : 
                          'Recently'
                        }
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Profile Form */}
                <form onSubmit={handleSave} className="p-6 md:p-8">
                  {message && (
                    <div className={`mb-6 md:mb-8 p-4 rounded-xl border text-sm ${
                      message.includes("Error") 
                        ? "bg-red-50/80 backdrop-blur-sm text-red-700 border-red-200" 
                        : "bg-green-50/80 backdrop-blur-sm text-green-700 border-green-200"
                    }`}>
                      <div className="flex items-center gap-3">
                        <svg className={`w-5 h-5 flex-shrink-0 ${message.includes("Error") ? 'text-red-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {message.includes("Error") ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        {message}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                    {/* Personal Information */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold text-[#002E4D] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Personal Information
                      </h3>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-5"></div>
                      <label className="block text-sm font-semibold text-[#002E4D] mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-3 md:p-4 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] disabled:bg-[#CEE2FF]/30"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-5"></div>
                      <label className="block text-sm font-semibold text-[#002E4D] mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-3 md:p-4 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] disabled:bg-[#CEE2FF]/30"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-5"></div>
                      <label className="block text-sm font-semibold text-[#002E4D] mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-3 md:p-4 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] disabled:bg-[#CEE2FF]/30"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-5"></div>
                      <label className="block text-sm font-semibold text-[#002E4D] mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-3 md:p-4 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] disabled:bg-[#CEE2FF]/30"
                        placeholder="Enter postal code"
                      />
                    </div>
                    
                    {/* Address Information */}
                    <div className="md:col-span-2 mt-4">
                      <h3 className="text-lg font-semibold text-[#002E4D] mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Address Information
                      </h3>
                    </div>
                    
                    <div className="md:col-span-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-5"></div>
                      <label className="block text-sm font-semibold text-[#002E4D] mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-3 md:p-4 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] disabled:bg-[#CEE2FF]/30"
                        placeholder="Enter your street address"
                      />
                    </div>
                    
                    <div className="md:col-span-2 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-5"></div>
                      <label className="block text-sm font-semibold text-[#002E4D] mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-3 md:p-4 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] disabled:bg-[#CEE2FF]/30"
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col md:flex-row justify-end space-y-3 md:space-y-0 md:space-x-4 border-t border-[#81BBDF]/30 pt-6">
                    {editMode ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="px-6 py-3 border-2 border-[#81BBDF] text-[#002E4D] font-semibold rounded-xl hover:bg-[#CEE2FF]/30 transition-all duration-300 disabled:opacity-70 flex items-center gap-2"
                          disabled={saving}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Save Changes
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="px-6 py-3 bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Profile
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}