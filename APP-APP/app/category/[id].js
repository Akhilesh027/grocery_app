import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Breadcrumb from '../../components/Breadcrumb';
import ProductGrid from '../../components/ProductGrid';
import VendorImageUpload from '../../components/VendorImageUpload';
import CategoryBanner from '../../components/CategoryBanner';
import { HeaderBackground } from '../../components/HeaderBackground';
import {
  categoriesWithSubCategories,
  getCategoryById,
  canVendorEditCategory,
  hasUploadQuota
} from '../../data/categoryData';

export default function CategoryPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [isVendorMode, setIsVendorMode] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);
  const currentVendorId = 'vendor1'; // In real app, get from auth context

  // Get category data
  const category = getCategoryById(id);

  if (!category) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Category not found</Text>
      </SafeAreaView>
    );
  }

  const breadcrumbItems = [
    { title: 'Home', path: '/' },
    { title: category.name }
  ];

  const handleSubCategoryPress = (subCategory) => {
    // Navigate to sub-category page
    router.push(`/category/${id}/${subCategory.id}`);
  };

  const handleLongPress = (item, type = 'subcategory') => {
    if (isVendorMode) {
      setSelectedImageData({
        categoryId: category.id,
        categoryName: category.name,
        currentImage: item.image,
        productId: `${type}_${item.id}`,
        itemId: item.id,
        itemType: type
      });
      setUploadModalVisible(true);
    }
  };

  const handleImageUpdate = (updateData) => {
    // In a real app, this would make an API call to update the backend
    console.log('Image updated:', updateData);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header Background */}
      <HeaderBackground 
        height={120} 
        colors={['#10B981', '#059669']}
        patternOpacity={0.1} 
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          <View style={styles.headerTitle}>
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <Text style={styles.categorySubtitle}>{category.itemCount} items available</Text>
          </View>

          <TouchableOpacity 
            style={[styles.vendorToggle, isVendorMode && styles.vendorToggleActive]}
            onPress={() => setIsVendorMode(!isVendorMode)}
          >
            <Text style={[styles.vendorToggleText, isVendorMode && styles.vendorToggleTextActive]}>
              {isVendorMode ? '📝' : '👤'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Category Banner */}
          <CategoryBanner category={category} />
          
          {/* Sub-categories Section - Only show sub-categories */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Choose what you're looking for</Text>
              <Text style={styles.sectionSubtitle}>
                {category.subCategories?.length || 0} options available
              </Text>
            </View>
            
            <View style={styles.subCategoriesGrid}>
              {category.subCategories?.map((subCategory) => (
                <TouchableOpacity 
                  key={subCategory.id} 
                  style={styles.subCategoryCard}
                  onPress={() => handleSubCategoryPress(subCategory)}
                  onLongPress={() => handleLongPress(subCategory, 'subcategory')}
                  delayLongPress={800}
                >
                  <Image source={{ uri: subCategory.image }} style={styles.subCategoryImage} />
                  <View style={styles.subCategoryOverlay}>
                    <Text style={styles.subCategoryIcon}>{subCategory.icon}</Text>
                    <Text style={styles.subCategoryName}>{subCategory.name}</Text>
                    <Text style={styles.subCategoryCount}>{subCategory.itemCount}</Text>
                    
                    {/* Upload hint for vendors */}
                    {isVendorMode && (
                      <View style={styles.uploadHint}>
                        <Text style={styles.uploadHintText}>Hold to edit</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>

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
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  categorySubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  vendorToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  vendorToggleActive: {
    backgroundColor: '#FFFFFF',
  },
  vendorToggleText: {
    fontSize: 18,
  },
  vendorToggleTextActive: {
    color: '#10B981',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  subCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subCategoryCard: {
    width: '48%',
    aspectRatio: 1.2,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedSubCategory: {
    borderWidth: 3,
    borderColor: '#10B981',
  },
  subCategoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  subCategoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 12,
  },
  subCategoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  subCategoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subCategoryCount: {
    fontSize: 12,
    color: '#F3F4F6',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  uploadHint: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  uploadHintText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  allProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '32%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 80,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 8,
  },
  productTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 14,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  price: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    marginRight: 4,
  },
  mrp: {
    fontSize: 10,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  rating: {
    fontSize: 10,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  discountBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  vendorBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 50,
  },
});