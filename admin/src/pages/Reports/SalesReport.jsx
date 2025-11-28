// src/pages/Reports/SalesReport.jsx
import React, { useState } from 'react';
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
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

const SalesReport = () => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
  });

  // Mock data
  const salesData = [
    { date: '2024-01-01', revenue: 24000, orders: 45, aov: 533 },
    { date: '2024-01-02', revenue: 18900, orders: 38, aov: 497 },
    { date: '2024-01-03', revenue: 31200, orders: 52, aov: 600 },
    { date: '2024-01-04', revenue: 27800, orders: 48, aov: 579 },
    { date: '2024-01-05', revenue: 34500, orders: 58, aov: 595 },
  ];

  const categoryData = [
    { name: 'Fruits', revenue: 45000, orders: 120 },
    { name: 'Vegetables', revenue: 38000, orders: 95 },
    { name: 'Dairy', revenue: 29000, orders: 85 },
    { name: 'Bakery', revenue: 22000, orders: 70 },
    { name: 'Beverages', revenue: 18000, orders: 60 },
  ];

  const summary = {
    totalRevenue: 152000,
    totalOrders: 430,
    averageOrderValue: 535,
    totalDiscounts: 15000,
  };

  const handleExport = () => {
    alert('Export functionality would be implemented here!');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Sales Report
        </Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export Report
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="fruits">Fruits</MenuItem>
                <MenuItem value="vegetables">Vegetables</MenuItem>
                <MenuItem value="dairy">Dairy</MenuItem>
                <MenuItem value="bakery">Bakery</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                fullWidth
                sx={{ height: '56px' }}
                onClick={() => alert('Report generated!')}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Revenue
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                ₹{summary.totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Orders
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {summary.totalOrders}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Average Order Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                ₹{summary.averageOrderValue}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Discounts
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF6B6B' }}>
                ₹{summary.totalDiscounts.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Trend
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  Revenue Line Chart Visualization
                </Typography>
                <Typography variant="h4" color="primary">
                  📈
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Line chart showing daily revenue trends
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue by Category
              </Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <Typography color="textSecondary" sx={{ mb: 2 }}>
                  Category Bar Chart
                </Typography>
                <Typography variant="h4" color="primary">
                  📊
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Bar chart showing revenue by category
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Daily Sales Details
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Orders</TableCell>
                  <TableCell align="right">Average Order Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salesData.map((row) => (
                  <TableRow key={row.date}>
                    <TableCell>{row.date}</TableCell>
                    <TableCell align="right">₹{row.revenue.toLocaleString()}</TableCell>
                    <TableCell align="right">{row.orders}</TableCell>
                    <TableCell align="right">₹{row.aov}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SalesReport;