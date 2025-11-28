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
  Divider,
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
  Edit as EditIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

// Direct API calls
const API_BASE_URL = 'https://grocery-c3c0.onrender.com/api';

const fetchOrderDetails = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch order details');
    }
    
    const data = await response.json();
    return data.order;
  } catch (error) {
    throw new Error(error.message);
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
      setOrder(orderData);

      // Fetch user loyalty data if user exists
      if (orderData.userId?._id) {
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
        currentCoins: transactions[0]?.newBalance || 0
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
    if (!order) return 0;
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
    if (!order) return null;
    const currentIndex = getCurrentStep();
    return currentIndex < orderSteps.length - 1 ? orderSteps[currentIndex + 1].value : null;
  };

  const getStatusColor = (status) => {
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

  const calculateItemTotal = (items = []) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTransactionTypeColor = (type) => {
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
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Order Details...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
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
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box>
        <Alert severity="warning">
          Order not found
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          sx={{ mt: 2 }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  const nextStatus = getNextStatus();
  const currentStep = getCurrentStep();
  const itemTotal = calculateItemTotal(order.items);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/orders')}
            variant="outlined"
          >
            Back to Orders
          </Button>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Order #{order.orderId}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchOrderData}
            disabled={loading}
            variant="outlined"
          >
            Refresh
          </Button>
          {nextStatus && (
            <Button
              variant="contained"
              startIcon={nextStatus === 'delivered' ? <DeliveredIcon /> : <ShippingIcon />}
              onClick={() => handleStatusUpdate(nextStatus)}
              disabled={updating}
            >
              {updating ? 'Updating...' : `Mark as ${orderSteps.find(step => step.value === nextStatus)?.label}`}
            </Button>
          )}
        </Box>
      </Box>

      {/* Status Chips */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip
          label={`Order Status: ${order.orderStatus.toUpperCase()}`}
          color={getStatusColor(order.orderStatus)}
          variant="filled"
          size="medium"
        />
        <Chip
          label={`Payment: ${order.paymentStatus.toUpperCase()}`}
          color={getPaymentStatusColor(order.paymentStatus)}
          variant="filled"
          size="medium"
        />
        <Chip
          label={`Total: ₹${order.totalAmount?.toLocaleString()}`}
          color="primary"
          variant="outlined"
          size="medium"
        />
        {order.paymentMethod && (
          <Chip
            label={`Payment Method: ${order.paymentMethod.toUpperCase()}`}
            variant="outlined"
            size="medium"
          />
        )}
        {order.userId && (
          <Tooltip title="Add Loyalty Coins">
            <Chip
              icon={<CoinsIcon />}
              label={`${userLoyaltyData?.currentCoins || 0} coins`}
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ReceiptIcon color="primary" />
                  Order Progress
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setStatusDialogOpen(true)}
                  disabled={order.orderStatus === 'delivered' || order.orderStatus === 'cancelled'}
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
                          color: step.value === order.orderStatus ? 'primary.main' : 'text.secondary'
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
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'grey.50' }}>
                      <TableCell><strong>Product</strong></TableCell>
                      <TableCell align="right"><strong>Price</strong></TableCell>
                      <TableCell align="center"><strong>Quantity</strong></TableCell>
                      <TableCell align="right"><strong>Subtotal</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {order.items?.map((item, index) => (
                      <TableRow key={item.productId?._id || index} hover>
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
                              />
                            )}
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {item.title || item.productId?.title || 'Unknown Product'}
                              </Typography>
                              {item.productId?.subtitle && (
                                <Typography variant="caption" color="textSecondary">
                                  {item.productId.subtitle}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            ₹{item.price?.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2">
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            ₹{(item.price * item.quantity)?.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    
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
                    
                    {order.discount > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography fontWeight="medium" color="success.main">
                            Discount:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium" color="success.main">
                            -₹{order.discount?.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {order.deliveryFee > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography fontWeight="medium">Delivery Fee:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium">
                            ₹{order.deliveryFee?.toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    
                    {order.referralCoinsUsed > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          <Typography fontWeight="medium" color="info.main">
                            Referral Coins Used:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="medium" color="info.main">
                            -₹{order.referralCoinsUsed?.toLocaleString()}
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
                          ₹{order.totalAmount?.toLocaleString()}
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
                  {order.orderId}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Date Placed
                </Typography>
                <Typography variant="body1">
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Payment Method
                </Typography>
                <Typography variant="body1" textTransform="capitalize" fontWeight="medium">
                  {order.paymentMethod || 'N/A'}
                </Typography>
              </Box>
              {order.deliverySlot && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="textSecondary">
                    Delivery Slot
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {order.deliverySlot}
                  </Typography>
                </Box>
              )}
              {order.coinsEarned > 0 && (
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    Loyalty Coins Earned
                  </Typography>
                  <Typography variant="body1" fontWeight="medium" color="success.main">
                    +{order.coinsEarned} coins
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
                <Tooltip title="Add Loyalty Coins">
                  <IconButton 
                    size="small" 
                    color="warning"
                    onClick={() => setCoinsDialogOpen(true)}
                  >
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Name
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {order.userId?.name || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {order.userId?.email || 'N/A'}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Contact Number
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {order.address?.mobile || 'N/A'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Current Loyalty Coins
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="warning.main">
                  {userLoyaltyData?.currentCoins || 0} coins
                </Typography>
              </Box>
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
                    {order.address.fullName}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    📱 {order.address.mobile}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {order.address.address}
                  </Typography>
                  {order.address.locality && (
                    <Typography variant="body2" color="textSecondary">
                      {order.address.locality}
                    </Typography>
                  )}
                  <Typography variant="body2" color="textSecondary">
                    {order.address.city}, {order.address.state}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    Pincode: {order.address.pincode}
                  </Typography>
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
                              {new Date(transaction.createdAt).toLocaleDateString()}
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
            Order: {order.orderId}
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
                  disabled={step.value === order.orderStatus}
                >
                  {step.label}
                  {step.value === order.orderStatus && ' (Current)'}
                </MenuItem>
              ))}
              <MenuItem value="cancelled" disabled={order.orderStatus === 'cancelled'}>
                Cancelled
                {order.orderStatus === 'cancelled' && ' (Current)'}
              </MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={() => handleStatusUpdate(selectedStatus)}
            variant="contained"
            disabled={!selectedStatus || selectedStatus === order.orderStatus || updating}
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
            Customer: {order.userId?.name}
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
            This will add {loyaltyCoins || 0} coins to {order.userId?.name}'s account.
            Current balance: {userLoyaltyData?.currentCoins || 0} coins
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