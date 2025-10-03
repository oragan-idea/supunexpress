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
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-neutral-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
            <h2 className="text-xl font-medium mb-4">Authentication Required</h2>
            <p className="text-neutral-600 mb-6">Please sign in to access your profile.</p>
            <a 
              href="/login" 
              className="bg-black text-white px-6 py-2.5 rounded-lg text-sm inline-block transition-all hover:shadow-md"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-8 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome to Supun Express</h1>
            <p className="text-neutral-600">Manage your account information and preferences</p>
          </div>
          
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            {/* Profile Header with Avatar */}
            <div className="bg-gradient-to-r from-black to-neutral-800 text-white p-6">
              <div className="flex items-center">
                <div className="bg-white text-black w-16 h-16 flex items-center justify-center rounded-full font-bold text-2xl shadow-lg">
                  {user.displayName 
                    ? user.displayName[0].toUpperCase() 
                    : user.email[0].toUpperCase()}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">
                    {user.displayName || "No Name"}
                  </h2>
                  <p className="text-neutral-300">{user.email}</p>
                </div>
              </div>
            </div>
            
            {/* Profile Form */}
            <form onSubmit={handleSave} className="p-6">
              {message && (
                <div className={`mb-6 p-3 rounded-lg text-sm ${message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {message}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-neutral-100"
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 border-t border-neutral-200 pt-6">
                {editMode ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setEditMode(false)}
                      className="px-5 py-2.5 border border-neutral-300 rounded-lg text-sm transition-all hover:bg-neutral-50"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-black text-white px-5 py-2.5 rounded-lg text-sm transition-all hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="bg-black text-white px-5 py-2.5 rounded-lg text-sm transition-all hover:shadow-md"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}