// src/pages/Orders/OrderList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderList.css';
import LoyaltyCoinsManager from '../Orders/Loayalitycoins';

// API Service
const API_BASE_URL = 'https://api.sampurnamart.cloud/api';

const orderAPI = {
  fetchOrders: async (page = 0, limit = 10, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/admin/orders?${params}`);
      
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
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
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

  updatePaymentStatus: async (orderId, paymentStatus, notes = '') => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/payment-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentStatus, notes }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update payment status');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  assignDeliveryBoy: async (orderId, deliveryBoyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/assign-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deliveryBoyId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign delivery boy');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  fetchDeliveryBoys: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/delivery-boys`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch delivery boys');
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  fetchOrderStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/stats/overview`);
      
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
  const [deliveryBoys, setDeliveryBoys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeliveryBoys, setLoadingDeliveryBoys] = useState(false);
  const [error, setError] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  
  // Status dialogs
  const [statusDialog, setStatusDialog] = useState({ 
    open: false, 
    order: null, 
    selectedStatus: '', 
    notes: '' 
  });
  
  const [paymentDialog, setPaymentDialog] = useState({ 
    open: false, 
    order: null, 
    selectedStatus: '', 
    notes: '' 
  });
  
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });
  
  const [loyaltyDialog, setLoyaltyDialog] = useState({ 
    open: false, 
    order: null, 
    user: null 
  });
  
  const [assignDialog, setAssignDialog] = useState({ 
    open: false, 
    order: null, 
    deliveryBoyId: '' 
  });

  const [filters, setFilters] = useState({
    page: 0,
    rowsPerPage: 10,
    orderStatus: '',
    paymentStatus: '',
    search: '',
    startDate: '',
    endDate: '',
    deliveryBoy: '',
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
      if (filters.deliveryBoy) filterParams.deliveryBoy = filters.deliveryBoy;

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

  const fetchDeliveryBoysData = async () => {
    try {
      setLoadingDeliveryBoys(true);
      const data = await orderAPI.fetchDeliveryBoys();
      setDeliveryBoys(data.deliveryBoys || []);
    } catch (err) {
      console.error('Failed to fetch delivery boys:', err);
      showSnackbar('Failed to load delivery boys', 'error');
    } finally {
      setLoadingDeliveryBoys(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDeliveryBoysData();
  }, [filters.page, filters.rowsPerPage, filters.orderStatus, 
      filters.paymentStatus, filters.search, filters.deliveryBoy]);

  // Order Status Handlers
  const handleStatusUpdate = async () => {
    const { order, selectedStatus, notes } = statusDialog;
    if (!selectedStatus) {
      showSnackbar('Please select a status', 'error');
      return;
    }

    try {
      setUpdatingOrder(order._id);
      await orderAPI.updateOrderStatus(order._id, selectedStatus, notes);
      await fetchData();
      showSnackbar('Order status updated successfully', 'success');
      setStatusDialog({ open: false, order: null, selectedStatus: '', notes: '' });
    } catch (err) {
      showSnackbar(err.message || 'Failed to update order status', 'error');
    } finally {
      setUpdatingOrder(null);
    }
  };

  // Payment Status Handlers
  const handlePaymentStatusUpdate = async () => {
    const { order, selectedStatus, notes } = paymentDialog;
    if (!selectedStatus) {
      showSnackbar('Please select a payment status', 'error');
      return;
    }

    try {
      setUpdatingOrder(order._id);
      await orderAPI.updatePaymentStatus(order._id, selectedStatus, notes);
      await fetchData();
      showSnackbar('Payment status updated successfully', 'success');
      setPaymentDialog({ open: false, order: null, selectedStatus: '', notes: '' });
    } catch (err) {
      showSnackbar(err.message || 'Failed to update payment status', 'error');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleAssignDeliveryBoy = async () => {
    if (!assignDialog.deliveryBoyId) {
      showSnackbar('Please select a delivery boy', 'error');
      return;
    }

    try {
      setUpdatingOrder(assignDialog.order._id);
      await orderAPI.assignDeliveryBoy(assignDialog.order._id, assignDialog.deliveryBoyId);
      await fetchData();
      showSnackbar('Delivery boy assigned successfully', 'success');
      setAssignDialog({ open: false, order: null, deliveryBoyId: '' });
    } catch (err) {
      showSnackbar(err.message || 'Failed to assign delivery boy', 'error');
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const handlePageChange = (newPage) => {
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
      paid: '#4caf50',
      pending: '#ff9800',
      failed: '#f44336',
      refunded: '#2196f3',
      partially_refunded: '#2196f3',
    };
    return colors[status] || '#757575';
  };

  const handleOpenLoyaltyDialog = (order) => {
    setLoyaltyDialog({
      open: true,
      order: order,
      user: order.userId
    });
  };

  const handleLoyaltyUpdate = (updatedUser) => {
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
      new: '#2196f3',
      pending: '#ff9800',
      confirmed: '#00bcd4',
      processing: '#9c27b0',
      shipped: '#ff9800',
      delivered: '#4caf50',
      cancelled: '#f44336',
      refunded: '#2196f3',
    };
    return colors[status] || '#757575';
  };

  const formatOrderStatus = (status) => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getNextStatusOptions = (currentStatus) => {
    const statusOptions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: ['confirmed']
    };
    return statusOptions[currentStatus] || [];
  };

  const getNextPaymentStatusOptions = (currentStatus) => {
    const options = ['paid', 'pending', 'failed', 'refunded'];
    return options.filter(status => status !== currentStatus);
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const openStatusDialog = (order) => {
    setStatusDialog({ 
      open: true, 
      order,
      selectedStatus: '',
      notes: ''
    });
  };

  const openPaymentDialog = (order) => {
    setPaymentDialog({ 
      open: true, 
      order,
      selectedStatus: '',
      notes: ''
    });
  };

  const openAssignDialog = (order) => {
    setAssignDialog({ 
      open: true, 
      order, 
      deliveryBoyId: order.deliveryBoy?._id || '' 
    });
  };

  const canAssignDeliveryBoy = (orderStatus) => {
    return ['pending', 'confirmed', 'processing', 'shipped'].includes(orderStatus);
  };

  const orderStatusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
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
    { value: 'refunded', label: 'Refunded' },
  ];

  if (loading && orders.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <h3>Loading Orders...</h3>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <a href="/dashboard" className="breadcrumb-link">
          <span className="breadcrumb-icon">🏠</span>
          Dashboard
        </a>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">
          <span className="breadcrumb-icon">📋</span>
          Orders
        </span>
      </div>

      {/* Header */}
      <div className="header-section">
        <div className="header-title">
          <h1>Order Management</h1>
          <p className="subtitle">Manage and track customer orders</p>
        </div>
        <button
          className="refresh-button"
          onClick={fetchData}
          disabled={loading}
        >
          <span className="button-icon">🔄</span>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card primary">
            <h2>{stats.today?.orders || 0}</h2>
            <p>Today's Orders</p>
          </div>
          <div className="stat-card success">
            <h2>₹{((stats.today?.revenue || 0)).toLocaleString('en-IN')}</h2>
            <p>Today's Revenue</p>
          </div>
          <div className="stat-card info">
            <h2>{totalCount}</h2>
            <p>Total Orders</p>
          </div>
          <div className="stat-card warning">
            <h2>{stats.recentOrders || 0}</h2>
            <p>Last 7 Days</p>
          </div>
        </div>
      )}

      {error && (
        <div className="error-alert">
          <div className="error-message">{error}</div>
          <button className="retry-button" onClick={fetchData}>
            RETRY
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-item">
            <label>Order Status</label>
            <select
              value={filters.orderStatus}
              onChange={(e) => handleFilterChange('orderStatus', e.target.value)}
              className="filter-select"
            >
              {orderStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Payment Status</label>
            <select
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="filter-select"
            >
              {paymentStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Delivery Boy</label>
            <select
              value={filters.deliveryBoy}
              onChange={(e) => handleFilterChange('deliveryBoy', e.target.value)}
              className="filter-select"
            >
              <option value="">All Delivery Boys</option>
              {deliveryBoys.map((boy) => (
                <option key={boy._id} value={boy._id}>
                  {boy.name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>Search Orders</label>
            <input
              type="text"
              placeholder="Order ID, Customer..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-item">
            <div className="orders-count">
              <span className="count-badge">{totalCount} orders</span>
            </div>
          </div>
        </div>
        
        {(filters.orderStatus || filters.paymentStatus || filters.search || filters.deliveryBoy) && (
          <div className="clear-filters">
            <button 
              className="clear-button"
              onClick={() => {
                setFilters({
                  page: 0,
                  rowsPerPage: 10,
                  orderStatus: '',
                  paymentStatus: '',
                  search: '',
                  startDate: '',
                  endDate: '',
                  deliveryBoy: '',
                });
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Payment Status</th>
              <th>Order Status</th>
              <th>Delivery Boy</th>
              <th>Items</th>
              <th>Date Placed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && orders.length > 0 ? (
              <tr>
                <td colSpan="9" className="loading-row">
                  <div className="table-spinner"></div>
                  <p>Updating orders...</p>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-row">
                  <h3>No Orders Found</h3>
                  <p>
                    {filters.orderStatus || filters.paymentStatus || filters.search || filters.deliveryBoy
                      ? 'No orders match your current filters. Try adjusting your search criteria.'
                      : 'No orders have been placed yet.'
                    }
                  </p>
                  {(filters.orderStatus || filters.paymentStatus || filters.search || filters.deliveryBoy) && (
                    <button 
                      className="clear-filters-button"
                      onClick={() => {
                        setFilters({
                          page: 0,
                          rowsPerPage: 10,
                          orderStatus: '',
                          paymentStatus: '',
                          search: '',
                          startDate: '',
                          endDate: '',
                          deliveryBoy: '',
                        });
                      }}
                    >
                      Clear Filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="order-row">
                  {/* Order ID */}
                  <td>
                    <span 
                      className="order-id-link"
                      onClick={() => handleViewOrder(order._id)}
                    >
                      {order.orderId}
                    </span>
                  </td>

                  {/* Customer */}
                  <td>
                    <div className="customer-info">
                      <strong>{order.userId?.name || 'N/A'}</strong>
                      {order.userId?.email && (
                        <small>{order.userId.email}</small>
                      )}
                    </div>
                  </td>

                  {/* Total Amount */}
                  <td className="amount-cell">
                    <strong>₹{((order.totalAmount || 0)).toLocaleString('en-IN')}</strong>
                  </td>

                  {/* Payment Status */}
                  <td>
                    <div className="payment-status-cell">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getPaymentStatusColor(order.paymentStatus) }}
                      >
                        {order.paymentStatus ? order.paymentStatus.toUpperCase() : 'N/A'}
                      </span>
                      <button 
                        className="change-payment-status-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPaymentDialog(order);
                        }}
                        disabled={updatingOrder === order._id}
                        title="Change Payment Status"
                      >
                        📝
                      </button>
                    </div>
                  </td>

                  {/* Order Status */}
                  <td>
                    <div className="order-status-cell">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getOrderStatusColor(order.status) }}
                      >
                        {formatOrderStatus(order.status)}
                      </span>
                      <button 
                        className="change-order-status-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          openStatusDialog(order);
                        }}
                        disabled={updatingOrder === order._id}
                        title="Change Order Status"
                      >
                        📝
                      </button>
                      {updatingOrder === order._id && (
                        <div className="updating-spinner"></div>
                      )}
                    </div>
                  </td>

                  {/* Delivery Boy */}
                  <td>
                    {order.deliveryBoy ? (
                      <div className="delivery-boy-info">
                        <div className="avatar-small">
                          {order.deliveryBoy.name?.charAt(0)?.toUpperCase() || 'D'}
                        </div>
                        <div>
                          <strong>{order.deliveryBoy.name}</strong>
                          {order.deliveryBoy.phone && (
                            <small>{order.deliveryBoy.phone}</small>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="delivery-assignment-cell">
                        <span className="not-assigned">Not Assigned</span>
                        <button 
                          className="assign-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openAssignDialog(order);
                          }}
                          disabled={!canAssignDeliveryBoy(order.status) || updatingOrder === order._id}
                          title="Assign Delivery Boy"
                        >
                          👤
                        </button>
                      </div>
                    )}
                  </td>

                  {/* Items */}
                  <td className="items-cell">
                    <small>{(order.items || []).length} items</small>
                  </td>

                  {/* Date Placed */}
                  <td>
                    <div className="date-cell">
                      <div>{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                      <small>
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </small>
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="actions-cell">
                      {/* View Order */}
                      <button 
                        className="action-button view-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewOrder(order._id);
                        }}
                        title="View Order Details"
                      >
                        👁️
                      </button>
                      
                      {/* Loyalty Coins */}
                      <button 
                        className="action-button loyalty-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLoyaltyDialog(order);
                        }}
                        title="Manage Loyalty Coins"
                      >
                        🪙
                      </button>

                      {/* Quick Actions Menu */}
                      <div className="quick-actions-menu">
                        <button 
                          className="action-button menu-button"
                          title="More Actions"
                        >
                          ⋮
                        </button>
                        <div className="quick-actions-dropdown">
                          <button 
                            className="dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              openStatusDialog(order);
                            }}
                            disabled={updatingOrder === order._id}
                          >
                            <span className="dropdown-icon">📋</span>
                            Change Order Status
                          </button>
                          <button 
                            className="dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPaymentDialog(order);
                            }}
                            disabled={updatingOrder === order._id}
                          >
                            <span className="dropdown-icon">💰</span>
                            Change Payment Status
                          </button>
                          <button 
                            className="dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              openAssignDialog(order);
                            }}
                            disabled={!canAssignDeliveryBoy(order.status) || updatingOrder === order._id}
                          >
                            <span className="dropdown-icon">👤</span>
                            Assign Delivery Boy
                          </button>
                          <button 
                            className="dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenLoyaltyDialog(order);
                            }}
                          >
                            <span className="dropdown-icon">🪙</span>
                            Manage Loyalty
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <div className="rows-per-page">
            <label>Rows per page:</label>
            <select 
              value={filters.rowsPerPage} 
              onChange={handleRowsPerPageChange}
              className="rows-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="page-info">
            {filters.page * filters.rowsPerPage + 1}-
            {Math.min((filters.page + 1) * filters.rowsPerPage, totalCount)} of {totalCount}
          </div>
          <div className="page-buttons">
            <button 
              className="page-button"
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page === 0}
            >
              ◀
            </button>
            <button 
              className="page-button"
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={(filters.page + 1) * filters.rowsPerPage >= totalCount}
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Order Status Update Dialog */}
      {statusDialog.open && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>Update Order Status - {statusDialog.order?.orderId}</h3>
              <button 
                className="close-button"
                onClick={() => setStatusDialog({ open: false, order: null, selectedStatus: '', notes: '' })}
              >
                ×
              </button>
            </div>
            <div className="dialog-content">
              <div className="order-info-summary">
                <p><strong>Customer:</strong> {statusDialog.order?.userId?.name}</p>
                <p><strong>Amount:</strong> ₹{((statusDialog.order?.totalAmount || 0)).toLocaleString('en-IN')}</p>
                <p><strong>Current Status:</strong> 
                  <span className="current-status" style={{ color: getOrderStatusColor(statusDialog.order?.status) }}>
                    {formatOrderStatus(statusDialog.order?.status)}
                  </span>
                </p>
              </div>

              <div className="form-group">
                <label>Select New Status</label>
                <select
                  value={statusDialog.selectedStatus}
                  onChange={(e) => setStatusDialog(prev => ({ 
                    ...prev, 
                    selectedStatus: e.target.value 
                  }))}
                  className="dialog-select"
                >
                  <option value="">Select a status</option>
                  {getNextStatusOptions(statusDialog.order?.status).map(status => (
                    <option key={status} value={status}>
                      {formatOrderStatus(status)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  placeholder="Add any notes about this status change..."
                  value={statusDialog.notes}
                  onChange={(e) => setStatusDialog(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  rows="3"
                  className="dialog-textarea"
                />
              </div>
            </div>
            <div className="dialog-actions">
              <button 
                className="dialog-button cancel"
                onClick={() => setStatusDialog({ open: false, order: null, selectedStatus: '', notes: '' })}
              >
                Cancel
              </button>
              <button 
                className="dialog-button primary"
                onClick={handleStatusUpdate}
                disabled={updatingOrder === statusDialog.order?._id || !statusDialog.selectedStatus}
              >
                {updatingOrder === statusDialog.order?._id ? 'Updating...' : 'Update Order Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Update Dialog */}
      {paymentDialog.open && (
        <div className="dialog-overlay">
          <div className="dialog">
            <div className="dialog-header">
              <h3>Update Payment Status - {paymentDialog.order?.orderId}</h3>
              <button 
                className="close-button"
                onClick={() => setPaymentDialog({ open: false, order: null, selectedStatus: '', notes: '' })}
              >
                ×
              </button>
            </div>
            <div className="dialog-content">
              <div className="order-info-summary">
                <p><strong>Customer:</strong> {paymentDialog.order?.userId?.name}</p>
                <p><strong>Amount:</strong> ₹{((paymentDialog.order?.totalAmount || 0)).toLocaleString('en-IN')}</p>
                <p><strong>Current Payment Status:</strong> 
                  <span className="current-status" style={{ color: getPaymentStatusColor(paymentDialog.order?.paymentStatus) }}>
                    {paymentDialog.order?.paymentStatus?.toUpperCase() || 'N/A'}
                  </span>
                </p>
              </div>

              <div className="form-group">
                <label>Select New Payment Status</label>
                <select
                  value={paymentDialog.selectedStatus}
                  onChange={(e) => setPaymentDialog(prev => ({ 
                    ...prev, 
                    selectedStatus: e.target.value 
                  }))}
                  className="dialog-select"
                >
                  <option value="">Select a status</option>
                  {getNextPaymentStatusOptions(paymentDialog.order?.paymentStatus).map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label>Notes (Optional)</label>
                <textarea
                  placeholder="Add any notes about this payment status change..."
                  value={paymentDialog.notes}
                  onChange={(e) => setPaymentDialog(prev => ({ 
                    ...prev, 
                    notes: e.target.value 
                  }))}
                  rows="3"
                  className="dialog-textarea"
                />
              </div>
            </div>
            <div className="dialog-actions">
              <button 
                className="dialog-button cancel"
                onClick={() => setPaymentDialog({ open: false, order: null, selectedStatus: '', notes: '' })}
              >
                Cancel
              </button>
              <button 
                className="dialog-button primary"
                onClick={handlePaymentStatusUpdate}
                disabled={updatingOrder === paymentDialog.order?._id || !paymentDialog.selectedStatus}
              >
                {updatingOrder === paymentDialog.order?._id ? 'Updating...' : 'Update Payment Status'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Delivery Boy Dialog */}
      {assignDialog.open && (
        <div className="dialog-overlay">
          <div className="dialog assign-dialog">
            <div className="dialog-header">
              <h3>👤 Assign Delivery Boy - Order {assignDialog.order?.orderId}</h3>
              <button 
                className="close-button"
                onClick={() => setAssignDialog({ open: false, order: null, deliveryBoyId: '' })}
              >
                ×
              </button>
            </div>
            <div className="dialog-content">
              <div className="customer-details">
                <h4>Customer Details:</h4>
                <div className="details-list">
                  <p><strong>Name:</strong> {assignDialog.order?.userId?.name || 'N/A'}</p>
                  <p><strong>Phone:</strong> {assignDialog.order?.shippingAddress?.phone || assignDialog.order?.userId?.phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {assignDialog.order?.address?.address || 'N/A'}</p>
                  {assignDialog.order?.address?.city && (
                    <p><strong>City:</strong> {assignDialog.order.address.city}</p>
                  )}
                </div>
              </div>

              <hr />

              <div className="form-group">
                <label>Select Delivery Boy</label>
                <select
                  value={assignDialog.deliveryBoyId}
                  onChange={(e) => setAssignDialog(prev => ({ ...prev, deliveryBoyId: e.target.value }))}
                  className="dialog-select"
                  disabled={loadingDeliveryBoys}
                >
                  <option value="">Not Assigned (Unassign)</option>
                  {deliveryBoys.map((boy) => (
                    <option key={boy._id} value={boy._id}>
                      {boy.name} • {boy.phone} • {boy.vehicleType || 'No Vehicle'}
                    </option>
                  ))}
                </select>
              </div>

              {assignDialog.deliveryBoyId && (
                <div className="delivery-boy-info-box">
                  <h4>Selected Delivery Boy Information:</h4>
                  {(() => {
                    const boy = deliveryBoys.find(b => b._id === assignDialog.deliveryBoyId);
                    return boy ? (
                      <div className="boy-details">
                        <p><strong>Name:</strong> {boy.name}</p>
                        <p><strong>Phone:</strong> {boy.phone}</p>
                        <p><strong>Vehicle:</strong> {boy.vehicleType || 'Not specified'}</p>
                        {boy.availability && (
                          <p><strong>Status:</strong> 
                            <span className={`availability ${boy.availability}`}>
                              {boy.availability === 'available' ? 'Available' : 'Busy'}
                            </span>
                          </p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {assignDialog.order?.deliveryBoy && assignDialog.deliveryBoyId !== assignDialog.order.deliveryBoy._id && (
                <div className="warning-note">
                  Currently assigned to: <strong>{assignDialog.order.deliveryBoy.name}</strong>
                </div>
              )}
            </div>
            <div className="dialog-actions">
              <button 
                className="dialog-button cancel"
                onClick={() => setAssignDialog({ open: false, order: null, deliveryBoyId: '' })}
              >
                Cancel
              </button>
              <button 
                className="dialog-button primary"
                onClick={handleAssignDeliveryBoy}
                disabled={updatingOrder === assignDialog.order?._id || loadingDeliveryBoys}
              >
                {updatingOrder === assignDialog.order?._id ? 'Assigning...' : 
                 loadingDeliveryBoys ? 'Loading...' : 'Assign Delivery Boy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loyalty Coins Dialog */}
      <LoyaltyCoinsManager
        open={loyaltyDialog.open}
        onClose={() => setLoyaltyDialog({ open: false, order: null, user: null })}
        order={loyaltyDialog.order}
        user={loyaltyDialog.user}
        onUpdate={handleLoyaltyUpdate}
      />

      {/* Snackbar for notifications */}
      {snackbar.open && (
        <div className={`snackbar ${snackbar.severity}`}>
          {snackbar.message}
          <button 
            className="snackbar-close"
            onClick={() => setSnackbar({ ...snackbar, open: false })}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderList;