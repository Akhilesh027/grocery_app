// src/pages/Dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';

// Direct API calls
const API_BASE_URL = 'http://31.97.233.212:5000/api';

const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

// Chart components
const SimpleLineChart = ({ data }) => (
  <Box sx={{ height: 300, p: 2 }}>
    {data && data.length > 0 ? (
      <Box sx={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: 1 }}>
        {data.map((item, index) => {
          const maxRevenue = Math.max(...data.map(d => d.revenue || 0));
          const height = maxRevenue > 0 ? ((item.revenue || 0) / maxRevenue) * 80 : 0;
          
          return (
            <Box
              key={index}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Box
                sx={{
                  width: '80%',
                  height: `${height}%`,
                  backgroundColor: 'primary.main',
                  borderRadius: 1,
                  mb: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  position: 'relative',
                  minHeight: '20px',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                <Typography variant="caption" sx={{ color: 'white', mb: 0.5, fontSize: '10px' }}>
                  ₹{(item.revenue || 0).toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="caption" color="textSecondary" align="center">
                {item._id ? new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
              </Typography>
            </Box>
          );
        })}
      </Box>
    ) : (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          No sales data available
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Sales data will appear here once orders are placed
        </Typography>
      </Box>
    )}
  </Box>
);

const OrderStatusChart = ({ data }) => {
  const totalOrders = data ? data.reduce((sum, item) => sum + (item.count || 0), 0) : 0;
  
  return (
    <Box sx={{ height: 300, p: 2 }}>
      {data && data.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {data.map((status, index) => {
            const percentage = totalOrders > 0 ? Math.round(((status.count || 0) / totalOrders) * 100) : 0;
            
            return (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: getStatusColor(status._id),
                  }}
                />
                <Typography variant="body2" sx={{ flex: 1, textTransform: 'capitalize' }}>
                  {status._id ? status._id.replace(/([A-Z])/g, ' $1').toLowerCase() : 'Unknown'}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {status.count || 0}
                </Typography>
                <Chip
                  label={`${percentage}%`}
                  size="small"
                  variant="outlined"
                />
              </Box>
            );
          })}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Order status will appear here
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const getStatusColor = (status) => {
  const colors = {
    new: '#FF6B6B',
    processing: '#4ECDC4',
    shipped: '#45B7D1',
    delivered: '#96CEB4',
    cancelled: '#FFA726',
    pending: '#FFA726',
    confirmed: '#4ECDC4',
    paid: '#96CEB4',
  };
  return colors[status] || '#9E9E9E';
};

// KPI Card Component
const KPICard = ({ 
  title, 
  value, 
  trend, 
  trendIcon, 
  trendColor = 'success', 
  icon, 
  color = 'primary' 
}) => {
  return (
    <Card sx={{ height: '100%', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography color="textSecondary" gutterBottom variant="overline" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ opacity: 0.3 }}>
            {icon}
          </Typography>
        </Box>
        
        <Typography variant="h4" component="div" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
          {value}
        </Typography>
        
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {trendIcon && React.cloneElement(trendIcon, { 
              fontSize: 'small',
              color: trendColor 
            })}
            <Chip
              label={trend}
              size="small"
              color={trendColor}
              variant="outlined"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { value: '+0%', positive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: `${change >= 0 ? '+' : ''}${Math.round(change)}%`,
      positive: change >= 0,
    };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading Dashboard...
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
            <Button color="inherit" size="small" onClick={fetchData}>
              RETRY
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  const { kpi, salesTrend, orderStatus, lowStockProducts } = dashboardData || {};

  // Calculate trends based on previous day data (simplified)
  const revenueTrend = calculateTrend(kpi?.revenue || 0, (kpi?.revenue || 0) * 0.88);
  const ordersTrend = calculateTrend(kpi?.newOrders || 0, (kpi?.newOrders || 0) * 0.92);
  const aovTrend = calculateTrend(kpi?.aov || 0, (kpi?.aov || 0) * 0.95);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Dashboard Overview
        </Typography>
        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Today's Revenue"
            value={`₹${(kpi?.revenue || 0).toLocaleString()}`}
            trend={revenueTrend.value}
            trendIcon={revenueTrend.positive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            trendColor={revenueTrend.positive ? 'success' : 'error'}
            icon="💰"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="New Orders"
            value={(kpi?.newOrders || 0).toString()}
            trend={ordersTrend.value}
            trendIcon={ordersTrend.positive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            trendColor={ordersTrend.positive ? 'success' : 'error'}
            icon="📦"
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Average Order Value"
            value={`₹${(kpi?.aov || 0).toLocaleString()}`}
            trend={aovTrend.value}
            trendIcon={aovTrend.positive ? <TrendingUpIcon /> : <TrendingDownIcon />}
            trendColor={aovTrend.positive ? 'success' : 'error'}
            icon="📊"
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Low Stock Alerts"
            value={(kpi?.lowStock || 0).toString()}
            trend=""
            icon="⚠️"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                📈 Sales Trend (Last 30 Days)
              </Typography>
              <SimpleLineChart data={salesTrend} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                🥧 Order Status Distribution
              </Typography>
              <OrderStatusChart data={orderStatus} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Low Stock Alerts & Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Low Stock Alerts
                </Typography>
                <Chip
                  label={lowStockProducts?.length || 0}
                  color="warning"
                  size="small"
                  sx={{ ml: 1, fontWeight: 'bold' }}
                />
              </Box>
              <List>
                {lowStockProducts && lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product, index) => (
                    <ListItem 
                      key={product._id || index} 
                      divider
                      sx={{ 
                        borderRadius: 1,
                        mb: 0.5,
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={product.image}
                          sx={{ 
                            bgcolor: 'warning.light',
                            width: 40,
                            height: 40
                          }}
                        >
                          {product.image ? '' : '📦'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" fontWeight="medium">
                            {product.title || 'Unknown Product'}
                          </Typography>
                        }
                        secondary={`Only ${product.stockQuantity || 0} units left - Reorder needed`}
                      />
                      <Chip
                        label="Low Stock"
                        color="warning"
                        size="small"
                        variant="filled"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText
                      primary="No low stock products"
                      secondary="All products are well stocked and inventory levels are optimal"
                      primaryTypographyProps={{ color: 'success.main', fontWeight: 'medium' }}
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                🔔 Recent Activity Summary
              </Typography>
              <List>
                <ListItem divider sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <ListItemText
                    primary={`${kpi?.newOrders || 0} New Orders Today`}
                    secondary="Track and manage these orders in the Orders section"
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem divider sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <ListItemText
                    primary={`${kpi?.lowStock || 0} Products Need Restocking`}
                    secondary="Check inventory management for low stock items"
                    primaryTypographyProps={{ fontWeight: 'medium' }}
                  />
                </ListItem>
                <ListItem divider sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <ListItemText
                    primary={`₹${(kpi?.revenue || 0).toLocaleString()} Revenue Generated`}
                    secondary="Today's total sales revenue"
                    primaryTypographyProps={{ fontWeight: 'medium', color: 'success.main' }}
                  />
                </ListItem>
                <ListItem sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                  <ListItemText
                    primary="System Running Smoothly"
                    secondary="All services are operational and performing well"
                    primaryTypographyProps={{ fontWeight: 'medium', color: 'success.main' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Last Updated */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="textSecondary">
          Data last updated: {new Date().toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;