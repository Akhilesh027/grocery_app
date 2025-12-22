import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'http://31.97.233.212:5000/api';

export default function SingleCategoryScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { categoryId, categoryName } = route.params || {};
  
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [todayDeals, setTodayDeals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [addingToCart, setAddingToCart] = useState({});
  
  // Fetch category details, subcategories and products
  const fetchCategoryData = useCallback(async () => {
    try {
      if (!categoryId && !categoryName) {
        Alert.alert('Error', 'No category specified');
        navigation.goBack();
        return;
      }

      setLoading(true);
      
      // Fetch ALL categories to get main and sub categories
      const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
      const allCategories = categoriesResponse.data;
      
      let categoryData;
      
      // Find the main category by ID or name
      if (categoryId) {
        categoryData = allCategories.find(cat => cat._id === categoryId);
      } else if (categoryName) {
        categoryData = allCategories.find(cat => 
          cat.name.toLowerCase() === categoryName.toLowerCase() && 
          cat.type === 'main'
        );
      }
      
      if (!categoryData) {
        Alert.alert('Error', 'Category not found');
        navigation.goBack();
        return;
      }
      
      setCategory(categoryData);
      
      // Find subcategories for this main category
      const subcats = allCategories.filter(cat => 
        cat.type === 'sub' && 
        cat.parentCategory === categoryData.name
      );
      
      setSubcategories(subcats);
      
      // Fetch products for this category
      await fetchProductsForCategory(categoryData.name, null);
      
    } catch (error) {
      console.error('Error fetching category data:', error);
      Alert.alert('Error', 'Failed to load category data');
    } finally {
      setLoading(false);
    }
  }, [categoryId, categoryName, navigation]);

  // Fetch products for category (with optional subcategory filter)
  const fetchProductsForCategory = async (mainCategory, subcategory) => {
    try {
      let query = {};
      
      // Build query based on your existing API structure
      if (subcategory) {
        // If subcategory is selected, filter by both main and subcategory
        // This depends on your Product model structure
        query = { 
          category: subcategory // or use your specific field name
        };
      } else {
        // If no subcategory selected, get all products in main category
        query = { 
          category: mainCategory // or use your specific field name
        };
      }
      
      const response = await axios.get(`${API_BASE_URL}/products`, {
        params: {
          category: mainCategory,
          limit: 50
        }
      });
      
      const products = response.data.products || [];
      setAllProducts(products);
      setFilteredProducts(products);
      
      // Filter for today's deals (products with discount > 20%)
      const deals = products.filter(product => product.discount >= 20);
      setTodayDeals(deals.slice(0, 10));
      
      // Filter trending products (top selling)
      const trending = products.filter(product => product.isTopSelling);
      setTrendingProducts(trending.slice(0, 8));
      
      // Recommended products (random selection for now)
      const recommended = [...products]
        .sort(() => Math.random() - 0.5)
        .slice(0, 8);
      setRecommendedProducts(recommended);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
      setAllProducts([]);
      setFilteredProducts([]);
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory._id);
    // Fetch products for selected subcategory
    fetchProductsForCategory(category.name, subcategory.name);
  };

  // Clear subcategory filter
  const handleClearSubcategory = () => {
    setSelectedSubcategory(null);
    fetchProductsForCategory(category.name, null);
  };

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
      if (response.data.success) {
        setCartItems(response.data.items || []);
      }
    } catch (error) {
      console.error('Error fetching cart:', error.response?.data || error.message);
    }
  };

  // Add to cart function
  const handleAddToCart = async (product) => {
    if (!product.inStock) {
      return Alert.alert("Out of Stock", "This product is not available currently.");
    }

    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        return Alert.alert("Login Required", "Please log in to add items to your cart.");
      }

      const response = await axios.post(`${API_BASE_URL}/cart`, {
        userId,
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0] || product.image,
        quantity: 1,
      });

      if (response.status === 200 && response.data.success) {
        Alert.alert("Added!", `${product.title} has been added to your cart.`);
        await fetchCartItems();
      } else {
        Alert.alert("Error", response.data.message || "Failed to add to cart.");
      }
    } catch (error) {
      console.error("Add to Cart Error:", error.response?.data || error.message);
      Alert.alert("Error", "Something went wrong while adding to cart.");
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  // Quick add to cart
  const handleQuickAdd = async (product) => {
    if (!product.inStock) return;

    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await axios.post(`${API_BASE_URL}/cart`, {
        userId,
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0] || product.image,
        quantity: 1,
      });

      if (response.status === 200 && response.data.success) {
        await fetchCartItems();
      }
    } catch (error) {
      console.error("Quick Add to Cart Error:", error.response?.data || error.message);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.productId === productId || item.productId?._id === productId);
  };

  // Get cart quantity
  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find(item => item.productId === productId || item.productId?._id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Get cart items count for badge
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchCategoryData(), fetchCartItems()]);
    setRefreshing(false);
  }, [fetchCategoryData]);

  useEffect(() => {
    fetchCategoryData();
    fetchCartItems();
  }, [fetchCategoryData]);

  // Header component
  const Header = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>
      
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {category?.name || 'Category'}
        </Text>
        <Text style={styles.productCount}>
          {filteredProducts.length} products
          {selectedSubcategory ? ' in this subcategory' : ''}
        </Text>
      </View>
      
      <View style={styles.headerIcons}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="magnify" size={24} color="#000" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={() => navigation.navigate('cart')}
        >
          <Icon name="cart-outline" size={24} color="#000" />
          {getCartItemsCount() > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {getCartItemsCount() > 99 ? '99+' : getCartItemsCount()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // Category banner
  const CategoryBanner = () => (
    <View style={styles.categoryBanner}>
      {category?.bannerImage ? (
        <Image 
          source={{ uri: category.bannerImage }} 
          style={styles.bannerImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.bannerPlaceholder}>
          <Icon name="tag-outline" size={48} color="#00CC66" />
          <Text style={styles.bannerPlaceholderText}>{category?.name}</Text>
        </View>
      )}
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitle}>{category?.name}</Text>
        <Text style={styles.bannerSubtitle}>
          {selectedSubcategory 
            ? subcategories.find(sub => sub._id === selectedSubcategory)?.name || 'Subcategory'
            : 'Explore all products'
          }
        </Text>
      </View>
    </View>
  );
const SubcategoriesSection = () => {
  if (subcategories.length === 0) return null;
  
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Subcategories</Text>
        {selectedSubcategory && (
          <TouchableOpacity onPress={handleClearSubcategory}>
            <Text style={styles.viewAllText}>Show All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.subcategoriesGrid}>
        {subcategories.map((subcat) => (
          <TouchableOpacity 
            key={subcat._id}
            style={[
              styles.subcategoryCard,
              selectedSubcategory === subcat._id && styles.selectedSubcategoryCard
            ]}
            onPress={() => handleSubcategorySelect(subcat)}
          >
            <View style={styles.subcategoryImageContainer}>
              {subcat.bannerImage ? (
                <Image 
                  source={{ uri: subcat.bannerImage }} 
                  style={[
                    styles.subcategoryImage,
                    selectedSubcategory === subcat._id && styles.selectedSubcategoryImage
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <View style={[
                  styles.subcategoryPlaceholder,
                  selectedSubcategory === subcat._id && styles.selectedSubcategoryPlaceholder
                ]}>
                  <Icon 
                    name="tag" 
                    size={24} 
                    color={selectedSubcategory === subcat._id ? '#FFF' : '#00CC66'} 
                  />
                </View>
              )}
            </View>
            <Text 
              style={[
                styles.subcategoryName,
                selectedSubcategory === subcat._id && styles.selectedSubcategoryName
              ]}
              numberOfLines={2}
            >
              {subcat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

  // Product card component
  const ProductCard = ({ product, showDiscount = true }) => {
    const cartQuantity = getCartQuantity(product._id);
    const isProductInCart = isInCart(product._id);
    
    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetail', { productId: product._id })}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: product.images?.[0] || product.image }} 
            style={styles.productImage}
          />
          {product.discount > 0 && showDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}% OFF</Text>
            </View>
          )}
          {product.isTopSelling && (
            <View style={styles.topSellingBadge}>
              <Icon name="fire" size={12} color="#FFF" />
              <Text style={styles.topSellingText}>Top</Text>
            </View>
          )}
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productTitle} numberOfLines={2}>
            {product.title}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.mrp && product.mrp > product.price && (
              <Text style={styles.mrp}>₹{product.mrp}</Text>
            )}
          </View>
          
          <Text style={styles.deliveryText}>
            {product.deliveryTime || 'Today'} • {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
          
          {isProductInCart ? (
            <View style={styles.cartActions}>
              <TouchableOpacity 
                style={styles.viewCartButton}
                onPress={() => navigation.navigate('Cart')}
              >
                <Text style={styles.viewCartText}>View Cart ({cartQuantity})</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.quickAddButton}
                onPress={() => handleQuickAdd(product)}
                disabled={addingToCart[product._id] || !product.inStock}
              >
                {addingToCart[product._id] ? (
                  <ActivityIndicator size="small" color="#00CC66" />
                ) : (
                  <Icon name="plus" size={20} color="#00CC66" />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={[
                styles.addButton,
                (!product.inStock || addingToCart[product._id]) && styles.addButtonDisabled
              ]}
              onPress={() => handleAddToCart(product)}
              disabled={!product.inStock || addingToCart[product._id]}
            >
              {addingToCart[product._id] ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.addButtonText}>
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Section header component
  const SectionHeader = ({ title, subtitle, onViewAll, showViewAll = true }) => (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {showViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00CC66" />
        <Text style={styles.loadingText}>Loading Category...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <CategoryBanner />
        
        {/* Subcategories Section */}
        <SubcategoriesSection />
        
        {/* Today's Deals Section */}
        {todayDeals.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Today's Deals"
              subtitle="Biggest discounts of the day"
              onViewAll={() => navigation.navigate('Products', { 
                title: "Today's Deals",
                products: todayDeals 
              })}
            />
            
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {todayDeals.map((product) => (
                <View key={product._id} style={styles.dealCardContainer}>
                  <ProductCard product={product} showDiscount={true} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Trending Products */}
        {trendingProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Trending Now"
              subtitle="Most popular in this category"
              onViewAll={() => navigation.navigate('Products', { 
                title: "Trending Products",
                products: trendingProducts 
              })}
            />
            
            <View style={styles.gridContainer}>
              {trendingProducts.map((product) => (
                <View key={product._id} style={styles.gridItem}>
                  <ProductCard product={product} showDiscount={false} />
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* All Products Section */}
        {filteredProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title={selectedSubcategory ? "All Products" : "All Products"}
              subtitle={`${filteredProducts.length} items available`}
              onViewAll={() => navigation.navigate('Products', { 
                title: selectedSubcategory 
                  ? `${subcategories.find(sub => sub._id === selectedSubcategory)?.name || 'Subcategory'} Products`
                  : `All ${category?.name}`,
                products: filteredProducts 
              })}
              showViewAll={filteredProducts.length > 12}
            />
            
            <View style={styles.allProductsGrid}>
              {filteredProducts.slice(0, 12).map((product) => (
                <View key={product._id} style={styles.gridItem}>
                  <ProductCard product={product} showDiscount={true} />
                </View>
              ))}
            </View>
            
            {filteredProducts.length > 12 && (
              <TouchableOpacity 
                style={styles.loadMoreButton}
                onPress={() => navigation.navigate('Products', { 
                  title: selectedSubcategory 
                    ? `${subcategories.find(sub => sub._id === selectedSubcategory)?.name || 'Subcategory'} Products`
                    : `All ${category?.name}`,
                  products: filteredProducts 
                })}
              >
                <Text style={styles.loadMoreText}>
                  View All {filteredProducts.length} Products
                </Text>
                <Icon name="arrow-right" size={20} color="#00CC66" />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Recommended Products */}
        {recommendedProducts.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="Recommended For You"
              subtitle="Based on your interests"
              onViewAll={() => navigation.navigate('Products', { 
                title: "Recommended Products",
                products: recommendedProducts 
              })}
            />
            
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {recommendedProducts.map((product) => (
                <View key={product._id} style={styles.recommendedCardContainer}>
                  <ProductCard product={product} showDiscount={true} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="package-variant" size={80} color="#E5E7EB" />
            <Text style={styles.emptyStateTitle}>No Products Found</Text>
            <Text style={styles.emptyStateText}>
              {selectedSubcategory
                ? 'There are no products available in this subcategory yet.'
                : 'There are no products available in this category yet.'
              }
            </Text>
            {selectedSubcategory && (
              <TouchableOpacity 
                style={styles.backToShopButton}
                onPress={handleClearSubcategory}
              >
                <Text style={styles.backToShopText}>Show All Products</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  productCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
  },
  cartButton: {
    padding: 8,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  categoryBanner: {
    height: 180,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 8,
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    color: '#00CC66',
    fontWeight: '600',
  },
  horizontalScroll: {
    marginLeft: -16,
    paddingLeft: 16,
  },
  subcategoriesScroll: {
    paddingRight: 16,
  },
   subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  subcategoryCard: {
    width: (width - 48) / 3, // 3 items per row with padding
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  selectedSubcategoryCard: {
    opacity: 0.9,
  },
  subcategoryImageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  subcategoryImage: {
    width: (width - 80) / 3, // Adjust width to fit 3 in row
    height: (width - 80) / 3, // Make it square
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  selectedSubcategoryImage: {
    borderColor: '#00CC66',
    borderWidth: 2,
  },
  subcategoryPlaceholder: {
    width: (width - 80) / 3,
    height: (width - 80) / 3,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  selectedSubcategoryPlaceholder: {
    backgroundColor: '#00CC66',
    borderColor: '#00CC66',
  },
  subcategoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 16,
    minHeight: 32,
  },
  selectedSubcategoryName: {
    color: '#00CC66',
    fontWeight: '600',
  },

  dealCardContainer: {
    width: 280,
    marginRight: 16,
  },
  recommendedCardContainer: {
    width: 200,
    marginRight: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  allProductsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 280,
  },
  productImageContainer: {
    height: 140,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00CC66',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  topSellingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topSellingText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  productInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  mrp: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  deliveryText: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#00CC66',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  cartActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  viewCartText: {
    color: '#1F2937',
    fontSize: 12,
    fontWeight: '600',
  },
  quickAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginTop: 8,
  },
  loadMoreText: {
    color: '#00CC66',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  emptyState: {
    paddingVertical: 60,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backToShopButton: {
    backgroundColor: '#00CC66',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToShopText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});