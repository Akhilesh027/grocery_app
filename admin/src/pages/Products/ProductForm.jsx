// src/pages/Products/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  Chip,
  IconButton,
} from '@mui/material';
import { 
  Save, 
  ArrowBack, 
  CloudUpload, 
  Image as ImageIcon,
  Delete,
  Add 
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [offerCategories, setOfferCategories] = useState([]);
  const [offerSubCategories, setOfferSubCategories] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [selectedImages, setSelectedImages] = useState([]);

  const [product, setProduct] = useState({
    title: '',
    subtitle: '',
    sku: '',
    price: '',
    mrp: '',
    images: [],
    inStock: true,
    stockQuantity: 0,
    lowStockAlert: 10,
    deliveryTime: '',
    rating: 0,
    category: {
      mainCategory: '',
      subCategory: '',
      offerCategory: '',
      offerSubCategory: '',
    },
    brand: '',
    description: '',
    weight: '',
    dimensions: '',
    shippingWeight: '',
    isFreeShipping: false,
    isTopSelling: false,
    isTodaysDeal: false,
    isHotDeal: false,
    isFeatured: false,
    metaTitle: '',
    metaDescription: '',
  });

  // Fetch categories and offer categories
  const fetchCategories = async () => {
    try {
      const [categoriesRes, offerCategoriesRes] = await Promise.all([
        fetch('https://grocery-c3c0.onrender.com/api/categories'),
        fetch('https://grocery-c3c0.onrender.com/api/offers/categories')
      ]);
      
      if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
      if (!offerCategoriesRes.ok) throw new Error('Failed to fetch offer categories');
      
      const categoriesData = await categoriesRes.json();
      const offerCategoriesData = await offerCategoriesRes.json();
      
      setCategories(categoriesData);
      setOfferCategories(offerCategoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({ open: true, message: 'Error fetching categories', severity: 'error' });
    }
  };

  // Fetch offer subcategories when offer category changes
  const fetchOfferSubCategories = async (offerCategoryId) => {
    if (!offerCategoryId) {
      setOfferSubCategories([]);
      return;
    }
    
    try {
      const response = await fetch(`https://grocery-c3c0.onrender.com/api/offers/subcategories/${offerCategoryId}`);
      if (!response.ok) throw new Error('Failed to fetch offer subcategories');
      const data = await response.json();
      setOfferSubCategories(data);
    } catch (error) {
      console.error('Error fetching offer subcategories:', error);
    }
  };

  // Fetch product data for editing
  const fetchProduct = async () => {
    if (!isEdit) return;
    
    try {
      setLoading(true);
      const response = await fetch(`https://grocery-c3c0.onrender.com/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      const productData = await response.json();
      
      setProduct({
        ...productData,
        images: productData.images || []
      });
      
      // Set specifications
      if (productData.specifications) {
        const specsArray = Array.isArray(productData.specifications) 
          ? productData.specifications 
          : Object.entries(productData.specifications).map(([key, value]) => ({
              key,
              value
            }));
        setSpecifications(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }]);
      }
      
      // Fetch offer subcategories if offer category exists
      if (productData.category?.offerCategory) {
        fetchOfferSubCategories(productData.category.offerCategory);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setSnackbar({ open: true, message: 'Error fetching product', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [isEdit, id]);

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProduct(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));

      // If offer category changes, fetch its subcategories
      if (field === 'category.offerCategory') {
        fetchOfferSubCategories(value);
      }
    } else {
      setProduct(prev => ({ ...prev, [field]: value }));
    }
  };

  // Handle specifications
  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index][field] = value;
    setSpecifications(updatedSpecs);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    if (specifications.length > 1) {
      const updatedSpecs = specifications.filter((_, i) => i !== index);
      setSpecifications(updatedSpecs);
    }
  };

  // Image selection handler
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;

    // Store selected files for form submission
    setSelectedImages(prev => [...prev, ...files]);

    // Create preview URLs for immediate display
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setProduct(prev => ({
      ...prev,
      images: [...prev.images, ...newPreviews]
    }));

    // Reset file input
    event.target.value = '';
  };

  // Remove image handler
  const removeImage = (index) => {
    const currentImages = [...product.images];
    const currentSelectedImages = [...selectedImages];
    
    // Remove from both previews and selected files
    currentImages.splice(index, 1);
    currentSelectedImages.splice(index, 1);
    
    setProduct(prev => ({ ...prev, images: currentImages }));
    setSelectedImages(currentSelectedImages);
  };

  const calculateDiscount = () => {
    if (product.mrp && product.price) {
      return Math.round(((product.mrp - product.price) / product.mrp) * 100);
    }
    return 0;
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const brandPrefix = product.brand ? product.brand.substring(0, 3).toUpperCase() : 'PRO';
    const newSKU = `${brandPrefix}-${timestamp}-${random}`;
    handleChange('sku', newSKU);
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation
  if (!product.title || !product.price || !product.mrp || !product.category.mainCategory) {
    setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
    return;
  }

  if (parseFloat(product.price) > parseFloat(product.mrp)) {
    setSnackbar({ open: true, message: 'Selling price cannot be greater than MRP', severity: 'error' });
    return;
  }

  if (!product.sku) {
    setSnackbar({ open: true, message: 'Please generate or enter SKU', severity: 'error' });
    return;
  }

  try {
    setLoading(true);
    setUploading(true);
    
    // Prepare form data
    const formData = new FormData();
    
    // Add individual fields instead of JSON string
    formData.append('title', product.title);
    formData.append('subtitle', product.subtitle);
    formData.append('sku', product.sku);
    formData.append('price', parseFloat(product.price));
    formData.append('mrp', parseFloat(product.mrp));
    formData.append('description', product.description);
    formData.append('brand', product.brand);
    formData.append('mainCategory', product.category.mainCategory);
    formData.append('subCategory', product.category.subCategory || '');
    formData.append('offerCategory', product.category.offerCategory || '');
    formData.append('offerSubCategory', product.category.offerSubCategory || '');
    formData.append('weight', product.weight || '');
    formData.append('dimensions', product.dimensions || '');
    formData.append('shippingWeight', product.shippingWeight ? parseFloat(product.shippingWeight) : '');
    formData.append('deliveryTime', product.deliveryTime || '');
    formData.append('lowStockAlert', parseInt(product.lowStockAlert) || 10);
    formData.append('stockQuantity', parseInt(product.stockQuantity) || 0);
    formData.append('inStock', product.inStock);
    formData.append('isFreeShipping', product.isFreeShipping);
    formData.append('isTopSelling', product.isTopSelling);
    formData.append('isTodaysDeal', product.isTodaysDeal);
    formData.append('isHotDeal', product.isHotDeal);
    formData.append('isFeatured', product.isFeatured);
    formData.append('metaTitle', product.metaTitle || '');
    formData.append('metaDescription', product.metaDescription || '');
    formData.append('status', 'draft');

    // Add specifications as JSON string
    const specsObj = {};
    specifications.forEach(spec => {
      if (spec.key && spec.value) {
        specsObj[spec.key] = spec.value;
      }
    });
    formData.append('specifications', JSON.stringify(specsObj));

    // Add images to form data
    selectedImages.forEach((file) => {
      formData.append('images', file);
    });

    const url = isEdit ? `https://grocery-c3c0.onrender.com/api/products/${id}` : 'https://grocery-c3c0.onrender.com/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    console.log('Submitting form data...');
    
    const response = await fetch(url, {
      method,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} product`);
    }

    const result = await response.json();
    
    setSnackbar({ 
      open: true, 
      message: `Product ${isEdit ? 'updated' : 'created'} successfully!`, 
      severity: 'success' 
    });

    // Clear selected images after successful submission
    setSelectedImages([]);

    // Redirect after successful submission
    setTimeout(() => {
      navigate('/products');
    }, 1000);

  } catch (error) {
    console.error('Error saving product:', error);
    setSnackbar({ 
      open: true, 
      message: `Error ${isEdit ? 'updating' : 'creating'} product: ${error.message}`, 
      severity: 'error' 
    });
  } finally {
    setLoading(false);
    setUploading(false);
  }
};
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Get unique main categories and subcategories
  const mainCategories = categories.filter(cat => cat.type === 'main');
  const subCategories = categories.filter(cat => 
    cat.type === 'sub' && cat.parentCategory === product.category.mainCategory
  );

  const tabContent = [
    // Tab 1: Basic Info & Pricing
    <Grid container spacing={3} key="basic-info">
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Product Title *"
          value={product.title}
          onChange={(e) => handleChange('title', e.target.value)}
          required
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="SKU *"
            value={product.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            required
            disabled={loading}
            placeholder="Generate or enter unique SKU"
          />
          <Button
            variant="outlined"
            onClick={generateSKU}
            disabled={loading}
            sx={{ minWidth: 'auto' }}
          >
            Generate
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Subtitle (Quantity Description)"
          value={product.subtitle}
          onChange={(e) => handleChange('subtitle', e.target.value)}
          placeholder="e.g., 1 kg, 500 ml, 12 pieces"
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Product Description"
          value={product.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Detailed product description..."
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="MRP *"
          type="number"
          value={product.mrp}
          onChange={(e) => handleChange('mrp', e.target.value)}
          required
          disabled={loading}
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Selling Price *"
          type="number"
          value={product.price}
          onChange={(e) => handleChange('price', e.target.value)}
          required
          disabled={loading}
          InputProps={{
            startAdornment: <InputAdornment position="start">₹</InputAdornment>,
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pricing Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} md={3}>
                <Typography color="textSecondary">MRP:</Typography>
                <Typography variant="h6">₹{product.mrp || 0}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography color="textSecondary">Selling Price:</Typography>
                <Typography variant="h6">₹{product.price || 0}</Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography color="textSecondary">Discount:</Typography>
                <Typography variant="h6" color="success.main">
                  {calculateDiscount()}%
                </Typography>
              </Grid>
              <Grid item xs={6} md={3}>
                <Typography color="textSecondary">You Save:</Typography>
                <Typography variant="h6" color="success.main">
                  ₹{((product.mrp - product.price) || 0).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>,

    // Tab 2: Categorization & Inventory
    <Grid container spacing={3} key="categorization">
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          select
          label="Main Category *"
          value={product.category.mainCategory}
          onChange={(e) => handleChange('category.mainCategory', e.target.value)}
          required
          disabled={loading}
        >
          <MenuItem value="">Select Main Category</MenuItem>
          {mainCategories.map((cat) => (
            <MenuItem key={cat._id} value={cat.name}>{cat.name}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          select
          label="Sub Category"
          value={product.category.subCategory}
          onChange={(e) => handleChange('category.subCategory', e.target.value)}
          disabled={!product.category.mainCategory || loading}
        >
          <MenuItem value="">Select Sub-category (Optional)</MenuItem>
          {subCategories.map((subCat) => (
            <MenuItem key={subCat._id} value={subCat.name}>{subCat.name}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          select
          label="Offer Category"
          value={product.category.offerCategory}
          onChange={(e) => handleChange('category.offerCategory', e.target.value)}
          disabled={loading}
        >
          <MenuItem value="">Select Offer Category (Optional)</MenuItem>
          {offerCategories.map((cat) => (
            <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          select
          label="Offer Sub Category"
          value={product.category.offerSubCategory}
          onChange={(e) => handleChange('category.offerSubCategory', e.target.value)}
          disabled={!product.category.offerCategory || loading}
        >
          <MenuItem value="">Select Offer Sub-category (Optional)</MenuItem>
          {offerSubCategories.map((subCat) => (
            <MenuItem key={subCat._id} value={subCat._id}>{subCat.name}</MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Brand"
          value={product.brand}
          onChange={(e) => handleChange('brand', e.target.value)}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Delivery Time"
          value={product.deliveryTime}
          onChange={(e) => handleChange('deliveryTime', e.target.value)}
          placeholder="e.g., 15 mins, 30 mins"
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Stock Quantity"
          type="number"
          value={product.stockQuantity}
          onChange={(e) => handleChange('stockQuantity', e.target.value)}
          disabled={loading}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <TextField
          fullWidth
          label="Low Stock Alert"
          type="number"
          value={product.lowStockAlert}
          onChange={(e) => handleChange('lowStockAlert', e.target.value)}
          disabled={loading}
          helperText="Alert when stock reaches this level"
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <FormControlLabel
          control={
            <Switch
              checked={product.inStock}
              onChange={(e) => handleChange('inStock', e.target.checked)}
              color="success"
              disabled={loading}
            />
          }
          label="In Stock"
        />
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Product Specifications
        </Typography>
        {specifications.map((spec, index) => (
          <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Specification Key"
                value={spec.key}
                onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                placeholder="e.g., Color, Size, Material"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={5}>
              <TextField
                fullWidth
                label="Specification Value"
                value={spec.value}
                onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                placeholder="e.g., Red, Large, Cotton"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={2}>
              <IconButton
                onClick={() => removeSpecification(index)}
                disabled={loading || specifications.length === 1}
                color="error"
              >
                <Delete />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Button
          startIcon={<Add />}
          onClick={addSpecification}
          disabled={loading}
          variant="outlined"
        >
          Add Specification
        </Button>
      </Grid>
    </Grid>,

    // Tab 3: Media & Marketing
    <Grid container spacing={3} key="marketing">
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Product Images
        </Typography>
      </Grid>

      {/* Image Upload Section */}
      <Grid item xs={12}>
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Upload Button */}
              <Box>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageSelect}
                  disabled={loading || uploading}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={loading || uploading}
                  >
                    Select Images
                  </Button>
                </label>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Recommended: 800x800px, JPG/PNG/WEBP (Max 10 images)
                </Typography>
              </Box>
            </Box>

            {/* Images Preview */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Images ({product.images?.length || 0})
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {product.images?.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: index === 0 ? 'primary.main' : 'divider',
                        backgroundImage: `url(${image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: 'grey.100',
                      }}
                    />
                    {index === 0 && (
                      <Chip 
                        label="Main" 
                        size="small" 
                        color="primary" 
                        sx={{ 
                          position: 'absolute', 
                          top: -8, 
                          left: -8,
                          fontSize: '0.6rem'
                        }} 
                      />
                    )}
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'error.main',
                        color: 'white',
                        '&:hover': { backgroundColor: 'error.dark' }
                      }}
                      onClick={() => removeImage(index)}
                      disabled={loading}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                {/* Empty State */}
                {(!product.images || product.images.length === 0) && (
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      border: '2px dashed',
                      borderColor: 'grey.400',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'grey.50',
                      flexDirection: 'column',
                      gap: 1
                    }}
                  >
                    <ImageIcon sx={{ color: 'grey.400', fontSize: 30 }} />
                    <Typography variant="caption" color="grey.500" align="center">
                      No images selected
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Helper Text */}
              {product.images && product.images.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  First image will be used as main product image. Images will be uploaded when you save the product.
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Marketing Features
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={product.isTopSelling}
                  onChange={(e) => handleChange('isTopSelling', e.target.checked)}
                  disabled={loading}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Top Selling
                  {product.isTopSelling && <Chip label="Featured" size="small" color="primary" />}
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={product.isTodaysDeal}
                  onChange={(e) => handleChange('isTodaysDeal', e.target.checked)}
                  disabled={loading}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Today's Deal
                  {product.isTodaysDeal && <Chip label="Special" size="small" color="secondary" />}
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={product.isHotDeal}
                  onChange={(e) => handleChange('isHotDeal', e.target.checked)}
                  disabled={loading}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Hot Deal
                  {product.isHotDeal && <Chip label="Hot" size="small" color="error" />}
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={product.isFeatured}
                  onChange={(e) => handleChange('isFeatured', e.target.checked)}
                  disabled={loading}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Featured Product
                  {product.isFeatured && <Chip label="Promoted" size="small" color="success" />}
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={product.isFreeShipping}
                  onChange={(e) => handleChange('isFreeShipping', e.target.checked)}
                  disabled={loading}
                />
              }
              label="Free Shipping"
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          SEO & Meta Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Meta Title"
              value={product.metaTitle}
              onChange={(e) => handleChange('metaTitle', e.target.value)}
              placeholder="SEO meta title (optional)"
              disabled={loading}
              helperText="Recommended: 50-60 characters"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Meta Description"
              value={product.metaDescription}
              onChange={(e) => handleChange('metaDescription', e.target.value)}
              placeholder="SEO meta description (optional)"
              disabled={loading}
              helperText="Recommended: 150-160 characters"
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>,
  ];

  if (loading && isEdit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          disabled={loading}
        >
          Back to Products
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ mb: 3 }}
          >
            <Tab label="Basic Info & Pricing" disabled={loading} />
            <Tab label="Categorization & Inventory" disabled={loading} />
            <Tab label="Media & Marketing" disabled={loading} />
          </Tabs>

          <form onSubmit={handleSubmit}>
            {tabContent[activeTab]}
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/products')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <Save />}
                size="large"
                disabled={loading || uploading}
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
              </Button>
            </Box>
          </form>
        </CardContent>
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

export default ProductForm;