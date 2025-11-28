import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// DMart-inspired categories with offers
const allCategories = [
  { 
    id: 'vegetables', 
    name: 'Fruits & Vegetables', 
    icon: '🥦', 
    offer: 'Up to 15% Off',
    color: '#10B981'
  },
  { 
    id: 'dairy', 
    name: 'Dairy', 
    icon: '🥛', 
    offer: 'Up to 20% Off',
    color: '#3B82F6'
  },
  { 
    id: 'snacks', 
    name: 'Snacks', 
    icon: '🍪', 
    offer: 'Buy 1 Get 1',
    color: '#F59E0B'
  },
  { 
    id: 'beverages', 
    name: 'Beverages', 
    icon: '🥤', 
    offer: '10% Off',
    color: '#8B5CF6'
  },
  { 
    id: 'grains', 
    name: 'Grains & Rice', 
    icon: '🌾', 
    offer: 'Combo Deals',
    color: '#F97316'
  },
  { 
    id: 'household', 
    name: 'Household Items', 
    icon: '🧽', 
    offer: '25% Off',
    color: '#06B6D4'
  },
  { 
    id: 'personal-care', 
    name: 'Personal Care', 
    icon: '🧴', 
    offer: '30% Off',
    color: '#EC4899'
  },
  { 
    id: 'baby-care', 
    name: 'Baby Care', 
    icon: '🍼', 
    offer: '15% Off',
    color: '#F472B6'
  },
  { 
    id: 'health', 
    name: 'Health & Wellness', 
    icon: '💊', 
    offer: '20% Off',
    color: '#EF4444'
  },
  { 
    id: 'bakery', 
    name: 'Bakery', 
    icon: '🥖', 
    offer: 'Fresh Daily',
    color: '#D97706'
  }
];

// Quick access categories (most frequently used)
const quickAccessCategories = ['vegetables', 'dairy', 'snacks', 'beverages'];

// Recently viewed categories
const recentlyViewedCategories = ['grains', 'household', 'personal-care'];

export default function CategoryDrawer({ visible, onClose, selectedCategory, onCategorySelect }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [slideAnim] = useState(new Animated.Value(-screenWidth));

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return allCategories;
    return allCategories.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Animation effects
  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleCategoryPress = (categoryId) => {
    onCategorySelect(categoryId);
    router.push({ 
      pathname: '/(tabs)/categories', 
      params: { cat: categoryId } 
    });
    onClose();
  };

  const renderCategoryItem = (category, isSelected = false) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryItem,
        isSelected && styles.selectedCategoryItem
      ]}
      onPress={() => handleCategoryPress(category.id)}
      activeOpacity={0.7}
    >
      <View style={styles.categoryContent}>
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <View style={styles.categoryTextContainer}>
          <Text style={[
            styles.categoryName,
            isSelected && styles.selectedCategoryName
          ]}>
            {category.name}
          </Text>
          {category.offer && (
            <View style={[styles.offerBadge, { backgroundColor: category.color }]}>
              <Text style={styles.offerText}>{category.offer}</Text>
            </View>
          )}
        </View>
      </View>
      {isSelected && <View style={styles.selectedIndicator} />}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.5)" />
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <Animated.View 
          style={[
            styles.drawerContainer,
            {
              transform: [{ translateX: slideAnim }],
            }
          ]}
        >
          {/* Header */}
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Categories</Text>
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search categories..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Quick Access Section */}
            {!searchQuery && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Quick Access</Text>
                </View>
                <View style={styles.quickAccessGrid}>
                  {quickAccessCategories.map(categoryId => {
                    const category = allCategories.find(cat => cat.id === categoryId);
                    return (
                      <TouchableOpacity
                        key={categoryId}
                        style={styles.quickAccessItem}
                        onPress={() => handleCategoryPress(categoryId)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quickAccessIcon}>{category.icon}</Text>
                        <Text style={styles.quickAccessName}>{category.name.split(' ')[0]}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Recently Viewed Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recently Viewed</Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.recentlyViewedContainer}
                  contentContainerStyle={styles.recentlyViewedContent}
                >
                  {recentlyViewedCategories.map(categoryId => {
                    const category = allCategories.find(cat => cat.id === categoryId);
                    return (
                      <TouchableOpacity
                        key={categoryId}
                        style={styles.recentlyViewedItem}
                        onPress={() => handleCategoryPress(categoryId)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.recentlyViewedIcon}>{category.icon}</Text>
                        <Text style={styles.recentlyViewedName}>{category.name.split(' ')[0]}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* All Categories Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>All Categories</Text>
                </View>
              </>
            )}

            {/* Categories List */}
            <View style={styles.categoriesContainer}>
              {filteredCategories.map(category => 
                renderCategoryItem(category, selectedCategory === category.id)
              )}
            </View>

            {/* Bottom padding for safe scrolling */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  drawerContainer: {
    width: screenWidth * 0.85, // 85% of screen width
    height: screenHeight,
    backgroundColor: '#FFFFFF',
    paddingTop: StatusBar.currentHeight || 50,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 10,
  },
  scrollContent: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    width: '22%',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  quickAccessIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickAccessName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#059669',
    textAlign: 'center',
  },
  recentlyViewedContainer: {
    paddingLeft: 16,
  },
  recentlyViewedContent: {
    paddingRight: 16,
  },
  recentlyViewedItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    minWidth: 80,
  },
  recentlyViewedIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  recentlyViewedName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#92400E',
    textAlign: 'center',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  categoryItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  selectedCategoryItem: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    borderWidth: 2,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedCategoryName: {
    color: '#059669',
  },
  offerBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  offerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  bottomPadding: {
    height: 100,
  },
});