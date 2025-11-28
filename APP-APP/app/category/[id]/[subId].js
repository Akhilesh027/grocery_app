import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Breadcrumb from '../../../components/Breadcrumb';
import ProductGrid from '../../../components/ProductGrid';
import HorizontalProductCard from '../../../components/HorizontalProductCard';
import VendorImageUpload from '../../../components/VendorImageUpload';
import { HeaderBackground } from '../../../components/HeaderBackground';
import {
  getCategoryById,
  getSubCategoryById,
  getSubCategoryProducts,
  canVendorEditCategory,
  hasUploadQuota
} from '../../../data/categoryData';

export default function SubCategoryPage() {
  const { id: categoryId, subId: subCategoryId } = useLocalSearchParams();
  const router = useRouter();
  const [isVendorMode, setIsVendorMode] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [selectedImageData, setSelectedImageData] = useState(null);
  const scrollViewRef = useRef(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const currentVendorId = 'vendor1'; // In real app, get from auth context

  // Get category and sub-category data
  const category = getCategoryById(categoryId);
  const subCategory = getSubCategoryById(categoryId, subCategoryId);
  const products = getSubCategoryProducts(categoryId, subCategoryId);

  if (!category || !subCategory) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Sub-category not found</Text>
      </SafeAreaView>
    );
  }

  const breadcrumbItems = [
    { title: 'Home', path: '/' },
    { title: category.name, path: `/category/${categoryId}` },
    { title: subCategory.name }
  ];

  const handleLongPress = (item, type = 'product') => {
    if (isVendorMode) {
      setSelectedImageData({
        categoryId: categoryId,
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

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || !scrollViewRef.current) return;

    const interval = setInterval(() => {
      setScrollPosition((prevPosition) => {
        const newPosition = prevPosition + 100; // Scroll speed
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ 
            y: newPosition, 
            animated: true 
          });
        }
        return newPosition;
      });
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  const handleScrollBeginDrag = () => {
    setIsAutoScrolling(false);
  };

  const handleScrollEndDrag = () => {
    // Resume auto-scroll after 10 seconds of inactivity
    setTimeout(() => {
      setIsAutoScrolling(true);
    }, 10000);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header Background */}
      <HeaderBackground 
        height={140} 
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
            <Text style={styles.subCategoryIcon}>{subCategory.icon}</Text>
            <Text style={styles.subCategoryTitle}>{subCategory.name}</Text>
            <Text style={styles.subCategorySubtitle}>
              {products.length} products available
            </Text>
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
          ref={scrollViewRef}
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
        >
          {/* Products Section - Top Priority */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {subCategory.icon} {subCategory.name} Products
              </Text>
              <Text style={styles.sectionSubtitle}>
                All products in this category
              </Text>
            </View>
            
            {products.length > 0 ? (
              <View style={styles.productsGrid}>
                {products.map((product) => (
                  <HorizontalProductCard
                    key={product.id}
                    product={product}
                    onLongPress={() => isVendorMode && handleLongPress(product, 'product')}
                    showVendorHint={isVendorMode}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No products available in this category</Text>
              </View>
            )}
          </View>

          {/* Related Information */}
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About {subCategory.name}</Text>
            <Text style={styles.infoText}>
              Discover fresh and high-quality {subCategory.name.toLowerCase()} products. 
              All items are carefully selected from trusted vendors to ensure the best quality for your family.
            </Text>
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
  subCategoryIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  subCategoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subCategorySubtitle: {
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
    paddingBottom: 100,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  productsGrid: {
    paddingHorizontal: 16,
  },
  vendorBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F59E0B',
    borderRadius: 8,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vendorText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
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
  infoSection: {
    marginTop: 32,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
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