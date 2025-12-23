// AdminOffersScreen.js
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://api.sampurnamart.cloud/api'; // Changed to localhost for web

export default function AdminOffersScreen() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [categories, setCategories] = useState([]);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'category', 'subcategory', 'offer'
  const [editingItem, setEditingItem] = useState(null);
  const [stats, setStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    discount: '',
    code: '',
    image: '',
    category: '',
    subcategory: '',
    icon: '🎁',
    color: '#EF4444',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    isActive: true,
    usageLimit: '1000',
    minOrderValue: '0',
    maxDiscount: '',
    displayOrder: '0'
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchSubCategories(),
        fetchOffers(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to fetch data. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/offers/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Categories error:', error);
      alert('Failed to load categories');
    }
  };

  const fetchSubCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/offers/subcategories`);
      if (!response.ok) {
        // Try to get all subcategories from each category if endpoint doesn't exist
        const allSubcats = [];
        for (const category of categories) {
          try {
            const subcatResponse = await fetch(`${API_BASE_URL}/offers/subcategories/${category._id}`);
            if (subcatResponse.ok) {
              const subcats = await subcatResponse.json();
              allSubcats.push(...subcats);
            }
          } catch (err) {
            console.warn(`Could not fetch subcategories for category ${category._id}:`, err);
          }
        }
        setAllSubCategories(allSubcats);
      } else {
        const data = await response.json();
        setAllSubCategories(data);
      }
    } catch (error) {
      console.error('Subcategories error:', error);
      // Create mock subcategories for demo
      const mockSubcategories = categories.map(cat => ({
        _id: `sub_${cat._id}`,
        name: `${cat.name} Deals`,
        category: cat,
        image: 'https://via.placeholder.com/300x200?text=Subcategory',
        isActive: true
      }));
      setAllSubCategories(mockSubcategories);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/offers`);
      if (!response.ok) throw new Error('Failed to fetch offers');
      const data = await response.json();
      setOffers(data);
    } catch (error) {
      console.error('Offers error:', error);
      // For demo purposes, create sample offers
      const sampleOffers = [
        {
          _id: '1',
          title: '50% Off on Vegetables',
          description: 'Get 50% discount on all vegetables',
          discount: '50% OFF',
          code: 'VEG50',
          image: 'https://via.placeholder.com/400x300?text=Vegetable+Offer',
          category: { _id: '1', name: 'Vegetables', icon: '🥦', color: '#4CAF50', isActive: true },
          subcategory: { _id: 'sub_1', name: 'Vegetable Deals' },
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          usageLimit: 100,
          minOrderValue: 199,
          usedCount: 24,
          maxDiscount: 100,
          createdAt: new Date()
        },
        {
          _id: '2',
          title: 'Buy 1 Get 1 Free on Fruits',
          description: 'Buy any fruit and get another fruit free',
          discount: 'BOGO',
          code: 'FRUITBOGO',
          image: 'https://via.placeholder.com/400x300?text=Fruit+Offer',
          category: { _id: '2', name: 'Fruits', icon: '🍎', color: '#FF5722', isActive: true },
          subcategory: { _id: 'sub_2', name: 'Fruit Deals' },
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          usageLimit: 200,
          minOrderValue: 99,
          usedCount: 56,
          maxDiscount: 50,
          createdAt: new Date()
        }
      ];
      setOffers(sampleOffers);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/offers/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Stats error:', error);
      // Mock stats for demo
      setStats({
        totalOffers: offers.length || 2,
        totalCategories: categories.length || 5,
        totalSubCategories: allSubCategories.length || 8,
        activeOffers: offers.filter(o => o.isActive).length || 2
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.category && modalType === 'subcategory') {
      // Filter subcategories for the selected category
      const filtered = allSubCategories.filter(sub => sub.category?._id === formData.category);
      // This would be handled by backend in production
    }
  }, [formData.category, modalType]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      discount: '',
      code: '',
      image: '',
      category: '',
      subcategory: '',
      icon: '🎁',
      color: '#EF4444',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
      usageLimit: '1000',
      minOrderValue: '0',
      maxDiscount: '',
      displayOrder: '0'
    });
    setEditingItem(null);
  };

  // Open modal for adding/editing
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    
    if (item) {
      setFormData({
        name: item.name || item.title || '',
        title: item.title || '',
        description: item.description || '',
        discount: item.discount || '',
        code: item.code || '',
        image: item.image || 'https://via.placeholder.com/400x300?text=Offer+Image',
        category: item.category?._id || item.category || '',
        subcategory: item.subcategory?._id || item.subcategory || '',
        icon: item.icon || '🎁',
        color: item.color || '#EF4444',
        startDate: item.startDate ? new Date(item.startDate) : new Date(),
        endDate: item.endDate ? new Date(item.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: item.isActive !== undefined ? item.isActive : true,
        usageLimit: item.usageLimit ? item.usageLimit.toString() : '1000',
        minOrderValue: item.minOrderValue ? item.minOrderValue.toString() : '0',
        maxDiscount: item.maxDiscount ? item.maxDiscount.toString() : '',
        displayOrder: item.displayOrder ? item.displayOrder.toString() : '0'
      });
    } else {
      resetForm();
    }
    
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Basic validation
    if (modalType === 'category' && !formData.name.trim()) {
      alert('Category name is required');
      return;
    }

    if (modalType === 'subcategory' && (!formData.name.trim() || !formData.category)) {
      alert('Subcategory name and category are required');
      return;
    }

    if (modalType === 'offer') {
      if (!formData.title.trim() || !formData.code.trim() || !formData.category || !formData.subcategory) {
        alert('Please fill all required fields');
        return;
      }
    }

    try {
      let url = `${API_BASE_URL}/offers`;
      let method = 'POST';
      let body = {};

      switch (modalType) {
        case 'category':
          url = `${API_BASE_URL}/offers/categories`;
          body = {
            name: formData.name,
            icon: formData.icon,
            color: formData.color,
            isActive: formData.isActive,
            displayOrder: parseInt(formData.displayOrder) || 0
          };
          if (editingItem) {
            url = `${url}/${editingItem._id}`;
            method = 'PUT';
          }
          break;

        case 'subcategory':
          url = `${API_BASE_URL}/offers/subcategories`;
          body = {
            name: formData.name,
            image: formData.image || 'https://via.placeholder.com/300x200?text=Subcategory',
            category: formData.category,
            isActive: formData.isActive,
            displayOrder: parseInt(formData.displayOrder) || 0
          };
          if (editingItem) {
            url = `${url}/${editingItem._id}`;
            method = 'PUT';
          }
          break;

        case 'offer':
          body = {
            title: formData.title,
            description: formData.description,
            discount: formData.discount,
            code: formData.code,
            image: formData.image || 'https://via.placeholder.com/400x300?text=Offer+Image',
            category: formData.category,
            subcategory: formData.subcategory,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isActive: formData.isActive,
            usageLimit: parseInt(formData.usageLimit) || 1000,
            minOrderValue: parseInt(formData.minOrderValue) || 0,
            maxDiscount: formData.maxDiscount ? parseInt(formData.maxDiscount) : undefined,
            displayOrder: parseInt(formData.displayOrder) || 0
          };
          if (editingItem) {
            url = `${url}/${editingItem._id}`;
            method = 'PUT';
          }
          break;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to save');
      }

      const result = await response.json();
      
      alert(`${modalType.charAt(0).toUpperCase() + modalType.slice(1)} ${editingItem ? 'updated' : 'created'} successfully`);
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      alert(error.message || 'Something went wrong');
    }
  };

  // Delete item
  const deleteItem = async (type, item) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        let url = '';
        switch (type) {
          case 'category':
            url = `${API_BASE_URL}/offers/categories/${item._id}`;
            break;
          case 'subcategory':
            url = `${API_BASE_URL}/offers/subcategories/${item._id}`;
            break;
          case 'offer':
            url = `${API_BASE_URL}/offers/${item._id}`;
            break;
        }

        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || errorData.message || 'Failed to delete');
        }

        const result = await response.json();
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} ${result.message || 'deleted successfully'}`);
        fetchData();
      } catch (error) {
        console.error('Delete error:', error);
        alert(error.message || 'Failed to delete');
      }
    }
  };

  // Toggle active status
  const toggleActive = async (type, item) => {
    try {
      let url = '';
      const body = { isActive: !item.isActive };

      switch (type) {
        case 'category':
          url = `${API_BASE_URL}/offers/categories/${item._id}`;
          break;
        case 'subcategory':
          url = `${API_BASE_URL}/offers/subcategories/${item._id}`;
          break;
        case 'offer':
          url = `${API_BASE_URL}/offers/${item._id}`;
          break;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to update');
      }

      await response.json();
      fetchData();
    } catch (error) {
      console.error('Toggle error:', error);
      alert(error.message || 'Failed to update status');
    }
  };

  // Handle date change
  const handleDateChange = (event, type) => {
    const selectedDate = new Date(event.target.value);
    setFormData(prev => ({ 
      ...prev, 
      [type === 'start' ? 'startDate' : 'endDate']: selectedDate 
    }));
  };

  // Filter subcategories based on selected category
  const getFilteredSubcategories = () => {
    if (!selectedCategory) return allSubCategories;
    return allSubCategories.filter(sub => sub.category?._id === selectedCategory);
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-500">{stats.totalOffers || 0}</div>
          <div className="text-sm text-gray-600">Total Offers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-500">{stats.activeOffers || 0}</div>
          <div className="text-sm text-gray-600">Active Offers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-500">{stats.totalCategories || 0}</div>
          <div className="text-sm text-gray-600">Categories</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center">
          <div className="text-2xl font-bold text-red-500">{stats.totalSubCategories || 0}</div>
          <div className="text-sm text-gray-600">Subcategories</div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow"
            onClick={() => openModal('category')}
          >
            <div className="text-2xl mb-2">📁</div>
            <div className="text-sm font-semibold text-gray-800">Add Category</div>
          </button>
          <button 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow"
            onClick={() => openModal('subcategory')}
          >
            <div className="text-2xl mb-2">📂</div>
            <div className="text-sm font-semibold text-gray-800">Add Subcategory</div>
          </button>
          <button 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow"
            onClick={() => openModal('offer')}
          >
            <div className="text-2xl mb-2">🎁</div>
            <div className="text-sm font-semibold text-gray-800">Create Offer</div>
          </button>
          <button 
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow"
            onClick={() => setActiveTab('offers')}
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-semibold text-gray-800">View All Offers</div>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Offers</h2>
        <div className="space-y-3">
          {offers.slice(0, 5).map(offer => (
            <div key={offer._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-3">
              <img 
                src={offer.image} 
                alt={offer.title}
                className="w-10 h-10 rounded object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/40x40?text=Loading';
                }}
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{offer.title}</div>
                <div className="text-sm text-gray-600">Code: {offer.code}</div>
                <div className="text-xs text-gray-500">{offer.category?.name}</div>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={offer.isActive}
                  onChange={() => toggleActive('offer', offer)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
          {offers.length === 0 && (
            <div className="text-center text-gray-600 py-8">No offers found. Create your first offer!</div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Categories
  const renderCategories = () => (
    <div className="p-4 space-y-4">
      <button 
        className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        onClick={() => openModal('category')}
      >
        + Add Category
      </button>

      <div className="space-y-3">
        {categories.map(item => (
          <div key={item._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-600">
                    Order: {item.displayOrder || 0} • {item.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={() => toggleActive('category', item)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <button 
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                  onClick={() => openModal('category', item)}
                >
                  Edit
                </button>
                <button 
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors"
                  onClick={() => deleteItem('category', item)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center text-gray-600 py-8">No categories found. Create your first category!</div>
        )}
      </div>
    </div>
  );

  // Render Subcategories
  const renderSubcategories = () => (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Filter by Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <button 
        className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        onClick={() => openModal('subcategory')}
      >
        + Add Subcategory
      </button>

      <div className="space-y-3">
        {getFilteredSubcategories().map(item => (
          <div key={item._id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <img 
                src={item.image} 
                alt={item.name}
                className="w-12 h-12 rounded object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/50x50?text=Loading';
                }}
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{item.name}</div>
                <div className="text-sm text-gray-600">
                  Category: {item.category?.name || 'No Category'}
                </div>
                <div className="text-xs text-gray-500">
                  Order: {item.displayOrder || 0} • {item.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.isActive}
                  onChange={() => toggleActive('subcategory', item)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <button 
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                onClick={() => openModal('subcategory', item)}
              >
                Edit
              </button>
              <button 
                className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors"
                onClick={() => deleteItem('subcategory', item)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {getFilteredSubcategories().length === 0 && (
          <div className="text-center text-gray-600 py-8">
            {selectedCategory ? 'No subcategories found for this category' : 'No subcategories found. Create your first subcategory!'}
          </div>
        )}
      </div>
    </div>
  );

  // Render Offers
  const renderOffers = () => (
    <div className="p-4 space-y-4">
      <button 
        className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors"
        onClick={() => openModal('offer')}
      >
        + Create Offer
      </button>

      <div className="space-y-4">
        {offers.map(item => (
          <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 flex space-x-4">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-16 h-16 rounded object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/60x60?text=Loading';
                }}
              />
              <div className="flex-1 space-y-2">
                <div className="font-semibold text-gray-800">{item.title}</div>
                <div className="text-sm text-gray-600">{item.description}</div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-red-500">Code: {item.code}</span>
                  <span className="font-semibold text-green-500">{item.discount}</span>
                </div>
                <div className="flex space-x-2 text-sm">
                  <span className="text-gray-600">{item.category?.name}</span>
                  <span className="text-gray-500">→ {item.subcategory?.name}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
              <div className="text-sm text-gray-600 space-y-1">
                <div>Used: {item.usedCount || 0}/{item.usageLimit}</div>
                <div>Min Order: ₹{item.minOrderValue}</div>
                {item.maxDiscount && <div>Max Discount: ₹{item.maxDiscount}</div>}
              </div>
              <div className="flex items-center space-x-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={() => toggleActive('offer', item)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
                <button 
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors"
                  onClick={() => openModal('offer', item)}
                >
                  Edit
                </button>
                <button 
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors"
                  onClick={() => deleteItem('offer', item)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {offers.length === 0 && (
          <div className="text-center text-gray-600 py-8">No offers found. Create your first offer!</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Offer Management</h1>
        <p className="text-gray-600">Admin Panel</p>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          {['dashboard', 'categories', 'subcategories', 'offers'].map(tab => (
            <button
              key={tab}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === tab 
                  ? 'text-red-500 border-b-2 border-red-500' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {loading && !refreshing ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            <div className="mt-4 text-gray-600">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'categories' && renderCategories()}
            {activeTab === 'subcategories' && renderSubcategories()}
            {activeTab === 'offers' && renderOffers()}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 text-center">
                {editingItem ? 'Edit' : 'Add New'} {modalType}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {modalType === 'category' && (
                  <>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Category Name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Icon (emoji)"
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Color (hex code)"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    />
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Display Order"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                    />
                  </>
                )}

                {modalType === 'subcategory' && (
                  <>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Subcategory Name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Image URL"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Display Order"
                      value={formData.displayOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                    />
                  </>
                )}

                {modalType === 'offer' && (
                  <>
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Offer Title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                    <textarea
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 resize-none"
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Discount Text (e.g., 50% OFF)"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Promo Code"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    />
                    <input
                      type="text"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Image URL"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                      <select
                        value={formData.subcategory}
                        onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select Subcategory</option>
                        {allSubCategories.map(sub => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          value={formData.startDate.toISOString().split('T')[0]}
                          onChange={(e) => handleDateChange(e, 'start')}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          value={formData.endDate.toISOString().split('T')[0]}
                          onChange={(e) => handleDateChange(e, 'end')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Usage Limit</label>
                        <input
                          type="number"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="1000"
                          value={formData.usageLimit}
                          onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Min Order (₹)</label>
                        <input
                          type="number"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="0"
                          value={formData.minOrderValue}
                          onChange={(e) => setFormData(prev => ({ ...prev, minOrderValue: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                        <input
                          type="number"
                          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                          placeholder="0"
                          value={formData.displayOrder}
                          onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                        />
                      </div>
                    </div>

                    <input
                      type="number"
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Max Discount Amount (optional)"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                    />
                  </>
                )}

                <div className="flex justify-between items-center pt-4">
                  <label className="text-sm font-medium text-gray-700">Active</label>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex space-x-3">
              <button
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                onClick={handleSubmit}
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}