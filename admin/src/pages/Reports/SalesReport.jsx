// src/pages/Reports/SalesReport.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  TrendingUp,
  TrendingDown,
  ShowChart,
  AttachMoney,
  ShoppingCart,
  LocalOffer,
  MoneyOff,
  AccountBalance,
  Category as CategoryIcon,
  CalendarToday,
  BarChart,
  PieChart,
  TableChart,
  Info,
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://31.97.233.212:5000/api';

const SalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [assumptions, setAssumptions] = useState({
    costPercentage: 0.65,
    deliveryCostPerOrder: 30,
    paymentGatewayFee: 0.02,
    platformFee: 0.05,
    discountPercentage: 0.10,
  });
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    category: '',
    paymentMethod: '',
    timeRange: '30d',
  });

  const timeRangeOptions = [
    { value: '1d', label: 'Today' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const paymentMethods = [
    { value: '', label: 'All Methods' },
    { value: 'cod', label: 'Cash on Delivery' },
    { value: 'upi', label: 'UPI' },
    { value: 'card', label: 'Card' },
    { value: 'wallet', label: 'Wallet' },
  ];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date for display (short)
  const formatDateShort = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  // Calculate profit data based on backend data and assumptions
  const calculateProfitData = (backendData) => {
    if (!backendData) return null;

    const { 
      summary, 
      dailySales = [], 
      categoryPerformance = [],
      topProducts = [],
      paymentMethodDistribution = []
    } = backendData;
    
    // Calculate profit for daily sales
    const enhancedDailySales = dailySales.map(day => {
      const revenue = day.revenue || 0;
      const orders = day.orders || 0;
      const cost = revenue * assumptions.costPercentage;
      const deliveryCost = orders * assumptions.deliveryCostPerOrder;
      const paymentFees = revenue * assumptions.paymentGatewayFee;
      const platformFees = revenue * assumptions.platformFee;
      const discounts = revenue * assumptions.discountPercentage;
      const totalExpenses = cost + deliveryCost + paymentFees + platformFees + discounts;
      const profit = revenue - totalExpenses;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;

      return {
        ...day,
        date: day._id,
        revenue: parseFloat(revenue.toFixed(2)),
        orders,
        itemsSold: day.itemsSold || 0,
        cost: parseFloat(cost.toFixed(2)),
        deliveryCost: parseFloat(deliveryCost.toFixed(2)),
        paymentFees: parseFloat(paymentFees.toFixed(2)),
        platformFees: parseFloat(platformFees.toFixed(2)),
        discounts: parseFloat(discounts.toFixed(2)),
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        profitMargin: parseFloat(profitMargin.toFixed(1)),
        aov: orders > 0 ? parseFloat((revenue / orders).toFixed(2)) : 0,
        actualDiscount: day.totalDiscount || 0,
        actualDeliveryCharges: day.deliveryCharges || 0,
        taxAmount: day.taxAmount || 0,
      };
    });

    // Calculate overall summary with profit
    const totalRevenue = summary?.totalRevenue || 0;
    const totalOrders = summary?.totalOrders || 0;
    const totalItemsSold = summary?.totalItemsSold || 0;
    const actualTotalDiscount = summary?.totalDiscount || 0;
    const actualDeliveryCharges = summary?.totalDeliveryCharges || 0;
    const actualTax = summary?.totalTax || 0;
    
    const totalCost = totalRevenue * assumptions.costPercentage;
    const totalDeliveryCost = totalOrders * assumptions.deliveryCostPerOrder;
    const totalPaymentFees = totalRevenue * assumptions.paymentGatewayFee;
    const totalPlatformFees = totalRevenue * assumptions.platformFee;
    const totalDiscounts = totalRevenue * assumptions.discountPercentage;
    const totalExpenses = totalCost + totalDeliveryCost + totalPaymentFees + totalPlatformFees + totalDiscounts;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const enhancedSummary = {
      ...summary,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalOrders,
      totalItemsSold,
      averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      totalDeliveryCost: parseFloat(totalDeliveryCost.toFixed(2)),
      totalPaymentFees: parseFloat(totalPaymentFees.toFixed(2)),
      totalPlatformFees: parseFloat(totalPlatformFees.toFixed(2)),
      totalDiscounts: parseFloat(totalDiscounts.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      profitMargin: parseFloat(profitMargin.toFixed(1)),
      grossProfit: parseFloat((totalRevenue - totalCost).toFixed(2)),
      actualTotalDiscount: parseFloat(actualTotalDiscount.toFixed(2)),
      actualDeliveryCharges: parseFloat(actualDeliveryCharges.toFixed(2)),
      actualTax: parseFloat(actualTax.toFixed(2)),
    };

    // Enhance category performance with profit calculations
    const enhancedCategoryPerformance = categoryPerformance.map(category => {
      const revenue = category.revenue || 0;
      const cost = revenue * assumptions.costPercentage;
      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const orders = category.orders || 0;
      const quantitySold = category.quantitySold || 0;
      const averagePrice = category.averagePrice || 0;

      return {
        ...category,
        revenue: parseFloat(revenue.toFixed(2)),
        cost: parseFloat(cost.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        margin: parseFloat(margin.toFixed(1)),
        orders,
        quantitySold,
        averagePrice: parseFloat(averagePrice.toFixed(2)),
        profitPerItem: quantitySold > 0 ? parseFloat((profit / quantitySold).toFixed(2)) : 0,
      };
    });

    // Enhance top products with profit calculations
    const enhancedTopProducts = topProducts.map(product => {
      const revenue = product.revenue || 0;
      const cost = revenue * assumptions.costPercentage;
      const profit = revenue - cost;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
      const quantitySold = product.quantitySold || 0;
      const orders = product.orders || 0;

      return {
        ...product,
        revenue: parseFloat(revenue.toFixed(2)),
        cost: parseFloat(cost.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        margin: parseFloat(margin.toFixed(1)),
        quantitySold,
        orders,
        averagePrice: product.averagePrice || 0,
        profitPerUnit: quantitySold > 0 ? parseFloat((profit / quantitySold).toFixed(2)) : 0,
      };
    });

    // Enhance payment method distribution
    const enhancedPaymentMethodDistribution = paymentMethodDistribution.map(payment => {
      const revenue = payment.revenue || 0;
      const orders = payment.orders || 0;
      const averageValue = payment.averageValue || 0;
      const percentage = payment.percentage || 0;

      return {
        ...payment,
        revenue: parseFloat(revenue.toFixed(2)),
        orders,
        averageValue: parseFloat(averageValue.toFixed(2)),
        percentage: parseFloat(percentage.toFixed(1)),
      };
    });

    return {
      summary: enhancedSummary,
      dailySales: enhancedDailySales,
      categoryPerformance: enhancedCategoryPerformance,
      topProducts: enhancedTopProducts,
      paymentMethodDistribution: enhancedPaymentMethodDistribution,
      revenueTrend: enhancedDailySales.map(day => ({
        date: day.date,
        revenue: day.revenue,
        profit: day.profit,
        orders: day.orders,
      })),
      dateRange: backendData.dateRange,
      generatedAt: backendData.generatedAt,
      assumptions,
    };
  };

  // Fetch real report data from API
  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please login.');
      }

      const params = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.category && { category: filters.category }),
        ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
      });

      const response = await fetch(`${API_BASE_URL}/reports/sales?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const salesData = await response.json();
      
      // Enhance data with profit calculations
      const enhancedData = calculateProfitData(salesData);
      setReportData(enhancedData);
      
    } catch (err) {
      setError(err.message || 'Failed to fetch report data');
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (range) => {
    const newFilters = { ...filters, timeRange: range };
    
    if (range !== 'custom') {
      const endDate = new Date();
      let startDate = new Date();
      
      switch(range) {
        case '1d':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }
      
      newFilters.startDate = startDate.toISOString().split('T')[0];
      newFilters.endDate = endDate.toISOString().split('T')[0];
    }
    
    setFilters(newFilters);
  };

  // Update assumptions
  const handleAssumptionChange = (key, value) => {
    setAssumptions(prev => ({
      ...prev,
      [key]: parseFloat(value)
    }));
  };

  // Apply updated assumptions
  const applyAssumptions = () => {
    if (reportData) {
      const recalculatedData = calculateProfitData({
        ...reportData,
        assumptions
      });
      setReportData(recalculatedData);
    }
    setShowAssumptions(false);
  };

  // Export to CSV
  const handleExport = () => {
    if (!reportData) return;
    
    try {
      // Create CSV content
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Add header
      csvContent += "Sales & Profit Report\n";
      csvContent += `Period: ${formatDate(filters.startDate)} to ${formatDate(filters.endDate)}\n`;
      csvContent += `Generated: ${formatDate(reportData.generatedAt)}\n\n`;
      
      // Add summary
      csvContent += "SUMMARY\n";
      csvContent += "Metric,Value\n";
      csvContent += `Total Revenue,₹${reportData.summary.totalRevenue.toFixed(2)}\n`;
      csvContent += `Total Orders,${reportData.summary.totalOrders}\n`;
      csvContent += `Total Items Sold,${reportData.summary.totalItemsSold}\n`;
      csvContent += `Average Order Value,₹${reportData.summary.averageOrderValue.toFixed(2)}\n`;
      csvContent += `Total Cost (${(assumptions.costPercentage * 100)}%),₹${reportData.summary.totalCost.toFixed(2)}\n`;
      csvContent += `Gross Profit,₹${reportData.summary.grossProfit.toFixed(2)}\n`;
      csvContent += `Delivery Costs (₹${assumptions.deliveryCostPerOrder}/order),₹${reportData.summary.totalDeliveryCost.toFixed(2)}\n`;
      csvContent += `Payment Fees (${(assumptions.paymentGatewayFee * 100)}%),₹${reportData.summary.totalPaymentFees.toFixed(2)}\n`;
      csvContent += `Platform Fees (${(assumptions.platformFee * 100)}%),₹${reportData.summary.totalPlatformFees.toFixed(2)}\n`;
      csvContent += `Discounts (${(assumptions.discountPercentage * 100)}%),₹${reportData.summary.totalDiscounts.toFixed(2)}\n`;
      csvContent += `Total Expenses,₹${reportData.summary.totalExpenses.toFixed(2)}\n`;
      csvContent += `Net Profit,₹${reportData.summary.netProfit.toFixed(2)}\n`;
      csvContent += `Profit Margin,${reportData.summary.profitMargin}%\n`;
      csvContent += `Min Order Value,₹${reportData.summary.minOrderValue?.toFixed(2) || 0}\n`;
      csvContent += `Max Order Value,₹${reportData.summary.maxOrderValue?.toFixed(2) || 0}\n\n`;
      
      // Add daily sales
      csvContent += "DAILY SALES\n";
      csvContent += "Date,Revenue,Cost,Profit,Profit Margin,Orders,Items Sold,AOV,Actual Discount,Actual Delivery\n";
      reportData.dailySales.forEach(row => {
        csvContent += `${row.date},₹${row.revenue.toFixed(2)},₹${row.cost.toFixed(2)},₹${row.profit.toFixed(2)},${row.profitMargin}%,${row.orders},${row.itemsSold},₹${row.aov.toFixed(2)},₹${row.actualDiscount.toFixed(2)},₹${row.actualDeliveryCharges.toFixed(2)}\n`;
      });
      
      csvContent += "\n";
      
      // Add category performance
      csvContent += "CATEGORY PERFORMANCE\n";
      csvContent += "Category,Revenue,Cost,Profit,Margin,Orders,Quantity Sold,Avg Price\n";
      reportData.categoryPerformance.forEach(row => {
        csvContent += `${row.category},₹${row.revenue.toFixed(2)},₹${row.cost.toFixed(2)},₹${row.profit.toFixed(2)},${row.margin}%,${row.orders},${row.quantitySold},₹${row.averagePrice.toFixed(2)}\n`;
      });
      
      csvContent += "\n";
      
      // Add top products
      csvContent += "TOP PRODUCTS\n";
      csvContent += "Product Name,Category,Revenue,Cost,Profit,Margin,Quantity Sold,Orders,Avg Price\n";
      reportData.topProducts.forEach(row => {
        csvContent += `${row.productName},${row.category},₹${row.revenue.toFixed(2)},₹${row.cost.toFixed(2)},₹${row.profit.toFixed(2)},${row.margin}%,${row.quantitySold},${row.orders},₹${row.averagePrice.toFixed(2)}\n`;
      });
      
      // Create download link
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `sales_profit_report_${filters.startDate}_to_${filters.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export report');
    }
  };

  // Initialize on component mount and when filters change
  useEffect(() => {
    fetchReportData();
  }, [filters]);

  // Show loading state
  if (loading && !reportData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading report data...</Typography>
      </Box>
    );
  }

  const data = reportData;

  return (
    <Box>
      {loading && <LinearProgress />}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Sales & Profit Report
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(filters.startDate)} to {formatDate(filters.endDate)}
            {data && ` • ${data.dateRange?.days || 0} days • Generated: ${formatDate(data.generatedAt)}`}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchReportData} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Calculation Assumptions">
            <IconButton onClick={() => setShowAssumptions(true)}>
              <Info />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
            disabled={!data || loading}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={filters.timeRange}
                  label="Time Range"
                  onChange={(e) => handleTimeRangeChange(e.target.value)}
                >
                  {timeRangeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, timeRange: 'custom' }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, timeRange: 'custom' }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="">All Categories</MenuItem>
                {data?.categoryPerformance.map(cat => (
                  <MenuItem key={cat.category} value={cat.category}>
                    {cat.category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Payment Method"
                value={filters.paymentMethod}
                onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
              >
                {paymentMethods.map(method => (
                  <MenuItem key={method.value} value={method.value}>
                    {method.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{ height: '56px' }}
                onClick={fetchReportData}
                disabled={loading}
                startIcon={<ShowChart />}
              >
                {loading ? 'Loading...' : 'Generate'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards with Profit/Loss */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#E8F5E9', borderRadius: '12px' }}>
                <AttachMoney sx={{ color: '#2E7D32', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  Total Revenue
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                  ₹{data?.summary.totalRevenue.toFixed(2)}
                </Typography>
                <Typography variant="caption">
                  {data?.summary.totalOrders} orders
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Net Profit Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 1.5, 
                bgcolor: data?.summary.netProfit >= 0 ? '#E8F5E9' : '#FFEBEE', 
                borderRadius: '12px' 
              }}>
                {data?.summary.netProfit >= 0 ? (
                  <TrendingUp sx={{ color: '#2E7D32', fontSize: 24 }} />
                ) : (
                  <TrendingDown sx={{ color: '#D32F2F', fontSize: 24 }} />
                )}
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  Net Profit
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold', 
                    color: data?.summary.netProfit >= 0 ? '#2E7D32' : '#D32F2F' 
                  }}>
                    ₹{data?.summary.netProfit.toFixed(2)}
                  </Typography>
                  <Chip 
                    label={`${data?.summary.profitMargin}%`}
                    size="small"
                    color={data?.summary.netProfit >= 0 ? 'success' : 'error'}
                    variant="outlined"
                  />
                </Box>
                <Typography variant="caption">
                  Margin
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#E3F2FD', borderRadius: '12px' }}>
                <ShoppingCart sx={{ color: '#1976D2', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  Total Orders
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {data?.summary.totalOrders}
                </Typography>
                <Typography variant="caption">
                  {data?.summary.totalItemsSold} items
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* AOV Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#F3E5F5', borderRadius: '12px' }}>
                <LocalOffer sx={{ color: '#7B1FA2', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  Avg Order Value
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ₹{data?.summary.averageOrderValue.toFixed(2)}
                </Typography>
                <Typography variant="caption">
                  Min: ₹{data?.summary.minOrderValue?.toFixed(2) || 0}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gross Profit Card */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#FFF3E0', borderRadius: '12px' }}>
                <MoneyOff sx={{ color: '#F57C00', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography color="textSecondary" variant="body2">
                  Gross Profit
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#F57C00' }}>
                  ₹{data?.summary.grossProfit.toFixed(2)}
                </Typography>
                <Typography variant="caption">
                  {((data?.summary.grossProfit / data?.summary.totalRevenue) * 100).toFixed(1)}% margin
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Expense Breakdown */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Expense Breakdown
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center', p: 2, borderRight: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary">
                  Cost of Goods
                </Typography>
                <Typography variant="h6" color="warning.main">
                  ₹{data?.summary.totalCost.toFixed(2)}
                </Typography>
                <Typography variant="caption">
                  {assumptions.costPercentage * 100}% of revenue
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center', p: 2, borderRight: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary">
                  Delivery Costs
                </Typography>
                <Typography variant="h6" color="info.main">
                  ₹{data?.summary.totalDeliveryCost.toFixed(2)}
                </Typography>
                <Typography variant="caption">
                  ₹{assumptions.deliveryCostPerOrder} per order
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center', p: 2, borderRight: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary">
                  Payment Fees
                </Typography>
                <Typography variant="h6" color="info.main">
                  ₹{data?.summary.totalPaymentFees.toFixed(2)}
                </Typography>
                <Typography variant="caption">
                  {assumptions.paymentGatewayFee * 100}% of revenue
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center', p: 2, borderRight: '1px solid #eee' }}>
                <Typography variant="body2" color="text.secondary">
                  Platform Fees
                </Typography>
                <Typography variant="h6" color="info.main">
                  ₹{data?.summary.totalPlatformFees.toFixed(2)}
                </Typography>
                <Typography variant="caption">
                  {assumptions.platformFee * 100}% of revenue
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Discounts
                </Typography>
                <Typography variant="h6" color="error.main">
                  ₹{data?.summary.totalDiscounts.toFixed(2)}
                </Typography>
                <Typography variant="caption">
                  {assumptions.discountPercentage * 100}% of revenue
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Daily Sales & Profit Table */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Daily Sales & Profit Analysis
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Showing {data?.dailySales.length} days
            </Typography>
          </Box>
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Revenue (₹)</TableCell>
                  <TableCell align="right">Cost (₹)</TableCell>
                  <TableCell align="right">Profit (₹)</TableCell>
                  <TableCell align="right">Margin</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">AOV (₹)</TableCell>
                  <TableCell align="right">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.dailySales.map((row) => (
                  <TableRow key={row.date} hover>
                    <TableCell>{formatDate(row.date)}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="success.main">
                        ₹{row.revenue.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="warning.main">
                        ₹{row.cost.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ 
                        fontWeight: 'bold',
                        color: row.profit >= 0 ? 'success.main' : 'error.main'
                      }}>
                        ₹{row.profit.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip 
                        label={`${row.profitMargin}%`}
                        size="small"
                        color={row.profitMargin >= 10 ? 'success' : row.profitMargin >= 0 ? 'warning' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">{row.orders}</TableCell>
                    <TableCell align="right">{row.itemsSold}</TableCell>
                    <TableCell align="right">₹{row.aov.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      {row.profit >= 0 ? '✅ Profitable' : '⚠️ Loss'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Revenue vs Profit Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue vs Profit Trend
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'flex-end', gap: 2, p: 2 }}>
                {data?.dailySales.map((day, index) => (
                  <Box key={day.date} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', width: '100%', gap: 1 }}>
                      {/* Revenue bar */}
                      <Box sx={{ 
                        width: '40%',
                        height: `${Math.min((day.revenue / 1000) * 3, 200)}px`,
                        bgcolor: '#8884d8',
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                      }}>
                        <Tooltip title={`Revenue: ₹${day.revenue.toFixed(2)}`}>
                          <Box sx={{ 
                            position: 'absolute', 
                            top: -25, 
                            width: '100%', 
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#8884d8'
                          }}>
                            ₹{day.revenue > 1000 ? `${(day.revenue/1000).toFixed(0)}k` : day.revenue.toFixed(0)}
                          </Box>
                        </Tooltip>
                      </Box>
                      
                      {/* Profit bar */}
                      <Box sx={{ 
                        width: '40%',
                        height: `${Math.min((Math.abs(day.profit) / 500) * 3, 200)}px`,
                        bgcolor: day.profit >= 0 ? '#82ca9d' : '#ff6b6b',
                        borderRadius: '4px 4px 0 0',
                        position: 'relative',
                      }}>
                        <Tooltip title={`Profit: ₹${day.profit.toFixed(2)}`}>
                          <Box sx={{ 
                            position: 'absolute', 
                            top: -25, 
                            width: '100%', 
                            textAlign: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: day.profit >= 0 ? '#82ca9d' : '#ff6b6b'
                          }}>
                            ₹{Math.abs(day.profit).toFixed(0)}
                          </Box>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>
                      {formatDateShort(day.date)}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 10, bgcolor: '#8884d8' }} />
                  <Typography variant="caption">Revenue</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 10, bgcolor: '#82ca9d' }} />
                  <Typography variant="caption">Profit (Positive)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 20, height: 10, bgcolor: '#ff6b6b' }} />
                  <Typography variant="caption">Loss (Negative)</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Category Performance */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Categories
              </Typography>
              <Box sx={{ height: 300, overflowY: 'auto' }}>
                {data?.categoryPerformance.slice(0, 8).map((category, index) => (
                  <Box key={category.category} sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {category.category}
                      </Typography>
                      <Chip 
                        label={`${category.margin}%`}
                        size="small"
                        color={category.margin >= 30 ? 'success' : category.margin >= 20 ? 'warning' : 'error'}
                        variant="outlined"
                      />
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ width: 60 }}>Revenue:</Typography>
                      <Typography variant="caption" sx={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>
                        ₹{category.revenue.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ width: 60 }}>Profit:</Typography>
                      <Typography variant="caption" sx={{ 
                        flex: 1, 
                        textAlign: 'right', 
                        fontWeight: 'bold',
                        color: category.profit >= 0 ? 'success.main' : 'error.main'
                      }}>
                        ₹{category.profit.toFixed(2)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" sx={{ width: 60 }}>Sold:</Typography>
                      <Typography variant="caption" sx={{ flex: 1, textAlign: 'right' }}>
                        {category.quantitySold} units
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      height: 4, 
                      bgcolor: '#eee', 
                      borderRadius: 2, 
                      mt: 0.5,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{ 
                        width: `${(category.revenue / (data.categoryPerformance[0]?.revenue || 1)) * 100}%`,
                        height: '100%',
                        bgcolor: category.profit >= 0 ? '#82ca9d' : '#ff6b6b',
                      }} />
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Products Table */}
      {data?.topProducts && data.topProducts.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Top Performing Products
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Revenue (₹)</TableCell>
                    <TableCell align="right">Cost (₹)</TableCell>
                    <TableCell align="right">Profit (₹)</TableCell>
                    <TableCell align="right">Margin</TableCell>
                    <TableCell align="right">Quantity Sold</TableCell>
                    <TableCell align="right">Avg Price (₹)</TableCell>
                    <TableCell align="right">Orders</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.topProducts.map((product, index) => (
                    <TableRow key={product.productId} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {product.productName}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="success.main">
                          ₹{product.revenue.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="warning.main">
                          ₹{product.cost.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold',
                          color: product.profit >= 0 ? 'success.main' : 'error.main'
                        }}>
                          ₹{product.profit.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${product.margin}%`}
                          size="small"
                          color={product.margin >= 30 ? 'success' : product.margin >= 20 ? 'warning' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">{product.quantitySold}</TableCell>
                      <TableCell align="right">₹{product.averagePrice.toFixed(2)}</TableCell>
                      <TableCell align="right">{product.orders}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Payment Method Distribution */}
      {data?.paymentMethodDistribution && data.paymentMethodDistribution.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment Method Distribution
            </Typography>
            <Grid container spacing={2}>
              {data.paymentMethodDistribution.map((payment, index) => (
                <Grid item xs={6} sm={4} md={2.4} key={payment.paymentMethod}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {payment.paymentMethod.toUpperCase()}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                        ₹{payment.revenue.toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payment.orders} orders
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip 
                          label={`${payment.percentage}%`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="caption">
                        Avg: ₹{payment.averageValue.toFixed(2)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Assumptions Dialog */}
      <Dialog open={showAssumptions} onClose={() => setShowAssumptions(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Profit Calculation Assumptions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Adjust these assumptions based on your actual business metrics. Changes will recalculate all profit data.
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cost Percentage (%)"
                  type="number"
                  value={assumptions.costPercentage * 100}
                  onChange={(e) => handleAssumptionChange('costPercentage', parseFloat(e.target.value) / 100)}
                  InputProps={{ inputProps: { min: 0, max: 100, step: 0.1 } }}
                  helperText="Cost of goods sold as % of revenue"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Delivery Cost per Order (₹)"
                  type="number"
                  value={assumptions.deliveryCostPerOrder}
                  onChange={(e) => handleAssumptionChange('deliveryCostPerOrder', parseFloat(e.target.value))}
                  InputProps={{ inputProps: { min: 0, step: 1 } }}
                  helperText="Average delivery cost per order"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Payment Gateway Fee (%)"
                  type="number"
                  value={assumptions.paymentGatewayFee * 100}
                  onChange={(e) => handleAssumptionChange('paymentGatewayFee', parseFloat(e.target.value) / 100)}
                  InputProps={{ inputProps: { min: 0, max: 10, step: 0.1 } }}
                  helperText="Payment processing fees as % of revenue"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Platform/Operational Fee (%)"
                  type="number"
                  value={assumptions.platformFee * 100}
                  onChange={(e) => handleAssumptionChange('platformFee', parseFloat(e.target.value) / 100)}
                  InputProps={{ inputProps: { min: 0, max: 20, step: 0.1 } }}
                  helperText="Platform maintenance & operational costs"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Average Discount (%)"
                  type="number"
                  value={assumptions.discountPercentage * 100}
                  onChange={(e) => handleAssumptionChange('discountPercentage', parseFloat(e.target.value) / 100)}
                  InputProps={{ inputProps: { min: 0, max: 50, step: 0.1 } }}
                  helperText="Average discount given as % of revenue"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAssumptions(false)}>Cancel</Button>
          <Button 
            onClick={applyAssumptions} 
            variant="contained"
            color="primary"
          >
            Apply Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Note about calculations */}
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Note:</strong> Profit calculations are based on business assumptions that you can adjust above.
          <br />
          • Actual data from backend includes: Revenue, Orders, Items Sold, Discounts, Delivery Charges, and Tax
          <br />
          • Calculated metrics include: Cost, Profit, Expenses based on your configured assumptions
          <br />
          • Click the ⓘ icon to adjust calculation assumptions
        </Typography>
      </Alert>
    </Box>
  );
};

export default SalesReport;