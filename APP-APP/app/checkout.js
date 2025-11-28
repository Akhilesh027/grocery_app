import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, MapPin, Check, X, Coins } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------- CONFIG ----------
const API_BASE_URL = 'https://grocery-c3c0.onrender.com/api';

const COLORS = {
  primary: '#00A86B',
  success: '#059669',
  error: '#DC2626',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: { primary: '#111827', secondary: '#6B7280', light: '#9CA3AF' },
  border: '#E5E7EB',
};

// ---------- UTILITIES ----------
const validators = {
  mobile: (m) => /^[6-9]\d{9}$/.test(m),
  pincode: (p) => /^\d{6}$/.test(p),
};
const formatPrice = (num) => `₹${Number(num || 0).toFixed(2)}`;

// Safe data access functions
const getItemPrice = (item) => {
  if (typeof item === 'number') return item;
  if (item.price) return item.price;
  if (item.productId?.price) return item.productId.price;
  if (item.product?.price) return item.product.price;
  return 0;
};

const getItemTitle = (item) => {
  if (item.title) return item.title;
  if (item.productId?.title) return item.productId.title;
  if (item.product?.title) return item.product.title;
  return 'Unknown Product';
};

const getItemImage = (item) => {
  if (item.image) return item.image;
  if (item.productId?.image) return item.productId.image;
  if (item.productId?.images?.[0]) return item.productId.images[0];
  if (item.product?.images?.[0]) return item.product.images[0];
  if (item.images?.[0]) return item.images[0];
  return "https://via.placeholder.com/100x100?text=No+Image";
};

// ---------- API SERVICE ----------
const api = {
  getToken: async () => await AsyncStorage.getItem('token'),
  request: async (endpoint, opts = {}) => {
    try {
      const token = await api.getToken();
      const headers = { 
        'Content-Type': 'application/json', 
        ...(opts.headers || {}) 
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const config = { 
        method: opts.method || 'GET',
        headers,
        ...opts 
      };
      
      if (opts.body && typeof opts.body !== 'string') {
        config.body = JSON.stringify(opts.body);
      } else if (opts.body) {
        config.body = opts.body;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  },

  checkPincode: async (pincode) => {
    try {
      const data = await api.request(`/check-pincode/${pincode}`);
      return {
        deliverable: typeof data.deliverable === 'boolean' ? data.deliverable : !!data.deliverable,
        message: data.message,
        zone: data.zone
      };
    } catch (error) {
      console.error('Pincode check error:', error);
      return { deliverable: false, message: 'Failed to check pincode availability' };
    }
  },

  saveAddress: async (address) => api.request('/address', { 
    method: 'POST', 
    body: address 
  }),
  
  getAddresses: async () => api.request('/address'),
  
  deleteAddress: async (addressId) => api.request(`/address/${addressId}`, { 
    method: 'DELETE' 
  }),
  
  validateCoupon: async (couponCode, subtotal) =>
    api.request('/coupon/validate', { 
      method: 'POST', 
      body: { couponCode, subtotal } 
    }),
  
  getUserReferrals: async () => api.request('/referrals/user'),
  
  useReferralCoins: async (coinsToUse, orderId) =>
    api.request('/referrals/use-coins', { 
      method: 'POST', 
      body: { coinsToUse, orderId } 
    }),
  
  placeOrder: async (order) => api.request('/order', { 
    method: 'POST', 
    body: order 
  }),
};

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', time: '8:00 AM - 11:00 AM' },
  { id: 'afternoon', label: 'Afternoon', time: '12:00 PM - 4:00 PM' },
  { id: 'evening', label: 'Evening', time: '5:00 PM - 9:00 PM' },
];

const PAYMENT_METHODS = [
  { id: 'upi', name: 'UPI', icon: '📱', description: 'Pay with UPI, PhonePe, Google Pay' },
  { id: 'card', name: 'Credit/Debit Card', icon: '💳', description: 'Pay with Visa, Mastercard, RuPay' },
  { id: 'cod', name: 'Cash on Delivery', icon: '💰', description: 'Pay when you receive your order' },
  { id: 'wallet', name: 'Wallet', icon: '💵', description: 'Pay with Paytm, PhonePe Wallet' },
];

const ADDRESS_TYPES = ['Home', 'Work', 'Other'];

const INITIAL_ADDRESS = {
  label: 'Home',
  fullName: '',
  mobile: '',
  pincode: '',
  address: '',
  locality: '',
  city: '',
  state: '',
  landmark: '',
  isDefault: false,
};

// ---------- COMPONENT ----------
export default function CheckoutScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const route = useRoute();
  const cartItems = route.params?.cartItems || [];

  // UI State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [deletingAddressId, setDeletingAddressId] = useState(null);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState(INITIAL_ADDRESS);
  const [addressErrors, setAddressErrors] = useState({});

  const [pincodeInput, setPincodeInput] = useState('');
  const [checkingPincode, setCheckingPincode] = useState(false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(null);
  const [deliveryMessage, setDeliveryMessage] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Referral State
  const [referralData, setReferralData] = useState(null);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [maxCoinsToUse, setMaxCoinsToUse] = useState(0);
  const [usingCoins, setUsingCoins] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [selectedSlot, setSelectedSlot] = useState('morning');

  const [placingOrder, setPlacingOrder] = useState(false);
const [deliveryTime, setDeliveryTime] = useState('');

  // Derived calculations with safe data access
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = getItemPrice(item);
      const quantity = item.quantity || 1;
      return sum + (parseFloat(price) || 0) * quantity;
    }, 0);
  }, [cartItems]);

  const baseDiscount = Math.round(subtotal * 0.1);
  const couponDiscount = appliedCoupon?.discount || 0;
  const referralDiscount = coinsToUse > 0 ? (coinsToUse / 10) : 0;
  const deliveryFee = deliveryAvailable ? (subtotal > 500 ? 0 : 40) : 0;
  const total = Math.max(0, subtotal - baseDiscount - couponDiscount - referralDiscount + deliveryFee);
  const coinsEarned = Math.round(total / 20);

  // ---------- LIFECYCLE ----------
  useEffect(() => {
    (async () => {
      await loadAddresses();
      await loadReferralData();
      computeAvailableCoupons();
    })();
  }, []);

  useEffect(() => {
    const maxUsable = Math.min(
      referralData?.user?.loyaltyCoins || 0,
      Math.floor((subtotal - baseDiscount - couponDiscount) * 10)
    );
    setMaxCoinsToUse(maxUsable);
    if (coinsToUse > maxUsable) {
      setCoinsToUse(maxUsable);
    }
  }, [subtotal, baseDiscount, couponDiscount, referralData]);

  // ---------- HELPERS ----------
  const getUserId = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user._id;
      }
      throw new Error('User not found. Please login again.');
    } catch (error) {
      console.error('Get user ID error:', error);
      throw error;
    }
  };

  async function loadAddresses() {
    try {
      setLoadingAddresses(true);
      const list = await api.getAddresses();
      setAddresses(Array.isArray(list) ? list : []);

      if (list && list.length) {
        const def = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(def._id || def.id || null);
        setDeliveryAvailable(true);
      }
    } catch (err) {
      console.warn('Load addresses failed:', err.message);
      Alert.alert('Error', 'Failed to load addresses');
    } finally {
      setLoadingAddresses(false);
    }
  }

  async function loadReferralData() {
    try {
      setLoadingReferrals(true);
      const data = await api.getUserReferrals();
      setReferralData(data);
    } catch (err) {
      console.warn('Load referrals failed:', err.message);
      // Don't show alert for referrals as it's not critical
    } finally {
      setLoadingReferrals(false);
    }
  }

  function computeAvailableCoupons() {
    const coupons = [];
    if (subtotal >= 2000) coupons.push({ code: 'SAVE200', discount: 200, description: '₹200 off on orders above ₹2000', minAmount: 2000 });
    if (subtotal >= 1000) coupons.push({ code: 'SAVE100', discount: 100, description: '₹100 off on orders above ₹1000', minAmount: 1000 });
    coupons.push({ code: 'FIRST1', discount: Math.max(0, subtotal - 1), description: "First order for just ₹1", minAmount: 1 });
    setAvailableCoupons(coupons);
  }

  // ---------- PINCODE VALIDATION ----------
  const validatePincode = (pincode) => {
    if (!pincode) {
      return 'Pincode is required';
    }
    if (!validators.pincode(pincode)) {
      return 'Enter a valid 6-digit pincode';
    }
    return '';
  };
const checkPincode = async () => {
  const pincodeError = validatePincode(pincodeInput);
  if (pincodeError) {
    Alert.alert('Invalid Pincode', pincodeError);
    return;
  }

  try {
    setCheckingPincode(true);

    const result = await api.checkPincode(pincodeInput);

    setDeliveryAvailable(result.deliverable);
    setDeliveryMessage(result.message);
    setNewAddress((s) => ({ ...s, pincode: pincodeInput }));

    if (result.deliverable) {
      // ⭐ DIRECTLY USE STORED DELIVERY TIME FROM BACKEND
      setDeliveryTime(result.zone?.deliveryTime || "");

      Alert.alert(
        'Delivery Available',
        `${result.message}\nDelivery Time: ${result.zone?.deliveryTime}`
      );
    } else {
      setDeliveryTime("");
      Alert.alert('Delivery Unavailable', result.message);
    }

  } catch (e) {
    Alert.alert('Error', 'Failed to check pincode availability');
  } finally {
    setCheckingPincode(false);
  }
};



  // ---------- ADDRESS VALIDATION ----------
  const validateAddressField = (field, value) => {
    const errors = { ...addressErrors };
    
    switch (field) {
      case 'fullName':
        if (!value?.trim()) {
          errors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.fullName = 'Name must be at least 2 characters';
        } else {
          delete errors.fullName;
        }
        break;
        
      case 'mobile':
        if (!value?.trim()) {
          errors.mobile = 'Mobile number is required';
        } else if (!validators.mobile(value)) {
          errors.mobile = 'Enter a valid 10-digit mobile number';
        } else {
          delete errors.mobile;
        }
        break;
        
      case 'pincode':
        // REMOVED PINCODE VALIDATION - only check if field exists
        if (!value?.trim()) {
          errors.pincode = 'Pincode is required';
        } else {
          delete errors.pincode;
        }
        break;
        
      case 'address':
        if (!value?.trim()) {
          errors.address = 'Address is required';
        } else if (value.trim().length < 10) {
          errors.address = 'Address must be at least 10 characters';
        } else {
          delete errors.address;
        }
        break;
        
      case 'city':
        if (!value?.trim()) {
          errors.city = 'City is required';
        } else {
          delete errors.city;
        }
        break;
        
      default:
        break;
    }
    
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddressForm = () => {
    // Validate all required fields
    const fieldsToValidate = ['fullName', 'mobile', 'pincode', 'address', 'city'];
    let isValid = true;
    
    fieldsToValidate.forEach(field => {
      if (!validateAddressField(field, newAddress[field])) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      Alert.alert('Validation Error', 'Please fix all errors before saving');
      return false;
    }
    
    return true;
  };

  // ---------- ADDRESS CRUD ----------
  const addAddress = async () => {
    if (!validateAddressForm()) return;
    
    try {
      // REMOVED PINCODE DELIVERY CHECK - save address regardless of delivery availability
      const saved = await api.saveAddress(newAddress);
      const final = saved.address || saved;
      
      setAddresses((prev) => [...prev, final]);
      setSelectedAddressId(final._id || final.id || null);
      setDeliveryAvailable(true); // Assume delivery is available when address is saved
      setNewAddress(INITIAL_ADDRESS);
      setAddressErrors({});
      setShowAddressModal(false);
      
      Alert.alert('Success', `Address added for ${final.fullName}`);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save address');
    }
  };

  const removeAddress = async (addrId) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: () => confirmRemove(addrId) 
      },
    ]);
  };

  const confirmRemove = async (addrId) => {
    try {
      setDeletingAddressId(addrId);
      await api.deleteAddress(addrId);
      
      const updated = addresses.filter((a) => (a._id || a.id) !== addrId);
      setAddresses(updated);
      
      if (selectedAddressId === addrId) {
        setSelectedAddressId(updated[0]?._id || updated[0]?.id || null);
      }
      
      Alert.alert('Success', 'Address deleted successfully');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to delete address');
    } finally {
      setDeletingAddressId(null);
    }
  };

  // ---------- COUPON ----------
  const applyCoupon = async (code) => {
    const input = (code || couponCode || '').trim();
    if (!input) {
      Alert.alert('Enter Coupon', 'Please enter a coupon code');
      return;
    }

    try {
      setValidatingCoupon(true);
      const res = await api.validateCoupon(input, subtotal);
      
      if (res && res.valid) {
        setAppliedCoupon({ 
          code: input, 
          discount: res.discount, 
          description: res.description 
        });
        Alert.alert('Coupon Applied', res.description || 'Coupon applied successfully');
      } else {
        Alert.alert('Invalid Coupon', res.message || 'This coupon cannot be applied to your order');
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // ---------- REFERRAL COINS HANDLING ----------
  const handleCoinsChange = (value) => {
    const numValue = parseInt(value) || 0;
    if (numValue <= maxCoinsToUse) {
      setCoinsToUse(numValue);
    }
  };

  const useMaxCoins = () => {
    setCoinsToUse(maxCoinsToUse);
  };

  const removeCoins = () => {
    setCoinsToUse(0);
  };

  const useReferralCoins = async (orderId) => {
    if (coinsToUse <= 0) return true;
    
    try {
      setUsingCoins(true);
      const response = await api.useReferralCoins(coinsToUse, orderId);
      
      if (response.success) {
        setReferralData(prev => ({
          ...prev,
          user: {
            ...prev?.user,
            loyaltyCoins: (prev?.user?.loyaltyCoins || 0) - coinsToUse
          }
        }));
        return true;
      } else {
        Alert.alert('Error', response.message || 'Failed to use referral coins');
        return false;
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to use referral coins');
      return false;
    } finally {
      setUsingCoins(false);
    }
  };

  // ---------- PLACE ORDER ----------
  const validateOrder = () => {
    if (!selectedAddressId) {
      Alert.alert('Select Address', 'Please select a delivery address');
      return false;
    }
    // REMOVED deliveryAvailable check - allow order placement even if delivery status is unknown
    if (selectedPayment === 'cod' && total > 5000) {
      Alert.alert('COD Limit Exceeded', 'Cash on Delivery is not available for orders above ₹5000');
      return false;
    }
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return false;
    }
    return true;
  };

  
  const placeOrder = async () => {
    if (!validateOrder()) return;
    
    try {
      setPlacingOrder(true);
      const addressObj = addresses.find((a) => (a._id || a.id) === selectedAddressId);
      
      if (!addressObj) {
        throw new Error('Selected address not found');
      }

      // Prepare order data WITHOUT referral coins initially
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId?._id || item.productId?.id || item._id,
          quantity: item.quantity || 1,
          price: getItemPrice(item),
          title: getItemTitle(item),
          image: getItemImage(item)
        })),
        address: addressObj,
        paymentMethod: selectedPayment,
        deliverySlot: TIME_SLOTS.find(slot => slot.id === selectedSlot)?.time,
        coupon: appliedCoupon || undefined,
        referralCoinsUsed: 0, // Start with 0
        subtotal: subtotal,
        discount: baseDiscount + couponDiscount, // No referral discount yet
        deliveryFee: deliveryFee,
        total: total - referralDiscount, // Include referral discount in calculation
        coinsEarned: coinsEarned,
      };

      // 1. Place order first
      const res = await api.placeOrder(orderData);
      
      if (res.success) {
        // 2. If coins were selected to use, apply them after order creation
        let coinsApplied = false;
        if (coinsToUse > 0) {
          try {
            const coinsResult = await api.useReferralCoins(coinsToUse, res.orderId);
            coinsApplied = coinsResult.success;
          } catch (coinsError) {
            console.warn('Failed to apply referral coins:', coinsError);
            // Continue even if coins application fails
          }
        }

        // Prepare success data for navigation
        const orderSuccessData = {
          orderId: res.orderId,
          total: res.total,
          coinsEarned: res.coinsEarned,
          coinsUsed: coinsApplied ? coinsToUse : 0,
          referralDiscount: coinsApplied ? referralDiscount : 0,
          paymentMethod: selectedPayment,
          deliverySlot: TIME_SLOTS.find(slot => slot.id === selectedSlot)?.time,
          address: addressObj,
          items: cartItems
        };

        // Reset state
        setCoinsToUse(0);
        setAppliedCoupon(null);
        setCouponCode('');

        // Navigate to Order Success page
        navigation.navigate('OrderSuccess', orderSuccessData);

      } else {
        throw new Error(res.message || 'Failed to place order');
      }

    } catch (err) {
      console.error('Order placement error:', err);
      Alert.alert('Order Failed', err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };



  // ---------- RENDERERS ----------
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <ArrowLeft size={24} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Checkout</Text>
    </View>
  );

  const renderPincode = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Check Delivery Availability</Text>
      <View style={styles.pincodeContainer}>
        <TextInput
          style={[
            styles.pincodeInput,
            pincodeInput && !validators.pincode(pincodeInput) && styles.inputError
          ]}
          placeholder="Enter 6-digit pincode"
          keyboardType="numeric"
          maxLength={6}
          value={pincodeInput}
          onChangeText={(text) => {
            setPincodeInput(text);
            if (text) validatePincode(text);
          }}
        />
        <TouchableOpacity 
          style={[
            styles.checkPincodeButton,
            (!pincodeInput || !validators.pincode(pincodeInput)) && styles.buttonDisabled
          ]} 
          onPress={checkPincode} 
          disabled={checkingPincode || !pincodeInput || !validators.pincode(pincodeInput)}
        >
          {checkingPincode ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.checkPincodeText}>Check</Text>
          )}
        </TouchableOpacity>
      </View>
      {pincodeInput && !validators.pincode(pincodeInput) && (
        <Text style={styles.errorText}>Please enter a valid 6-digit pincode</Text>
      )}
   {deliveryAvailable !== null && (
  <View style={{ marginTop: 10 }}>
    <Text style={{ 
      color: deliveryAvailable ? COLORS.success : COLORS.error, 
      fontSize: 14,
      fontWeight: "500"
    }}>
      {deliveryMessage}
    </Text>

    {deliveryAvailable && deliveryTime ? (
      <Text style={{ 
        color: COLORS.primary,
        fontSize: 15,
        fontWeight: "600",
        marginTop: 3,
      }}>
        🚚 Estimated Delivery: {deliveryTime}
      </Text>
    ) : null}
  </View>
)}

    </View>
  );

  const renderAddresses = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowAddressModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {loadingAddresses ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : addresses.length > 0 ? (
        addresses.map((addr) => {
          const aid = addr._id || addr.id;
          const isSelected = selectedAddressId === aid;
          return (
            <TouchableOpacity 
              key={aid} 
              style={[
                styles.addressCard, 
                isSelected && styles.addressSelected
              ]} 
              onPress={() => { 
                setSelectedAddressId(aid); 
                setDeliveryAvailable(true); // Assume delivery is available when address is selected
              }}
            >
              <View style={styles.addressHeader}>
                <Text style={styles.addressLabel}>{addr.label || 'Address'}</Text>
                <View style={styles.addressActions}>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Default</Text>
                    </View>
                  )}
                  <TouchableOpacity 
                    disabled={deletingAddressId === aid} 
                    onPress={() => removeAddress(aid)}
                  >
                    {deletingAddressId === aid ? (
                      <ActivityIndicator size="small" color={COLORS.error} />
                    ) : (
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.addressName}>{addr.fullName}</Text>
              <Text style={styles.addressText}>{addr.address}</Text>
              <Text style={styles.addressText}>
                {addr.locality ? `${addr.locality}, ` : ''}{addr.city}, {addr.state} - {addr.pincode}
              </Text>
              <Text style={styles.addressMobile}>Mobile: {addr.mobile}</Text>
            </TouchableOpacity>
          );
        })
      ) : (
        <TouchableOpacity 
          style={styles.noAddressCard} 
          onPress={() => setShowAddressModal(true)}
        >
          <MapPin size={24} color={COLORS.primary} />
          <Text style={styles.noAddressText}>Add your delivery address</Text>
          <Text style={styles.noAddressSubText}>Tap to add new address</Text>
        </TouchableOpacity>
      )}
    </View>
  );

const renderOrderSummary = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Order Summary</Text>
    {cartItems.map((item, index) => {
      const price = getItemPrice(item);
      const quantity = item.quantity || 1;
      const title = getItemTitle(item);
      
      return (
        <View 
          key={item._id || `${item.productId?._id || index}-${Math.random()}`} 
          style={styles.itemRow}
        >
          <Text style={styles.itemName}>{title} × {quantity}</Text>
          <Text style={styles.itemPrice}>{formatPrice(price * quantity)}</Text>
        </View>
      );
    })}
    <View style={styles.divider} />
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Subtotal</Text>
      <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
    </View>
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Discount (10%)</Text>
      <Text style={[styles.summaryValue, styles.discountText]}>
        -{formatPrice(baseDiscount)}
      </Text>
    </View>
    {appliedCoupon && (
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Coupon ({appliedCoupon.code})</Text>
        <Text style={[styles.summaryValue, styles.discountText]}>
          -{formatPrice(appliedCoupon.discount)}
        </Text>
      </View>
    )}
    {coinsToUse > 0 && (
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Referral Coins</Text>
        <Text style={[styles.summaryValue, styles.discountText]}>
          -{formatPrice(referralDiscount)}
        </Text>
      </View>
    )}
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>Delivery Fee</Text>
      <Text style={styles.summaryValue}>
        {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
      </Text>
    </View>
    <View style={[styles.summaryRow, styles.totalRow]}>
      <Text style={styles.totalLabel}>Total</Text>
      <Text style={styles.totalValue}>{formatPrice(total)}</Text>
    </View>
    {coinsEarned > 0 && (
      <Text style={styles.coinsText}>
        🪙 You'll earn {coinsEarned} loyalty coins
      </Text>
    )}
  </View>
);

const renderReferralCoins = () => {
  const availableCoins = referralData?.user?.loyaltyCoins || 0;
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Use Loyalty Coins</Text>
      
      {loadingReferrals ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : availableCoins > 0 ? (
        <View style={styles.referralStats}>
          <View style={styles.coinsBalance}>
            <Coins size={20} color="#F59E0B" />
            <Text style={styles.coinsBalanceText}>
              Available Coins: {availableCoins}
            </Text>
          </View>
          
          {referralData?.totalEarned > 0 && (
            <Text style={styles.referralEarnings}>
              Total Earned from Referrals: {formatPrice(referralData.totalEarned)}
            </Text>
          )}
          
          {referralData?.completed > 0 && (
            <Text style={styles.referralCount}>
              Completed Referrals: {referralData.completed}
            </Text>
          )}
        </View>
      ) : (
        <Text style={styles.noReferralsText}>
          You don't have any loyalty coins yet
        </Text>
      )}

      {maxCoinsToUse > 0 && (
        <View style={styles.coinsUsageContainer}>
          <Text style={styles.coinsUsageLabel}>
            Use coins for discount (10 coins = ₹1):
          </Text>
          
          <View style={styles.coinsInputContainer}>
            <TextInput
              style={styles.coinsInput}
              placeholder="0"
              keyboardType="numeric"
              value={coinsToUse.toString()}
              onChangeText={handleCoinsChange}
            />
            <Text style={styles.coinsMaxText}>Max: {maxCoinsToUse}</Text>
          </View>
          
          <View style={styles.coinsButtons}>
            <TouchableOpacity 
              style={styles.useMaxButton} 
              onPress={useMaxCoins}
              disabled={usingCoins}
            >
              <Text style={styles.useMaxText}>
                {usingCoins ? '...' : 'Use Max'}
              </Text>
            </TouchableOpacity>
            
            {coinsToUse > 0 && (
              <TouchableOpacity 
                style={styles.removeCoinsButton} 
                onPress={removeCoins}
                disabled={usingCoins}
              >
                <Text style={styles.removeCoinsText}>
                  {usingCoins ? '...' : 'Remove'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {coinsToUse > 0 && (
            <View style={styles.coinsDiscountInfo}>
              <Text style={styles.coinsDiscountText}>
                💰 You'll get {formatPrice(referralDiscount)} discount using {coinsToUse} coins
              </Text>
              <Text style={styles.coinsConversionText}>
                Conversion: {coinsToUse} coins = ₹{(coinsToUse / 10).toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}

      {maxCoinsToUse === 0 && availableCoins > 0 && (
        <Text style={styles.noCoinsMessage}>
          You can't use coins on this order. Minimum order value after discounts should be more than ₹0.
        </Text>
      )}
    </View>
  );
};

const renderCoupon = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Apply Coupon</Text>
    
    {availableCoupons.length > 0 && (
      <View style={styles.availableCoupons}>
        <Text style={styles.availableCouponsTitle}>Available Coupons:</Text>
        {availableCoupons.map((coupon) => (
          <View key={coupon.code} style={styles.couponCard}>
            <View style={styles.couponInfo}>
              <Text style={styles.couponCode}>{coupon.code}</Text>
              <Text style={styles.couponDescription}>{coupon.description}</Text>
              <Text style={styles.couponMinAmount}>
                Min: {formatPrice(coupon.minAmount)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.applyCouponBtn} 
              onPress={() => {
                setCouponCode(coupon.code);
                applyCoupon(coupon.code);
              }}
            >
              <Text style={styles.applyCouponText}>Apply</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    )}

    <View style={styles.couponContainer}>
      <TextInput 
        style={[styles.input, { flex: 1 }]} 
        placeholder="Enter coupon code" 
        value={couponCode} 
        onChangeText={setCouponCode} 
        editable={!validatingCoupon} 
      />
      {appliedCoupon ? (
        <TouchableOpacity 
          style={styles.removeBtn} 
          onPress={removeCoupon}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={styles.applyBtn} 
          onPress={() => applyCoupon()} 
          disabled={validatingCoupon}
        >
          {validatingCoupon ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.applyText}>Apply</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
    
    {appliedCoupon && (
      <Text style={styles.couponApplied}>✅ {appliedCoupon.description}</Text>
    )}
  </View>
);

const renderPayment = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Payment Method</Text>
    {PAYMENT_METHODS.map((method) => (
      <TouchableOpacity 
        key={method.id} 
        style={[
          styles.paymentOption, 
          selectedPayment === method.id && styles.selectedPayment
        ]} 
        onPress={() => setSelectedPayment(method.id)}
      >
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentIcon}>{method.icon}</Text>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>{method.name}</Text>
            <Text style={styles.paymentDescription}>{method.description}</Text>
          </View>
        </View>
        <View style={[
          styles.radioButton, 
          selectedPayment === method.id && styles.radioButtonSelected
        ]}>
          {selectedPayment === method.id && (
            <View style={styles.radioButtonInner} />
          )}
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

  const renderAddressModal = () => (
    <Modal 
      visible={showAddressModal} 
      animationType="slide" 
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add New Address</Text>
          <TouchableOpacity onPress={() => {
            setShowAddressModal(false);
            setNewAddress(INITIAL_ADDRESS);
            setAddressErrors({});
          }}>
            <X size={24} color={COLORS.text.secondary} />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput 
              style={[
                styles.input,
                addressErrors.fullName && styles.inputError
              ]} 
              placeholder="Enter full name" 
              value={newAddress.fullName} 
              onChangeText={(text) => {
                setNewAddress((s) => ({ ...s, fullName: text }));
                validateAddressField('fullName', text);
              }} 
            />
            {addressErrors.fullName && (
              <Text style={styles.errorText}>{addressErrors.fullName}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mobile Number *</Text>
            <TextInput 
              style={[
                styles.input,
                addressErrors.mobile && styles.inputError
              ]} 
              placeholder="Enter 10-digit mobile number" 
              keyboardType="phone-pad" 
              maxLength={10} 
              value={newAddress.mobile} 
              onChangeText={(text) => {
                setNewAddress((s) => ({ ...s, mobile: text }));
                validateAddressField('mobile', text);
              }} 
            />
            {addressErrors.mobile && (
              <Text style={styles.errorText}>{addressErrors.mobile}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Pincode *</Text>
            <TextInput 
              style={[
                styles.input,
                addressErrors.pincode && styles.inputError
              ]} 
              placeholder="Enter pincode" 
              keyboardType="numeric" 
              value={newAddress.pincode} 
              onChangeText={(text) => {
                setNewAddress((s) => ({ ...s, pincode: text }));
                validateAddressField('pincode', text);
              }} 
            />
            {addressErrors.pincode && (
              <Text style={styles.errorText}>{addressErrors.pincode}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address *</Text>
            <TextInput 
              style={[
                styles.input,
                styles.textArea,
                addressErrors.address && styles.inputError
              ]} 
              placeholder="House No, Building, Street" 
              multiline 
              numberOfLines={3}
              value={newAddress.address} 
              onChangeText={(text) => {
                setNewAddress((s) => ({ ...s, address: text }));
                validateAddressField('address', text);
              }} 
            />
            {addressErrors.address && (
              <Text style={styles.errorText}>{addressErrors.address}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Locality/Area</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter locality or area" 
              value={newAddress.locality} 
              onChangeText={(text) => setNewAddress((s) => ({ ...s, locality: text }))} 
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>City *</Text>
            <TextInput 
              style={[
                styles.input,
                addressErrors.city && styles.inputError
              ]} 
              placeholder="Enter city" 
              value={newAddress.city} 
              onChangeText={(text) => {
                setNewAddress((s) => ({ ...s, city: text }));
                validateAddressField('city', text);
              }} 
            />
            {addressErrors.city && (
              <Text style={styles.errorText}>{addressErrors.city}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>State</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter state" 
              value={newAddress.state} 
              onChangeText={(text) => setNewAddress((s) => ({ ...s, state: text }))} 
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Landmark (Optional)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter nearby landmark" 
              value={newAddress.landmark} 
              onChangeText={(text) => setNewAddress((s) => ({ ...s, landmark: text }))} 
            />
          </View>

          <View style={styles.addressTypeContainer}>
            <Text style={styles.addressTypeLabel}>Address Type:</Text>
            <View style={styles.addressTypeButtons}>
              {ADDRESS_TYPES.map((type) => (
                <TouchableOpacity 
                  key={type} 
                  style={[
                    styles.addressTypeButton, 
                    newAddress.label === type && styles.addressTypeSelected
                  ]} 
                  onPress={() => setNewAddress((s) => ({ ...s, label: type }))}
                >
                  <Text style={[
                    styles.addressTypeText, 
                    newAddress.label === type && styles.addressTypeTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.setDefaultContainer} 
            onPress={() => setNewAddress((s) => ({ ...s, isDefault: !s.isDefault }))}
          >
            <View style={[
              styles.checkbox, 
              newAddress.isDefault && styles.checkboxChecked
            ]}>
              {newAddress.isDefault && <Check size={14} color="#fff" />}
            </View>
            <Text style={styles.setDefaultText}>Set as default address</Text>
          </TouchableOpacity>
        </ScrollView>
        
        <View style={styles.modalFooter}>
          <TouchableOpacity 
            style={[
              styles.saveAddressButton,
              Object.keys(addressErrors).length > 0 && styles.buttonDisabled
            ]} 
            onPress={addAddress}
            disabled={Object.keys(addressErrors).length > 0}
          >
            <Text style={styles.saveAddressText}>Save Address</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderCheckoutBar = () => (
    <View style={styles.checkoutContainer}>
      <TouchableOpacity 
        style={[
          styles.placeOrderButton, 
          !selectedAddressId && styles.disabledButton
        ]} 
        disabled={!selectedAddressId || placingOrder} 
        onPress={placeOrder}
      >
        {placingOrder ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.placeOrderText}>
            {!selectedAddressId 
              ? 'Select Address' 
              : `Place Order - ${formatPrice(total)}`
            }
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // ---------- MAIN ----------
  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        {renderPincode()}
        {renderAddresses()}
        {renderOrderSummary()}
        {renderReferralCoins()}
        {renderCoupon()}
        {renderPayment()}
      </ScrollView>

      {renderAddressModal()}
      {renderCheckoutBar()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  scrollContent: {
    paddingBottom: 140
  },
  header: { 
    backgroundColor: COLORS.surface, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingTop: 48, 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.text.primary, 
    marginLeft: 16 
  },

  section: { 
    backgroundColor: COLORS.surface, 
    marginTop: 16, 
    marginHorizontal: 16, 
    borderRadius: 12, 
    padding: 16, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.text.primary 
  },

  pincodeContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  pincodeInput: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontSize: 15, 
    marginRight: 10 
  },
  checkPincodeButton: { 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 18, 
    paddingVertical: 10, 
    borderRadius: 8, 
    minWidth: 80, 
    alignItems: 'center' 
  },
  checkPincodeText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  deliveryStatus: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10, 
    padding: 10, 
    borderRadius: 8 
  },
  deliveryAvailable: { 
    backgroundColor: '#ECFDF5', 
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.success 
  },
  deliveryUnavailable: { 
    backgroundColor: '#FEF2F2', 
    borderLeftWidth: 4, 
    borderLeftColor: COLORS.error 
  },
  deliveryAvailableText: { 
    color: COLORS.success, 
    marginLeft: 8, 
    fontWeight: '500' 
  },
  deliveryUnavailableText: { 
    color: COLORS.error, 
    marginLeft: 8, 
    fontWeight: '500' 
  },

  addButton: { 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 6 
  },
  addButtonText: { 
    color: '#fff', 
    fontSize: 14, 
    fontWeight: '600' 
  },
  addressCard: { 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 10, 
    padding: 12, 
    marginBottom: 8 
  },
  addressSelected: { 
    borderColor: COLORS.primary, 
    backgroundColor: '#ECFDF5' 
  },
  addressHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  addressActions: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  addressLabel: { 
    fontWeight: '700', 
    color: COLORS.text.primary, 
    fontSize: 14 
  },
  defaultBadge: { 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 4, 
    marginRight: 8 
  },
  defaultBadgeText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: '600' 
  },
  deleteButtonText: { 
    color: COLORS.error, 
    fontSize: 12, 
    fontWeight: '600' 
  },
  addressName: { 
    fontWeight: '600', 
    color: COLORS.text.primary, 
    marginBottom: 2 
  },
  addressText: { 
    color: COLORS.text.secondary, 
    fontSize: 13, 
    marginBottom: 2 
  },
  addressMobile: { 
    color: COLORS.text.light, 
    fontSize: 12, 
    marginTop: 4 
  },
  noAddressCard: { 
    borderWidth: 2, 
    borderColor: COLORS.border, 
    borderStyle: 'dashed', 
    borderRadius: 10, 
    padding: 20, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  noAddressText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: COLORS.text.primary, 
    marginTop: 8 
  },
  noAddressSubText: { 
    fontSize: 14, 
    color: COLORS.text.secondary, 
    marginTop: 4 
  },

  modalContainer: { 
    flex: 1, 
    backgroundColor: COLORS.surface 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: COLORS.text.primary 
  },
  modalContent: { 
    flex: 1, 
    padding: 16 
  },
  modalFooter: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border 
  },

  addressTypeContainer: { 
    marginVertical: 16 
  },
  addressTypeLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#374151', 
    marginBottom: 8 
  },
  addressTypeButtons: {
    flexDirection: 'row', 
    flexWrap: 'wrap'
  },
  addressTypeButton: { 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    marginRight: 8, 
    marginBottom: 8 
  },
  addressTypeSelected: { 
    borderColor: COLORS.primary, 
    backgroundColor: '#ECFDF5' 
  },
  addressTypeText: { 
    color: COLORS.text.secondary, 
    fontWeight: '500' 
  },
  addressTypeTextSelected: { 
    color: COLORS.primary, 
    fontWeight: '600' 
  },

  setDefaultContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  checkbox: { 
    width: 20, 
    height: 20, 
    borderWidth: 2, 
    borderColor: COLORS.border, 
    borderRadius: 4, 
    marginRight: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  checkboxChecked: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary 
  },
  setDefaultText: { 
    fontSize: 14, 
    color: '#374151', 
    fontWeight: '500' 
  },
  saveAddressButton: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 16, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  saveAddressText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },

  availableCoupons: { 
    marginBottom: 16 
  },
  availableCouponsTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#374151', 
    marginBottom: 8 
  },
  couponCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 8 
  },
  couponInfo: { 
    flex: 1 
  },
  couponCode: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: COLORS.primary 
  },
  couponDescription: { 
    fontSize: 12, 
    color: '#374151', 
    marginTop: 2 
  },
  couponMinAmount: { 
    fontSize: 11, 
    color: COLORS.text.secondary, 
    marginTop: 2 
  },
  applyCouponBtn: { 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 4 
  },
  applyCouponText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '600' 
  },

  input: { 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    marginBottom: 10, 
    fontSize: 15 
  },
  itemRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 6 
  },
  itemName: { 
    fontSize: 14, 
    color: COLORS.text.primary,
    flex: 1,
    marginRight: 8
  },
  itemPrice: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  divider: { 
    borderBottomWidth: 1, 
    borderColor: COLORS.border, 
    marginVertical: 8 
  },
  summaryRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 4 
  },
  totalRow: { 
    marginTop: 6, 
    borderTopWidth: 1, 
    borderColor: COLORS.border, 
    paddingTop: 6 
  },
  summaryLabel: { 
    fontSize: 14, 
    color: COLORS.text.secondary 
  },
  summaryValue: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.text.primary 
  },
  discountText: { 
    color: COLORS.success 
  },
  totalLabel: { 
    fontSize: 16, 
    fontWeight: '700' 
  },
  totalValue: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.text.primary 
  },
  coinsText: { 
    backgroundColor: '#FEF3C7', 
    color: '#92400E', 
    fontWeight: '600', 
    textAlign: 'center', 
    padding: 10, 
    borderRadius: 6, 
    marginTop: 10 
  },
  couponContainer: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  applyBtn: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    marginLeft: 8, 
    minWidth: 80, 
    alignItems: 'center' 
  },
  applyText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  removeBtn: { 
    backgroundColor: COLORS.error, 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    marginLeft: 8, 
    minWidth: 80, 
    alignItems: 'center' 
  },
  removeText: { 
    color: '#fff', 
    fontWeight: '600' 
  },
  couponApplied: { 
    color: COLORS.success, 
    fontSize: 13, 
    marginTop: 8, 
    fontWeight: '600' 
  },

  paymentOption: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    borderRadius: 8, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  paymentHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  paymentIcon: { 
    fontSize: 20, 
    marginRight: 12 
  },
  paymentInfo: { 
    flex: 1 
  },
  paymentName: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: COLORS.text.primary, 
    marginBottom: 2 
  },
  paymentDescription: { 
    fontSize: 12, 
    color: COLORS.text.secondary 
  },
  selectedPayment: { 
    borderColor: COLORS.primary, 
    backgroundColor: '#ECFDF5' 
  },
  radioButton: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: COLORS.border, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  radioButtonSelected: { 
    borderColor: COLORS.primary 
  },
  radioButtonInner: { 
    width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: COLORS.primary 
  },

  checkoutContainer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: COLORS.surface, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border, 
    paddingHorizontal: 16, 
    paddingVertical: 16 
  },
  placeOrderButton: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 16, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  placeOrderText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  },
  disabledButton: { 
    backgroundColor: COLORS.border 
  },

  // Referral Coins Styles
  referralStats: { 
    marginBottom: 16 
  },
  coinsBalance: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  coinsBalanceText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#92400E', 
    marginLeft: 8 
  },
  referralEarnings: { 
    fontSize: 12, 
    color: COLORS.text.secondary, 
    marginBottom: 4 
  },
  referralCount: { 
    fontSize: 12, 
    color: COLORS.text.secondary 
  },
  remainingCoins: { 
    fontSize: 12, 
    color: COLORS.primary, 
    fontWeight: '600',
    marginTop: 4
  },
  noReferralsText: { 
    fontSize: 14, 
    color: COLORS.text.secondary, 
    textAlign: 'center', 
    marginVertical: 16 
  },

  coinsUsageContainer: { 
    marginTop: 12 
  },
  coinsUsageLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.text.primary, 
    marginBottom: 8 
  },
  coinsInputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  coinsInput: { 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 8, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontSize: 15, 
    width: 80,
    marginRight: 12
  },
  coinsMaxText: { 
    fontSize: 12, 
    color: COLORS.text.secondary 
  },
  coinsButtons: { 
    flexDirection: 'row', 
    marginBottom: 8 
  },
  useMaxButton: { 
    backgroundColor: '#F59E0B', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 6,
    marginRight: 8
  },
  useMaxText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  removeCoinsButton: { 
    backgroundColor: COLORS.error, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 6 
  },
  removeCoinsText: { 
    color: '#fff', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  
  coinsDiscountInfo: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6
  },
  coinsDiscountText: { 
    color: COLORS.success, 
    fontSize: 13, 
    fontWeight: '600',
    marginBottom: 2
  },
  coinsConversionText: {
    color: COLORS.text.secondary,
    fontSize: 11
  },
  
  noCoinsMessage: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic'
  },
  // Add these styles to your existing styles object

// Order Summary Styles
itemRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 8,
  borderBottomWidth: 1,
  borderBottomColor: COLORS.border,
},
itemName: {
  fontSize: 14,
  color: COLORS.text.primary,
  flex: 1,
},
itemPrice: {
  fontSize: 14,
  fontWeight: '600',
  color: COLORS.text.primary,
},
divider: {
  height: 1,
  backgroundColor: COLORS.border,
  marginVertical: 12,
},
summaryRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingVertical: 6,
},
totalRow: {
  borderTopWidth: 1,
  borderTopColor: COLORS.border,
  marginTop: 8,
  paddingTop: 12,
},
summaryLabel: {
  fontSize: 14,
  color: COLORS.text.secondary,
},
summaryValue: {
  fontSize: 14,
  fontWeight: '500',
  color: COLORS.text.primary,
},
totalLabel: {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.text.primary,
},
totalValue: {
  fontSize: 18,
  fontWeight: '700',
  color: COLORS.primary,
},
discountText: {
  color: COLORS.success,
},
coinsText: {
  fontSize: 14,
  color: COLORS.primary,
  textAlign: 'center',
  marginTop: 8,
  fontWeight: '500',
},

// Referral Coins Styles
referralStats: {
  marginBottom: 16,
},
coinsBalance: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},
coinsBalanceText: {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.text.primary,
  marginLeft: 8,
},
referralEarnings: {
  fontSize: 14,
  color: COLORS.text.secondary,
  marginBottom: 4,
},
referralCount: {
  fontSize: 14,
  color: COLORS.text.secondary,
},
noReferralsText: {
  fontSize: 14,
  color: COLORS.text.secondary,
  textAlign: 'center',
  fontStyle: 'italic',
},
coinsUsageContainer: {
  borderTopWidth: 1,
  borderTopColor: COLORS.border,
  paddingTop: 16,
},
coinsUsageLabel: {
  fontSize: 14,
  color: COLORS.text.primary,
  marginBottom: 8,
},
coinsInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 12,
},
coinsInput: {
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 8,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 16,
  width: 80,
  marginRight: 12,
},
coinsMaxText: {
  fontSize: 14,
  color: COLORS.text.secondary,
},
coinsButtons: {
  flexDirection: 'row',
  gap: 12,
  marginBottom: 12,
},
useMaxButton: {
  backgroundColor: COLORS.primary,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 6,
},
useMaxText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
},
removeCoinsButton: {
  backgroundColor: COLORS.error,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 6,
},
removeCoinsText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
},
coinsDiscountInfo: {
  backgroundColor: '#F0F9FF',
  padding: 12,
  borderRadius: 8,
},
coinsDiscountText: {
  fontSize: 14,
  color: COLORS.primary,
  fontWeight: '500',
  marginBottom: 4,
},
coinsConversionText: {
  fontSize: 12,
  color: COLORS.text.secondary,
},
noCoinsMessage: {
  fontSize: 14,
  color: COLORS.text.secondary,
  textAlign: 'center',
  fontStyle: 'italic',
  marginTop: 8,
},

// Coupon Styles
availableCoupons: {
  marginBottom: 16,
},
availableCouponsTitle: {
  fontSize: 14,
  fontWeight: '600',
  color: COLORS.text.primary,
  marginBottom: 8,
},
couponCard: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#F8FAFC',
  padding: 12,
  borderRadius: 8,
  marginBottom: 8,
  borderWidth: 1,
  borderColor: COLORS.border,
},
couponInfo: {
  flex: 1,
},
couponCode: {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.primary,
  marginBottom: 4,
},
couponDescription: {
  fontSize: 14,
  color: COLORS.text.primary,
  marginBottom: 4,
},
couponMinAmount: {
  fontSize: 12,
  color: COLORS.text.secondary,
},
applyCouponBtn: {
  backgroundColor: COLORS.primary,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 6,
},
applyCouponText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '500',
},
couponContainer: {
  flexDirection: 'row',
  gap: 12,
  alignItems: 'center',
},
applyBtn: {
  backgroundColor: COLORS.primary,
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 8,
  minWidth: 80,
  alignItems: 'center',
},
applyText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
removeBtn: {
  backgroundColor: COLORS.error,
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 8,
  minWidth: 80,
  alignItems: 'center',
},
removeText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
couponApplied: {
  fontSize: 14,
  color: COLORS.success,
  fontWeight: '500',
  marginTop: 8,
  textAlign: 'center',
},

// Payment Styles
paymentOption: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 16,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 8,
  marginBottom: 12,
},
selectedPayment: {
  borderColor: COLORS.primary,
  backgroundColor: '#F0F9FF',
},
paymentHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  flex: 1,
},
paymentIcon: {
  fontSize: 24,
  marginRight: 12,
},
paymentInfo: {
  flex: 1,
},
paymentName: {
  fontSize: 16,
  fontWeight: '600',
  color: COLORS.text.primary,
  marginBottom: 4,
},
paymentDescription: {
  fontSize: 14,
  color: COLORS.text.secondary,
},
radioButton: {
  width: 20,
  height: 20,
  borderRadius: 10,
  borderWidth: 2,
  borderColor: COLORS.border,
  alignItems: 'center',
  justifyContent: 'center',
},
radioButtonSelected: {
  borderColor: COLORS.primary,
},
radioButtonInner: {
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: COLORS.primary,
},
});