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
import { ArrowLeft, MapPin, Check, X, Coins, Wallet } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://31.97.233.212:5000/api';

const COLORS = {
  primary: '#00A86B',
  success: '#059669',
  error: '#DC2626',
  warning: '#F59E0B',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: { primary: '#111827', secondary: '#6B7280', light: '#9CA3AF' },
  border: '#E5E7EB',
  wallet: '#8B5CF6',
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

// Check if a product is a 1rs offer product
const is1RsOfferProduct = (product) => {
  if (!product) return false;
  
  // Check if product has offerCategory with name "1rs"
  if (product.category?.offerCategory?.name === '1rs') {
    return true;
  }
  
  // Also check if product price is 1 (as fallback)
  const price = getItemPrice(product);
  return price === 1 || price === '1';
};

// Extract 1rs offer products from cart
const get1RsOfferProducts = (cartItems) => {
  return cartItems.filter(item => {
    const product = item.productId || item;
    return is1RsOfferProduct(product);
  });
};

// Get product IDs from cart items
const getProductIdsFromCart = (cartItems) => {
  return cartItems.map(item => {
    if (item.productId?._id) return item.productId._id;
    if (item.productId?.id) return item.productId.id;
    if (item._id) return item._id;
    return null;
  }).filter(id => id !== null);
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
  
// In your frontend API service (api object)
checkOfferPurchaseEligibility: async (productIds) => {
  try {
    // First get the user ID
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      return { eligible: true, restrictedProducts: [], message: '' };
    }
    
    const user = JSON.parse(userData);
    const userId = user.id;
    
    if (!userId) {
      return { eligible: true, restrictedProducts: [], message: '' };
    }

    const data = await api.request(`/orders/check-offer-eligibility/${userId}`, {
      method: 'POST',
      body: { productIds }
    });
    
    return {
      eligible: data.eligible || true,
      restrictedProducts: data.restrictedProducts || [],
      message: data.message || ''
    };
  } catch (error) {
    console.error('Offer eligibility check error:', error);
    return { eligible: true, restrictedProducts: [], message: '' };
  }
},

getOfferPurchaseHistory: async () => {
  try {
    // First get the user ID
    const userData = await AsyncStorage.getItem('user');
    if (!userData) {
      return { purchasedOffers: [], lastPurchaseDate: null, canPurchase: true };
    }
    
    const user = JSON.parse(userData);
    const userId = user.id;
    
    if (!userId) {
      return { purchasedOffers: [], lastPurchaseDate: null, canPurchase: true };
    }

    const data = await api.request(`/orders/offer-purchase-history/${userId}`);
    
    return {
      purchasedOffers: data.purchasedOffers || [],
      lastPurchaseDate: data.lastPurchaseDate,
      canPurchase: data.canPurchase || true
    };
  } catch (error) {
    console.error('Get offer purchase history error:', error);
    return { purchasedOffers: [], lastPurchaseDate: null, canPurchase: true };
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
  
  getAvailableCoupons: async () => api.request('/coupons/available'),
  
  validateCoupon: async (couponCode, subtotal) =>
    api.request('/coupon/validate', { 
      method: 'POST', 
      body: { couponCode, subtotal } 
    }),
  
  getUserLoyaltyCoins: async () => {
    try {
      const data = await api.request('/referrals/user');
      return {
        loyaltyCoins: data?.user?.loyaltyCoins || 0,
        totalEarned: data?.totalEarned || 0,
        completed: data?.completed || 0
      };
    } catch (error) {
      console.error('Get loyalty coins error:', error);
      return { loyaltyCoins: 0, totalEarned: 0, completed: 0 };
    }
  },
  
  useWalletCoins: async (coinsToUse, orderId) =>
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
  { id: 'wallet', name: 'Wallet', icon: '💵', description: 'Pay using your loyalty coins' },
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
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  
  // Loyalty Coins & Wallet State
  const [loyaltyCoins, setLoyaltyCoins] = useState(0);
  const [loadingCoins, setLoadingCoins] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [selectedSlot, setSelectedSlot] = useState('morning');
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletDiscount, setWalletDiscount] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState('');
  
  // Offer Product Restriction State
  const [checkingOfferEligibility, setCheckingOfferEligibility] = useState(false);
  const [offerEligibility, setOfferEligibility] = useState({
    eligible: true,
    restrictedProducts: [],
    message: ''
  });
  const [offerPurchaseHistory, setOfferPurchaseHistory] = useState({
    purchasedOffers: [],
    lastPurchaseDate: null,
    canPurchase: true
  });

  // Derived calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = getItemPrice(item);
      const quantity = item.quantity || 1;
      return sum + (parseFloat(price) || 0) * quantity;
    }, 0);
  }, [cartItems]);

  const baseDiscount = Math.round(subtotal * 0.1);
  const couponDiscount = appliedCoupon?.discount || 0;
  const deliveryFee = deliveryAvailable ? (subtotal > 500 ? 0 : 40) : 0;
  
  // Calculate wallet discount
  const calculatedWalletDiscount = useMemo(() => {
    if (selectedPayment !== 'wallet' || !useWalletBalance || walletBalance <= 0) {
      return 0;
    }
    
    const totalBeforeWallet = subtotal - baseDiscount - couponDiscount + deliveryFee;
    const maxWalletDiscount = Math.min(walletBalance, totalBeforeWallet);
    
    return Math.floor(maxWalletDiscount);
  }, [selectedPayment, useWalletBalance, walletBalance, subtotal, baseDiscount, couponDiscount, deliveryFee]);

  // Calculate coins needed
  const coinsNeeded = useMemo(() => {
    if (calculatedWalletDiscount <= 0) return 0;
    return calculatedWalletDiscount * 100;
  }, [calculatedWalletDiscount]);

  // Calculate final total
  const total = useMemo(() => {
    const walletDiscount = selectedPayment === 'wallet' && useWalletBalance ? calculatedWalletDiscount : 0;
    return Math.max(0, subtotal - baseDiscount - couponDiscount - walletDiscount + deliveryFee);
  }, [subtotal, baseDiscount, couponDiscount, deliveryFee, selectedPayment, useWalletBalance, calculatedWalletDiscount]);

  const coinsEarned = Math.round(total / 20);

  // Get 1rs offer products in cart
  const offerProducts = useMemo(() => get1RsOfferProducts(cartItems), [cartItems]);
  const hasRestrictedProducts = offerEligibility.restrictedProducts.length > 0;
  const productIds = useMemo(() => getProductIdsFromCart(cartItems), [cartItems]);

  // ---------- LIFECYCLE ----------
  useEffect(() => {
    (async () => {
      await loadAddresses();
      await loadLoyaltyCoins();
      await loadAvailableCoupons();
      await loadOfferPurchaseHistory();
      await checkOfferEligibility(); // Check eligibility on load
    })();
  }, []);

  useEffect(() => {
    if (selectedPayment === 'wallet') {
      setUseWalletBalance(true);
    } else {
      setUseWalletBalance(false);
    }
  }, [selectedPayment]);

  useEffect(() => {
    const newWalletBalance = loyaltyCoins / 100;
    setWalletBalance(newWalletBalance);
  }, [loyaltyCoins]);

  // Check offer eligibility when cart changes
  useEffect(() => {
    if (productIds.length > 0 && offerProducts.length > 0) {
      checkOfferEligibility();
    }
  }, [productIds, offerProducts.length]);

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

  async function loadLoyaltyCoins() {
    try {
      setLoadingCoins(true);
      
      const cachedCoins = await AsyncStorage.getItem('loyaltyCoins');
      if (cachedCoins) {
        setLoyaltyCoins(parseInt(cachedCoins) || 0);
      }
      
      const data = await api.getUserLoyaltyCoins();
      const coins = data.loyaltyCoins || 0;
      
      setLoyaltyCoins(coins);
      await AsyncStorage.setItem('loyaltyCoins', coins.toString());
      
      console.log('Loaded loyalty coins:', coins);
    } catch (err) {
      console.warn('Load loyalty coins failed:', err.message);
    } finally {
      setLoadingCoins(false);
    }
  }

  async function loadAvailableCoupons() {
    try {
      setLoadingCoupons(true);
      const coupons = await api.getAvailableCoupons();
      
      const now = new Date();
      const validCoupons = coupons.filter(coupon => {
        if (!coupon.active) return false;
        if (coupon.minOrder && subtotal < coupon.minOrder) return false;
        return true;
      });
      
      setAvailableCoupons(validCoupons);
    } catch (err) {
      console.warn('Load coupons failed:', err.message);
      setAvailableCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  }

  // ---------- OFFER ELIGIBILITY ----------
  const checkOfferEligibility = async () => {
    try {
      if (productIds.length === 0) return true;
      
      setCheckingOfferEligibility(true);
      const eligibilityResult = await api.checkOfferPurchaseEligibility(productIds);
      
      setOfferEligibility(eligibilityResult);
      
      return eligibilityResult.eligible;
    } catch (error) {
      console.error('Offer eligibility check error:', error);
      return true; // Fail-safe: allow purchase if API fails
    } finally {
      setCheckingOfferEligibility(false);
    }
  };

  const loadOfferPurchaseHistory = async () => {
    try {
      const history = await api.getOfferPurchaseHistory();
      setOfferPurchaseHistory(history);
    } catch (error) {
      console.error('Failed to load offer purchase history:', error);
    }
  };

  const updateLocalCoins = async (newCoins) => {
    try {
      await AsyncStorage.setItem('loyaltyCoins', newCoins.toString());
      setLoyaltyCoins(newCoins);
    } catch (error) {
      console.error('Failed to update local coins:', error);
    }
  };

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
      const saved = await api.saveAddress(newAddress);
      const final = saved.address || saved;
      
      setAddresses((prev) => [...prev, final]);
      setSelectedAddressId(final._id || final.id || null);
      setDeliveryAvailable(true);
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
        if (res.minOrder && subtotal < res.minOrder) {
          Alert.alert(
            'Coupon Not Applicable',
            `This coupon requires a minimum order of ₹${res.minOrder}`
          );
          return;
        }

        setAppliedCoupon({
          code: input,
          discount: res.discount,
          type: res.type,
          description: res.description,
        });

        Alert.alert('Coupon Applied', res.description || 'Coupon applied successfully');
      } else {
        Alert.alert('Invalid Coupon', res?.message || 'This coupon cannot be applied to your order');
      }
    } catch (err) {
      Alert.alert('Error', err?.message || 'Failed to validate coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const formatCouponDiscount = (coupon) => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}% off`;
    } else {
      return `₹${coupon.value} off`;
    }
  };

  const formatCouponMinOrder = (coupon) => {
    if (coupon.minOrder) {
      return `Min order: ₹${coupon.minOrder}`;
    }
    return 'No minimum order';
  };

  // ---------- WALLET VALIDATION ----------
  const validateWalletPayment = () => {
    if (selectedPayment !== 'wallet') return true;
    
    if (!useWalletBalance) {
      Alert.alert('Wallet Payment', 'Please enable wallet balance usage');
      return false;
    }
    
    if (loyaltyCoins <= 0) {
      Alert.alert('Insufficient Coins', 'You don\'t have any loyalty coins in your wallet');
      return false;
    }
    
    if (coinsNeeded > loyaltyCoins) {
      Alert.alert('Insufficient Coins', `You need ${coinsNeeded} coins but only have ${loyaltyCoins}`);
      return false;
    }
    
    return true;
  };

  // ---------- PLACE ORDER ----------
  const validateOrder = async () => {
    // Check 1rs offer product restriction first
    if (offerProducts.length > 0 && !offerEligibility.eligible) {
      Alert.alert(
        'Offer Product Restriction',
        'You cannot purchase 1rs offer products as you have already purchased them this month.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
      return false;
    }
    
    if (!selectedAddressId) {
      Alert.alert('Select Address', 'Please select a delivery address');
      return false;
    }
    
    if (!validateWalletPayment()) {
      return false;
    }
    
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
    // First validate order (including offer product check)
    const isValid = await validateOrder();
    if (!isValid) return;
    
    try {
      setPlacingOrder(true);
      const addressObj = addresses.find((a) => (a._id || a.id) === selectedAddressId);
      
      if (!addressObj) {
        throw new Error('Selected address not found');
      }

      // Prepare order data
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
        subtotal: subtotal,
        discount: baseDiscount + couponDiscount,
        deliveryFee: deliveryFee,
        total: total + (selectedPayment === 'wallet' && useWalletBalance ? calculatedWalletDiscount : 0),
        coinsEarned: coinsEarned,
      };

      // Place order
      const res = await api.placeOrder(orderData);
      
      if (res.success) {
        // Apply wallet coins if used
        let walletApplied = false;
        if (selectedPayment === 'wallet' && useWalletBalance && coinsNeeded > 0) {
          try {
            const coinsResult = await api.useWalletCoins(coinsNeeded, res.orderId);
            
            if (coinsResult.success) {
              walletApplied = true;
              const newCoinsBalance = loyaltyCoins - coinsNeeded;
              await updateLocalCoins(newCoinsBalance);
            }
          } catch (coinsError) {
            console.warn('Failed to apply wallet coins:', coinsError);
          }
        }

        // Navigate to success page
        navigation.navigate('OrderSuccess', {
          orderId: res.orderId,
          total: walletApplied ? total : res.total,
          paymentMethod: selectedPayment,
          deliverySlot: TIME_SLOTS.find(slot => slot.id === selectedSlot)?.time,
          address: addressObj,
          items: cartItems,
          deliveryTime: deliveryTime,
          walletUsed: walletApplied ? {
            coinsUsed: coinsNeeded,
            amount: calculatedWalletDiscount,
            remainingCoins: loyaltyCoins - coinsNeeded
          } : undefined,
        });

        // Reset state
        setAppliedCoupon(null);
        setCouponCode('');
        setUseWalletBalance(false);

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
                setDeliveryAvailable(true);
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

  const renderOfferProductWarning = () => {
    if (offerProducts.length === 0) return null;
    
    return (
      <View style={styles.offerWarningSection}>
        <Text style={styles.offerWarningTitle}>
          ⚠️ 1rs Offer Products ({offerProducts.length} item{offerProducts.length > 1 ? 's' : ''})
        </Text>
        
        {checkingOfferEligibility ? (
          <ActivityIndicator size="small" color={COLORS.warning} style={{ marginTop: 8 }} />
        ) : (
          <>
            {!offerEligibility.eligible ? (
              <View style={styles.restrictedProductsContainer}>
                <Text style={styles.restrictedProductsTitle}>
                  You cannot purchase these 1rs products:
                </Text>
                {offerEligibility.restrictedProducts.map(productId => {
                  const item = cartItems.find(item => {
                    const id = item.productId?._id || item.productId?.id || item._id;
                    return id === productId;
                  });
                  return item ? (
                    <Text key={productId} style={styles.restrictedProduct}>
                      • {getItemTitle(item)} - {formatPrice(getItemPrice(item))}
                    </Text>
                  ) : null;
                })}
                <Text style={styles.offerRuleText}>
                  Rule: Only 1 purchase per month allowed for 1rs offer products
                </Text>
              </View>
            ) : (
              <View style={styles.offerInfoContainer}>
                <Text style={styles.offerInfoText}>
                  You're purchasing {offerProducts.length} 1rs offer product{offerProducts.length > 1 ? 's' : ''}
                </Text>
                <Text style={styles.offerRuleText}>
                  Note: You can purchase 1rs offer products only once per month
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      {cartItems.map((item, index) => {
        const price = getItemPrice(item);
        const quantity = item.quantity || 1;
        const title = getItemTitle(item);
        const isOfferProduct = is1RsOfferProduct(item.productId || item);
        
        return (
          <View 
            key={item._id || `${item.productId?._id || index}-${Math.random()}`} 
            style={styles.itemRow}
          >
            <View style={styles.itemTitleContainer}>
              <Text style={styles.itemName}>
                {title} × {quantity}
              </Text>
              {isOfferProduct && (
                <Text style={styles.offerBadge}>1rs Offer</Text>
              )}
            </View>
            <Text style={[
              styles.itemPrice,
              isOfferProduct && styles.offerProductPrice
            ]}>
              {formatPrice(price * quantity)}
            </Text>
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
            -{formatPrice(couponDiscount)}
          </Text>
        </View>
      )}
      {selectedPayment === 'wallet' && useWalletBalance && calculatedWalletDiscount > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Wallet Payment</Text>
          <Text style={[styles.summaryValue, styles.discountText]}>
            -{formatPrice(calculatedWalletDiscount)}
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
      
      {selectedPayment === 'wallet' && useWalletBalance && calculatedWalletDiscount > 0 && (
        <View style={styles.walletSummary}>
          <View style={styles.coinsInfo}>
            <Coins size={16} color={COLORS.warning} />
            <Text style={styles.coinsInfoText}>
              Using {coinsNeeded} coins ({formatPrice(calculatedWalletDiscount)})
            </Text>
          </View>
          <Text style={styles.remainingCoins}>
            Remaining coins: {loyaltyCoins - coinsNeeded}
          </Text>
          <Text style={styles.conversionRate}>
            Conversion: 1000 coins = ₹10
          </Text>
        </View>
      )}
    </View>
  );

  const renderCoupon = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Apply Coupon</Text>
      
      {loadingCoupons ? (
        <ActivityIndicator size="large" color={COLORS.primary} />
      ) : availableCoupons.length > 0 ? (
        <View style={styles.availableCoupons}>
          <Text style={styles.availableCouponsTitle}>Available Coupons:</Text>
          {availableCoupons.map((coupon) => (
            <View key={coupon._id} style={styles.couponCard}>
              <View style={styles.couponInfo}>
                <Text style={styles.couponCode}>{coupon.code}</Text>
                <Text style={styles.couponDescription}>{coupon.description}</Text>
                <View style={styles.couponDetails}>
                  <Text style={styles.couponValue}>
                    {formatCouponDiscount(coupon)}
                  </Text>
                  <Text style={styles.couponMinAmount}>
                    {formatCouponMinOrder(coupon)}
                  </Text>
                </View>
                {coupon.expiresAt && (
                  <Text style={styles.couponExpiry}>
                    Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.applyCouponBtn} 
                onPress={() => {
                  setCouponCode(coupon.code);
                  applyCoupon(coupon.code);
                }}
                disabled={validatingCoupon}
              >
                <Text style={styles.applyCouponText}>
                  {validatingCoupon && couponCode === coupon.code ? '...' : 'Apply'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.noCouponsText}>
          No coupons available for this order
        </Text>
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
            disabled={validatingCoupon}
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.applyBtn} 
            onPress={() => applyCoupon()} 
            disabled={validatingCoupon || !couponCode.trim()}
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
        <View key={method.id}>
          <TouchableOpacity 
            style={[
              styles.paymentOption, 
              selectedPayment === method.id && styles.selectedPayment,
              method.id === 'wallet' && styles.walletOption
            ]} 
            onPress={() => {
              setSelectedPayment(method.id);
              if (method.id === 'wallet') {
                setUseWalletBalance(true);
              } else {
                setUseWalletBalance(false);
              }
            }}
          >
            <View style={styles.paymentHeader}>
              <Text style={styles.paymentIcon}>{method.icon}</Text>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>{method.name}</Text>
                <Text style={styles.paymentDescription}>{method.description}</Text>
                
                {method.id === 'wallet' && (
                  <View style={styles.walletBalanceContainer}>
                    <View style={styles.walletBalanceRow}>
                      <Wallet size={14} color={COLORS.wallet} />
                      <Text style={styles.walletBalanceText}>
                        Balance: {formatPrice(walletBalance)} ({loyaltyCoins} coins)
                      </Text>
                    </View>
                  </View>
                )}
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
          
          {method.id === 'wallet' && selectedPayment === 'wallet' && (
            <View style={styles.walletUsageContainer}>
              <TouchableOpacity 
                style={styles.walletToggle}
                onPress={() => setUseWalletBalance(!useWalletBalance)}
                disabled={loyaltyCoins <= 0}
              >
                <View style={[
                  styles.toggleSwitch,
                  useWalletBalance && styles.toggleSwitchOn,
                  loyaltyCoins <= 0 && styles.toggleSwitchDisabled
                ]}>
                  <View style={[
                    styles.toggleCircle,
                    useWalletBalance && styles.toggleCircleOn
                  ]} />
                </View>
                <Text style={[
                  styles.walletToggleText,
                  loyaltyCoins <= 0 && styles.walletToggleTextDisabled
                ]}>
                  {loyaltyCoins <= 0 ? 'No coins available' : `Use wallet balance`}
                </Text>
              </TouchableOpacity>
              
              {useWalletBalance && loyaltyCoins > 0 && (
                <View style={styles.walletDetails}>
                  <Text style={styles.walletConversion}>
                    💰 Conversion: 1000 coins = ₹10
                  </Text>
                  {calculatedWalletDiscount > 0 ? (
                    <>
                      <Text style={styles.walletDiscount}>
                        You'll save: {formatPrice(calculatedWalletDiscount)} using {coinsNeeded} coins
                      </Text>
                      <Text style={styles.walletRemaining}>
                        Remaining coins: {loyaltyCoins - coinsNeeded}
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.walletNoDiscount}>
                      Wallet balance will be applied to your order
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
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

  const renderCheckoutBar = () => {
    const isDisabled = !selectedAddressId || placingOrder || !offerEligibility.eligible;
    
    return (
      <View style={styles.checkoutContainer}>
        {!offerEligibility.eligible && (
          <View style={styles.restrictedWarningContainer}>
            <Text style={styles.restrictedWarningText}>
              ⚠️ Remove restricted 1rs products to place order
            </Text>
          </View>
        )}
        <TouchableOpacity 
          style={[
            styles.placeOrderButton, 
            isDisabled && styles.disabledButton
          ]} 
          disabled={isDisabled} 
          onPress={placeOrder}
        >
          {placingOrder ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>
              {!selectedAddressId 
                ? 'Select Address' 
                : !offerEligibility.eligible
                  ? 'Cannot Place Order'
                  : `Place Order - ${formatPrice(total)}`
              }
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

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
        {renderOfferProductWarning()}
        {renderOrderSummary()}
        {renderCoupon()}
        {renderPayment()}
      </ScrollView>

      {renderAddressModal()}
      {renderCheckoutBar()}
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  // Pincode styles
  pincodeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  pincodeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  checkPincodeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: COLORS.text.light,
  },
  checkPincodeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  // Address styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  addressCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  addressSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  deleteButtonText: {
    color: COLORS.error,
    fontSize: 14,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  addressMobile: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  noAddressCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noAddressText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginTop: 8,
  },
  noAddressSubText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  // Offer Product Warning styles
  offerWarningSection: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#FFEEBA',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
  },
  offerWarningTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#856404',
  },
  restrictedProductsContainer: {
    backgroundColor: '#F8D7DA',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  restrictedProductsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#721C24',
    marginBottom: 8,
  },
  restrictedProduct: {
    fontSize: 13,
    color: '#721C24',
    marginLeft: 8,
    marginBottom: 4,
  },
  offerInfoContainer: {
    backgroundColor: '#D1ECF1',
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  offerInfoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0C5460',
    marginBottom: 6,
  },
  offerRuleText: {
    fontSize: 12,
    color: '#856404',
    fontStyle: 'italic',
    marginTop: 8,
  },
  // Order Summary styles
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  itemName: {
    fontSize: 14,
    color: COLORS.text.primary,
    flex: 1,
  },
  offerBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.error,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  offerProductPrice: {
    color: COLORS.error,
    fontWeight: '600',
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
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  discountText: {
    color: COLORS.success,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  walletSummary: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  coinsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  coinsInfoText: {
    fontSize: 14,
    color: '#92400E',
    fontWeight: '500',
  },
  remainingCoins: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 4,
  },
  conversionRate: {
    fontSize: 12,
    color: '#92400E',
    fontStyle: 'italic',
  },
  // Coupon styles
  availableCoupons: {
    marginBottom: 12,
  },
  availableCouponsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  couponCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  couponInfo: {
    flex: 1,
  },
  couponCode: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
  },
  couponDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  couponDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  couponValue: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.success,
  },
  couponMinAmount: {
    fontSize: 12,
    color: COLORS.text.light,
  },
  couponExpiry: {
    fontSize: 11,
    color: COLORS.text.light,
    marginTop: 2,
  },
  applyCouponBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  applyCouponText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  noCouponsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  couponContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  applyBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 80,
  },
  applyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  removeBtn: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    minWidth: 80,
  },
  removeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  couponApplied: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
    marginTop: 8,
  },
  // Payment styles
  paymentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedPayment: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  walletOption: {
    borderColor: COLORS.wallet,
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
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  walletBalanceContainer: {
    marginTop: 4,
  },
  walletBalanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  walletBalanceText: {
    fontSize: 11,
    color: COLORS.wallet,
    fontWeight: '500',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
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
  walletUsageContainer: {
    marginLeft: 44,
    marginBottom: 12,
  },
  walletToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D1D5DB',
    padding: 2,
    marginRight: 8,
  },
  toggleSwitchOn: {
    backgroundColor: COLORS.wallet,
  },
  toggleSwitchDisabled: {
    backgroundColor: '#E5E7EB',
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    transform: [{ translateX: 0 }],
  },
  toggleCircleOn: {
    transform: [{ translateX: 20 }],
  },
  walletToggleText: {
    fontSize: 13,
    color: COLORS.text.primary,
  },
  walletToggleTextDisabled: {
    color: COLORS.text.light,
  },
  walletDetails: {
    backgroundColor: '#F5F3FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  walletConversion: {
    fontSize: 12,
    color: COLORS.wallet,
    marginBottom: 4,
  },
  walletDiscount: {
    fontSize: 13,
    color: COLORS.text.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  walletRemaining: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  walletNoDiscount: {
    fontSize: 13,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 6,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  addressTypeContainer: {
    marginBottom: 16,
  },
  addressTypeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  addressTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  addressTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
  },
  addressTypeSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#E6F7F0',
  },
  addressTypeText: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  addressTypeTextSelected: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  setDefaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  setDefaultText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  saveAddressButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveAddressText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Checkout bar styles
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  restrictedWarningContainer: {
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  restrictedWarningText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
    textAlign: 'center',
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.text.light,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});