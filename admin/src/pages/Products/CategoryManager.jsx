import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Folder as FolderIcon,
  PhotoCamera,
} from '@mui/icons-material';

const CategoryManager = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [imageFile, setImageFile] = useState(null);

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'main',
    parentCategory: '',
    icon: '',
    bannerImage: '',
  });

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://grocery-c3c0.onrender.com/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setSnackbar({ open: true, message: 'Error fetching categories', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenDialog = (category = null) => {
    if (category && category._id) {
      // Editing existing category
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        type: category.type,
        parentCategory: category.parentCategory || '',
        icon: category.icon || '',
        bannerImage: category.bannerImage || '',
      });
    } else if (category && category.type === 'sub') {
      // Creating new sub-category with pre-filled parent
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        type: 'sub',
        parentCategory: category.parentCategory || '',
        icon: '',
        bannerImage: '',
      });
    } else {
      // Creating new main category
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        type: 'main',
        parentCategory: '',
        icon: '',
        bannerImage: '',
      });
    }
    setImageFile(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCategory(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryForm.name) {
      setSnackbar({ open: true, message: 'Category name is required', severity: 'error' });
      return;
    }

    if (categoryForm.type === 'sub' && !categoryForm.parentCategory) {
      setSnackbar({ open: true, message: 'Parent category is required for sub-categories', severity: 'error' });
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('name', categoryForm.name);
      formData.append('type', categoryForm.type);
      if (categoryForm.type === 'sub') {
        formData.append('parentCategory', categoryForm.parentCategory);
      }
      formData.append('icon', categoryForm.icon);
      if (imageFile) {
        formData.append('bannerImage', imageFile);
      }

      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory
        ? `https://grocery-c3c0.onrender.com/api/categories/${editingCategory._id}`
        : 'https://grocery-c3c0.onrender.com/api/categories';

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${editingCategory ? 'update' : 'create'} category`);
      }

      await fetchCategories();

      setSnackbar({
        open: true,
        message: `Category ${editingCategory ? 'updated' : 'created'} successfully!`,
        severity: 'success',
      });

      handleCloseDialog();
    } catch (error) {
      console.error('Error saving category:', error);
      setSnackbar({
        open: true,
        message: error.message || `Error ${editingCategory ? 'updating' : 'creating'} category`,
        severity: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Delete category "${category.name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`https://grocery-c3c0.onrender.com/api/categories/${category._id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to delete category');
        }

        await fetchCategories();
        setSnackbar({ open: true, message: 'Category deleted successfully', severity: 'success' });
      } catch (error) {
        console.error('Error deleting category:', error);
        setSnackbar({ open: true, message: error.message || 'Error deleting category', severity: 'error' });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Group categories by type
  const mainCategories = categories.filter(cat => cat.type === 'main');
  const subCategories = categories.filter(cat => cat.type === 'sub');

  // Get subcategories for each main category
  const getSubCategories = (mainCategoryName) => {
    return subCategories.filter(sub => sub.parentCategory === mainCategoryName);
  };

  if (loading) {
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
          Category Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      <Grid container spacing={3}>
        {mainCategories.map((mainCategory) => (
          <Grid item xs={12} md={6} key={mainCategory._id}>
            <Card>
              <CardContent>
                {mainCategory.bannerImage && (
                  <Box
                    component="img"
                    src={`${mainCategory.bannerImage}`}
                    alt={mainCategory.name}
                    sx={{
                      width: '100%',
                      height: 120,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mb: 1,
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      mr: 2,
                      bgcolor: 'primary.main',
                      width: 40,
                      height: 40,
                      fontSize: '1.2rem',
                    }}
                  >
                    {mainCategory.icon || <FolderIcon />}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{mainCategory.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Main Category
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(mainCategory)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(mainCategory)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>

                {getSubCategories(mainCategory.name).length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Sub-categories ({getSubCategories(mainCategory.name).length})
                    </Typography>
                    <List dense>
                      {getSubCategories(mainCategory.name).map((subCategory) => (
                        <ListItem key={subCategory._id}>
                          <Avatar
                            sx={{
                              mr: 2,
                              bgcolor: 'secondary.main',
                              width: 32,
                              height: 32,
                              fontSize: '0.9rem',
                            }}
                          >
                            {subCategory.icon || <FolderIcon />}
                          </Avatar>
                          <ListItemText
                            primary={subCategory.name}
                            secondary={
                              <Chip
                                label="Sub-category"
                                size="small"
                                variant="outlined"
                                color="secondary"
                              />
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(subCategory)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(subCategory)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                <Button
                  startIcon={<AddIcon />}
                  onClick={() =>
                    handleOpenDialog({
                      type: 'sub',
                      parentCategory: mainCategory.name,
                    })
                  }
                  sx={{ mt: 1 }}
                  size="small"
                >
                  Add Sub-category
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {mainCategories.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <FolderIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Categories Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Get started by creating your first category
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Create First Category
                </Button>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Add/Edit Category Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Category' : 'Add New Category'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category Name *"
                  value={categoryForm.name}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  disabled={submitting}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Category Type *"
                  value={categoryForm.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setCategoryForm((prev) => ({ 
                      ...prev, 
                      type: newType,
                      parentCategory: newType === 'main' ? '' : prev.parentCategory
                    }));
                  }}
                  required
                  disabled={submitting || Boolean(editingCategory)}
                >
                  <MenuItem value="main">Main Category</MenuItem>
                  <MenuItem value="sub">Sub Category</MenuItem>
                </TextField>
              </Grid>
              {categoryForm.type === 'sub' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Parent Category *"
                    value={categoryForm.parentCategory}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        parentCategory: e.target.value,
                      }))
                    }
                    required
                    disabled={submitting}
                  >
                    <MenuItem value="">Select Parent Category</MenuItem>
                    {mainCategories.map((cat) => (
                      <MenuItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Icon (Emoji or Text)"
                  value={categoryForm.icon}
                  onChange={(e) =>
                    setCategoryForm((prev) => ({ ...prev, icon: e.target.value }))
                  }
                  placeholder="e.g., 🍎, 🥦 or F for Fruits"
                  disabled={submitting}
                  helperText="Use emoji or single letter for icon"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<PhotoCamera />}
                  disabled={submitting}
                >
                  {imageFile ? `Selected: ${imageFile.name}` : 'Upload Category Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) setImageFile(file);
                    }}
                  />
                </Button>
                {categoryForm.bannerImage && !imageFile && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Current image: {categoryForm.bannerImage.split('/').pop()}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {editingCategory ? 'Upload new image to replace current one' : 'Optional: Add a banner image for the category'}
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : null}
            >
              {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar */}
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

export default CategoryManager;