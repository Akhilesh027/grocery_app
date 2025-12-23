import { useEffect, useState } from "react";
import axios from "axios";

// --- Configuration Constants ---
const API_BASE_URL = "https://api.sampurnamart.cloud";

const BannerList = () => {
  const [banners, setBanners] = useState([]);
  const [globalLoading, setGlobalLoading] = useState(true); // Initial fetch loading
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Update loading state
  const [deletingId, setDeletingId] = useState(null); // Delete loading state
  const [editData, setEditData] = useState({ 
    name: "", 
    imageFile: null, // Stores the File object for upload
    imagePreview: null, // Stores the blob URL for preview
  });
  const [error, setError] = useState(null);

  // --- API Functions ---

  const fetchBanners = async () => {
    setGlobalLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/banners`);
      setBanners(res.data);
    } catch (err) {
        setError("Failed to fetch banners.");
    } finally {
        setGlobalLoading(false);
    }
  };

  const deleteBanner = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      setDeletingId(id);
      setError(null);
      try {
        // Backend expects DELETE /api/banner/:id
        await axios.delete(`${API_BASE_URL}/api/banner/${id}`); 
        fetchBanners(); // Refresh list on success
      } catch (err) {
        setError(`Failed to delete banner ${id}.`);
      } finally {
        setDeletingId(null);
      }
    }
  };
  
  const updateBanner = async (id) => {
    if (!editData.name.trim()) {
        setError("Banner name cannot be empty.");
        return;
    }

    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData();
    formData.append("name", editData.name);
    
    // IMPORTANT: Only append the file if one was selected
    if (editData.imageFile) { 
      formData.append("image", editData.imageFile);
    }

    try {
      // Backend expects PUT /api/banner/:id with multipart/form-data
      await axios.put(`${API_BASE_URL}/api/banner/${id}`, formData); 
      
      setEditingId(null);
      // Clean up preview URL memory
      if (editData.imagePreview) URL.revokeObjectURL(editData.imagePreview);
      
      fetchBanners(); // Refresh list on success
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.error || "Update failed due to server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handlers ---
  
  const startEditing = (banner) => {
    setEditingId(banner._id);
    // Reset file/preview state when starting a new edit
    setEditData({ name: banner.name, imageFile: null, imagePreview: null });
    setError(null);
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Clean up previous preview URL before creating a new one
    if (editData.imagePreview) URL.revokeObjectURL(editData.imagePreview);
    
    if (file) {
      setEditData({ 
        ...editData, 
        imageFile: file, 
        imagePreview: URL.createObjectURL(file) 
      });
    } else {
      setEditData({ ...editData, imageFile: null, imagePreview: null });
    }
  };
  
  const cancelEditing = () => {
    setEditingId(null);
    // Clean up preview URL memory if it exists
    if (editData.imagePreview) URL.revokeObjectURL(editData.imagePreview);
    setEditData({ name: "", imageFile: null, imagePreview: null });
    setError(null);
  };

  // --- Initial Data Fetch ---
  useEffect(() => {
    fetchBanners();
  }, []);
  
  // --- Render ---

  if (globalLoading) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p>Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Banner Management</h1>
        <a href="/add-banner">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition">
            ➕ Add Banner
          </button>
        </a>
      </div>

      {/* Global Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner._id} className="border p-4 rounded-xl shadow-lg bg-white">
            
            {/* Conditional Image Display: Show new preview if available */}
            <img
              src={editingId === banner._id && editData.imagePreview ? editData.imagePreview : banner.imageUrl}
              className="w-full h-40 object-cover rounded mb-3 border border-gray-200"
              alt={banner.name}
            />

            {/* Editing State */}
            {editingId === banner._id ? (
              <div className="space-y-3">
                {/* Name Input */}
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />

                {/* Image Upload */}
                <input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                    {editData.imageFile ? `New file selected: ${editData.imageFile.name}` : "Select a new file to replace the current image."}
                </p>

                {/* Save & Cancel Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => updateBanner(banner._id)}
                    className={`flex-1 ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded transition`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>

                  <button
                    onClick={cancelEditing}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display State
              <>
                <h2 className="text-lg font-semibold mb-3 text-gray-700">{banner.name}</h2>

                <div className="flex gap-3">
                  <button
                    onClick={() => startEditing(banner)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() => deleteBanner(banner._id)}
                    className={`bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition ${deletingId === banner._id ? 'bg-red-400 cursor-not-allowed' : ''}`}
                    disabled={deletingId === banner._id}
                  >
                    {deletingId === banner._id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerList;