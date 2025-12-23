import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions, // Import Dimensions for dynamic sizing
} from 'react-native';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useCategoryNavigation } from '../context/CategoryNavigationContext';
import VendorImageUpload from './VendorImageUpload'; // Assuming this path is correct

// Get screen width for dynamic sizing
const { width } = Dimensions.get('window');
// Define column count and margin for layout calculation
const NUM_COLUMNS = 2;
const CARD_MARGIN = 10;
const CONTAINER_PADDING = 10;

// Calculate the width of each card
const CARD_WIDTH = (width - (2 * CONTAINER_PADDING) - ((NUM_COLUMNS - 1) * CARD_MARGIN)) / NUM_COLUMNS;


export default function CategoryGrid({
  showVendorUpload = false,
  currentVendorId = 'vendor1'
}) {
  const router = useRouter();
  // Assuming CategoryNavigationContext is still used for global state management
  const { navigateToCategory } = useCategoryNavigation(); 

  const [categories, setCategories] = useState([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);

  /**
   * Fetches main categories and limits the result to the first 4.
   */
  const getCategories = async () => {
    try {
      const res = await axios.get("https://api.sampurnamart.cloud/api/categories");

      // Filter only main categories
      const mainCategories = res.data.filter(cat => cat.type === "main");

      // Limit to the first 4 categories as requested
      const fourCategories = mainCategories.slice(0, 4); 

      setCategories(fourCategories);

    } catch (err) {
      console.log("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  /**
   * Handles category press, navigating to the category page with the ID.
   */
  const handleCategoryPress = (category) => {
    // 1. Update global context/state with the selected category ID (optional based on your app needs)
    navigateToCategory(category._id); 
        router.push({
      pathname: "/SingleCategory", 
      params: { categoryId: category._id } 
    });
  };

  /**
   * Handles long press for vendor image upload (if enabled).
   */
  const handleLongPress = (category) => {
    if (!showVendorUpload) return;

    setSelectedImageData({
      categoryId: category._id,
      categoryName: category.name,
      currentImage: category.bannerImage,
      productId: `category_${category._id}`
    });

    setUploadModalVisible(true);
  };

  /**
   * Updates the banner image locally after a successful upload.
   */
  const handleImageUpdate = (updateData) => {
    setCategories(prev =>
      prev.map(cat =>
        // The productId is structured as 'category_ID', so we remove 'category_' to get the actual ID
        cat._id === updateData.productId.replace("category_", "") 
          ? { ...cat, bannerImage: updateData.imageUrl }
          : cat
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {categories?.length > 0 ? (
          categories.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={[styles.categoryCard]}
              onPress={() => handleCategoryPress(item)}
              onLongPress={() => handleLongPress(item)}
              delayLongPress={800}
            >
              {/* Fallback image source if the URI is null/invalid */}
              <Image 
                source={{ uri: item.bannerImage }} 
                style={styles.categoryImage} 
              />

              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>

                {/* Show edit hint only when vendor upload mode is active */}
                {showVendorUpload && (
                  <View style={styles.uploadHint}>
                    <Text style={styles.uploadHintText}>Hold to edit</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ textAlign: "center", padding: 20 }}>Loading...</Text>
        )}
      </View>

      {/* Vendor Image Upload Modal */}
      {selectedImageData && (
        <VendorImageUpload
          isVisible={uploadModalVisible}
          onClose={() => {
            setUploadModalVisible(false);
            setSelectedImageData(null);
          }}
          currentVendorId={currentVendorId}
          categoryName={selectedImageData.categoryName}
          productId={selectedImageData.productId}
          currentImage={selectedImageData.currentImage}
          onImageUpdate={handleImageUpdate}
        />
      )}
    </View>
  );
}

// ---
// STYLESHEET FOR 2-COLUMN GRID
// ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: CONTAINER_PADDING,
    backgroundColor: '#f8f8f8', // Light background for the page
  },

  // Grid container set up for a 2-column wrapping layout
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    justifyContent: 'space-between', // Spacing between columns
  },

  // Individual category card style
  categoryCard: {
    width: CARD_WIDTH, // Calculated width for 2 columns
    marginBottom: CARD_MARGIN, // Vertical spacing between rows
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
    overflow: 'hidden',
  },

  // Image style
  categoryImage: {
    width: '100%',
    // Consistent aspect ratio (e.g., 4:3)
    height: CARD_WIDTH * 0.75, 
    resizeMode: 'cover',
  },

  // Info section below the image
  categoryInfo: {
    padding: 10,
    alignItems: 'center', // Center the text horizontally
  },

  // Category name text
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
  },

  // Styles for the "Hold to edit" hint
  uploadHint: {
    marginTop: 5,
    paddingVertical: 2,
    paddingHorizontal: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
  },
  uploadHintText: {
    fontSize: 10,
    color: '#666',
  },
});