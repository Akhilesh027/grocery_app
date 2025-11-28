import React, { useState, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const SearchScreen = () => {
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('https://grocery-c3c0.onrender.com/api/products');
        // Extract products array from response
        const productsData = res.data.products || [];
        setProducts(productsData);
      } catch (err) {
        console.error('Error fetching products:', err.message);
        setError('Failed to load products');
        Alert.alert('Error', 'Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // Categories data based on your product categories
  const categories = [
    { id: 'all', name: 'All', icon: '🛍️' },
    { id: 'fruit', name: 'Fruits', icon: '🍎' },
    { id: 'vegetable', name: 'Vegetables', icon: '🥦' },
    { id: 'grocery', name: 'Grocery', icon: '🛒' },
    { id: 'personal-care', name: 'Personal Care', icon: '🧴' },
    { id: 'cleaning', name: 'Cleaning', icon: '🧹' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'beverages', name: 'Beverages', icon: '🥤' },
  ];

  // Filter products based on search query and category
  const filteredProducts = useMemo(() => {
    if (loading) return [];
    
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => {
        const productCategory = product.category?.mainCategory?.toLowerCase() || '';
        const selectedCategoryLower = selectedCategory.toLowerCase();
        return productCategory.includes(selectedCategoryLower);
      });
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const productTitle = product.title?.toLowerCase() || '';
        const productSubtitle = product.subtitle?.toLowerCase() || '';
        const productBrand = product.brand?.toLowerCase() || '';
        const productCategory = product.category?.mainCategory?.toLowerCase() || '';
        
        return (
          productTitle.includes(query) ||
          productSubtitle.includes(query) ||
          productBrand.includes(query) ||
          productCategory.includes(query)
        );
      });
    }
    
    return filtered;
  }, [products, searchQuery, selectedCategory, loading]);

  // Render product item
  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImage}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <Text style={styles.productImagePlaceholder}>
            {getCategoryIcon(item.category?.mainCategory)}
          </Text>
        )}
      </View>
      
      {/* Discount Badge */}
      {item.discount > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>{item.discount}% OFF</Text>
        </View>
      )}
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.title || 'Product Name'}
        </Text>
        <Text style={styles.productSubtitle} numberOfLines={1}>
          {item.subtitle || ''}
        </Text>
        <Text style={styles.productBrand}>
          {item.brand || 'Generic Brand'}
        </Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>
            ₹{item.price ? item.price.toLocaleString() : '0'}
          </Text>
          {item.mrp && item.mrp > item.price && (
            <Text style={styles.productMrp}>
              ₹{item.mrp.toLocaleString()}
            </Text>
          )}
        </View>
        
        {/* Delivery Time */}
        <Text style={styles.deliveryTime}>
          ⏱️ {item.deliveryTime || '10-15 min'}
        </Text>
        
        {/* Stock Status */}
        {!item.inStock && (
          <Text style={styles.outOfStock}>Out of Stock</Text>
        )}
        
        {/* Rating */}
        {item.rating > 0 && (
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>⭐ {item.rating}</Text>
          </View>
        )}
        
        {/* Deal Badges */}
        <View style={styles.badgesContainer}>
          {item.isTopSelling && (
            <Text style={styles.topSellingBadge}>🔥 Top Selling</Text>
          )}
          {item.isTodaysDeal && (
            <Text style={styles.todaysDealBadge}>🎯 Today's Deal</Text>
          )}
          {item.isHotDeal && (
            <Text style={styles.hotDealBadge}>💥 Hot Deal</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Helper function to get category icon
  const getCategoryIcon = (mainCategory) => {
    if (!mainCategory) return '🛍️';
    
    const categoryMap = {
      'fruit': '🍎',
      'vegetable': '🥦',
      'grocery': '🛒',
      'personal care': '🧴',
      'cleaning': '🧹',
      'electronics': '📱',
      'beverages': '🥤'
    };
    
    return categoryMap[mainCategory.toLowerCase()] || '🛍️';
  };

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem,
        selectedCategory === item.name && styles.categoryItemSelected
      ]}
      onPress={() => setSelectedCategory(item.name)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryName,
        selectedCategory === item.name && styles.categoryNameSelected
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for products, brands and more"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              returnKeyType="search"
              autoCorrect={false}
            />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9933" />
          <Text style={styles.loadingText}>Loading products...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for products, brands and more"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              returnKeyType="search"
              autoCorrect={false}
            />
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for products, brands and more"
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Search Results */}
        <View style={styles.section}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </Text>
            <Text style={styles.resultsCount}>
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductItem}
              keyExtractor={(item, index) => item._id || `product-${index}`}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.productsRow}
              contentContainerStyle={styles.productsList}
            />
          ) : (
            <View style={styles.noResults}>
              <Text style={styles.noResultsIcon}>🔍</Text>
              <Text style={styles.noResultsText}>
                {searchQuery || selectedCategory !== 'All' ? 'No products found' : 'No products available'}
              </Text>
              <Text style={styles.noResultsSubText}>
                {searchQuery 
                  ? 'Try different keywords or check the spelling'
                  : selectedCategory !== 'All'
                  ? `No ${selectedCategory.toLowerCase()} products available`
                  : 'Products will appear here once available'
                }
              </Text>
              {(searchQuery || selectedCategory !== 'All') && (
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                >
                  <Text style={styles.clearFiltersText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  backIcon: {
    fontSize: 20,
    color: '#374151',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6B7280',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginRight: 12,
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryItemSelected: {
    backgroundColor: '#FFEDD5',
    borderColor: '#FF9933',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryNameSelected: {
    color: '#FF9933',
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  productsList: {
    paddingBottom: 20,
  },
  productsRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  productImagePlaceholder: {
    fontSize: 32,
    color: '#9CA3AF',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 1,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
    lineHeight: 18,
  },
  productSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 6,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  productMrp: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  deliveryTime: {
    fontSize: 10,
    color: '#059669',
    marginBottom: 4,
  },
  outOfStock: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingContainer: {
    marginBottom: 6,
  },
  rating: {
    fontSize: 10,
    color: '#D97706',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  topSellingBadge: {
    fontSize: 8,
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  todaysDealBadge: {
    fontSize: 8,
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  hotDealBadge: {
    fontSize: 8,
    color: '#7C3AED',
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#9CA3AF',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  clearFiltersButton: {
    backgroundColor: '#FF9933',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF9933',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default SearchScreen;