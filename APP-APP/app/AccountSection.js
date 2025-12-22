import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { User, ChevronRight, Gift, Star, MapPin, Package, Clock, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://31.97.233.212:5000/api';

// Properly define colors object
const colors = {
  primary: '#007AFF',
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  border: '#E5E7EB',
};

const fonts = {
  sans: 'System',
};

export default function AccountPage() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch user data');
      
      const data = await response.json();
      if (data.success) {
        setUserData(data.user);
        await AsyncStorage.setItem('userId', data.user._id);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  // Fetch user addresses
  const fetchAddresses = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/address`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data || []);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    }
  };

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setOrders(data.orders || []);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    try {
      Alert.alert(
        'Delete Address',
        'Are you sure you want to delete this address?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${API_BASE_URL}/address/${addressId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Address deleted successfully');
                fetchAddresses();
              } else {
                throw new Error('Failed to delete address');
              }
            }
          }
        ]
      );
    } catch (err) {
      console.error('Error deleting address:', err);
      Alert.alert('Error', 'Failed to delete address');
    }
  };

  // Set default address
  const setDefaultAddress = async (addressId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/address/${addressId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Default address updated');
        fetchAddresses();
      }
    } catch (err) {
      console.error('Error setting default address:', err);
      Alert.alert('Error', 'Failed to update default address');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchUserData(),
      fetchAddresses(),
      fetchOrders(),
    ]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUserData(),
        fetchAddresses(),
        fetchOrders(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Calculate loyalty progress
  const calculateLoyaltyProgress = () => {
    if (!userData?.loyaltyCoins) return { progress: 0, level: 1, nextLevel: 100 };
    
    const coins = userData.loyaltyCoins;
    const levels = [
      { threshold: 0, level: 1 },
      { threshold: 100, level: 2 },
      { threshold: 250, level: 3 },
      { threshold: 500, level: 4 },
      { threshold: 1000, level: 5 }
    ];

    let currentLevel = 1;
    let nextLevelThreshold = 100;

    for (let i = 0; i < levels.length - 1; i++) {
      if (coins >= levels[i].threshold && coins < levels[i + 1].threshold) {
        currentLevel = levels[i].level;
        nextLevelThreshold = levels[i + 1].threshold;
        break;
      }
    }

    if (coins >= levels[levels.length - 1].threshold) {
      currentLevel = levels[levels.length - 1].level;
      nextLevelThreshold = coins + 100;
    }

    const progress = Math.min((coins / nextLevelThreshold) * 100, 100);
    
    return {
      progress,
      level: currentLevel,
      currentCoins: coins,
      nextLevel: nextLevelThreshold
    };
  };

  const loyaltyProgress = calculateLoyaltyProgress();

  // Fixed getOrderStatusColor function
  const getOrderStatusColor = (status) => {
    const statusColors = {
      new: colors.primary,
      confirmed: colors.primary,
      processing: colors.warning,
      shipped: colors.warning,
      delivered: colors.success,
      cancelled: colors.error,
    };
    return statusColors[status] || colors.gray500;
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={16} color={colors.success} />;
      case 'cancelled':
        return <XCircle size={16} color={colors.error} />;
      default:
        return <Clock size={16} color={colors.warning} />;
    }
  };

  const formatOrderDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <View style={styles.iconWrap}>
              <User size={20} color="#FFFFFF" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Profile</Text>
              <Text style={styles.subtitle}>
                {userData?.name ? `Welcome, ${userData.name}` : 'Manage your account'}
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Gift size={16} color={colors.primary} />
                <Text style={styles.statLabel}>Coins</Text>
              </View>
              <Text style={styles.statValue}>
                {userData?.loyaltyCoins?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.coinsSubtext}>Available coins</Text>
            </View>

            <View style={styles.statBox}>
              <View style={styles.statHeader}>
                <Star size={16} color={colors.primary} />
                <Text style={styles.statLabel}>Loyalty Level</Text>
              </View>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Level {loyaltyProgress.level}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${loyaltyProgress.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {loyaltyProgress.currentCoins}/{loyaltyProgress.nextLevel}
              </Text>
            </View>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{userData?.name || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{userData?.email || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Referral Code:</Text>
              <Text style={styles.infoValue}>{userData?.referralCode || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
              Profile
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'addresses' && styles.activeTab]}
            onPress={() => setActiveTab('addresses')}
          >
            <Text style={[styles.tabText, activeTab === 'addresses' && styles.activeTabText]}>
              Addresses ({addresses.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
              Orders ({orders.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content based on active tab */}
        {activeTab === 'profile' && (
          <View style={styles.tabContent}>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Edit Profile</Text>
              <ChevronRight size={20} color={colors.gray400} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Change Password</Text>
              <ChevronRight size={20} color={colors.gray400} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Text style={styles.menuText}>Notification Settings</Text>
              <ChevronRight size={20} color={colors.gray400} />
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'addresses' && (
          <View style={styles.tabContent}>
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => router.push('/add-address')}
            >
              <Plus size={20} color={colors.primary} />
              <Text style={styles.addAddressText}>Add New Address</Text>
            </TouchableOpacity>

            {addresses.length === 0 ? (
              <View style={styles.emptyState}>
                <MapPin size={48} color={colors.gray300} />
                <Text style={styles.emptyStateTitle}>No Addresses</Text>
                <Text style={styles.emptyStateText}>
                  You haven't added any addresses yet. Add your first address to get started.
                </Text>
              </View>
            ) : (
              <View style={styles.addressesList}>
                {addresses.map((address) => (
                  <View key={address._id} style={styles.addressCard}>
                    <View style={styles.addressHeader}>
                      <View style={styles.addressTitleRow}>
                        <Text style={styles.addressLabel}>{address.label}</Text>
                        {address.isDefault && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.addressActions}>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => router.push(`/edit-address/${address._id}`)}
                        >
                          <Edit size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => deleteAddress(address._id)}
                        >
                          <Trash2 size={16} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <Text style={styles.addressName}>{address.fullName}</Text>
                    <Text style={styles.addressPhone}>📱 {address.mobile}</Text>
                    <Text style={styles.addressText}>{address.address}</Text>
                    {address.locality && (
                      <Text style={styles.addressText}>{address.locality}</Text>
                    )}
                    <Text style={styles.addressText}>
                      {address.city}, {address.state} - {address.pincode}
                    </Text>
                    {address.landmark && (
                      <Text style={styles.addressLandmark}>Landmark: {address.landmark}</Text>
                    )}
                    
                    {!address.isDefault && (
                      <TouchableOpacity 
                        style={styles.setDefaultButton}
                        onPress={() => setDefaultAddress(address._id)}
                      >
                        <Text style={styles.setDefaultText}>Set as Default</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {activeTab === 'orders' && (
          <View style={styles.tabContent}>
            {orders.length === 0 ? (
              <View style={styles.emptyState}>
                <Package size={48} color={colors.gray300} />
                <Text style={styles.emptyStateTitle}>No Orders</Text>
                <Text style={styles.emptyStateText}>
                  You haven't placed any orders yet. Start shopping to see your orders here.
                </Text>
                <TouchableOpacity 
                  style={styles.shopButton}
                  onPress={() => router.push('/')}
                >
                  <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.ordersList}>
                {orders.map((order) => (
                  <TouchableOpacity 
                    key={order._id}
                    style={styles.orderCard}
                    onPress={() => router.push(`/order/${order._id}`)}
                  >
                    <View style={styles.orderHeader}>
                      <View style={styles.orderInfo}>
                        <Text style={styles.orderId}>Order #{order.orderId}</Text>
                        <Text style={styles.orderDate}>
                          {formatOrderDate(order.createdAt)}
                        </Text>
                      </View>
                      <View style={styles.orderStatus}>
                        {getOrderStatusIcon(order.orderStatus)}
                        <Text style={[styles.statusText, { color: getOrderStatusColor(order.orderStatus) }]}>
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.orderDetails}>
                      <Text style={styles.itemsCount}>
                        {order.items?.length || 0} items
                      </Text>
                      <Text style={styles.orderTotal}>
                        ₹{order.totalAmount?.toLocaleString()}
                      </Text>
                    </View>
                    
                    <View style={styles.orderFooter}>
                      <Text style={styles.paymentStatus}>
                        Payment: {order.paymentStatus}
                      </Text>
                      <ChevronRight size={16} color={colors.gray400} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={async () => {
            await AsyncStorage.clear();
            router.replace('/login');
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: fonts.sans,
    color: colors.gray900,
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    color: colors.primary,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: fonts.sans,
    color: colors.gray900,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: fonts.sans,
    color: colors.gray500,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.gray50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray200,
    padding: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: fonts.sans,
    color: colors.gray700,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: fonts.sans,
    color: colors.gray900,
    marginBottom: 2,
  },
  coinsSubtext: {
    fontSize: 10,
    fontFamily: fonts.sans,
    color: colors.gray500,
  },
  levelBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fonts.sans,
    color: colors.white,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.gray200,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: fonts.sans,
    color: colors.gray600,
  },
  userInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
  infoValue: {
    fontSize: 14,
    color: colors.gray900,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
  },
  activeTabText: {
    color: colors.white,
  },
  tabContent: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  menuText: {
    fontSize: 16,
    color: colors.gray800,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  addAddressText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray700,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  shopButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
  addressesList: {
    gap: 12,
  },
  addressCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  addressPhone: {
    fontSize: 14,
    color: colors.gray600,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.gray700,
    lineHeight: 18,
  },
  addressLandmark: {
    fontSize: 14,
    color: colors.gray500,
    fontStyle: 'italic',
    marginTop: 2,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
  },
  setDefaultText: {
    color: colors.primary,
    fontWeight: '600',
  },
  ordersList: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: colors.gray500,
  },
  orderStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemsCount: {
    fontSize: 14,
    color: colors.gray600,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 12,
  },
  paymentStatus: {
    fontSize: 12,
    color: colors.gray500,
    textTransform: 'capitalize',
  },
  logoutButton: {
    backgroundColor: colors.error,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});