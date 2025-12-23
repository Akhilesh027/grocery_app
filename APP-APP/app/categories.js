import { useState, useEffect } from 'react';
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
} from 'react-native';
import { useCategoryNavigation } from '../context/CategoryNavigationContext';
import { getCategoryById } from '../data/categoryData'; // Assuming this function is still necessary for initial nav logic
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const { width } = Dimensions.get('window');

const API_BASE_URL = 'https://api.sampurnamart.cloud/api';

export default function CategoriesScreen() {
  const { selectedCategoryId, clearCategorySelection } = useCategoryNavigation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [addingToCart, setAddingToCart] = useState({});
  const navigation = useNavigation();

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);

      // Set default selected category if none selected
      if (data.length > 0 && !selectedCategory) {
        const mainCategories = data.filter(cat => cat.type === 'main');
        if (mainCategories.length > 0) {
          setSelectedCategory(mainCategories[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products by category
  const fetchProductsByCategory = async (categoryName, subcategoryName = null) => {
    try {
      setProductsLoading(true);
      let url = `${API_BASE_URL}/products?category=${categoryName}`;
      if (subcategoryName) {
        url += `&subcategory=${subcategoryName}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
      setProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  // ✅ Add to Cart Functionality
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

  // ✅ Quick Add to Cart (no alerts)
  const handleQuickAdd = async (product) => {
    if (!product.inStock) return;

    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return; // Silent fail if not logged in

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

  // Get cart quantity for a product
  const getCartQuantity = (productId) => {
    const cartItem = cartItems.find(item => item.productId === productId || item.productId?._id === productId);
    return cartItem ? cartItem.quantity : 0;
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cartItems.some(item => item.productId === productId || item.productId?._id === productId);
  };

  useEffect(() => {
    fetchCategories();
    fetchCartItems();
  }, []);

  // Handle navigation from Home page
  useEffect(() => {
    if (selectedCategoryId) {
      const category = getCategoryById(selectedCategoryId);
      if (category) {
        // Find the full category object by ID from the fetched list
        const mainCat = categories.find(cat => cat.name === category.name);
        if (mainCat) {
            setSelectedCategory(mainCat._id);
        }
        setSelectedSubcategory(null);
      }
      clearCategorySelection();
    }
  }, [selectedCategoryId, clearCategorySelection, categories]);

  // Fetch products when category or subcategory changes
  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find(cat => cat._id === selectedCategory);
      if (category) {
        // Pass the category name and subcategory name for API filtering
        const subcategoryName = selectedSubcategory 
                                ? categories.find(sub => sub._id === selectedSubcategory)?.name 
                                : null;
                                
        fetchProductsByCategory(category.name, subcategoryName);
      }
    }
  }, [selectedCategory, selectedSubcategory, categories]);

  // Group categories by type
  const mainCategories = categories.filter(cat => cat.type === 'main');
  const subCategories = categories.filter(cat => cat.type === 'sub');

  // Get subcategories for selected main category
  const getSubCategoriesForMain = (mainCategoryId) => {
    const mainCategory = categories.find(cat => cat._id === mainCategoryId);
    if (!mainCategory) return [];
    
    return subCategories.filter(sub => sub.parentCategory === mainCategory.name);
  };

  const currentSubcategories = selectedCategory ? getSubCategoriesForMain(selectedCategory) : [];
  const showSubcategories = currentSubcategories.length > 0 && !selectedSubcategory;
  const selectedCategoryData = categories.find(cat => cat._id === selectedCategory);

  // Get cart items count for badge
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };
  
  // Placeholder icon function for subcategory rendering (kept simple)
  const getPlaceholderIcon = (category) => {
      // Use the first letter of the category name if no icon is specified
      return category.name ? category.name.charAt(0) : 'P';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00CC66" />
        <Text style={styles.loadingText}>Loading Categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuIcon}>
          <Text style={styles.menuText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop by Category</Text>
        <View style={styles.headerIcons}>
         
          <TouchableOpacity 
            style={styles.cartButton}
            onPress={() => navigation.navigate('cart')}
          >
            <Text style={styles.cartIcon}>🛒</Text>
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

      <View style={styles.splitContainer}>
        {/* Left Sidebar (Main Categories) */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
       {mainCategories.map((category) => (
  <TouchableOpacity
    key={category._id}
    style={[
      styles.categoryItem,
      selectedCategory === category._id && styles.selectedCategoryItem
    ]}
    onPress={() => {
      setSelectedCategory(category._id);
      setSelectedSubcategory(null);
    }}
  >
    {/* Image Placeholder/Block for Sidebar */}
    <View style={[
      styles.imagePlaceholder, 
      selectedCategory === category._id && styles.selectedImagePlaceholder
    ]}>
      {/* 💡 UPDATED: Using category.bannerImage directly */}
      {category.bannerImage ? ( 
        <Image 
          source={{ uri: category.bannerImage }} // Use the bannerImage URL
          style={styles.sidebarImage} // Style to make the image fill the container
          resizeMode="cover" // Use 'cover' to fill the space without distortion
        />
      ) : (
        // Fallback: If no image URL is available, show styled text placeholder
        <Text style={[
            styles.placeholderText,
            selectedCategory === category._id && styles.selectedPlaceholderText
        ]}>
          {category.name.charAt(0)}
        </Text>
      )}
    </View>
    {/* End Image Placeholder */}
    
    <Text style={[
      styles.categoryName,
      selectedCategory === category._id && styles.selectedCategoryName
    ]}>
      {category.name}
    </Text>
  </TouchableOpacity>
))}
          </ScrollView>
        </View>

        {/* Right Content */}
        <View style={styles.rightContent}>
          <View style={styles.currentCategoryBanner}>
            <View style={styles.categoryBannerLeft}>
              {selectedSubcategory && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setSelectedSubcategory(null)}
                >
                  <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.currentCategoryText}>
                {selectedSubcategory 
                  ? currentSubcategories.find(sub => sub._id === selectedSubcategory)?.name || 'Products'
                  : selectedCategoryData?.name || 'Select Category'
                }
              </Text>
            </View>
            <Text style={styles.productCount}>
              {productsLoading ? '...' : products.length} items
            </Text>
          </View>

          {productsLoading ? (
            <View style={styles.loadingProducts}>
              <ActivityIndicator size="small" color="#00CC66" />
              <Text style={styles.loadingProductsText}>Loading products...</Text>
            </View>
          ) : showSubcategories ? (
            // Subcategory Grid View
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.subcategoriesScrollContent}
            >
              <View style={styles.subcategoriesGrid}>
                {currentSubcategories.map((subcategory) => (
                  <TouchableOpacity 
                    key={subcategory._id}
                    style={styles.subcategoryCard}
                    onPress={() => setSelectedSubcategory(subcategory._id)}
                  >
                    {/* Subcategory Banner Image */}
                    {subcategory.bannerImage ? (
                      <Image 
                        source={{ uri: `${subcategory.bannerImage}` }} 
                        style={styles.subcategoryImage} 
                      />
                    ) : (
                      <View style={[styles.subcategoryImage, styles.subcategoryPlaceholder]}>
                        <Text style={styles.placeholderIcon}>
                            {getPlaceholderIcon(subcategory)}
                        </Text>
                      </View>
                    )}
                    <View style={styles.subcategoryOverlay}>
                      <Text style={styles.subcategoryName}>{subcategory.name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            // Products List View
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {products.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateIcon}>📦</Text>
                  <Text style={styles.emptyStateTitle}>No Products Found</Text>
                  <Text style={styles.emptyStateText}>
                    {selectedSubcategory 
                      ? 'No products available in this subcategory' 
                      : 'No products available in this category'
                    }
                  </Text>
                </View>
              ) : (
                products.map((product) => {
                  const cartQuantity = getCartQuantity(product._id);
                  const isProductInCart = isInCart(product._id);
                  
                  return (
                    <View key={product._id} style={styles.productCard}>
                      <View style={styles.productHeader}>
                        <Image 
                          source={{ uri: product.images?.[0] || product.image }} 
                          style={styles.productImage}
                        />
                        <View style={styles.productContent}>
                          <Text style={styles.productTitle}>{product.title}</Text>
                          {product.subtitle && (
                            <Text style={styles.productSubtitle}>{product.subtitle}</Text>
                          )}
                          <View style={styles.priceContainer}>
                            <Text style={styles.price}>₹{product.price}</Text>
                            {product.mrp && product.mrp > product.price && (
                              <>
                                <Text style={styles.mrp}>₹{product.mrp}</Text>
                                {product.discount > 0 && (
                                  <View style={styles.discountBadge}>
                                    <Text style={styles.discountText}>{product.discount}% OFF</Text>
                                  </View>
                                )}
                              </>
                            )}
                          </View>
                          <View style={styles.deliveryInfo}>
                            <Text style={styles.deliveryText}>{product.deliveryTime || 'Today'}</Text>
                            {product.isTopSelling && (
                              <View style={styles.badge}>
                                <Text style={styles.badgeText}>🔥 Top</Text>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>
                      
                      <View style={styles.productFooter}>
                        <View style={styles.stockInfo}>
                          <Text style={[
                            styles.stockText,
                            { color: product.inStock ? '#00CC66' : '#EF4444' }
                          ]}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </Text>
                          {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                            <Text style={styles.lowStockText}>Only {product.stockQuantity} left</Text>
                          )}
                        </View>
                        
                        {isProductInCart ? (
                          <View style={styles.cartActions}>
                            <TouchableOpacity 
                              style={styles.quantityButton}
                              onPress={() => navigation.navigate('Cart')}
                            >
                              <Text style={styles.quantityButtonText}>View in Cart ({cartQuantity})</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.quickAddButton}
                              onPress={() => handleQuickAdd(product)}
                              disabled={addingToCart[product._id] || !product.inStock}
                            >
                              {addingToCart[product._id] ? (
                                <ActivityIndicator size="small" color="#00CC66" />
                              ) : (
                                <Text style={styles.quickAddText}>+</Text>
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
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    backgroundColor: '#FFFFFF',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 24,
    color: '#1F2937',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0,
    flex: 1,
    marginLeft: 8,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  cartButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartIcon: {
    fontSize: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444', // Red
    borderRadius: 10,
    paddingHorizontal: 4,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 110,
    backgroundColor: '#F5F5F5',
    paddingTop: 8,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  selectedCategoryItem: {
    backgroundColor: '#FFFFFF',
  },
  // NEW STYLE: Image Placeholder / Block for Sidebar
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#E5E7EB', // Default gray background
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  selectedImagePlaceholder: {
    backgroundColor: '#00CC66', // Highlight color when selected
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text for highlight color
  },
  categoryName: {
    fontSize: 9,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 11,
    maxWidth: 100,
    paddingHorizontal: 2,
    letterSpacing: 0.1,
  },
  selectedCategoryName: {
    color: '#1F2937',
    fontWeight: '600',
  },
  rightContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  currentCategoryBanner: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 20,
  },
  backText: {
    fontSize: 16,
    color: '#FF9933',
  },
  currentCategoryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 0,
  },
  productCount: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingProducts: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingProductsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  subcategoriesScrollContent: {
    padding: 16,
  },
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subcategoryCard: {
    width: (width - 110 - 48) / 2, // 110 (sidebar) + 16*2 (padding) + 16 (gap) = 158. 
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  subcategoryImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  subcategoryPlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 40,
    color: '#9CA3AF',
  },
  subcategoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  subcategoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  productHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  productContent: {
    flex: 1,
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 19,
    letterSpacing: 0.1,
  },
  productSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
    letterSpacing: 0,
  },
  mrp: {
    fontSize: 13,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '400',
    letterSpacing: 0,
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#00CC66',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 12,
    color: '#6B7280',
    marginRight: 8,
  },
  badge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    color: '#FF9933',
    fontWeight: '600',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  stockInfo: {
    flex: 1,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  lowStockText: {
    fontSize: 10,
    color: '#EF4444',
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#00CC66',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cartActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    backgroundColor: '#F3F4F6', // Lighter background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  quantityButtonText: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '600',
  },
  quickAddButton: {
    backgroundColor: '#E5E7EB',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddText: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: '600',
    color: '#00CC66',
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden', // IMPORTANT: Clips the image to the border radius
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  selectedImagePlaceholder: {
    // Keep this for visual feedback on selection if needed, or remove border/color if image is the focus
    borderColor: '#00CC66', 
    borderWidth: 2,
  },
  sidebarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#E5E7EB', // Default background
    overflow: 'hidden', // Crucial for image clipping
    borderWidth: 1, // Example styling
    borderColor: '#D1D5DB', // Example styling
  },
  selectedImagePlaceholder: {
    backgroundColor: '#00CC66', // Example highlight color
    borderColor: '#00CC66',
  },
  sidebarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12, // Inherits from container, but good to keep
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B7280', // Text color for non-selected placeholder
  },
  selectedPlaceholderText: {
    color: '#FFFFFF', // Text color when selected
  },

});