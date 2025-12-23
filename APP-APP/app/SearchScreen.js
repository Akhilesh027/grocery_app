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
  Alert,
  Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SearchScreen = () => {
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSubcategories, setShowSubcategories] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});

  // Fetch products AND categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsRes = await axios.get('https://api.sampurnamart.cloud/api/products');
        const productsData = productsRes.data.products || productsRes.data || [];
        setProducts(productsData);
        
        // Fetch categories from backend API
        const categoriesRes = await axios.get('https://api.sampurnamart.cloud/api/categories');
        const categoriesData = categoriesRes.data.categories || categoriesRes.data || [];
        
        // Transform backend categories data based on your structure
        const transformedCategories = transformBackendCategories(categoriesData);
        setCategories(transformedCategories);
        
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError('Failed to load data');
        Alert.alert('Error', 'Failed to load products or categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Transform backend categories structure based on your data
  const transformBackendCategories = (backendCategories) => {
    if (!backendCategories || backendCategories.length === 0) {
      return [{ 
        id: 'all', 
        name: 'All', 
        image: 'https://cdn-icons-png.flaticon.com/512/833/833268.png',
        type: 'main',
        subcategories: [] 
      }];
    }

    // Group main categories and their subcategories
    const mainCategories = [];
    const subcategoriesByParent = {};
    
    // First pass: separate main and sub categories
    backendCategories.forEach(cat => {
      if (cat.type === 'main' && !cat.parentCategory) {
        // This is a main category
        const category = {
          id: cat._id,
          name: cat.name,
          image: cat.bannerImage || cat.icon || getDefaultCategoryImage(cat.name),
          type: 'main',
          subcategories: []
        };
        mainCategories.push(category);
      } else if (cat.type === 'sub' && cat.parentCategory) {
        // This is a subcategory
        if (!subcategoriesByParent[cat.parentCategory]) {
          subcategoriesByParent[cat.parentCategory] = [];
        }
        subcategoriesByParent[cat.parentCategory].push({
          id: cat._id,
          name: cat.name,
          image: cat.bannerImage || cat.icon,
          parentCategory: cat.parentCategory
        });
      }
    });

    // Second pass: attach subcategories to their parent categories
    const transformedCategories = mainCategories.map(mainCat => {
      if (subcategoriesByParent[mainCat.name]) {
        mainCat.subcategories = subcategoriesByParent[mainCat.name];
      }
      return mainCat;
    });

    // Add "All" category at the beginning
    return [{ 
      id: 'all', 
      name: 'All', 
      image: 'https://cdn-icons-png.flaticon.com/512/833/833268.png',
      type: 'main',
      subcategories: [] 
    }, ...transformedCategories];
  };

  // Helper function to get default category image
  const getDefaultCategoryImage = (categoryName) => {
    if (!categoryName) return 'https://cdn-icons-png.flaticon.com/512/3737/3737720.png';
    
    const categoryNameLower = categoryName.toLowerCase();
    
    // Default fallback images
    const imageMap = {
      'dairy': 'https://cdn-icons-png.flaticon.com/512/2875/2875386.png',
      'fruit': 'https://cdn-icons-png.flaticon.com/512/1625/1625096.png',
      'fruits': 'https://cdn-icons-png.flaticon.com/512/1625/1625096.png',
      'vegetable': 'https://cdn-icons-png.flaticon.com/512/2153/2153951.png',
      'vegetables': 'https://cdn-icons-png.flaticon.com/512/2153/2153951.png',
      'grocery': 'https://cdn-icons-png.flaticon.com/512/3082/3082009.png',
    };
    
    for (const [key, image] of Object.entries(imageMap)) {
      if (categoryNameLower.includes(key)) {
        return image;
      }
    }
    
    return 'https://cdn-icons-png.flaticon.com/512/3737/3737720.png';
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
        Alert.alert(
          "Login Required",
          "Please log in to add items to your cart.",
          [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }]
        );
        return;
      }

      const payload = {
        userId,
        productId: product._id,
        title: product.title,
        price: product.price,
        image: product.images?.[0] || product.image,
        quantity: 1,
      };

      const response = await axios.post("https://api.sampurnamart.cloud/api/cart", payload);

      if (response.data.success) {
        Alert.alert("Added!", `${product.title} has been added to your cart.`);
      } else {
        Alert.alert("Error", response.data.message || "Failed to add to cart.");
      }

    } catch (error) {
      console.log("Add to Cart Error:", error?.message);
      Alert.alert("Error", "Something went wrong while adding to cart.");
    } finally {
      setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setShowSubcategories(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedSubcategory(null);
  };

  // Filter products based on search query, category, and subcategory
  const filteredProducts = useMemo(() => {
    if (loading) return [];
    
    let filtered = [...products];
    
    // Filter by main category
    if (selectedCategory !== 'All') {
      const selectedCategoryObj = categories.find(cat => cat.name === selectedCategory);
      if (selectedCategoryObj) {
        // Filter products based on category
        filtered = filtered.filter(product => {
          const productCategory = product.category?.mainCategory?.toLowerCase() || '';
          const categoryNameLower = selectedCategory.toLowerCase();
          return productCategory.includes(categoryNameLower);
        });
      }
    }
    
    // Filter by subcategory
    if (selectedSubcategory) {
      filtered = filtered.filter(product => {
        const productSubcategory = product.category?.subCategory?.toLowerCase() || '';
        const subcategoryLower = selectedSubcategory.toLowerCase();
        return productSubcategory.includes(subcategoryLower);
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
        const productSubcategory = product.category?.subCategory?.toLowerCase() || '';
        
        return (
          productTitle.includes(query) ||
          productSubtitle.includes(query) ||
          productBrand.includes(query) ||
          productCategory.includes(query) ||
          productSubcategory.includes(query)
        );
      });
    }
    
    return filtered;
  }, [products, searchQuery, selectedCategory, selectedSubcategory, loading, categories]);

  // Open subcategories modal
  const openSubcategoriesModal = (category) => {
    setCurrentCategory(category);
    setShowSubcategories(true);
  };

  // Render product item
  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => {
        // Navigate to product detail screen if needed
        // navigation.navigate('ProductDetail', { productId: item._id });
      }}
    >
      <View style={styles.productImageContainer}>
       {item.images && item.images.length > 0 ? (
  <Image 
    source={{ uri: item.images[0] }}   // ✅ CORRECT
    style={styles.productImage}
    resizeMode="cover"
  />
) : (
  <View style={styles.productImagePlaceholder}>
    <Text style={styles.productImagePlaceholderText}>
      {item.title?.charAt(0) || 'P'}
    </Text>
  </View>
)}

        
        {/* Discount Badge */}
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>{item.discount}% OFF</Text>
          </View>
        )}
      </View>
      
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
        
        {/* Category and Subcategory */}
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryText}>
            {item.category?.mainCategory || 'Category'}
          </Text>
          {item.category?.subCategory && (
            <Text style={styles.subcategoryText}>
              • {item.category.subCategory}
            </Text>
          )}
        </View>
        
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
        
        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            !item.inStock && styles.addToCartButtonDisabled
          ]}
          onPress={() => handleAddToCart(item)}
          disabled={!item.inStock || addingToCart[item._id]}
        >
          {addingToCart[item._id] ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.addToCartButtonText}>
              {item.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Render category item with image
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.categoryItem,
        selectedCategory === item.name && styles.categoryItemSelected
      ]}
      onPress={() => {
        setSelectedCategory(item.name);
        setSelectedSubcategory(null);
        if (item.subcategories && item.subcategories.length > 0 && item.name !== 'All') {
          openSubcategoriesModal(item);
        }
      }}
    >
      <View style={styles.categoryImageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.categoryImage}
          resizeMode="cover"
        />
        {selectedCategory === item.name && (
          <View style={styles.categorySelectedOverlay} />
        )}
      </View>
      <Text style={[
        styles.categoryName,
        selectedCategory === item.name && styles.categoryNameSelected
      ]}>
        {item.name}
      </Text>
      {item.subcategories && item.subcategories.length > 0 && item.name !== 'All' && (
        <View style={styles.subcategoryIndicator}>
          <Text style={styles.subcategoryIndicatorText}>▼</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render subcategory modal with images
  const renderSubcategoriesModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showSubcategories}
      onRequestClose={() => setShowSubcategories(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {currentCategory?.name} Subcategories
            </Text>
            <TouchableOpacity 
              onPress={() => setShowSubcategories(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.subcategoriesScrollView}>
            <TouchableOpacity
              style={[
                styles.subcategoryItem,
                !selectedSubcategory && styles.subcategoryItemSelected
              ]}
              onPress={() => {
                setSelectedSubcategory(null);
                setShowSubcategories(false);
              }}
            >
              <View style={styles.subcategoryImageContainer}>
                <Image 
                  source={{ uri: currentCategory?.image }} 
                  style={styles.subcategoryImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.subcategoryItemText}>All {currentCategory?.name}</Text>
            </TouchableOpacity>
            
            {currentCategory?.subcategories?.map((subcategory) => (
              <TouchableOpacity
                key={subcategory.id}
                style={[
                  styles.subcategoryItem,
                  selectedSubcategory === subcategory.name && styles.subcategoryItemSelected
                ]}
                onPress={() => handleSubcategorySelect(subcategory.name)}
              >
                <View style={styles.subcategoryImageContainer}>
                  <Image 
                    source={{ uri: subcategory.image || currentCategory?.image }} 
                    style={styles.subcategoryImage}
                    resizeMode="cover"
                  />
                </View>
                <Text style={styles.subcategoryItemText}>{subcategory.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
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
          <Text style={styles.loadingText}>Loading products and categories...</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            {(selectedCategory !== 'All' || selectedSubcategory || searchQuery) && (
              <TouchableOpacity onPress={clearFilters} style={styles.clearAllButton}>
                <Text style={styles.clearAllButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
          
          {/* Selected filters display */}
          {(selectedCategory !== 'All' || selectedSubcategory) && (
            <View style={styles.activeFiltersContainer}>
              <Text style={styles.activeFiltersLabel}>Active Filters:</Text>
              <View style={styles.activeFiltersChips}>
                {selectedCategory !== 'All' && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>{selectedCategory}</Text>
                    <TouchableOpacity 
                      onPress={() => setSelectedCategory('All')}
                      style={styles.filterChipClose}
                    >
                      <Text style={styles.filterChipCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {selectedSubcategory && (
                  <View style={styles.filterChip}>
                    <Text style={styles.filterChipText}>{selectedSubcategory}</Text>
                    <TouchableOpacity 
                      onPress={() => setSelectedSubcategory(null)}
                      style={styles.filterChipClose}
                    >
                      <Text style={styles.filterChipCloseText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Search Results */}
        <View style={styles.section}>
          <View style={styles.resultsHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery 
                ? `Search Results for "${searchQuery}"`
                : selectedCategory === 'All' 
                  ? 'All Products' 
                  : selectedSubcategory
                    ? `${selectedCategory} - ${selectedSubcategory}`
                    : selectedCategory
              }
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
                No products found
              </Text>
              <Text style={styles.noResultsSubText}>
                {searchQuery 
                  ? 'Try different keywords or check the spelling'
                  : 'Try clearing filters or selecting a different category'
                }
              </Text>
              {(searchQuery || selectedCategory !== 'All' || selectedSubcategory) && (
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearFiltersText}>Clear All Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Subcategories Modal */}
      {renderSubcategoriesModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '#1E293B',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 18,
    color: '#94A3B8',
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#1E293B',
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#94A3B8',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  clearAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
  },
  clearAllButtonText: {
    fontSize: 14,
    color: '#64748B',
  },
  categoriesList: {
    paddingVertical: 8,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minWidth: 90,
    maxWidth: 90,
  },
  categoryItemSelected: {
    borderColor: '#FF9933',
  },
  categoryImageContainer: {
    position: 'relative',
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 6,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categorySelectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 153, 51, 0.2)',
    borderWidth: 2,
    borderColor: '#FF9933',
    borderRadius: 25,
  },
  categoryName: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryNameSelected: {
    color: '#FF9933',
    fontWeight: '600',
  },
  subcategoryIndicator: {
    marginTop: 4,
  },
  subcategoryIndicatorText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  activeFiltersContainer: {
    marginTop: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  activeFiltersLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  activeFiltersChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  filterChipText: {
    fontSize: 14,
    color: '#1E293B',
    marginRight: 4,
  },
  filterChipClose: {
    padding: 2,
  },
  filterChipCloseText: {
    fontSize: 12,
    color: '#64748B',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#64748B',
  },
  productsList: {
    paddingBottom: 20,
  },
  productsRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  productImageContainer: {
    position: 'relative',
    height: 140,
    backgroundColor: '#F8FAFC',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  productImagePlaceholderText: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  productSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    color: '#FF9933',
    fontWeight: '500',
  },
  subcategoryText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginRight: 8,
  },
  productMrp: {
    fontSize: 14,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  deliveryTime: {
    fontSize: 12,
    color: '#22C55E',
    marginBottom: 4,
  },
  outOfStock: {
    fontSize: 12,
    color: '#DC2626',
    marginBottom: 4,
  },
  ratingContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  rating: {
    fontSize: 12,
    color: '#92400E',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  topSellingBadge: {
    fontSize: 10,
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  todaysDealBadge: {
    fontSize: 10,
    color: '#059669',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    marginBottom: 2,
  },
  hotDealBadge: {
    fontSize: 10,
    color: '#EA580C',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  addToCartButton: {
    backgroundColor: '#FF9933',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  addToCartButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748B',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF9933',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearFiltersButton: {
    backgroundColor: '#FF9933',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#64748B',
  },
  subcategoriesScrollView: {
    maxHeight: 400,
  },
  subcategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subcategoryItemSelected: {
    backgroundColor: '#FFF7ED',
  },
  subcategoryImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  subcategoryImage: {
    width: '100%',
    height: '100%',
  },
  subcategoryItemText: {
    fontSize: 16,
    color: '#1E293B',
  },
});

export default SearchScreen;