// src/pages/Orders/OrderList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Chip,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as DeliveredIcon,
  Cancel as CancelIcon,
  Home as HomeIcon,
  ListAlt as OrdersIcon,
} from '@mui/icons-material';
import { Coins } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import LoyaltyCoinsManager from '../Orders/Loayalitycoins';
// API Service
const API_BASE_URL = 'https://grocery-c3c0.onrender.com/api';

const orderAPI = {
  fetchOrders: async (page = 0, limit = 10, filters = {}) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/admin/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateOrderStatus: async (orderId, status, notes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  fetchOrderStats: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/orders/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order stats');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

const OrderList = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [statusDialog, setStatusDialog] = useState({ open: false, order: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
const [loyaltyDialog, setLoyaltyDialog] = useState({ 
  open: false, 
  order: null, 
  user: null 
});
  const [filters, setFilters] = useState({
    page: 0,
    rowsPerPage: 10,
    orderStatus: '',
    paymentStatus: '',
    search: '',
    startDate: '',
    endDate: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filterParams = {};
      if (filters.orderStatus) filterParams.orderStatus = filters.orderStatus;
      if (filters.paymentStatus) filterParams.paymentStatus = filters.paymentStatus;
      if (filters.search) filterParams.search = filters.search;
      if (filters.startDate) filterParams.startDate = filters.startDate;
      if (filters.endDate) filterParams.endDate = filters.endDate;

      const [ordersData, statsData] = await Promise.all([
        orderAPI.fetchOrders(filters.page, filters.rowsPerPage, filterParams),
        orderAPI.fetchOrderStats()
      ]);

      setOrders(ordersData.orders || []);
      setTotalCount(ordersData.total || 0);
      setStats(statsData.stats);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
      console.error('Orders fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.page, filters.rowsPerPage, filters.orderStatus, filters.paymentStatus, filters.search]);

  const handleStatusUpdate = async (orderId, newStatus, notes = '') => {
    try {
      setUpdatingOrder(orderId);
      await orderAPI.updateOrderStatus(orderId, newStatus, notes);
      await fetchData();
      showSnackbar('Order status updated successfully', 'success');
      setStatusDialog({ open: false, order: null });
    } catch (err) {
      setError(err.message || 'Failed to update order status');
      showSnackbar(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handlePageChange = (event, newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event) => {
    setFilters(prev => ({
      ...prev,
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'success',
      pending: 'warning',
      failed: 'error',
    };
    return colors[status] || 'default';
  };
const handleOpenLoyaltyDialog = (order) => {
  setLoyaltyDialog({
    open: true,
    order: order,
    user: order.userId
  });
};

// Add this function to handle loyalty updates
const handleLoyaltyUpdate = (updatedUser) => {
  // Update the user in the orders list if needed
  setOrders(prevOrders => 
    prevOrders.map(order => 
      order.userId._id === updatedUser._id 
        ? { ...order, userId: { ...order.userId, loyaltyCoins: updatedUser.loyaltyCoins } }
        : order
    )
  );
  showSnackbar(`Loyalty coins updated for ${updatedUser.name}`, 'success');
};

  const getOrderStatusColor = (status) => {
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

  const formatOrderStatus = (status) => {
    return status ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';
  };

  const getNextStatusOptions = (currentStatus) => {
    const statusOptions = {
      new: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: ['confirmed'] // Allow reactivation
    };
    return statusOptions[currentStatus] || [];
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleEditOrder = (orderId) => {
    navigate(`/orders/${orderId}/edit`);
  };

  const openStatusDialog = (order) => {
    setStatusDialog({ open: true, order });
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'new', label: 'New' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const paymentStatusOptions = [
    { value: '', label: 'All Payments' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
  ];

  const StatusUpdateDialog = () => (
    <Dialog open={statusDialog.open} onClose={() => setStatusDialog({ open: false, order: null })}>
      <DialogTitle>
        Update Order Status - {statusDialog.order?.orderId}
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>New Status</InputLabel>
          <Select
            label="New Status"
            defaultValue=""
          >
            {getNextStatusOptions(statusDialog.order?.orderStatus).map(status => (
              <MenuItem key={status} value={status}>
                {formatOrderStatus(status)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="Notes (Optional)"
          multiline
          rows={3}
          sx={{ mt: 2 }}
          placeholder="Add any notes about this status change..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setStatusDialog({ open: false, order: null })}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={() => handleStatusUpdate(
            statusDialog.order._id, 
            document.querySelector('[role="button"]').innerText.toLowerCase(),
            document.querySelector('textarea')?.value
          )}
          disabled={updatingOrder === statusDialog.order?._id}
        >
          {updatingOrder === statusDialog.order?._id ? 'Updating...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (loading && orders.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Orders...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link underline="hover" color="inherit" href="/dashboard" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <OrdersIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Orders
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            Order Management
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage and track customer orders
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Box>

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h4" fontWeight="bold">
                {stats.today.orders}
              </Typography>
              <Typography variant="body2">
                Today's Orders
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'success.main', color: 'white' }}>
              <Typography variant="h4" fontWeight="bold">
                ₹{(stats.today.revenue || 0).toLocaleString()}
              </Typography>
              <Typography variant="body2">
                Today's Revenue
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'info.main', color: 'white' }}>
              <Typography variant="h4" fontWeight="bold">
                {totalCount}
              </Typography>
              <Typography variant="body2">
                Total Orders
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.main', color: 'white' }}>
              <Typography variant="h4" fontWeight="bold">
                {stats.recentOrders}
              </Typography>
              <Typography variant="body2">
                Last 7 Days
              </Typography>
            </Card>
          </Grid>
        </Grid>
      )}

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchData}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Order Status"
                value={filters.orderStatus}
                onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
                size="small"
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Payment Status"
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
                size="small"
              >
                {paymentStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Orders"
                placeholder="Order ID, Customer..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip
                  label={`Total: ${totalCount} orders`}
                  variant="outlined"
                  color="primary"
                />
                {(filters.orderStatus || filters.paymentStatus || filters.search) && (
                  <Button 
                    size="small" 
                    onClick={() => {
                      setFilters({
                        page: 0,
                        rowsPerPage: 10,
                        orderStatus: '',
                        paymentStatus: '',
                        search: '',
                        startDate: '',
                        endDate: '',
                      });
                    }}
                  >
                    Clear All
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Amount</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Payment Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Items</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date Placed</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && orders.length > 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Updating orders...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      No Orders Found
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                      {filters.orderStatus || filters.paymentStatus || filters.search
                        ? 'No orders match your current filters. Try adjusting your search criteria.'
                        : 'No orders have been placed yet. Orders will appear here once customers start placing orders.'
                      }
                    </Typography>
                    {(filters.orderStatus || filters.paymentStatus || filters.search) && (
                      <Button 
                        variant="outlined" 
                        onClick={() => {
                          setFilters({
                            page: 0,
                            rowsPerPage: 10,
                            orderStatus: '',
                            paymentStatus: '',
                            search: '',
                            startDate: '',
                            endDate: '',
                          });
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow 
                    key={order._id}
                    hover
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'action.hover',
                        cursor: 'pointer'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Order ID */}
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold" 
                        color="primary"
                        onClick={() => handleViewOrder(order._id)}
                        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                      >
                        {order.orderId}
                      </Typography>
                    </TableCell>

                    {/* Customer */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {order.userId?.name || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {order.userId?.email || ''}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Total Amount */}
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        ₹{(order.totalAmount || 0).toLocaleString()}
                      </Typography>
                    </TableCell>

                    {/* Payment Status */}
                    <TableCell>
                      <Chip
                        label={order.paymentStatus ? order.paymentStatus.toUpperCase() : 'N/A'}
                        color={getPaymentStatusColor(order.paymentStatus)}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>

                    {/* Order Status */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={formatOrderStatus(order.orderStatus)}
                          color={getOrderStatusColor(order.orderStatus)}
                          size="small"
                          variant="filled"
                        />
                        {updatingOrder === order._id && (
                          <CircularProgress size={16} />
                        )}
                      </Box>
                    </TableCell>

                    {/* Items */}
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {(order.items || []).length} items
                      </Typography>
                    </TableCell>

                    {/* Date Placed */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Box>
                    </TableCell>

                    {/* Actions */}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Tooltip title="View Order Details">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewOrder(order._id)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
<Tooltip title="Manage Loyalty Coins">
  <IconButton
    size="small"
    color="warning"
    onClick={() => handleOpenLoyaltyDialog(order)}
  >
    <Coins />
  </IconButton>
</Tooltip>
                        {getNextStatusOptions(order.orderStatus).length > 0 && (
                          <Tooltip title="Update Status">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => openStatusDialog(order)}
                              disabled={updatingOrder === order._id}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={filters.rowsPerPage}
          page={filters.page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          sx={{
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
          
        />
      </Card>

      {/* Status Update Dialog */}
      <StatusUpdateDialog />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
      <LoyaltyCoinsManager
  open={loyaltyDialog.open}
  onClose={() => setLoyaltyDialog({ open: false, order: null, user: null })}
  order={loyaltyDialog.order}
  user={loyaltyDialog.user}
  onUpdate={handleLoyaltyUpdate}
/>
    </Box>
  );
};

export default OrderList;