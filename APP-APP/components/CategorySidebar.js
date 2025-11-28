import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';

export default function CategorySidebar({ categories, selectedCategory, onCategorySelect }) {
  const categoryData = [
    {
      id: 'top-picks',
      name: 'Top Picks',
      icon: '🪙',
      color: '#F59E0B'
    },
    {
      id: 'fruits-vegetables',
      name: 'Fruits &\nVegetables',
      icon: '🥕',
      color: '#10B981'
    },
    {
      id: 'grocery',
      name: 'Grocery &\nStaples',
      icon: '🌾',
      color: '#8B5CF6'
    },
    {
      id: 'snacks',
      name: 'Snacks &\nBiscuits',
      icon: '🍪',
      color: '#EF4444'
    },
    {
      id: 'dairy',
      name: 'Dairy &\nBeverage',
      icon: '🥛',
      color: '#84CC16'
    },
    {
      id: 'breakfast',
      name: 'Breakfast &\nCereal',
      icon: '🥣',
      color: '#06B6D4'
    },
    {
      id: 'frozen',
      name: 'Frozen\nFood',
      icon: '🧊',
      color: '#3B82F6'
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categoryData.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryItem,
              selectedCategory === category.id && styles.selectedCategoryItem,
              index === categoryData.length - 1 && styles.lastItem
            ]}
            onPress={() => onCategorySelect(category.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              { backgroundColor: selectedCategory === category.id ? category.color : '#F3F4F6' }
            ]}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
            </View>
            <Text style={[
              styles.categoryName,
              selectedCategory === category.id && styles.selectedCategoryName
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    backgroundColor: '#E8F5E8', // Light green background like the image
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginBottom: 1,
  },
  selectedCategoryItem: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Subtle green background for selected
  },
  lastItem: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 14,
  },
  selectedCategoryName: {
    color: '#059669',
    fontWeight: '600',
  },
});