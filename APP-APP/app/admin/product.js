import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Alert
} from 'react-native';
import { ArrowLeft, Plus, Search, CreditCard as Edit, Trash2, Package, DollarSign } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProductsManagement() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const [newProduct, setNewProduct] = useState({
    title: '',
    price: '',
    mrp: '',
    category: 'vegetables',
    image: '',
    inStock: true
  });

  const [products, setProducts] = useState([
    {
      id: '1',
      title: 'Fresh Tomatoes 1kg',
      price: 45,
      mrp: 55,
      category: 'vegetables',
      inStock: true,
      stock: 50,
      image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '2',
      title: 'Basmati Rice 5kg',
      price: 450,
      mrp: 580,
      category: 'grains',
      inStock: true,
      stock: 25,
      image: 'https://images.pexels.com/photos/1059947/pexels-photo-1059947.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    {
      id: '3',
      title: 'Fresh Milk 1L',
      price: 65,
      mrp: 75,
      category: 'dairy',
      inStock: false,
      stock: 0,
      image: 'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=300'
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'vegetables', name: 'Vegetables' },
    { id: 'fruits', name: 'Fruits' },
    { id: 'dairy', name: 'Dairy' },
    { id: 'grains', name: 'Grains' },
    { id: 'snacks', name: 'Snacks' }
  ];

  const quickPriceTiers = [1000, 5000];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addProduct = () => {
    if (!newProduct.title || !newProduct.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const product = {
      id: Date.now().toString(),
      ...newProduct,
      price: parseFloat(newProduct.price),
      mrp: parseFloat(newProduct.mrp) || parseFloat(newProduct.price),
      stock: 10,
      image: newProduct.image || 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=300'
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      title: '',
      price: '',
      mrp: '',
      category: 'vegetables',
      image: '',
      inStock: true
    });
    setShowAddModal(false);
    Alert.alert('Success', 'Product added successfully');
  };

  const deleteProduct = (id) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setProducts(prev => prev.filter(p => p.id !== id))
        }
      ]
    );
  };

  const toggleStock = (id) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, inStock: !p.inStock } : p
      )
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Product Management</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Search size={20} color="#6B7280" />
          <TextInput
            style={styles.searchField}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryTabs}
        contentContainerStyle={styles.categoryTabsContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory === category.id && styles.selectedCategoryTab
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Text style={[
              styles.categoryTabText,
              selectedCategory === category.id && styles.selectedCategoryTabText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.productsList}>
        {filteredProducts.map((product) => (
          <View key={product.id} style={styles.productCard}>
            <Image source={{ uri: product.image }} style={styles.productImage} />
            
            <View style={styles.productDetails}>
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
              
              <View style={styles.priceContainer}>
                <Text style={styles.productPrice}>₹{product.price}</Text>
                {product.mrp > product.price && (
                  <Text style={styles.productMRP}>₹{product.mrp}</Text>
                )}
              </View>
              
              <View style={styles.stockContainer}>
                <Package size={16} color={product.inStock ? "#059669" : "#EF4444"} />
                <Text style={[
                  styles.stockText,
                  { color: product.inStock ? "#059669" : "#EF4444" }
                ]}>
                  {product.inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
                </Text>
              </View>
            </View>
            
            <View style={styles.productActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => toggleStock(product.id)}
              >
                <Text style={[
                  styles.actionButtonText,
                  { color: product.inStock ? "#EF4444" : "#059669" }
                ]}>
                  {product.inStock ? 'Disable' : 'Enable'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton}>
                <Edit size={16} color="#2563EB" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => deleteProduct(product.id)}
              >
                <Trash2 size={16} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={showAddModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add New Product</Text>
            <TouchableOpacity onPress={addProduct}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Product Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                value={newProduct.title}
                onChangeText={(text) => setNewProduct(prev => ({ ...prev, title: text }))}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.slice(1).map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      newProduct.category === category.id && styles.selectedCategoryChip
                    ]}
                    onPress={() => setNewProduct(prev => ({ ...prev, category: category.id }))}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      newProduct.category === category.id && styles.selectedCategoryChipText
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.priceSection}>
              <Text style={styles.inputLabel}>Quick Price Tiers</Text>
              <View style={styles.quickPriceButtons}>
                {quickPriceTiers.map(tier => (
                  <TouchableOpacity
                    key={tier}
                    style={styles.priceButton}
                    onPress={() => setNewProduct(prev => ({ 
                      ...prev, 
                      price: tier.toString(),
                      mrp: (tier * 1.2).toString()
                    }))}
                  >
                    <DollarSign size={16} color="#2563EB" />
                    <Text style={styles.priceButtonText}>₹{tier.toLocaleString()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>Price</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={newProduct.price}
                  onChangeText={(text) => setNewProduct(prev => ({ ...prev, price: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputHalf}>
                <Text style={styles.inputLabel}>MRP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  value={newProduct.mrp}
                  onChangeText={(text) => setNewProduct(prev => ({ ...prev, mrp: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Image URL (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/image.jpg"
                value={newProduct.image}
                onChangeText={(text) => setNewProduct(prev => ({ ...prev, image: text }))}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#2563EB',
    padding: 8,
    borderRadius: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchField: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  categoryTabs: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  selectedCategoryTab: {
    backgroundColor: '#2563EB',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  selectedCategoryTabText: {
    color: '#FFFFFF',
  },
  productsList: {
    flex: 1,
    padding: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productDetails: {
    flex: 1,
    marginLeft: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginRight: 8,
  },
  productMRP: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  productActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButton: {
    padding: 8,
    marginVertical: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalCancel: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalSave: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#2563EB',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  selectedCategoryChipText: {
    color: '#FFFFFF',
  },
  priceSection: {
    marginBottom: 20,
  },
  quickPriceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  priceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  inputHalf: {
    flex: 1,
  },
});