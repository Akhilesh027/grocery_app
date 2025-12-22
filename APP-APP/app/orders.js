import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Dimensions
} from 'react-native';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CircleCheck as CheckCircle, 
  Circle as XCircle, 
  Star, 
  RotateCcw, 
  Truck, 
  MapPin, 
  CreditCard, 
  X,
  User,
  Calendar,
  Navigation,
  Phone,
  ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://31.97.233.212:5000/api';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Define colors properly
const colors = {
  primary: '#2563EB',
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
  success: '#059669',
  warning: '#F59E0B',
  border: '#E5E7EB',
};

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Fetch user orders from API
  const fetchUserOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please login to view your orders');
        router.replace('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', error.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle reorder
  const handleReorder = async (order) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      
      if (!token || !userId) {
        Alert.alert('Error', 'Please login to reorder');
        router.replace('/login');
        return;
      }

      // Add all items from the order to cart
      const cartPromises = order.items.map(async (item) => {
        const productData = {
          userId: userId,
          productId: item.productId?._id || item.productId,
          title: item.title || item.productId?.title || 'Product',
          price: item.price || 0,
          image: item.image || item.productId?.image || '',
          quantity: item.quantity || 1
        };

        const response = await fetch(`${API_BASE_URL}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to add ${productData.title} to cart`);
        }
      });

      await Promise.all(cartPromises);
      
      Alert.alert(
        'Success', 
        'All items added to cart!', 
        [
          { 
            text: 'Continue Shopping', 
            style: 'cancel' 
          },
          { 
            text: 'View Cart', 
            onPress: () => router.push('/cart') 
          }
        ]
      );
    } catch (error) {
      console.error('Error during reorder:', error);
      Alert.alert('Error', error.message || 'Failed to add items to cart');
    }
  };

  // Handle view order details in modal
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserOrders();
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const tabs = [
    { id: 'all', title: 'All Orders', count: orders.length },
    { id: 'new', title: 'New', count: orders.filter(o => o.orderStatus === 'new').length },
    { id: 'confirmed', title: 'Confirmed', count: orders.filter(o => o.orderStatus === 'confirmed').length },
    { id: 'processing', title: 'Processing', count: orders.filter(o => o.orderStatus === 'processing').length },
    { id: 'shipped', title: 'Shipped', count: orders.filter(o => o.orderStatus === 'shipped').length },
    { id: 'delivered', title: 'Delivered', count: orders.filter(o => o.orderStatus === 'delivered').length },
    { id: 'cancelled', title: 'Cancelled', count: orders.filter(o => o.orderStatus === 'cancelled').length }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return <Package size={20} color="#3B82F6" />;
      case 'confirmed': return <Clock size={20} color="#8B5CF6" />;
      case 'processing': return <Clock size={20} color="#F59E0B" />;
      case 'shipped': return <Truck size={20} color="#F59E0B" />;
      case 'delivered': return <CheckCircle size={20} color="#059669" />;
      case 'cancelled': return <XCircle size={20} color="#EF4444" />;
      default: return <Package size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#3B82F6';
      case 'confirmed': return '#8B5CF6';
      case 'processing': return '#F59E0B';
      case 'shipped': return '#F59E0B';
      case 'delivered': return '#059669';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'new': return '#DBEAFE';
      case 'confirmed': return '#EDE9FE';
      case 'processing': return '#FEF3C7';
      case 'shipped': return '#FEF3C7';
      case 'delivered': return '#D1FAE5';
      case 'cancelled': return '#FEE2E2';
      default: return '#F3F4F6';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      new: 'New Order',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  const getTotalItems = (order) => {
    return order.items?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;
  };

  const getOrderProgress = (orderStatus) => {
    const steps = [
      { status: 'new', label: 'Order Placed', completed: true },
      { status: 'confirmed', label: 'Confirmed', completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(orderStatus) },
      { status: 'processing', label: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(orderStatus) },
      { status: 'shipped', label: 'Shipped', completed: ['shipped', 'delivered'].includes(orderStatus) },
      { status: 'delivered', label: 'Delivered', completed: orderStatus === 'delivered' }
    ];
    return steps;
  };

  const filteredOrders = selectedTab === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus === selectedTab);

  // Render Order Details Modal
  const renderOrderDetailsModal = () => {
    if (!selectedOrder) return null;

    const progressSteps = getOrderProgress(selectedOrder.orderStatus);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <X size={24} color={colors.gray700} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Order Progress Tracking */}
              <View style={styles.trackingSection}>
                <Text style={styles.sectionTitle}>Order Tracking</Text>
                <View style={styles.progressContainer}>
                  {progressSteps.map((step, index) => (
                    <View key={step.status} style={styles.progressStep}>
                      <View style={styles.stepIndicator}>
                        <View style={[
                          styles.stepCircle,
                          step.completed && styles.stepCircleCompleted
                        ]}>
                          {step.completed && <CheckCircle size={16} color={colors.white} />}
                        </View>
                        {index < progressSteps.length - 1 && (
                          <View style={[
                            styles.stepLine,
                            step.completed && styles.stepLineCompleted
                          ]} />
                        )}
                      </View>
                      <Text style={[
                        styles.stepLabel,
                        step.completed && styles.stepLabelCompleted
                      ]}>
                        {step.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Order Summary */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.detailRow}>
                  <Package size={18} color={colors.gray600} />
                  <Text style={styles.detailLabel}>Order ID:</Text>
                  <Text style={styles.detailValue}>{selectedOrder.orderId}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={18} color={colors.gray600} />
                  <Text style={styles.detailLabel}>Order Date:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedOrder.createdAt)} at {formatTime(selectedOrder.createdAt)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <CreditCard size={18} color={colors.gray600} />
                  <Text style={styles.detailLabel}>Payment:</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusBgColor(selectedOrder.paymentStatus) }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(selectedOrder.paymentStatus) }
                    ]}>
                      {selectedOrder.paymentStatus}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Delivery Address */}
              {selectedOrder.address && (
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Delivery Address</Text>
                  <View style={styles.addressCard}>
                    <MapPin size={18} color={colors.primary} />
                    <View style={styles.addressDetails}>
                      <Text style={styles.addressName}>{selectedOrder.address.fullName}</Text>
                      <Text style={styles.addressText}>{selectedOrder.address.address}</Text>
                      {selectedOrder.address.locality && (
                        <Text style={styles.addressText}>{selectedOrder.address.locality}</Text>
                      )}
                      <Text style={styles.addressText}>
                        {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                      </Text>
                      <View style={styles.addressContact}>
                        <Phone size={14} color={colors.gray500} />
                        <Text style={styles.addressPhone}>{selectedOrder.address.mobile}</Text>
                      </View>
                      {selectedOrder.address.landmark && (
                        <Text style={styles.addressLandmark}>
                          Landmark: {selectedOrder.address.landmark}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              )}

              {/* Order Items */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>
                  Order Items ({getTotalItems(selectedOrder)})
                </Text>
                {selectedOrder.items?.map((item, index) => (
                  <View key={index} style={styles.orderItemDetail}>
                    <Image 
                      source={{ uri: item.image || item.productId?.image }} 
                      style={styles.itemImageDetail} 
                    />
                    <View style={styles.itemDetailsDetail}>
                      <Text style={styles.itemTitleDetail}>
                        {item.title || item.productId?.title || 'Unknown Product'}
                      </Text>
                      <Text style={styles.itemPriceDetail}>₹{item.price} × {item.quantity}</Text>
                    </View>
                    <Text style={styles.itemTotalDetail}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Price Breakdown */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Price Breakdown</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Items Total:</Text>
                  <Text style={styles.priceValue}>
                    ₹{selectedOrder.pricing.total?.toLocaleString()}
                  </Text>
                </View>
                {selectedOrder.discount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Discount:</Text>
                    <Text style={[styles.priceValue, styles.discountText]}>
                      -₹{selectedOrder.discount?.toLocaleString()}
                    </Text>
                  </View>
                )}
                {selectedOrder.deliveryFee > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Delivery Fee:</Text>
                    <Text style={styles.priceValue}>
                      ₹{selectedOrder.deliveryFee?.toLocaleString()}
                    </Text>
                  </View>
                )}
                <View style={[styles.priceRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total Amount:</Text>
                  <Text style={styles.totalValue}>
                    ₹{selectedOrder.pricing.total?.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Loyalty Coins */}
              {selectedOrder.coinsEarned > 0 && (
                <View style={styles.coinsSection}>
                  <View style={styles.coinsBadge}>
                    <Star size={16} color={colors.warning} />
                    <Text style={styles.coinsText}>
                      Earned {selectedOrder.coinsEarned} loyalty coins
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={() => setDetailModalVisible(false)}
              >
                <Text style={styles.secondaryButtonText}>Close</Text>
              </TouchableOpacity>
              {selectedOrder.orderStatus === 'delivered' && (
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => {
                    setDetailModalVisible(false);
                    handleReorder(selectedOrder);
                  }}
                >
                  <RotateCcw size={18} color={colors.white} />
                  <Text style={styles.primaryButtonText}>Reorder All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderOrderCard = ({ item: order }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleViewDetails(order)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderIdSection}>
          <Text style={styles.orderId}>#{order.orderId}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusBgColor(order.orderStatus) }
          ]}>
            {getStatusIcon(order.orderStatus)}
            <Text style={[
              styles.statusText,
              { color: getStatusColor(order.orderStatus) }
            ]}>
              {getStatusText(order.orderStatus)}
            </Text>
          </View>
        </View>
        <Text style={styles.orderDate}>
          {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
        </Text>
      </View>

      <View style={styles.orderItems}>
        {order.items?.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Image 
              source={{ uri: item.image || item.productId?.image }} 
              style={styles.itemImage} 
            />
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>
                {item.title || item.productId?.title || 'Unknown Product'}
              </Text>
              <Text style={styles.itemPrice}>₹{item.price} × {item.quantity}</Text>
            </View>
          </View>
        ))}
        {order.items?.length > 2 && (
          <Text style={styles.moreItems}>+{order.items.length - 2} more items</Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.orderTotal}>
          <Text style={styles.totalLabel}>Total: ₹{order.pricing.total?.toLocaleString()}</Text>
          <Text style={styles.itemsCount}>{getTotalItems(order)} items</Text>
        </View>

        <View style={styles.orderActions}>
          <TouchableOpacity 
            style={styles.viewDetailsButton}
            onPress={(e) => {
              e.stopPropagation();
              handleViewDetails(order);
            }}
          >
            <Text style={styles.viewDetailsButtonText}>View Details</Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {order.coinsEarned > 0 && (
        <View style={styles.coinsEarned}>
          <Star size={14} color={colors.warning} />
          <Text style={styles.coinsText}>Earned {order.coinsEarned} coins</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color={colors.gray900} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedTab === tab.id && styles.activeTab
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText
              ]}>
                {tab.title}
              </Text>
              <View style={[
                styles.tabBadge,
                selectedTab === tab.id && styles.activeTabBadge
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  selectedTab === tab.id && styles.activeTabBadgeText
                ]}>
                  {tab.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.ordersList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={48} color={colors.gray400} />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedTab === 'all' 
                ? "You haven't placed any orders yet"
                : `No ${selectedTab} orders found`
              }
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => router.push('/')}
            >
              <Text style={styles.shopButtonText}>Start Shopping</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Order Details Modal */}
      {renderOrderDetailsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  header: {
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
  },
  tabsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: colors.gray100,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
    marginRight: 6,
  },
  activeTabText: {
    color: colors.white,
  },
  tabBadge: {
    backgroundColor: colors.gray200,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: colors.white,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray700,
  },
  activeTabBadgeText: {
    color: colors.primary,
  },
  ordersList: {
    padding: 16,
    flexGrow: 1,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  orderHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  orderIdSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  orderDate: {
    fontSize: 14,
    color: colors.gray500,
  },
  orderItems: {
    padding: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.gray200,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 12,
    color: colors.gray500,
  },
  moreItems: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  orderTotal: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 2,
  },
  itemsCount: {
    fontSize: 12,
    color: colors.gray500,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 4,
  },
  coinsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    gap: 6,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray900,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray500,
    textAlign: 'center',
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.gray900,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.gray100,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
  },
  secondaryButtonText: {
    color: colors.gray700,
    fontSize: 16,
    fontWeight: '600',
  },
  // Tracking Styles
  trackingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepIndicator: {
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: colors.gray300,
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.gray500,
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: colors.gray900,
    fontWeight: '600',
  },
  // Detail Section Styles
  detailSection: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: colors.gray600,
    flex: 1,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: colors.gray50,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200,
    gap: 12,
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.gray600,
    lineHeight: 18,
  },
  addressContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  addressPhone: {
    fontSize: 14,
    color: colors.gray600,
  },
  addressLandmark: {
    fontSize: 14,
    color: colors.gray500,
    fontStyle: 'italic',
    marginTop: 4,
  },
  orderItemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.gray50,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemImageDetail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: colors.gray200,
  },
  itemDetailsDetail: {
    flex: 1,
  },
  itemTitleDetail: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: 4,
  },
  itemPriceDetail: {
    fontSize: 12,
    color: colors.gray500,
  },
  itemTotalDetail: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.gray600,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
  },
  discountText: {
    color: colors.success,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.gray900,
  },
  coinsSection: {
    alignItems: 'center',
    marginTop: 16,
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
});