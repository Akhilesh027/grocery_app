import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  ScrollView,
  Animated 
} from 'react-native';
import ProductGrid from './ProductGrid';

export default function SubCategoryGrid({ 
  category, 
  isExpanded, 
  onSubCategoryPress,
  selectedSubCategory,
  animatedHeight 
}) {
  if (!category || !category.subCategories) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          height: isExpanded ? animatedHeight : 0,
          opacity: isExpanded ? 1 : 0 
        }
      ]}
    >
      <View style={styles.content}>
        {/* Sub-category header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>
            {category.icon} {category.name} Categories
          </Text>
          <Text style={styles.headerSubtitle}>
            Choose from {category.subCategories.length} sub-categories
          </Text>
        </View>

        {/* Sub-categories grid */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.subCategoriesScroll}
          contentContainerStyle={styles.subCategoriesContainer}
        >
          {category.subCategories.map((subCategory) => (
            <TouchableOpacity 
              key={subCategory.id}
              style={[
                styles.subCategoryCard,
                selectedSubCategory?.id === subCategory.id && styles.selectedSubCategory
              ]}
              onPress={() => onSubCategoryPress(subCategory)}
            >
              <Image 
                source={{ uri: subCategory.image }} 
                style={styles.subCategoryImage} 
              />
              <View style={styles.subCategoryOverlay}>
                <Text style={styles.subCategoryIcon}>{subCategory.icon}</Text>
                <Text style={styles.subCategoryName}>{subCategory.name}</Text>
                <Text style={styles.subCategoryCount}>{subCategory.itemCount}</Text>
              </View>
              
              {/* Selection indicator */}
              {selectedSubCategory?.id === subCategory.id && (
                <View style={styles.selectionIndicator}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected sub-category products */}
        {selectedSubCategory && selectedSubCategory.products && (
          <View style={styles.productsSection}>
            <View style={styles.productsSectionHeader}>
              <Text style={styles.productsSectionTitle}>
                {selectedSubCategory.icon} {selectedSubCategory.name} Products
              </Text>
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllText}>View All ({selectedSubCategory.products.length})</Text>
              </TouchableOpacity>
            </View>
            
            {/* Products Grid */}
            <View style={styles.productsGrid}>
              {selectedSubCategory.products.slice(0, 6).map((product) => (
                <View key={product.id} style={styles.productWrapper}>
                  <View style={styles.productCard}>
                    <Image 
                      source={{ uri: product.image }} 
                      style={styles.productImage} 
                    />
                    <View style={styles.productInfo}>
                      <Text style={styles.productTitle} numberOfLines={2}>
                        {product.title}
                      </Text>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>₹{product.price}</Text>
                        {product.mrp > product.price && (
                          <Text style={styles.mrp}>₹{product.mrp}</Text>
                        )}
                      </View>
                      <Text style={styles.rating}>🪙 {product.rating}</Text>
                      
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Close button */}
        <TouchableOpacity style={styles.closeButton} onPress={() => onSubCategoryPress(null)}>
          <Text style={styles.closeButtonText}>× Close Categories</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    paddingVertical: 20,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  subCategoriesScroll: {
    marginBottom: 20,
  },
  subCategoriesContainer: {
    paddingHorizontal: 20,
    paddingRight: 40,
  },
  subCategoryCard: {
    width: 120,
    height: 120,
    marginRight: 12,
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
    backgroundColor: 'rgba(16, 185, 129, 0.7)',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: 8,
  },
  subCategoryIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  subCategoryName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 1,
  },
  subCategoryCount: {
    fontSize: 9,
    color: '#F3F4F6',
  },
  selectionIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10B981',
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
  productsSection: {
    paddingHorizontal: 20,
  },
  productsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productsSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  viewAllButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  viewAllText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '32%',
    marginBottom: 12,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    marginBottom: 4,
  },
  vendorBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  vendorText: {
    fontSize: 8,
    color: '#6B7280',
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});