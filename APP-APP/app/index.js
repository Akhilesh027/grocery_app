import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, 
  ActivityIndicator, PermissionsAndroid, Platform, Alert, Modal 
} from 'react-native';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';

import { HeaderBackground } from '../components/HeaderBackground';
import PromoCarousel from '../components/PromoCarousel';
import CategoryGrid from '../components/CategoryGrid';
import CategoryGrid3x3 from '../components/CategoryGrid3x3';
import ProductGrid from '../components/ProductGrid';
import VendorImageGrid from '../components/VendorImageGrid';
import BannerAd from '../components/BannerAd';
import SupportSection from '../components/SupportSection';
import AdvertisementBanner from '../components/AdvertisementBanner';
import BrandSpotlight from '../components/BrandSpotlight';
import { useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  const [isVendorMode, setIsVendorMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
    const navigation = useNavigation();

  // Location state
  const [location, setLocation] = useState({
    address: "Fetching your location...",
    pincode: "",
    latitude: null,
    longitude: null
  });

  const [watchId, setWatchId] = useState(null);
  const currentVendorId = 'vendor1';

  // ====================== IMPROVED NOTIFICATION STATE ======================
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationIntervalRef = useRef(null);

  // Improved notification fetch with better error handling
  const fetchAllNotifications = async () => {
    try {
      const res = await axios.get("https://grocery-c3c0.onrender.com/api/notifications/latest");
      const fetchedNotifications = res.data.notifications || [];
      setNotifications(fetchedNotifications);
      
      // Calculate unread count (you might want to add 'read' property to your notifications)
      const unread = fetchedNotifications.filter(notif => !notif.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.log("Notifications fetch error:", err);
      setNotifications([{ 
        id: 'error', 
        message: "Failed to load notifications", 
        timestamp: new Date().toISOString(),
        type: 'error'
      }]);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`https://grocery-c3c0.onrender.com/api/notifications/${notificationId}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.log("Mark as read error:", err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.patch("https://grocery-c3c0.onrender.com/api/notifications/mark-all-read");
      setUnreadCount(0);
    } catch (err) {
      console.log("Mark all as read error:", err);
    }
  };

  // ====================== IMPROVED LOCATION HANDLING ======================
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show nearby products and services.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const getAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (response.data) {
        const address = response.data.address;
        let displayAddress = '';
        
        if (address.road) displayAddress += address.road + ', ';
        if (address.suburb) displayAddress += address.suburb + ', ';
        if (address.city) displayAddress += address.city + ', ';
        if (address.state) displayAddress += address.state;
        
        const pincode = address.postcode || '';
        
        setLocation({
          address: displayAddress || 'Location found',
          pincode: pincode,
          latitude: latitude,
          longitude: longitude
        });
      }
    } catch (error) {
      console.log('Error getting address:', error);
      setLocation(prev => ({
        ...prev,
        address: 'Location found (address unavailable)',
        pincode: ''
      }));
    }
  };

  // Improved location tracking with better error handling
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      setLocationLoading(true);
      
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          getAddressFromCoordinates(latitude, longitude);
          setLocationLoading(false);
          resolve({ latitude, longitude });
        },
        (error) => {
          console.log('Error getting location:', error);
          setLocation({
            address: "Unable to get location",
            pincode: "",
            latitude: null,
            longitude: null
          });
          setLocationLoading(false);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 20000, // Increased timeout
          maximumAge: 60000 // 1 minute cache
        }
      );
    });
  };

  // Improved live location tracking
  const startLiveLocationTracking = () => {
    try {
      const id = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Live location update:', { latitude, longitude });
          getAddressFromCoordinates(latitude, longitude);
        },
        (error) => {
          console.log('Live location error:', error);
          // Attempt to restart location tracking on error
          setTimeout(() => {
            stopLiveLocationTracking();
            startLiveLocationTracking();
          }, 5000);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 50, // More frequent updates (50 meters)
          interval: 10000,    // 10 seconds
          fastestInterval: 5000, // 5 seconds
          useSignificantChanges: false
        }
      );
      
      setWatchId(id);
      console.log('Live location tracking started with ID:', id);
    } catch (error) {
      console.log('Error starting live location:', error);
    }
  };

  const stopLiveLocationTracking = () => {
    if (watchId !== null) {
      Geolocation.clearWatch(watchId);
      setWatchId(null);
      console.log('Live location tracking stopped');
    }
  };

  const initializeLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      
      if (hasPermission) {
        await getCurrentLocation();
        startLiveLocationTracking();
      } else {
        setLocation({
          address: "Location permission denied",
          pincode: "",
          latitude: null,
          longitude: null
        });
        Alert.alert(
          'Location Permission Required',
          'Please enable location permissions in settings to get accurate delivery information.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.log('Location initialization error:', error);
      Alert.alert(
        'Location Error',
        'Failed to initialize location services. Please check your location settings.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleChangeLocation = () => {
    Alert.alert(
      'Update Location',
      'Refresh your current location?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Refresh', 
          onPress: () => {
            stopLiveLocationTracking();
            initializeLocation();
          }
        }
      ]
    );
  };

  // Improved notification handling
  const handleShowNotifications = async () => {
    await fetchAllNotifications();
    setShowNotifications(true);
  };

  const handleNotificationPress = (notification) => {
    markAsRead(notification.id);
    // Handle notification action based on type
    if (notification.type === 'product') {
      navigation.navigate('ProductDetail', { productId: notification.productId });
    } else if (notification.type === 'order') {
      navigation.navigate('OrderDetail', { orderId: notification.orderId });
    }
    setShowNotifications(false);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("https://grocery-c3c0.onrender.com/api/products");
        setProducts(res.data.products || res.data || []);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    initializeLocation();
    fetchAllNotifications();

    // Set up notification polling (every 30 seconds instead of 10)
    notificationIntervalRef.current = setInterval(fetchAllNotifications, 30000);

    return () => {
      stopLiveLocationTracking();
      if (notificationIntervalRef.current) {
        clearInterval(notificationIntervalRef.current);
      }
    };
  }, []);

  // ====================== IMPROVED NOTIFICATION MODAL ======================
  const NotificationListModal = () => (
    <Modal visible={showNotifications} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.notificationsContainer}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Notifications</Text>
            <View style={styles.notificationsHeaderActions}>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead} style={styles.markAllReadBtn}>
                  <Text style={styles.markAllReadText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity 
                style={styles.closeModalBtn} 
                onPress={() => setShowNotifications(false)}
              >
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.notificationsList}>
            {notifications.length === 0 ? (
              <View style={styles.emptyNotifications}>
                <Text style={styles.emptyNotificationsText}>No notifications yet</Text>
                <Text style={styles.emptyNotificationsSubText}>
                  We'll notify you about important updates here
                </Text>
              </View>
            ) : (
              notifications.map((notif, idx) => (
                <TouchableOpacity 
                  key={notif.id || idx}
                  style={[
                    styles.notificationItem,
                    !notif.read && styles.unreadNotification
                  ]}
                  onPress={() => handleNotificationPress(notif)}
                >
                  <View style={styles.notificationContent}>
                    <Text style={styles.notificationMessage}>{notif.message}</Text>
                    <Text style={styles.notificationTime}>
                      {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString() : 'Just now'}
                    </Text>
                  </View>
                  {!notif.read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FF9933" />
        <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "red" }}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* NOTIFICATION LIST MODAL */}
      <NotificationListModal />
      <HeaderBackground height={180} colors={["#FF9933", "#FF7700"]} patternOpacity={0.1} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.locationSection}>
              <Text style={styles.locationLabel}>Delivering to</Text>
              <View style={styles.locationContainer}>
                <View style={styles.locationTextContainer}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <View style={styles.locationInfo}>
                    {locationLoading ? (
                      <View style={styles.locationLoading}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.locationText}>Getting location...</Text>
                      </View>
                    ) : (
                      <>
                        <Text style={styles.locationText} numberOfLines={1}>
                          {location.address}
                        </Text>
                        {location.pincode ? (
                          <Text style={styles.pincodeText}>Pincode: {location.pincode}</Text>
                        ) : null}
                      </>
                    )}
                  </View>
                </View>
                <TouchableOpacity onPress={handleChangeLocation} disabled={locationLoading}>
                  <Text style={[styles.changeText, locationLoading && styles.changeTextDisabled]}>
                    {locationLoading ? 'Updating...' : 'Change'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* IMPROVED NOTIFICATION BELL ICON */}
            <TouchableOpacity 
              style={styles.notificationIcon} 
              onPress={handleShowNotifications}
            >
              <Text style={styles.bellText}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {/* USER PROFILE ICON */}
            <TouchableOpacity style={styles.profileIcon}>
              <Text style={styles.profileText}>👤</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.searchBar}
            onPress={() => navigation.navigate('SearchScreen', { allProducts: products })}
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
              <Text style={styles.sectionTitle}>Shop by Category</Text>
              <View style={styles.headerActions}>
                
                  <TouchableOpacity onPress={() => navigation.navigate("category")}>
      <Text style={styles.viewAllText}>View All</Text>
    </TouchableOpacity>
              </View>
            </View>
            <CategoryGrid showVendorUpload={isVendorMode} currentVendorId={currentVendorId} />
          </View>
          <BrandSpotlight />
          <VendorImageGrid title="Featured Vendors" />
          <ProductGrid title="🛍️ All Products" products={products} />
          <ProductGrid title="🔥 Today's Deals" products={products} />
          <ProductGrid title="💥 Hot Deals" products={products} />
          <ProductGrid title="🥗 Grocery Items" products={products} />
          <ProductGrid title="🧴 Personal Care Items" products={products} />
          <ProductGrid title="🧹 Cleaning Essentials" products={products} />
          <BannerAd title="Mega Sale!" subtitle="Up to 50% off" backgroundColor="#DC2626" />
          <SupportSection />
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFAFA" },
  safeArea: { flex: 1 },
  header: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 20, zIndex: 10 },

  // =================== IMPROVED NOTIFICATION MODAL STYLES ===================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  notificationsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '40%',
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  notificationsHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  markAllReadBtn: {
    marginRight: 15,
  },
  markAllReadText: {
    color: '#FF9933',
    fontSize: 14,
    fontWeight: '500',
  },
  closeModalBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
  },
  notificationsList: {
    flex: 1,
  },
  emptyNotifications: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyNotificationsSubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
    backgroundColor: '#FFFFFF',
  },
  unreadNotification: {
    backgroundColor: '#FFFBEB',
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9933',
  },

  // =================== EXISTING STYLES ===================
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  locationSection: { flex: 1, marginRight: 10 },
  locationLabel: { fontSize: 11, color: "#FFFFFF", opacity: 0.85, marginBottom: 4 },
  locationContainer: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  locationTextContainer: { flexDirection: "row", alignItems: "flex-start", flex: 1, marginRight: 10 },
  locationIcon: { marginRight: 6, marginTop: 2 },
  locationInfo: { flex: 1 },
  locationLoading: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF", flex: 1 },
  pincodeText: { fontSize: 11, color: "#FFFFFF", opacity: 0.8, marginTop: 2 },
  changeText: { fontSize: 11, color: "#FFFFFF", fontWeight: "500", marginTop: 2 },
  changeTextDisabled: { opacity: 0.5 },
  
  // Improved notification icon styles
  notificationIcon: { 
    width: 40, 
    height: 40, 
    backgroundColor: "rgba(255,255,255,0.25)", 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center",
    marginRight: 10,
    position: 'relative',
  },
  bellText: { fontSize: 18 },
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
    paddingHorizontal: 4,
  },
  
  profileIcon: { 
    width: 40, 
    height: 40, 
    backgroundColor: "rgba(255,255,255,0.25)", 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  profileText: { fontSize: 18 },

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
    elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 12 },
  searchText: { fontSize: 13, color: "#94A3B8" },

  scrollContent: { paddingBottom: 120 },
  sectionContainer: { marginTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#111827" },
  viewAllText: { fontSize: 13, fontWeight: "600", color: "#FF9933" },
  headerActions: { flexDirection: "row", alignItems: "center" },
  vendorToggle: { backgroundColor: "#F3F4F6", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 12 },
  vendorToggleActive: { backgroundColor: "#FF9933" },
  vendorToggleText: { fontSize: 11, fontWeight: "500", color: "#6B7280" },
  vendorToggleTextActive: { color: "#FFF" },

  // Retry button styles
  retryButton: {
    marginTop: 16,
    backgroundColor: '#FF9933',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});