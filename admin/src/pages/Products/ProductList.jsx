// src/pages/Products/ProductList.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Switch,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Paper,
  Tooltip,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon,
  Delete as DeleteIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [filters, setFilters] = useState({
    page: 0,
    rowsPerPage: 10,
    search: '',
    category: '',
    stockStatus: '',
  });

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: (filters.page + 1).toString(),
        limit: filters.rowsPerPage.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
        ...(filters.stockStatus && { stockStatus: filters.stockStatus }),
      });

      const response = await fetch(`https://api.sampurnamart.cloud/api/products?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setSnackbar({ open: true, message: 'Error fetching products', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://api.sampurnamart.cloud/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters.page, filters.rowsPerPage, filters.search, filters.category, filters.stockStatus]);

  const handleSearch = (event) => {
    setFilters(prev => ({ ...prev, search: event.target.value, page: 0 }));
  };

  const handleCategoryFilter = (event) => {
    setFilters(prev => ({ ...prev, category: event.target.value, page: 0 }));
  };

  const handleStockFilter = (event) => {
    setFilters(prev => ({ ...prev, stockStatus: event.target.value, page: 0 }));
  };

  const handleStatusToggle = async (product) => {
    try {
      const response = await fetch(`https://api.sampurnamart.cloud/api/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          inStock: !product.inStock,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to update product status');
      
      const updatedProduct = await response.json();
      setProducts(prev => prev.map(p => 
        p._id === updatedProduct._id ? updatedProduct : p
      ));
      
      setSnackbar({ open: true, message: 'Product status updated', severity: 'success' });
    } catch (error) {
      console.error('Error updating product status:', error);
      setSnackbar({ open: true, message: 'Error updating product status', severity: 'error' });
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm(`Delete product "${product.title}"?`)) {
      try {
        const response = await fetch(`https://api.sampurnamart.cloud/api/products/${product._id}`, {
          method: 'DELETE',
        });

        if (!response.ok) throw new Error('Failed to delete product');
        
        setProducts(prev => prev.filter(p => p._id !== product._id));
        setSnackbar({ open: true, message: 'Product deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting product:', error);
        setSnackbar({ open: true, message: 'Error deleting product', severity: 'error' });
      }
    }
  };

  const handleEdit = (product) => {
    navigate(`/products/edit/${product._id}`);
  };

  const handleChangePage = (event, newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    setFilters(prev => ({ 
      ...prev, 
      rowsPerPage: parseInt(event.target.value, 10),
      page: 0 
    }));
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Get unique main categories for filter
  const mainCategories = [...new Set(categories
    .filter(cat => cat.type === 'main')
    .map(cat => cat.name)
  )];

  if (loading && products.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Product Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/products/new')}
        >
          Add New Product
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search products..."
                value={filters.search}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Category"
                value={filters.category}
                onChange={handleCategoryFilter}
              >
                <MenuItem value="">All Categories</MenuItem>
                {mainCategories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Stock Status"
                value={filters.stockStatus}
                onChange={handleStockFilter}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="in_stock">In Stock</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Image</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Features</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product._id} hover>
                  <TableCell>
                    <Box
                      sx={{
                        width: 50,
                        height: 50,
                        borderRadius: 1,
                        backgroundColor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        backgroundImage: product.image ? `url(${product.image})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                     {product.images?.length > 0 ? (
  <img 
    src={product.images[0]} 
    alt="product"
    style={{ width: "100px", height: "50px" }}
  />
) : (
  '🛒'
)}

                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {product.title}
                      </Typography>
                      {product.subtitle && (
                        <Typography variant="caption" color="text.secondary">
                          {product.subtitle}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {product.category?.mainCategory || 'N/A'}
                      </Typography>
                      {product.category?.subCategory && (
                        <Typography variant="caption" color="text.secondary">
                          {product.category.subCategory}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="bold" color="primary">
                        ₹{product.price}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                        ₹{product.mrp}
                      </Typography>
                      {product.discount > 0 && (
                        <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                          {product.discount}% off
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.stockQuantity} 
                      color={product.stockQuantity > 10 ? 'success' : product.stockQuantity > 0 ? 'warning' : 'error'}
                      size="small"
                      variant={product.inStock ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={product.inStock}
                      color="success"
                      onChange={() => handleStatusToggle(product)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {product.isTopSelling && <Chip label="Top" size="small" color="primary" variant="outlined" />}
                      {product.isTodaysDeal && <Chip label="Deal" size="small" color="secondary" variant="outlined" />}
                      {product.isHotDeal && <Chip label="Hot" size="small" color="error" variant="outlined" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton 
                          color="primary" 
                          size="small"
                          onClick={() => handleEdit(product)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton 
                          color="error" 
                          size="small"
                          onClick={() => handleDelete(product)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={products.length} // You might want to get total count from API
          rowsPerPage={filters.rowsPerPage}
          page={filters.page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductList;