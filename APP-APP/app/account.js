import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function AccountScreen() {
  const navigation = useNavigation();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const sidebarCategories = [
    { id: 'profile', title: 'My Profile', icon: '👤', screen: 'AccountSection' },
    { id: 'orders', title: 'My Orders', icon: '📦', screen: 'orders' },
    { id: 'addresses', title: 'Addresses', icon: '📍', screen: 'AddressScreen' },
    { id: 'payments', title: 'Payment Methods', icon: '💳', screen: 'PaymentScreen' },
    { id: 'refer', title: 'Refer & Earn', icon: '🎁', screen: 'referral' },
    { id: 'notifications', title: 'Notifications', icon: '🔔', screen: 'NotificationsScreen' },
    { id: 'support', title: 'Help & Support', icon: '❓', screen: 'SupportScreen' },
    { id: 'about', title: 'About', icon: 'ℹ️', screen: 'AboutScreen' },
  ];

  // ✅ Load user info from AsyncStorage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userData = await AsyncStorage.getItem('user');

        if (token && userData) {
          setIsLoggedIn(true);
          setUser(JSON.parse(userData));
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error loading user info:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', fetchUser);
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setIsLoggedIn(false);
      setUser(null);
      Alert.alert('Logout Successful', 'You have been logged out.');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (screenName) => {
    setSidebarVisible(false);
    if (!isLoggedIn && screenName !== 'AboutScreen' && screenName !== 'SupportScreen') {
      navigation.navigate('LoginScreen');
    } else {
      navigation.navigate(screenName);
    }
  };

  const renderMainContent = () => (
    <ScrollView style={styles.mainScrollView} showsVerticalScrollIndicator={false}>
      {/* Profile Info */}
      {isLoggedIn && user ? (
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userPhone}>{user.phone || 'Phone not added'}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.loginBanner}>
          <Text style={styles.loginText}>Login / Sign Up to manage your account</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={styles.loginButtonText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Account Sections</Text>
        {sidebarCategories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItemMain}
            onPress={() => handleNavigate(item.screen)}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      {isLoggedIn && (
        <TouchableOpacity
          style={[styles.loginButton, { marginHorizontal: 16, marginBottom: 40 }]}
          onPress={handleLogout}
        >
          <Text style={styles.loginButtonText}>LOGOUT</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.hamburgerMenu} onPress={() => setSidebarVisible(true)}>
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => navigation.navigate('cart')}
          >
            <Text style={styles.cartIcon}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.fullContent}>{renderMainContent()}</View>

      {/* Sidebar Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sidebarVisible}
        onRequestClose={() => setSidebarVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sidebarModal}>
            <View style={styles.sidebarHeader}>
              <TouchableOpacity onPress={() => setSidebarVisible(false)}>
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.sidebarHeaderTitle}>
                {isLoggedIn ? `Hi, ${user?.name?.split(' ')[0]}` : 'Hi, Guest'}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('CartScreen')}>
                <Text style={styles.cartIconSidebar}>🛒</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {sidebarCategories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.sidebarItem}
                  onPress={() => handleNavigate(item.screen)}
                >
                  <Text style={styles.sidebarIcon}>{item.icon}</Text>
                  <Text style={styles.sidebarText}>{item.title}</Text>
                </TouchableOpacity>
              ))}

              {isLoggedIn ? (
                <TouchableOpacity
                  style={[styles.sidebarItem, { backgroundColor: '#F9FAFB' }]}
                  onPress={handleLogout}
                >
                  <Text style={[styles.sidebarIcon, { color: 'red' }]}>🚪</Text>
                  <Text style={[styles.sidebarText, { color: 'red' }]}>Logout</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.sidebarItem, { backgroundColor: '#F9FAFB' }]}
                  onPress={() => navigation.navigate('LoginScreen')}
                >
                  <Text style={[styles.sidebarIcon, { color: '#10B981' }]}>🔑</Text>
                  <Text style={[styles.sidebarText, { color: '#10B981' }]}>Login</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
          <TouchableOpacity
            style={styles.modalBackground}
            onPress={() => setSidebarVisible(false)}
          />
        </View>
      </Modal>
    </View>
  );
}


// (✅ Keep your existing styles here — no changes needed)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  hamburgerMenu: {
    padding: 8,
  },
  hamburgerIcon: {
    fontSize: 20,
    color: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    padding: 8,
    marginRight: 4,
  },
  searchIcon: {
    fontSize: 20,
    color: '#10B981',
  },
  cartButton: {
    padding: 8,
  },
  cartIcon: {
    fontSize: 20,
    color: '#10B981',
  },
  fullContent: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mainScrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#10B981',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  savingsBanner: {
    backgroundColor: '#E8F5E8',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 12,
  },
  savingsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingsLeft: {
    marginRight: 16,
  },
  savingsIcon: {
    fontSize: 32,
  },
  savingsRight: {
    flex: 1,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  savingsSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 4,
  },
  savingsDescription: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  savingsArrow: {
    fontSize: 20,
    color: '#10B981',
  },
  loginBanner: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loginText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  loginButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
  },
  menuItemMain: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 16,
    width: 24,
  },
  menuTitle: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  menuArrow: {
    fontSize: 18,
    color: '#CCCCCC',
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarModal: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backIcon: {
    fontSize: 20,
    color: '#333333',
  },
  sidebarHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
    flex: 1,
    textAlign: 'center',
  },
  cartIconSidebar: {
    fontSize: 20,
    color: '#10B981',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
  editIcon: {
    fontSize: 16,
  },
  shopByCategorySidebar: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  shopByCategoryTextSidebar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  shopByCategoryArrowSidebar: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  gstBanner: {
    backgroundColor: '#FFF9C4',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  moreInfoBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#FFA500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  moreInfoText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  gstText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sidebarIcon: {
    fontSize: 16,
    marginRight: 16,
    width: 24,
  },
  sidebarText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
  },
  sidebarScrollView: {
    flex: 1,
    marginBottom: 60,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
  },
  contentContainer: {
    padding: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 20,
  },
  contentText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginTop: 50,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderText: {
    fontSize: 14,
    color: '#333333',
  },
  orderStatus: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  addressItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666666',
  },
  addButton: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  referBanner: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    overflow: 'hidden',
  },
  referContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  referLeft: {
    flex: 1,
  },
  referTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  referSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  referButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    alignSelf: 'flex-start',
  },
  referButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  referRight: {
    marginLeft: 16,
  },
  referEmoji: {
    fontSize: 48,
    opacity: 0.8,
  },
});
