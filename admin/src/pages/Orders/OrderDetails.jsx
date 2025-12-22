// src/pages/Orders/OrderDetails.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack,
  Refresh as RefreshIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as CoinsIcon,
  Add as AddIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

// Direct API calls
const API_BASE_URL = 'http://31.97.233.212:5000/api';

const fetchOrderDetails = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required. Please login again.');
    }

    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Session expired. Please login again.');
      }
      if (response.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error(`Failed to fetch order details: ${response.status}`);
    }
    
    const data = await response.json();
    return data.order || null;
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch order details');
  }
};

const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update order status');
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

const addLoyaltyCoins = async (userId, coins, reason, orderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/loyalty-coins`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        coins: parseInt(coins),
        reason: reason,
        orderId: orderId
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add loyalty coins');
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

const fetchUserLoyaltyTransactions = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/loyalty-transactions?limit=5`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch loyalty transactions');
    }
    
    const data = await response.json();
    return data.transactions || [];
  } catch (error) {
    throw new Error(error.message);
  }
};

const OrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [coinsDialogOpen, setCoinsDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loyaltyCoins, setLoyaltyCoins] = useState('');
  const [coinsReason, setCoinsReason] = useState('');
  const [loyaltyTransactions, setLoyaltyTransactions] = useState([]);
  const [userLoyaltyData, setUserLoyaltyData] = useState(null);

  const orderSteps = [
    { label: 'New', value: 'new' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
  ];

  const predefinedReasons = [
    'Customer service compensation',
    'Promotional bonus',
    'Referral reward',
    'Order issue resolution',
    'Special offer',
    'Customer appreciation',
    'Service delay compensation',
    'Product quality issue',
    'Other'
  ];

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      setError(null);
      const orderData = await fetchOrderDetails(id);
      
      if (!orderData) {
        throw new Error('Order data not found');
      }
      
      setOrder(orderData);

      // Fetch user loyalty data if user exists
      if (orderData.userId && orderData.userId._id) {
        await fetchUserLoyaltyInfo(orderData.userId._id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch order details');
      console.error('Order details fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLoyaltyInfo = async (userId) => {
    try {
      const transactions = await fetchUserLoyaltyTransactions(userId);
      setLoyaltyTransactions(transactions);
      
      // Set user loyalty data
      setUserLoyaltyData({
        userId: userId,
        currentCoins: transactions[0] ? transactions[0].newBalance : 0
      });
    } catch (err) {
      console.error('Failed to fetch loyalty info:', err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderData();
    }
  }, [id]);

  const getCurrentStep = () => {
    if (!order || !order.orderStatus) return 0;
    const statusIndex = orderSteps.findIndex(step => step.value === order.orderStatus);
    return statusIndex >= 0 ? statusIndex : 0;
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(order._id, newStatus);
      await fetchOrderData(); // Refresh order data
      setStatusDialogOpen(false);
      setSelectedStatus('');
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddLoyaltyCoins = async () => {
    if (!loyaltyCoins || loyaltyCoins <= 0) {
      setError('Please enter a valid number of coins');
      return;
    }

    if (!coinsReason.trim()) {
      setError('Please provide a reason for adding coins');
      return;
    }

    try {
      setUpdating(true);
      const result = await addLoyaltyCoins(
        order.userId._id,
        loyaltyCoins,
        coinsReason,
        order._id
      );

      // Refresh data
      await fetchOrderData();
      setCoinsDialogOpen(false);
      setLoyaltyCoins('');
      setCoinsReason('');
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to add loyalty coins');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = () => {
    if (!order || !order.orderStatus) return null;
    const currentIndex = getCurrentStep();
    return currentIndex < orderSteps.length - 1 ? orderSteps[currentIndex + 1].value : null;
  };

  const getStatusColor = (status) => {
    if (!status) return 'default';
    
    const colors = {
      new: 'primary',
      confirmed: 'info',
      processing: 'secondary',
      shipped: 'warning',
      delivered: 'success',
      cancelled: 'error',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    if (!status) return 'default';
    
    const colors = {
      paid: 'success',
      pending: 'warning',
      failed: 'error',
    };
    return colors[status] || 'default';
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    
    // Handle both string and object addresses
    if (typeof address === 'string') return address;
    
    const parts = [
      address.fullName,
      address.mobile && `Phone: ${address.mobile}`,
      address.address,
      address.locality,
      address.landmark && `Landmark: ${address.landmark}`,
      address.city,
      address.state,
      address.pincode && `Pincode: ${address.pincode}`
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  };

  const calculateItemTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  const getTransactionTypeColor = (type) => {
    if (!type) return 'default';
    
    const colors = {
      admin_added: 'success',
      admin_deducted: 'error',
      purchase_earned: 'info',
      referral_earned: 'warning',
      referral_used: 'secondary',
      order_used: 'primary',
    };
    return colors[type] || 'default';
  };

  const formatTransactionType = (type) => {
    if (!type) return '';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const safeString = (str) => {
    return str ? String(str) : '';
  };

  const safeToUpperCase = (str) => {
    return str ? String(str).toUpperCase() : '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const parent = e.target.parentElement;
    if (parent) {
      const fallback = parent.querySelector('.fallback-icon');
      if (fallback) {
        fallback.style.display = 'flex';
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        {/* Header skeleton */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="rounded" width={120} height={40} />
            <Box>
              <Skeleton variant="text" width={200} height={40} />
              <Skeleton variant="text" width={150} height={20} />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="rounded" width={120} height={40} />
            <Skeleton variant="rounded" width={180} height={40} />
          </Box>
        </Box>

        {/* Status chips skeleton */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Skeleton variant="rounded" width={150} height={32} />
          <Skeleton variant="rounded" width={120} height={32} />
          <Skeleton variant="rounded" width={100} height={32} />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rounded" height={200} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={400} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={300} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={250} sx={{ mb: 3 }} />
            <Skeleton variant="rounded" height={200} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchOrderData}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          variant="contained"
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  // No order found
  if (!order) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6">Order not found</Typography>
          <Typography variant="body2">
            The order you're looking for doesn't exist or has been removed.
          </Typography>
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  const nextStatus = getNextStatus();
  const currentStep = getCurrentStep();
  const itemTotal = calculateItemTotal(order.items || []);
  const orderDate = formatDate(order.createdAt);
  const orderStatus = safeString(order.orderStatus);
  const paymentStatus = safeString(order.paymentStatus);
  const paymentMethod = safeString(order.paymentMethod);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/orders')}
            variant="outlined"
            size="medium"
          >
            Back
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
              Order #{safeString(order.orderId)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Placed on {orderDate}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchOrderData}
            disabled={loading || updating}
            variant="outlined"
            size="medium"
          >
            Refresh
          </Button>
          {nextStatus && (
            <Button
              variant="contained"
              startIcon={nextStatus === 'delivered' ? <DeliveredIcon /> : <ShippingIcon />}
              onClick={() => handleStatusUpdate(nextStatus)}
              disabled={updating}
              size="medium"
            >
              {updating ? 'Updating...' : `Mark as ${orderSteps.find(step => step.value === nextStatus).label}`}
            </Button>
          )}
        </Box>
      </Box>

      {/* Status Chips */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip
          label={`Order Status: ${safeToUpperCase(orderStatus)}`}
          color={getStatusColor(orderStatus)}
          variant="filled"
          size="medium"
          icon={orderStatus ? undefined : <WarningIcon />}
        />
        <Chip
          label={`Payment: ${safeToUpperCase(paymentStatus)}`}
          color={getPaymentStatusColor(paymentStatus)}
          variant="filled"
          size="medium"
          icon={paymentStatus ? undefined : <WarningIcon />}
        />
        <Chip
          label={`Total: ₹${(order.totalAmount || 0).toLocaleString()}`}
          color="primary"
          variant="outlined"
          size="medium"
        />
        {paymentMethod && (
          <Chip
            label={`Payment Method: ${safeToUpperCase(paymentMethod)}`}
            variant="outlined"
            size="medium"
          />
        )}
        {order.userId && (
          <Tooltip title="Add Loyalty Coins">
            <Chip
              icon={<CoinsIcon />}
              label={`${userLoyaltyData ? userLoyaltyData.currentCoins : 0} coins`}
              color="warning"
              variant="outlined"
              onClick={() => setCoinsDialogOpen(true)}
              clickable
            />
          </Tooltip>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Order Progress */}
        <Grid item xs={12}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon color="primary" />
                  Order Progress
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setStatusDialogOpen(true)}
                  disabled={order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
                  size="medium"
                >
                  Change Status
                </Button>
              </Box>
              
              <Stepper activeStep={currentStep} alternativeLabel>
                {orderSteps.map((step) => (
                  <Step key={step.value}>
                    <StepLabel 
                      sx={{
                        '& .MuiStepLabel-label': {
                          fontWeight: step.value === order.orderStatus ? 'bold' : 'normal',
                          color: step.value === order.orderStatus ? 'primary.main' : 'text.secondary',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }
                      }}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" />
                Order Items
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="medium">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell><strong>Product</strong></TableCell>
                      <TableCell align="right"><strong>Price</strong></TableCell>
                      <TableCell align="center"><strong>Quantity</strong></TableCell>
                      <TableCell align="right"><strong>Subtotal</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(order.items || []).map((item, index) => (
                      <TableRow key={item.productId ? item.productId._id : index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.title}
                                style={{ 
                                  width: 50, 
                                  height: 50, 
                                  objectFit: 'cover',
                                  borderRadius: 4 
                                }}
                                onError={handleImageError}
                              />
                            )}
                            <Box className="fallback-icon" style={{ display: item.image ? 'none' : 'flex', alignItems: 'center', gap: 2 }}>
                              <ReceiptIcon color="action" />
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.title || (item.productId ? item.productId.title : 'Product')}
                                </Typography>
                                {item.productId && item.productId.subtitle && (
                                  <Typography variant="caption" color="textSecondary">
                                    {item.productId.subtitle}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ₹{(item.price || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {item.quantity || 1}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {(!order.items || order.items.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="textSecondary">
                            No items found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {/* Order Summary */}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography fontWeight="medium">Items Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight="medium">
                          ₹{itemTotal.toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    
                    {(order.discount || 0) > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography fontWeight="medium" color="success.main">
                            Discount:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium" color="success.main">
                            -₹{(order.discount || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {(order.deliveryFee || 0) > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography fontWeight="medium">Delivery Fee:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium">
                            ₹{(order.deliveryFee || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {(order.referralCoinsUsed || 0) > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography fontWeight="medium" color="info.main">
                            Referral Coins Used:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium" color="info.main">
                            -₹{(order.referralCoinsUsed || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    <TableRow sx={{ backgroundColor: 'primary.50' }}>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6" color="primary">
                          Total Amount:
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" color="primary">
                          ₹{(order.totalAmount || 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Order & Customer Details */}
        <Grid item xs={12} md={4}>
          {/* Order Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptIcon color="primary" />
                Order Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Order ID
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {safeString(order.orderId)}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Date Placed
                </Typography>
                <Typography variant="body1">
                  {orderDate}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Payment Method
                </Typography>
                <Typography variant="body1" textTransform="capitalize" fontWeight="medium">
                  {paymentMethod || 'N/A'}
                </Typography>
              </Box>
              {order.deliverySlot && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Delivery Slot
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {safeString(order.deliverySlot)}
                  </Typography>
                </Box>
              )}
              {(order.coinsEarned || 0) > 0 && (
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Loyalty Coins Earned
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="success.main">
                    +{(order.coinsEarned || 0)} coins
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Customer Details */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon color="primary" />
                  Customer Details
                </Typography>
                {order.userId && (
                  <Tooltip title="Add Loyalty Coins">
                    <IconButton 
                      size="small" 
                      color="warning"
                      onClick={() => setCoinsDialogOpen(true)}
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {order.userId ? order.userId.name : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {order.userId ? order.userId.email : 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Contact Number
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {order.address ? order.address.mobile : 'N/A'}
                </Typography>
              </Box>
              {order.userId && (
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Current Loyalty Coins
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="warning.main">
                    {userLoyaltyData ? userLoyaltyData.currentCoins : 0} coins
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="primary" />
                Delivery Address
              </Typography>
              {order.address && typeof order.address === 'object' ? (
                <Box>
                  <Typography variant="body1" fontWeight="medium" gutterBottom>
                    {order.address.fullName || 'N/A'}
                  </Typography>
                  {order.address.mobile && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      📱 {order.address.mobile}
                    </Typography>
                  )}
                  {order.address.address && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {order.address.address}
                    </Typography>
                  )}
                  {order.address.locality && (
                    <Typography variant="body2" color="textSecondary">
                      {order.address.locality}
                    </Typography>
                  )}
                  {(order.address.city || order.address.state) && (
                    <Typography variant="body2" color="textSecondary">
                      {[order.address.city, order.address.state].filter(Boolean).join(', ')}
                    </Typography>
                  )}
                  {order.address.pincode && (
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                      Pincode: {order.address.pincode}
                    </Typography>
                  )}
                  {order.address.landmark && (
                    <Typography variant="body2" color="textSecondary">
                      Landmark: {order.address.landmark}
                    </Typography>
                  )}
                  {order.address.label && (
                    <Chip 
                      label={order.address.label} 
                      size="small" 
                      variant="outlined" 
                      sx={{ mt: 1 }}
                    />
                  )}
                </Box>
              ) : (
                <Typography variant="body1">
                  {formatAddress(order.address)}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Loyalty Coins History */}
          {loyaltyTransactions.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CoinsIcon color="warning" />
                  Recent Loyalty Transactions
                </Typography>
                <List dense>
                  {loyaltyTransactions.slice(0, 3).map((transaction, index) => (
                    <ListItem key={transaction._id} divider={index < loyaltyTransactions.length - 1}>
                      <ListItemIcon>
                        <CoinsIcon 
                          color={transaction.type === 'admin_added' ? 'success' : 'warning'} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {formatTransactionType(transaction.type)}
                            </Typography>
                            <Chip
                              label={transaction.type === 'admin_added' ? `+${transaction.coins}` : `-${transaction.coins}`}
                              color={getTransactionTypeColor(transaction.type)}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" color="textSecondary">
                              {transaction.reason}
                            </Typography>
                            <Typography variant="caption" display="block" color="textSecondary">
                              {formatDate(transaction.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Update Order Status
          <Typography variant="body2" color="textSecondary">
            Order: {safeString(order.orderId)}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Select Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Select Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {orderSteps.map((step) => (
                <MenuItem 
                  key={step.value} 
                  value={step.value}
                  disabled={step.value === orderStatus}
                >
                  {step.label}
                  {step.value === orderStatus && ' (Current)'}
                </MenuItem>
              ))}
              <MenuItem value="cancelled" disabled={orderStatus === 'cancelled'}>
                Cancelled
                {orderStatus === 'cancelled' && ' (Current)'}
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleStatusUpdate(selectedStatus)}
            variant="contained"
            disabled={!selectedStatus || selectedStatus === orderStatus || updating}
            startIcon={updating ? <CircularProgress size={16} /> : null}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Loyalty Coins Dialog */}
      <Dialog open={coinsDialogOpen} onClose={() => setCoinsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CoinsIcon color="warning" />
            Add Loyalty Coins
          </Box>
          <Typography variant="body2" color="textSecondary">
            Customer: {order.userId ? order.userId.name : 'N/A'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Number of Coins"
            value={loyaltyCoins}
            onChange={(e) => setLoyaltyCoins(e.target.value)}
            sx={{ mb: 3, mt: 2 }}
            inputProps={{ min: 1, max: 10000 }}
            helperText="Enter the number of coins to add"
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Reason</InputLabel>
            <Select
              value={coinsReason}
              label="Reason"
              onChange={(e) => setCoinsReason(e.target.value)}
            >
              {predefinedReasons.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {coinsReason === 'Other' && (
            <TextField
              fullWidth
              label="Custom Reason"
              value={coinsReason}
              onChange={(e) => setCoinsReason(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="Please specify the reason..."
            />
          )}

          <Alert severity="info" sx={{ mt: 2 }}>
            This will add {loyaltyCoins || 0} coins to {order.userId ? order.userId.name : 'customer'}'s account.
            Current balance: {userLoyaltyData ? userLoyaltyData.currentCoins : 0} coins
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCoinsDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddLoyaltyCoins}
            variant="contained"
            color="warning"
            disabled={!loyaltyCoins || !coinsReason || updating}
            startIcon={updating ? <CircularProgress size={16} /> : <AddIcon />}
          >
            {updating ? 'Adding...' : 'Add Coins'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrderDetails;