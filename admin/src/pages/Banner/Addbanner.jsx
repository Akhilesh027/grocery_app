import { useState } from "react";
import axios from "axios";

const AddBanner = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setError("");
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const submitForm = async () => {
    if (!name.trim()) {
      setError("Please enter a banner name");
      return;
    }

    if (!image) {
      setError("Please select an image");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("image", image);

    try {
      const response = await axios.post("https://api.sampurnamart.cloud/api/banner", formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000, // 30 second timeout
      });

      if (response.status === 201) {
        alert("Banner uploaded successfully!");
        // Reset form
        setName("");
        setImage(null);
        setPreview("");
        
        // Redirect to banners page
        window.location.href = "/banners";
      }
    } catch (error) {
      console.error("Upload Error:", error);
      
      if (error.response) {
        // Server responded with error status
        setError(error.response.data.error || "Upload failed. Please try again.");
      } else if (error.request) {
        // Request was made but no response received
        setError("Network error. Please check your connection.");
      } else {
        // Something else happened
        setError("Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setImage(null);
    setPreview("");
    setError("");
  };

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Add New Banner</h1>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Banner Name Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Name *
        </label>
        <input
          type="text"
          placeholder="Enter banner name"
          value={name}
          className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          disabled={loading}
        />
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Banner Image *
        </label>
        <input
          type="file"
          accept="image/jpeg, image/jpg, image/png, image/webp"
          className="border border-gray-300 p-3 w-full rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          onChange={handleImageChange}
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Supported formats: JPEG, PNG, WebP (Max 5MB)
        </p>
      </div>

      {/* Image Preview */}
      {preview && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview
          </label>
          <div className="border border-gray-300 rounded-lg p-2">
            <img
              src={preview}
              alt="Preview"
              className="h-48 w-full object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={submitForm}
          disabled={loading}
          className={`flex-1 py-3 px-4 rounded-lg font-medium ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white transition-colors`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </span>
          ) : (
            "Upload Banner"
          )}
        </button>

        <button
          type="button"
          onClick={resetForm}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Upload Tips:</h3>
        <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
          <li>Use high-quality images for better display</li>
          <li>Recommended aspect ratio: 16:9 or 3:1</li>
          <li>Optimal size: 1200x400 pixels</li>
          <li>File size should be less than 5MB</li>
        </ul>
      </div>
    </div>
  );
};

export default AddBanner;