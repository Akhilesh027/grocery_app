import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useCategoryNavigation } from '../context/CategoryNavigationContext';
import { getCategoryByName } from '../data/categoryData';
import VendorImageUpload from './VendorImageUpload';

export default function CategoryGrid({ 
  showVendorUpload = false,
  currentVendorId = 'vendor1' 
}) {
  const router = useRouter();
  const { navigateToCategory } = useCategoryNavigation();
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);

  // Updated to show only 4 main categories for 2x2 grid
  const [categories, setCategories] = useState([
    {
      id: '1',
      name: 'Vegetables',
      icon: '🥬',
      image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=200',
      itemCount: '50+',
      vendorId: null,
      color: '#E8F5E9'
    },
    {
      id: '2',
      name: 'Fruits',
      icon: '🍎',
      image: 'https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg?auto=compress&cs=tinysrgb&w=200',
      itemCount: '30+',
      vendorId: null,
      color: '#FFF3E0'
    },
    {
      id: '5',
      name: 'Cuts & Sprouts',
      icon: '🥥',
      image: 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=200',
      itemCount: '25+',
      vendorId: null,
      color: '#E3F2FD'
    },
    {
      id: '3',
      name: 'Dairy',
      icon: '🥛',
      image: 'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=200',
      itemCount: '25+',
      vendorId: null,
      color: '#FCE4EC'
    }
  ]);

  const handleCategoryPress = (category) => {
    // Try to find the full category data
    const fullCategory = getCategoryByName(category.name);
    if (fullCategory) {
      // Set the category in context and navigate to categories tab
      navigateToCategory(fullCategory.id);
      router.push('/categories');
    }
  };

  const handleLongPress = (category) => {
    if (showVendorUpload) {
      setSelectedImageData({
        categoryId: category.id,
        categoryName: category.name,
        currentImage: category.image,
        productId: `category_${category.id}`
      });
      setUploadModalVisible(true);
    }
  };

  const handleImageUpdate = (updateData) => {
    // Update category image locally
    setCategories(prevCategories => 
      prevCategories.map(cat => 
        cat.id === updateData.productId.replace('category_', '') 
          ? { ...cat, image: updateData.imageUrl, vendorId: updateData.vendorId }
          : cat
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {categories.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={[styles.categoryCard, { backgroundColor: item.color }]}
            onPress={() => handleCategoryPress(item)}
            onLongPress={() => handleLongPress(item)}
            delayLongPress={800}
          >
            <Image source={{ uri: item.image }} style={styles.categoryImage} />
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={styles.categoryName}>{item.name}</Text>
              
              
              {/* Upload hint for vendors */}
              {showVendorUpload && (
                <View style={styles.uploadHint}>
                  <Text style={styles.uploadHintText}>Hold to edit</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20, // Same as BrandSpotlight
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12, // Same gap as BrandSpotlight
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    height: 120,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryImage: {
    width: 50,
  
    resizeMode: 'contain',
    position: 'absolute',
    right: 8,
    bottom: 8,
    opacity: 0.9,
  },
  categoryInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'left',
    letterSpacing: 0,
  },
  selectedCategoryCard: {
    borderWidth: 3,
    borderColor: '#FF9933',
    transform: [{ scale: 0.95 }],
  },
  selectionIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF9933',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  vendorIndicator: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  uploadHint: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uploadHintText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '500',
  },
});
