import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, 
  ActivityIndicator, Modal, Dimensions, Image
} from 'react-native';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import { HeaderBackground } from '../components/HeaderBackground';
import PromoCarousel from '../components/PromoCarousel';
import CategoryGrid from '../components/CategoryGrid';
import ProductGrid from '../components/ProductGrid';
import BannerAd from '../components/BannerAd';
import SupportSection from '../components/SupportSection';
import AdvertisementBanner from '../components/AdvertisementBanner';
import { useNavigation } from "@react-navigation/native";
import { useCategoryNavigation } from '../context/CategoryNavigationContext';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'https://api.sampurnamart.cloud/api';
const CARD_WIDTH = (width - 60) / 3; 

export default function HomeScreen() {
  const navigation = useNavigation();
  const { navigateToCategory } = useCategoryNavigation();
  
  const [loading, setLoading] = useState(true);
  const [allProducts, setAllProducts] = useState([]); 
  const [allCategories, setAllCategories] = useState([]); 
  const [firstCategorySection, setFirstCategorySection] = useState(null);
  const [secondCategorySection, setSecondCategorySection] = useState(null);
  const [error, setError] = useState('');
  
  // Deals & Filters
  const [allTopSelling, setAllTopSelling] = useState([]);
  const [allTodaysDeals, setAllTodaysDeals] = useState([]); 
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationIntervalRef = useRef(null);
  const currentVendorId = 'vendor1';
// ---------------- NOTIFICATION LOGIC ----------------

const fetchAllNotifications = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/notifications`);

    if (res.data.success) {
      const list = res.data.notifications || [];
      setNotifications(list);

      const unread = list.filter(n => !n.read).length;
      setUnreadCount(unread);
    }
  } catch (err) {
    console.log("Fetch notifications error:", err.message);
  }
};

const markAsRead = async (id) => {
  try {
    await axios.patch(`${API_BASE_URL}/notifications/${id}/read`);

    setNotifications(prev =>
      prev.map(n =>
        n._id === id ? { ...n, read: true } : n
      )
    );

    setUnreadCount(prev => Math.max(prev - 1, 0));
  } catch (err) {
    console.log("Mark read error:", err.message);
  }
};

const markAllAsRead = async () => {
  try {
    await axios.patch(`${API_BASE_URL}/notifications/mark-all-read`);

    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );

    setUnreadCount(0);
  } catch (err) {
    console.log("Mark all read error:", err.message);
  }
};

const handleShowNotifications = async () => {
  setShowNotifications(true);
};

const handleNotificationPress = async (notification) => {
  if (!notification.read) {
    await markAsRead(notification._id);
  }

  setShowNotifications(false);

  // Optional navigation
  if (notification.type === "order") {
    navigation.navigate("Orders");
  }
};
useEffect(() => {
  fetchHomeData();
  fetchAllNotifications();

  notificationIntervalRef.current = setInterval(fetchAllNotifications, 30000);

  return () => {
    if (notificationIntervalRef.current) {
      clearInterval(notificationIntervalRef.current);
    }
  };
}, []);

const NotificationListModal = () => (
  <Modal
    visible={showNotifications}
    transparent={true}
    animationType="slide"
  >
    <View style={styles.modalOverlay}>
      <View style={styles.notificationsContainer}>
        {/* Header */}
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>Notifications</Text>
          <View style={styles.headerActions}>
            {notifications.some(n => !n.read) && (
              <TouchableOpacity 
                onPress={markAllAsRead}
                style={styles.markAllButton}
              >
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={() => setShowNotifications(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <ScrollView style={styles.notificationList}>
          {notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyText}>We'll notify you when something arrives</Text>
            </View>
          ) : (
            notifications.map((notification) => (
              <TouchableOpacity
                key={notification._id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadNotification
                ]}
                onPress={() => handleNotificationPress(notification)}
              >
                <View style={styles.notificationIconContainer}>
                  <Text style={styles.notificationIcon}>
                    {notification.type === 'order' ? '🛒' :
                     notification.type === 'promotion' ? '🎉' :
                     notification.type === 'system' ? '⚙️' : '🔔'}
                  </Text>
                </View>
                
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitleText}>
                    {notification.title}
                  </Text>
                  <Text style={styles.notificationMessage}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatNotificationTime(notification.createdAt)}
                  </Text>
                </View>
                
                {!notification.read && (
                  <View style={styles.unreadDot} />
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// Add this helper function for time formatting
const formatNotificationTime = (timestamp) => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return notificationTime.toLocaleDateString();
};

  // ====================== CORE DATA FETCHING & STRUCTURING ======================

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      
      const productsRes = await axios.get(`${API_BASE_URL}/products`);
      const fetchedProducts = productsRes.data.products || productsRes.data || [];
      setAllProducts(fetchedProducts);

      // 2. Filter Global Deals
      setAllTopSelling(fetchedProducts.filter(p => p.isTopSelling));
      setAllTodaysDeals(fetchedProducts.filter(p => p.isTodaysDeal));
      
      // 3. Fetch All Categories
      const categoriesRes = await axios.get(`${API_BASE_URL}/categories`);
      const fetchedCategories = categoriesRes.data || [];
      setAllCategories(fetchedCategories);

      // Structure main categories and subcategories
      const mainCategories = fetchedCategories.filter(cat => cat.type === "main");
      const subCategories = fetchedCategories.filter(cat => cat.type === "sub");

      // Get first two main categories (you can also sort them by order, priority, etc.)
      const firstMainCategory = mainCategories[0];
      const secondMainCategory = mainCategories[1];

      // Helper function to structure a category section
      const structureCategorySection = (mainCategory) => {
        if (!mainCategory) return null;
        
        const categorySubCats = subCategories.filter(sub => 
          sub.parentCategory?.trim().toLowerCase() === mainCategory.name.trim().toLowerCase() ||
          sub.parentCategory?.trim().toLowerCase().includes(mainCategory.name.trim().toLowerCase())
        );

        const categoryProducts = fetchedProducts.filter(p => 
          p.category?.mainCategory?.trim().toLowerCase() === mainCategory.name.trim().toLowerCase() ||
          p.category?.mainCategory?.trim().toLowerCase().includes(mainCategory.name.trim().toLowerCase())
        );

        return {
          mainCategory: mainCategory,
          subcategories: categorySubCats,
          topSelling: categoryProducts.filter(p => p.isTopSelling),
          todaysDeals: categoryProducts.filter(p => p.isTodaysDeal)
        };
      };

      // Structure first category section
      if (firstMainCategory) {
        setFirstCategorySection(structureCategorySection(firstMainCategory));
      }

      // Structure second category section
      if (secondMainCategory) {
        setSecondCategorySection(structureCategorySection(secondMainCategory));
      }
      
    } catch (err) {
      console.log("Home Data Fetch Error:", err);
      setError("Failed to load home data. Check server status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeData();
    fetchAllNotifications();

    notificationIntervalRef.current = setInterval(fetchAllNotifications, 30000);

    return () => {
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, []);

  // --- RENDERING HELPER COMPONENTS ---

  const renderSubcategoryGrid = (subcategories, mainCategoryName) => {
    const itemsToRender = subcategories.slice(0, 6); 

    const handleSubcategoryPress = (subCat) => {
      navigation.navigate('SingleCategory', {
        categoryId: subCat._id,
        categoryName: subCat.name
      });
    };
    
    return (
      <View style={styles.subcategoryGridContainer}>
        {itemsToRender.map((subCat, index) => (
          <TouchableOpacity
            key={subCat._id}
            style={styles.subCatCard}
            onPress={() => handleSubcategoryPress(subCat)}
          >
            {/* Square Image Container */}
            <View style={styles.subCatImageSquareContainer}>
              {subCat.bannerImage ? (
                <Image
                  source={{ uri: subCat.bannerImage }}
                  style={styles.subCatImageSquare}
                  resizeMode="cover"
                />
              ) : (
                /* Fallback for no image */
                <Text style={styles.subCatIconFallback}>
                  {subCat.icon || subCat.name.charAt(0)}
                </Text>
              )}
            </View>
            {/* Category Name */}
            <Text style={styles.subCatName} numberOfLines={1}>
              {subCat.name}
            </Text>
          </TouchableOpacity>
        ))}
        {/* Fill empty spots in the 3-column layout */}
        {itemsToRender.length % 3 !== 0 && 
          [...Array(3 - (itemsToRender.length % 3))].map((_, i) => (
            <View key={`filler-${i}`} style={styles.subCatCardFiller} />
          ))
        }
      </View>
    );
  };
  
  const renderCategorySection = (section, isLast = false) => {
    if (!section) return null;
    
    const displayName = section.mainCategory.name.trim();
    const categoryNameLower = displayName.toLowerCase();

    return (
      <View key={section.mainCategory._id} style={[styles.sectionContainer, isLast && styles.lastSection]}>
        {/* Category Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {displayName.charAt(0).toUpperCase() + displayName.slice(1)} Specials
          </Text>
          <TouchableOpacity onPress={() => navigateToCategory(section.mainCategory._id)}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* 3x2 Subcategory Grid */}
        {section.subcategories.length > 0 ? (
          <>
            {renderSubcategoryGrid(section.subcategories, section.mainCategory.name)}
          </>
        ) : (
          <Text style={styles.noSubcatText}>No subcategories available for {displayName}.</Text>
        )}

        {/* Top Selling Products from this Category */}
        {section.topSelling.length > 0 && (
          <>
            <ProductGrid 
              title={`🔥 Top Selling ${displayName}`}
              products={section.topSelling} 
            />
          </>
        )}
        
        {/* Today's Deals from this Category */}
        {section.todaysDeals.length > 0 && (
          <>
            <ProductGrid 
              title={`⏰ ${displayName} Deals Today`}
              products={section.todaysDeals} 
            />
          </>
        )}
        
        {/* Category-specific Banners */}
        <View style={styles.bannerCarouselContainer}>
          <BannerAd 
            title={`${displayName} Sale`} 
            subtitle="Great deals available" 
            backgroundColor="#059669" 
          />
          <BannerAd 
            title={`${displayName} Special`} 
            subtitle="Limited time offer" 
            backgroundColor="#F59E0B" 
          />
        </View>
      </View>
    );
  };

  // --- MAIN RENDER ---

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF9933" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading home content...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "red" }}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchHomeData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NotificationListModal />
      <HeaderBackground height={180} colors={["#FF9933", "#FF7700"]} patternOpacity={0.1} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header with Left Icons and Right App Name */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
             <View style={styles.rightTitleContainer}>
              <Text style={styles.appName}>Sampurna</Text>
              <Text style={styles.appTagline}>Complete Grocery</Text>
            </View>
            {/* Left Side: Notification and Profile Icons */}
            <View style={styles.leftIconsContainer}>
              <TouchableOpacity 
                style={styles.notificationIcon} 
                onPress={handleShowNotifications}
              >
                <Text style={styles.bellText}>🔔</Text>
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.profileIcon}>
                <Text style={styles.profileText}>👤</Text>
              </TouchableOpacity>
            </View>

            {/* Right Side: App Name */}
         
          </View>
          
          {/* Search Bar */}
          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => navigation.navigate('SearchScreen', { allProducts: allProducts })}
          >
            <Text style={styles.searchIcon}>🔍</Text>
            <Text style={styles.searchText}>Search for products, brands and more</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <AdvertisementBanner />
          <PromoCarousel />
          
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explore Categories</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => navigation.navigate("SingleCategory")}>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
            </View>
            <CategoryGrid showVendorUpload={false} currentVendorId={currentVendorId} />
          </View>

          {allTopSelling.length > 0 && (
            <ProductGrid title="🔥 All Top Selling Products" products={allTopSelling} />
          )}

          {allTodaysDeals.length > 0 && (
            <ProductGrid title="⏰ All Today's Deals" products={allTodaysDeals} />
          )}

          <BannerAd title="Weekend Savings!" subtitle="Extra 15% Off on Groceries" backgroundColor="#1D4ED8" />

          {firstCategorySection && renderCategorySection(firstCategorySection)}
          
          {secondCategorySection && renderCategorySection(secondCategorySection, true)}
          
          <SupportSection />
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
const IMAGE_SIZE = 70; // Define a standard image size for the square

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FAFAFA" 
  },
  safeArea: { 
    flex: 1 
  },
  
  // Header Styles
  header: { 
    paddingTop: 20, 
    paddingHorizontal: 20, 
    paddingBottom: 20, 
    zIndex: 10 ,
    marginTop: 20,
  },
  
  headerTop: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "flex-start", 
    marginBottom: 20 
  },
  
  leftIconsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  notificationIcon: { 
    width: 40, 
    height: 40, 
    backgroundColor: "rgba(255,255,255,0.25)", 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 10,
    position: 'relative' 
  },
  
  bellText: { 
    fontSize: 18 
  },
  
  badge: {
    position: 'absolute', 
    top: -2, 
    right: -2, 
    backgroundColor: '#EF4444', 
    borderRadius: 10, 
    minWidth: 18, 
    height: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#FF9933',
  },
  
  badgeText: { 
    color: '#FFFFFF', 
    fontSize: 10, 
    fontWeight: 'bold', 
    paddingHorizontal: 4 
  },
  
  profileIcon: { 
    width: 40, 
    height: 40, 
    backgroundColor: "rgba(255,255,255,0.25)", 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  
  profileText: { 
    fontSize: 18 
  },
  
  // Right Side: App Name Container
  rightTitleContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  
  appName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  
  appTagline: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  
  searchBar: { 
    backgroundColor: "#FFF", 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    paddingVertical: 14, 
    flexDirection: "row", 
    alignItems: "center", 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 2 
  },
  
  searchIcon: { 
    fontSize: 16, 
    marginRight: 12 
  },
  
  searchText: { 
    fontSize: 13, 
    color: "#94A3B8" 
  },
  
  scrollContent: { 
    paddingBottom: 120 
  },
  
  // --- Dynamic Category Styles ---
  sectionContainer: { 
    marginTop: 24, 
    paddingBottom: 10, 
    borderBottomWidth: 6, 
    borderBottomColor: '#F0F0F0' 
  },
  
  lastSection: { 
    borderBottomWidth: 0 
  }, 
  
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    marginBottom: 12 
  },
  
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "800", 
    color: "#111827" 
  },
  
  sectionSubTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#374151", 
    paddingHorizontal: 20, 
    marginBottom: 12, 
    marginTop: 15 
  },
  
  viewAllText: { 
    fontSize: 13, 
    fontWeight: "600", 
    color: "#FF9933" 
  },
  
  noSubcatText: { 
    fontSize: 13, 
    color: '#9CA3AF', 
    paddingHorizontal: 20, 
    marginBottom: 10 
  },
  
  // 3x2 Subcategory Grid Styles
  subcategoryGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15, 
    marginBottom: 10,
  },
  
  subCatCard: {
    width: CARD_WIDTH,
    alignItems: 'center',
    marginBottom: 15, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    paddingTop: 5,
    paddingBottom: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    overflow: 'hidden',
  },
  
  subCatCardFiller: {
    width: CARD_WIDTH, 
    height: 0, 
  },

  // Square container for the image
  subCatImageSquareContainer: {
    width: IMAGE_SIZE, 
    height: IMAGE_SIZE, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderRadius: 8,
    overflow: 'hidden', 
  },
  
  subCatImageSquare: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  subCatIconFallback: {
    fontSize: 28, 
    color: '#FF9933',
    fontWeight: 'bold',
  },

  subCatName: {
    fontSize: 12,
    fontWeight: '600', 
    color: '#1F2937', 
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 5, 
  },

  // Banner Container
  bannerCarouselContainer: {
    flexDirection: 'column', 
    paddingHorizontal: 20,
    gap: 10, 
    paddingBottom: 15,
  },

  retryButton: { 
    marginTop: 16, 
    backgroundColor: '#FF9933', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 8 
  },
  
  retryButtonText: { 
    color: '#FFFFFF', 
    fontWeight: '600' 
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  
  notificationsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%'
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  notificationsContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '40%',
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllButton: {
    marginRight: 15,
  },
  markAllText: {
    color: '#FF9933',
    fontSize: 14,
    fontWeight: '500',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: '#666',
  },
  notificationList: {
    paddingHorizontal: 15,
  },
  notificationItem: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
    alignItems: 'flex-start',
  },
  unreadNotification: {
    backgroundColor: '#FFF9F2',
  },
  notificationIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF5EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9933',
    marginLeft: 10,
    marginTop: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});