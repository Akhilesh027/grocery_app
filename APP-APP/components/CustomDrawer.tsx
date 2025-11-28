import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';

const allCategories = [
  { id: 'vegetables', name: 'Fruits & Vegetables', icon: '🥦', offer: 'Up to 15% Off' },
  { id: 'dairy', name: 'Dairy', icon: '🥛', offer: 'Up to 20% Off' },
  { id: 'snacks', name: 'Snacks', icon: '🍪', offer: 'Buy 1 Get 1' },
  { id: 'beverages', name: 'Beverages', icon: '🥤', offer: '10% Off' },
  { id: 'grains', name: 'Grains & Rice', icon: '🌾', offer: 'Combo Deals' },
  { id: 'household', name: 'Household', icon: '🧽', offer: '' },
  { id: 'all', name: 'All Items', icon: '🛒', offer: '' },
];

const frequent = ['vegetables', 'dairy', 'snacks'];
const recent = ['beverages', 'grains'];

export default function CustomDrawer(props: DrawerContentComponentProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allCategories;
    return allCategories.filter(c => c.name.toLowerCase().includes(q) || c.id.includes(q));
  }, [query]);

  const goToCategory = (id: string) => {
    // Navigate to Categories tab and pass initial category as search param
    router.push({ pathname: '/categories', params: { cat: id } });
    // Close drawer
    props.navigation.closeDrawer();
  };

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Quick Access */}
      <Text style={styles.sectionTitle}>Quick Access</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
        {frequent.map(id => {
          const c = allCategories.find(x => x.id === id)!;
          return (
            <TouchableOpacity key={id} style={styles.quickChip} onPress={() => goToCategory(id)}>
              <Text style={styles.quickIcon}>{c.icon}</Text>
              <Text style={styles.quickText}>{c.name.split(' ')[0]}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Recent */}
      {recent.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recently Viewed</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRow}>
            {recent.map(id => {
              const c = allCategories.find(x => x.id === id)!;
              return (
                <TouchableOpacity key={id} style={styles.quickChipAlt} onPress={() => goToCategory(id)}>
                  <Text style={styles.quickIcon}>{c.icon}</Text>
                  <Text style={styles.quickText}>{c.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      {/* All Categories list */}
      <Text style={styles.sectionTitle}>All Categories</Text>
      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered.map(cat => (
          <TouchableOpacity key={cat.id} style={styles.catRow} onPress={() => goToCategory(cat.id)}>
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <View style={styles.catTextWrap}>
              <Text style={styles.catName}>{cat.name}</Text>
              {!!cat.offer && (
                <Text style={styles.catOffer}>{cat.offer}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 48,
  },
  searchBar: {
    marginHorizontal: 16,
    backgroundColor: colors.lightSurface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  searchInput: {
    fontSize: 16,
    color: colors.gray900,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray700,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  quickRow: {
    paddingHorizontal: 12,
  },
  quickChip: {
    backgroundColor: colors.lightSurface,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickChipAlt: {
    backgroundColor: colors.gray100,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  quickText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray700,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  catIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  catTextWrap: {
    flex: 1,
  },
  catName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900,
  },
  catOffer: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
});