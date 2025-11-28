// Extended category data structure with sub-categories and vendor management

export const categoriesWithSubCategories = [
  {
    id: '1',
    name: 'Vegetables',
    icon: '🥬',
    image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=200',
    itemCount: '50+',
    vendorId: null, // Can be updated by vendors
    subCategories: [
      {
        id: 'all',
        name: 'All Products',
        icon: '🛒',
        image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: 'All',
        vendorId: null,
        products: [] // This will be populated dynamically with all category products
      },
      {
        id: 'v1',
        name: 'Leafy Vegetables',
        icon: '🥬',
        image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '15+',
        vendorId: null,
        products: [
          {
            id: 'lv1',
            title: 'Fresh Spinach 250g',
            price: 25,
            mrp: 35,
            discount: 29,
            image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.3,
            inStock: true,
            vendorId: 'vendor1'
          },
          {
            id: 'lv2',
            title: 'Lettuce Head',
            price: 40,
            mrp: 50,
            discount: 20,
            image: 'https://images.pexels.com/photos/1352199/pexels-photo-1352199.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.1,
            inStock: true,
            vendorId: 'vendor2'
          },
          {
            id: 'lv3',
            title: 'Fresh Mint 100g',
            price: 15,
            mrp: 20,
            discount: 25,
            image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.4,
            inStock: true,
            vendorId: 'vendor1'
          },
          {
            id: 'lv4',
            title: 'Coriander Leaves 50g',
            price: 10,
            mrp: 15,
            discount: 33,
            image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.2,
            inStock: true,
            vendorId: 'vendor3'
          },
          {
            id: 'lv5',
            title: 'Kale Leaves 200g',
            price: 35,
            mrp: 45,
            discount: 22,
            image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.3,
            inStock: true,
            vendorId: 'vendor2'
          },
          {
            id: 'lv6',
            title: 'Cabbage 1 piece',
            price: 30,
            mrp: 40,
            discount: 25,
            image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.1,
            inStock: true,
            vendorId: 'vendor1'
          }
        ]
      },
      {
        id: 'v2',
        name: 'Root Vegetables',
        icon: '🥕',
        image: 'https://images.pexels.com/photos/533342/pexels-photo-533342.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '12+',
        vendorId: null,
        products: [
          {
            id: 'rv1',
            title: 'Fresh Carrots 500g',
            price: 35,
            mrp: 45,
            discount: 22,
            image: 'https://images.pexels.com/photos/533342/pexels-photo-533342.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.5,
            inStock: true,
            vendorId: 'vendor1'
          },
          {
            id: 'rv2',
            title: 'Beetroot 500g',
            price: 45,
            mrp: 60,
            discount: 25,
            image: 'https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.2,
            inStock: true,
            vendorId: 'vendor3'
          }
        ]
      },
      {
        id: 'v3',
        name: 'Organic Vegetables',
        icon: '🌱',
        image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '20+',
        vendorId: null,
        products: [
          {
            id: 'ov1',
            title: 'Organic Tomatoes 1kg',
            price: 65,
            mrp: 80,
            discount: 19,
            image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.7,
            inStock: true,
            vendorId: 'vendor2'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Fruits',
    icon: '🍎',
    image: 'https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg?auto=compress&cs=tinysrgb&w=200',
    itemCount: '30+',
    vendorId: null,
    subCategories: [
      {
        id: 'all',
        name: 'All Products',
        icon: '🛒',
        image: 'https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: 'All',
        vendorId: null,
        products: [] // This will be populated dynamically with all category products
      },
      {
        id: 'f1',
        name: 'Citrus Fruits',
        icon: '🍊',
        image: 'https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '8+',
        vendorId: null,
        products: [
          {
            id: 'cf1',
            title: 'Fresh Oranges 1kg',
            price: 80,
            mrp: 100,
            discount: 20,
            image: 'https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.4,
            inStock: true,
            vendorId: 'vendor1'
          },
          {
            id: 'cf2',
            title: 'Lemons 500g',
            price: 30,
            mrp: 40,
            discount: 25,
            image: 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.2,
            inStock: true,
            vendorId: 'vendor2'
          }
        ]
      },
      {
        id: 'f2',
        name: 'Seasonal Fruits',
        icon: '🍇',
        image: 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '15+',
        vendorId: null,
        products: [
          {
            id: 'sf1',
            title: 'Fresh Grapes 500g',
            price: 120,
            mrp: 150,
            discount: 20,
            image: 'https://images.pexels.com/photos/708777/pexels-photo-708777.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.6,
            inStock: true,
            vendorId: 'vendor3'
          }
        ]
      },
      {
        id: 'f3',
        name: 'Tropical Fruits',
        icon: '🥭',
        image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '7+',
        vendorId: null,
        products: [
          {
            id: 'tf1',
            title: 'Ripe Bananas 1kg',
            price: 40,
            mrp: 50,
            discount: 20,
            image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.1,
            inStock: true,
            vendorId: 'vendor1'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Dairy',
    icon: '🥛',
    image: 'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=200',
    itemCount: '25+',
    vendorId: null,
    subCategories: [
      {
        id: 'all',
        name: 'All Products',
        icon: '🛒',
        image: 'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: 'All',
        vendorId: null,
        products: [] // This will be populated dynamically with all category products
      },
      {
        id: 'd1',
        name: 'Milk Products',
        icon: '🥛',
        image: 'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '10+',
        vendorId: null,
        products: [
          {
            id: 'mp1',
            title: 'Full Cream Milk 1L',
            price: 55,
            mrp: 60,
            discount: 8,
            image: 'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.8,
            inStock: true,
            vendorId: 'vendor2'
          }
        ]
      },
      {
        id: 'd2',
        name: 'Cheese & Paneer',
        icon: '🧀',
        image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '8+',
        vendorId: null,
        products: [
          {
            id: 'cp1',
            title: 'Fresh Paneer 250g',
            price: 80,
            mrp: 100,
            discount: 20,
            image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.5,
            inStock: true,
            vendorId: 'vendor3'
          }
        ]
      },
      {
        id: 'd3',
        name: 'Yogurt & Curd',
        icon: '🥣',
        image: 'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '7+',
        vendorId: null,
        products: [
          {
            id: 'yc1',
            title: 'Fresh Curd 500g',
            price: 35,
            mrp: 45,
            discount: 22,
            image: 'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.3,
            inStock: true,
            vendorId: 'vendor1'
          }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Grains',
    icon: '🌾',
    image: 'https://images.pexels.com/photos/1059947/pexels-photo-1059947.jpeg?auto=compress&cs=tinysrgb&w=200',
    itemCount: '20+',
    vendorId: null,
    subCategories: [
      {
        id: 'all',
        name: 'All Products',
        icon: '🛒',
        image: 'https://images.pexels.com/photos/1059947/pexels-photo-1059947.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: 'All',
        vendorId: null,
        products: [] // This will be populated dynamically with all category products
      },
      {
        id: 'g1',
        name: 'Rice & Varieties',
        icon: '🍚',
        image: 'https://images.pexels.com/photos/1059947/pexels-photo-1059947.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '8+',
        vendorId: null,
        products: [
          {
            id: 'rv1',
            title: 'Basmati Rice 5kg',
            price: 450,
            mrp: 520,
            discount: 13,
            image: 'https://images.pexels.com/photos/1059947/pexels-photo-1059947.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.7,
            inStock: true,
            vendorId: 'vendor2'
          }
        ]
      },
      {
        id: 'g2',
        name: 'Wheat & Flour',
        icon: '🌾',
        image: 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '6+',
        vendorId: null,
        products: [
          {
            id: 'wf1',
            title: 'Wheat Flour 5kg',
            price: 200,
            mrp: 250,
            discount: 20,
            image: 'https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.6,
            inStock: true,
            vendorId: 'vendor1'
          }
        ]
      },
      {
        id: 'g3',
        name: 'Pulses & Dal',
        icon: '🫘',
        image: 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '6+',
        vendorId: null,
        products: [
          {
            id: 'pd1',
            title: 'Toor Dal 1kg',
            price: 120,
            mrp: 140,
            discount: 14,
            image: 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.3,
            inStock: true,
            vendorId: 'vendor3'
          }
        ]
      }
    ]
  },
  {
    id: '5',
    name: 'Cuts & Sprouts',
    icon: '🥥',
    image: 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=200',
    itemCount: '25+',
    vendorId: null,
    subCategories: [
      {
        id: 'all',
        name: 'All Products',
        icon: '🛒',
        image: 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: 'All',
        vendorId: null,
        products: [
          {
            id: 'cs1',
            title: 'Tender Coconut',
            subtitle: '1 pc',
            price: 68.80,
            mrp: 86,
            discount: 20,
            image: 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: null,
            inStock: true,
            deliveryTime: '11 mins',
            quantity: '230ml+',
            vendorId: 'vendor1'
          },
          {
            id: 'cs2',
            title: 'Frozen Green Peas',
            subtitle: '1 kg',
            price: 159,
            mrp: 260,
            discount: 39,
            image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 3.9,
            inStock: true,
            deliveryTime: '11 mins',
            brand: 'freshol',
            vendorId: 'vendor2'
          },
          {
            id: 'cs3',
            title: 'Garlic - Peeled',
            subtitle: '100 g',
            price: 38,
            mrp: 63,
            discount: 28,
            image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: null,
            inStock: true,
            deliveryTime: '11 mins',
            brand: 'Har Din Sastal',
            vendorId: 'vendor3'
          },
          {
            id: 'cs4',
            title: 'Tender Coconut - Small',
            subtitle: '2x1 pc - (Multipack)',
            price: 102.90,
            mrp: 146,
            discount: 30,
            image: 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: null,
            inStock: true,
            deliveryTime: '11 mins',
            quantity: '2 pieces',
            brand: 'freshol',
            vendorId: 'vendor1'
          }
        ]
      }
    ]
  },
  {
    id: '6',
    name: 'Personal Care',
    icon: '🧼',
    image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=200',
    itemCount: '50+',
    vendorId: null,
    subCategories: [
      {
        id: 'all',
        name: 'All Products',
        icon: '🛍️',
        image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: 'All',
        vendorId: null,
        products: [] // This will be populated dynamically with all category products
      },
      {
        id: 'pc1',
        name: 'Hair Care',
        icon: '💇‍♀️',
        image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '25+',
        vendorId: null,
        products: [
          {
            id: 'hc1',
            title: 'Herbal Shampoo 400ml',
            price: 180,
            mrp: 220,
            discount: 18,
            image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.3,
            inStock: true,
            vendorId: 'vendor1'
          }
        ]
      },
      {
        id: 'pc2',
        name: 'Skin Care',
        icon: '🧽',
        image: 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '30+',
        vendorId: null,
        products: [
          {
            id: 'sc1',
            title: 'Face Wash 150ml',
            price: 120,
            mrp: 150,
            discount: 20,
            image: 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.2,
            inStock: true,
            vendorId: 'vendor2'
          }
        ]
      },
      {
        id: 'pc3',
        name: 'Oral Care',
        icon: '🦷',
        image: 'https://images.pexels.com/photos/298864/pexels-photo-298864.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '15+',
        vendorId: null,
        products: [
          {
            id: 'oc1',
            title: 'Toothpaste 100g',
            price: 65,
            mrp: 80,
            discount: 19,
            image: 'https://images.pexels.com/photos/298864/pexels-photo-298864.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.6,
            inStock: true,
            vendorId: 'vendor3'
          }
        ]
      },
      {
        id: 'pc4',
        name: 'Body Care',
        icon: '🧼',
        image: 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=200',
        itemCount: '20+',
        vendorId: null,
        products: [
          {
            id: 'bc1',
            title: 'Body Lotion 200ml',
            price: 250,
            mrp: 300,
            discount: 17,
            image: 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=300',
            rating: 4.5,
            inStock: true,
            vendorId: 'vendor1'
          }
        ]
      }
    ]
  }
];

// Vendor management system
export const vendorPermissions = {
  vendor1: {
    id: 'vendor1',
    name: 'Fresh Farm Co.',
    email: 'vendor1@freshfarm.com',
    permissions: ['vegetables', 'fruits', 'dairy', 'personal care'],
    uploadQuota: 100, // Number of images allowed
    usedQuota: 25,
    isActive: true
  },
  vendor2: {
    id: 'vendor2',
    name: 'Organic Delights',
    email: 'vendor2@organic.com',
    permissions: ['vegetables', 'grains', 'dairy', 'personal care'],
    uploadQuota: 75,
    usedQuota: 15,
    isActive: true
  },
  vendor3: {
    id: 'vendor3',
    name: 'Healthy Harvest',
    email: 'vendor3@healthy.com',
    permissions: ['fruits', 'grains', 'personal care'],
    uploadQuota: 50,
    usedQuota: 8,
    isActive: true
  }
};

// Image validation settings
export const imageValidation = {
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxSize: 2 * 1024 * 1024, // 2MB
  minWidth: 200,
  minHeight: 200,
  maxWidth: 2000,
  maxHeight: 2000
};

// Helper functions
export const getCategoryById = (categoryId) => {
  // First try to find by ID
  let category = categoriesWithSubCategories.find(cat => cat.id === categoryId);
  
  // If not found, try to find by slug (name converted to slug format)
  if (!category) {
    const slug = categoryId.toLowerCase().replace(/-/g, ' ');
    category = categoriesWithSubCategories.find(cat => 
      cat.name.toLowerCase() === slug
    );
  }
  
  return category;
};

export const getSubCategoryById = (categoryId, subCategoryId) => {
  const category = getCategoryById(categoryId);
  return category?.subCategories?.find(sub => sub.id === subCategoryId);
};

export const canVendorEditCategory = (vendorId, categoryName) => {
  const vendor = vendorPermissions[vendorId];
  return vendor?.isActive && vendor?.permissions.includes(categoryName.toLowerCase());
};

export const hasUploadQuota = (vendorId) => {
  const vendor = vendorPermissions[vendorId];
  return vendor && vendor.usedQuota < vendor.uploadQuota;
};

// Get all products from a category (across all sub-categories)
export const getAllCategoryProducts = (categoryId) => {
  const category = getCategoryById(categoryId);
  if (!category || !category.subCategories) return [];
  
  return category.subCategories.reduce((allProducts, subCategory) => {
    return allProducts.concat(subCategory.products || []);
  }, []);
};

// Get products from a specific sub-category
export const getSubCategoryProducts = (categoryId, subCategoryId) => {
  const category = getCategoryById(categoryId);
  if (!category) return [];
  
  // If it's 'All Products', return all products from the category
  if (subCategoryId === 'all') {
    return getAllCategoryProducts(categoryId);
  }
  
  const subCategory = category.subCategories?.find(sub => sub.id === subCategoryId);
  return subCategory?.products || [];
};

// Get category by name (for homepage category grids)
export const getCategoryByName = (categoryName) => {
  return categoriesWithSubCategories.find(cat => 
    cat.name.toLowerCase() === categoryName.toLowerCase()
  );
};

export const updateVendorImage = (vendorId, categoryId, subCategoryId, productId, newImageUrl) => {
  // This would typically make an API call to backend
  // For now, we'll simulate the update locally
  const category = getCategoryById(categoryId);
  if (!category) return false;
  
  const subCategory = category.subCategories.find(sub => sub.id === subCategoryId);
  if (!subCategory) return false;
  
  const product = subCategory.products.find(prod => prod.id === productId);
  if (!product || product.vendorId !== vendorId) return false;
  
  // Check vendor permissions
  if (!canVendorEditCategory(vendorId, category.name)) return false;
  
  // Update image
  product.image = newImageUrl;
  return true;
};
