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

export default function CategoryGrid3x3({ 
  title, 
  categories, 
  showViewAll = true, 
  enableNavigation = true,
  showVendorUpload = false,
  currentVendorId = 'vendor1'
}) {
  const router = useRouter();
  const { navigateToCategory } = useCategoryNavigation();
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);
  const [categoryList, setCategoryList] = useState(categories);

  const handleCategoryPress = (category) => {
    if (enableNavigation) {
      // Try to find the category in the main categories data
      const fullCategory = getCategoryByName(category.name);
      if (fullCategory) {
        // Set the category in context and navigate to categories tab
        navigateToCategory(fullCategory.id);
        router.push('/categories');
      }
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
    setCategoryList(prevCategories => 
      prevCategories.map(cat => 
        cat.id === updateData.productId.replace('category_', '') 
          ? { ...cat, image: updateData.imageUrl, vendorId: updateData.vendorId }
          : cat
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showViewAll && (
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.grid}>
        {categoryList.slice(0, 9).map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.categoryCard}
            onPress={() => handleCategoryPress(item)}
            onLongPress={() => handleLongPress(item)}
            delayLongPress={800}
          >
            <Image source={{ uri: item.image }} style={styles.categoryImage} />
            <View style={styles.categoryOverlay}>
              <Text style={styles.categoryIcon}>{item.icon}</Text>
              <Text style={styles.categoryName}>{item.name}</Text>
              <Text style={styles.categoryCount}>{item.itemCount}</Text>
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
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9933',
    letterSpacing: 0.2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '32%', // 3 columns with proper spacing
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 153, 51, 0.85)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 8,
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  categoryCount: {
    fontSize: 9,
    color: '#F3F4F6',
    textAlign: 'left',
  },
  vendorIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF9933',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  uploadHint: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uploadHintText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#FF9933',
  },
});
