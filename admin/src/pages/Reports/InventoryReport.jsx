// src/pages/Reports/InventoryReport.jsx
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
  Chip,
} from '@mui/material';
import { Download as DownloadIcon, Warning as WarningIcon } from '@mui/icons-material';

const InventoryReport = () => {
  const [filters, setFilters] = useState({
    category: '',
    stockStatus: '',
  });

  // Mock data
  const inventoryData = [
    {
      id: 1,
      title: 'Organic Bananas',
      category: 'Fruits',
      currentStock: 5,
      minimumStock: 10,
      status: 'low',
      value: 2500,
    },
    {
      id: 2,
      title: 'Fresh Milk 1L',
      category: 'Dairy',
      currentStock: 3,
      minimumStock: 15,
      status: 'low',
      value: 1950,
    },
    {
      id: 3,
      title: 'Whole Wheat Bread',
      category: 'Bakery',
      currentStock: 25,
      minimumStock: 20,
      status: 'adequate',
      value: 2250,
    },
    {
      id: 4,
      title: 'Organic Apples',
      category: 'Fruits',
      currentStock: 45,
      minimumStock: 15,
      status: 'excess',
      value: 9000,
    },
    {
      id: 5,
      title: 'Greek Yogurt',
      category: 'Dairy',
      currentStock: 0,
      minimumStock: 10,
      status: 'out',
      value: 0,
    },
  ];

  const summary = {
    totalProducts: 156,
    lowStockItems: 12,
    outOfStockItems: 3,
    totalInventoryValue: 245000,
  };

  const getStatusColor = (status) => {
    const colors = {
      out: 'error',
      low: 'warning',
      adequate: 'success',
      excess: 'info',
    };
    return colors[status];
  };

  const getStatusText = (status) => {
    const texts = {
      out: 'Out of Stock',
      low: 'Low Stock',
      adequate: 'Adequate',
      excess: 'Excess Stock',
    };
    return texts[status];
  };

  const handleExport = () => {
    alert('Export functionality would be implemented here!');
  };

  const filteredData = inventoryData.filter(item => {
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesStatus = !filters.stockStatus || item.status === filters.stockStatus;
    return matchesCategory && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Inventory Report
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="Fruits">Fruits</MenuItem>
                <MenuItem value="Vegetables">Vegetables</MenuItem>
                <MenuItem value="Dairy">Dairy</MenuItem>
                <MenuItem value="Bakery">Bakery</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Stock Status"
                value={filters.stockStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="low">Low Stock</MenuItem>
                <MenuItem value="out">Out of Stock</MenuItem>
                <MenuItem value="adequate">Adequate</MenuItem>
                <MenuItem value="excess">Excess Stock</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
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
                Total Products
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {summary.totalProducts}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="overline">
                  Low Stock Items
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#FF9800' }}>
                {summary.lowStockItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WarningIcon color="error" sx={{ mr: 1 }} />
                <Typography color="textSecondary" variant="overline">
                  Out of Stock
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F44336' }}>
                {summary.outOfStockItems}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="overline">
                Total Inventory Value
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                ₹{summary.totalInventoryValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Inventory Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Inventory Details
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Minimum Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Inventory Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.title}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell align="right">{item.currentStock}</TableCell>
                    <TableCell align="right">{item.minimumStock}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(item.status)}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">₹{item.value.toLocaleString()}</TableCell>
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

export default InventoryReport;