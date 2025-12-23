import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const API_BASE_URL = 'https://api.sampurnamart.cloud/api';

export default function OffersScreen() {
  const navigation = useNavigation();
  const [selectedOfferType, setSelectedOfferType] = useState('all-offers');
  const [selectedSubOffer, setSelectedSubOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState({});
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [userPoints, setUserPoints] = useState(245);
  const [addingToCart, setAddingToCart] = useState({});

  // Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchOffers(),
        fetchProducts(),
        fetchUserPoints()
      ]);
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to load offers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/offers/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
      
      // Fetch subcategories for each category
      data.forEach(category => {
        fetchSubCategories(category._id);
      });
    } catch (error) {
      console.error('Categories error:', error);
    }
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/offers/subcategories/${categoryId}`);
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data = await response.json();
      
      setSubCategories(prev => ({
        ...prev,
        [categoryId]: data
      }));
    } catch (error) {
      console.error('Subcategories error:', error);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/offers?active=true`);
      if (!response.ok) throw new Error('Failed to fetch offers');
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Offers error:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products?page=1&limit=50`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Products error:', error);
    }
  };

  const fetchUserPoints = async () => {
    setUserPoints(245); // Static for demo
  };

  const applyOffer = async (offerCode) => {
    try {
      Alert.alert('Success', `Offer ${offerCode} applied successfully!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to apply offer');
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
        image: product.images[0],
        quantity: 1,
      });

      console.log("Cart Response:", response.data);

      if (response.status === 200 && response.data.success) {
        Alert.alert("Added!", `${product.title} has been added to your cart.`);
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

  // Buy Now function - navigates to checkout with product
  const handleBuyNow = async (product) => {
    if (!product.inStock) {
      return Alert.alert("Out of Stock", "This product is not available currently.");
    }

    try {
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        return Alert.alert("Login Required", "Please log in to proceed with purchase.");
      }

      // First add to cart
      const response = await axios.post(`${API_BASE_URL}/cart`, {
        userId,
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images[0],
        quantity: 1,
      });

      if (response.status === 200 && response.data.success) {
        // Navigate to checkout with the product
        navigation.navigate('Checkout', { 
          cartItems: [{
            _id: product._id,
            productId: product._id,
            title: product.title,
            price: product.price,
            image: product.images[0],
            quantity: 1,
            product: product
          }],
          fromBuyNow: true
        });
      } else {
        Alert.alert("Error", response.data.message || "Failed to add to cart.");
      }
    } catch (error) {
      console.error("Buy Now Error:", error.response?.data || error.message);
      Alert.alert("Error", "Something went wrong while processing your order.");
    }
  };

  // Quick Add function - adds to cart without alert
  const handleQuickAdd = async (product) => {
    if (!product.inStock) return;

    try {
      setAddingToCart(prev => ({ ...prev, [product._id]: true }));

      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        Alert.alert("Login Required", "Please log in to add items to your cart.");
        return;
      }

      const response = await axios.post(`${API_BASE_URL}/cart`, {
        userId,
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images[0],
        quantity: 1,
      });

      if (response.status === 200 && response.data.success) {
        // Optional: Show a small toast instead of alert
        console.log("Product added to cart:", product.title);
      }
    } catch (error) {
      console.error("Quick Add Error:", error.response?.data || error.message);
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Transform categories for the sidebar
  const offerTypes = [
    {
      id: 'all-offers',
      name: 'All\nOffers',
      icon: '🎁',
      color: '#EF4444'
    },
    ...categories.map(cat => ({
      id: cat._id,
      name: cat.name.includes('\n') ? cat.name : `${cat.name}\nOffers`,
      icon: cat.icon || '🎁',
      color: cat.color || '#EF4444'
    }))
  ];

  // Get current suboffers based on selection
  const currentSubOffers = selectedOfferType === 'all-offers' 
    ? [] 
    : (subCategories[selectedOfferType] || []);

  const showSubOffers = currentSubOffers.length > 0 && !selectedSubOffer;

  // Filter offers based on selection
  const filteredOffers = offers.filter(offer => {
    if (selectedSubOffer) {
      return offer.subcategory?._id === selectedSubOffer;
    }
    if (selectedOfferType === 'all-offers') {
      return true;
    }
    return offer.category?._id === selectedOfferType;
  });

  // Filter products based on offer categories and subcategories
  const filteredProducts = products.filter(product => {
    const productOfferCategory = product.category?.offerCategory;
    const productOfferSubCategory = product.category?.offerSubCategory;

    if (selectedSubOffer) {
      // Show products with specific subcategory
      return productOfferSubCategory?._id === selectedSubOffer;
    }
    if (selectedOfferType === 'all-offers') {
      // Show all products that have any offer category
      return productOfferCategory !== null && productOfferCategory !== undefined;
    }
    // Show products with specific category
    return productOfferCategory?._id === selectedOfferType;
  });

  // Get display name for current selection
  const getCurrentOfferText = () => {
    if (selectedSubOffer) {
      const subOffer = currentSubOffers.find(sub => sub._id === selectedSubOffer);
      return subOffer?.name || 'Offers';
    }
    
    if (selectedOfferType === 'all-offers') {
      return '🎁 All Offers';
    }
    
    const category = categories.find(cat => cat._id === selectedOfferType);
    return `${category?.icon || '🎁'} ${category?.name || 'Offers'}`;
  };

  // Get item count for display
  const getItemCount = () => {
    if (selectedSubOffer) {
      return filteredProducts.length + filteredOffers.length;
    }
    if (showSubOffers) {
      return currentSubOffers.length;
    }
    return filteredProducts.length + filteredOffers.length;
  };

  // Render product card
  const renderProductCard = (product) => (
    <View key={`product-${product._id}`} style={styles.productCard}>
      <View style={styles.productHeader}>
        <Image 
          source={{ uri: product.images[0] }} 
          style={styles.productImage}
          defaultSource={{ uri: 'https://via.placeholder.com/400x300?text=Loading' }}
        />
        <View style={styles.productContent}>
          <Text style={styles.productTitle}>{product.title}</Text>
          <Text style={styles.productSubtitle}>{product.subtitle}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{product.price}</Text>
            <Text style={styles.originalPrice}>₹{product.mrp}</Text>
            <Text style={styles.discountPercent}>{product.discount}% OFF</Text>
          </View>
          <View style={styles.productMeta}>
            <Text style={styles.productCategory}>
              {product.category?.mainCategory} • {product.category?.subCategory}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.productFooter}>
        <View style={styles.stockContainer}>
          <Text style={[
            styles.stockText,
            { color: product.inStock ? '#10B981' : '#EF4444' }
          ]}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
          {product.inStock && (
            <Text style={styles.stockQuantity}>{product.stockQuantity} left</Text>
          )}
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.quickAddButton,
              !product.inStock && styles.buttonDisabled
            ]}
            disabled={!product.inStock || addingToCart[product._id]}
            onPress={() => handleQuickAdd(product)}
          >
            {addingToCart[product._id] ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.quickAddButtonText}>+</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.buyButton,
              !product.inStock && styles.buyButtonDisabled
            ]}
            disabled={!product.inStock}
            onPress={() => handleBuyNow(product)}
          >
            <Text style={styles.buyButtonText}>
              {product.inStock ? 'Buy Now' : 'Out of Stock'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Product details */}
      <View style={styles.productDetails}>
        {product.brand && (
          <Text style={styles.detailText}>Brand: {product.brand}</Text>
        )}
        {product.deliveryTime && (
          <Text style={styles.detailText}>Delivery: {product.deliveryTime} days</Text>
        )}
        {product.isFreeShipping && (
          <Text style={styles.freeShippingText}>🚚 Free Shipping</Text>
        )}
      </View>

      {/* Add to Cart Button */}
      <TouchableOpacity 
        style={[
          styles.addToCartButton,
          !product.inStock && styles.addToCartButtonDisabled
        ]}
        disabled={!product.inStock || addingToCart[product._id]}
        onPress={() => handleAddToCart(product)}
      >
        {addingToCart[product._id] ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.addToCartButtonText}>
            {product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Render offer card
  const renderOfferCard = (offer) => (
    <View key={`offer-${offer._id}`} style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <Image 
          source={{ uri: offer.image }} 
          style={styles.offerImage}
          defaultSource={{ uri: 'https://via.placeholder.com/400x300?text=Loading' }}
        />
        <View style={styles.offerContent}>
          <Text style={styles.offerTitle}>{offer.title}</Text>
          <Text style={styles.offerDescription}>{offer.description}</Text>
          <View style={styles.offerMeta}>
            <Text style={styles.offerCategory}>
              {offer.category?.name} • {offer.subcategory?.name}
            </Text>
          </View>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{offer.discount}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.offerFooter}>
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Code:</Text>
          <Text style={styles.codeText}>{offer.code}</Text>
        </View>
        <TouchableOpacity 
          style={styles.applyButton}
          onPress={() => applyOffer(offer.code)}
        >
          <Text style={styles.applyButtonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Offer validity and limits */}
      <View style={styles.offerDetails}>
        <Text style={styles.validityText}>
          Valid until: {new Date(offer.endDate).toLocaleDateString()}
        </Text>
        {offer.minOrderValue > 0 && (
          <Text style={styles.minOrderText}>
            Min. order: ₹{offer.minOrderValue}
          </Text>
        )}
        <Text style={styles.usageText}>
          Used: {offer.usedCount}/{offer.usageLimit} times
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading offers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Offers & Deals</Text>
        <View style={styles.earnedPoints}>
          <Text style={styles.pointsText}>⭐ {userPoints} pts</Text>
        </View>
      </View>

      <View style={styles.splitContainer}>
        {/* Left Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {offerTypes.map((offerType) => (
              <TouchableOpacity
                key={offerType.id}
                style={[
                  styles.offerTypeItem,
                  selectedOfferType === offerType.id && styles.selectedOfferTypeItem
                ]}
                onPress={() => {
                  setSelectedOfferType(offerType.id);
                  setSelectedSubOffer(null);
                }}
              >
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: selectedOfferType === offerType.id ? offerType.color : '#F3F4F6' }
                ]}>
                  <Text style={styles.offerTypeIcon}>{offerType.icon}</Text>
                </View>
                <Text style={[
                  styles.offerTypeName,
                  selectedOfferType === offerType.id && styles.selectedOfferTypeName
                ]}>
                  {offerType.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Right Content */}
        <View style={styles.rightContent}>
          <View style={styles.currentOfferBanner}>
            <View style={styles.offerBannerLeft}>
              {selectedSubOffer && (
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => setSelectedSubOffer(null)}
                >
                  <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.currentOfferText}>
                {getCurrentOfferText()}
              </Text>
            </View>
            <Text style={styles.offerCount}>
              {getItemCount()} items
            </Text>
          </View>

          {showSubOffers ? (
            <FlatList
              data={currentSubOffers}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.subOfferCard}
                  onPress={() => setSelectedSubOffer(item._id)}
                >
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.subOfferImage}
                    defaultSource={{ uri: 'https://via.placeholder.com/300x200?text=Loading' }}
                  />
                  <Text style={styles.subOfferName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.offersGrid}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No subcategories found</Text>
                </View>
              }
            />
          ) : (
            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              {/* Show offers first */}
              {filteredOffers.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Special Offers</Text>
                  {filteredOffers.map(renderOfferCard)}
                </View>
              )}

              {/* Show products with offers */}
              {filteredProducts.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>
                    Products with Offers ({filteredProducts.length})
                  </Text>
                  {filteredProducts.map(renderProductCard)}
                </View>
              )}

              {/* Empty state */}
              {filteredOffers.length === 0 && filteredProducts.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No offers or products found</Text>
                  <Text style={styles.emptySubText}>Check back later for new deals!</Text>
                </View>
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
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    flex: 1,
  },
  earnedPoints: {
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF8C00',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 120,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    paddingTop: 8,
  },
  offerTypeItem: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  selectedOfferTypeItem: {
    backgroundColor: '#FFF0F0',
    borderRightWidth: 3,
    borderRightColor: '#EF4444',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F8F9FA',
  },
  offerTypeIcon: {
    fontSize: 22,
  },
  offerTypeName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 14,
  },
  selectedOfferTypeName: {
    color: '#EF4444',
    fontWeight: '600',
  },
  rightContent: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  currentOfferBanner: {
    backgroundColor: '#FFE8E8',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D0D0D0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
  },
  backText: {
    fontSize: 16,
    color: '#DC2626',
  },
  currentOfferText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    letterSpacing: 0.2,
  },
  offerCount: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offersGrid: {
    padding: 12,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  subOfferCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  subOfferImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  subOfferName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    paddingLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  // Product Card Styles
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginRight: 12,
  },
  productContent: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productMeta: {
    marginBottom: 8,
  },
  productCategory: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  stockContainer: {
    flexDirection: 'column',
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  stockQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickAddButton: {
    backgroundColor: '#3B82F6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buyButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  buyButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  productDetails: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  freeShippingText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  addToCartButton: {
    backgroundColor: '#EF4444',
    margin: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  addToCartButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Offer Card Styles
  offerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  offerHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  offerImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 8,
    lineHeight: 18,
  },
  offerMeta: {
    marginBottom: 8,
  },
  offerCategory: {
    fontSize: 11,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  discountBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  applyButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  offerDetails: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  validityText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  minOrderText: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  usageText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
});