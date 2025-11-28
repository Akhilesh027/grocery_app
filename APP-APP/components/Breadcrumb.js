import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Breadcrumb({ items = [] }) {
  const router = useRouter();

  const handleBreadcrumbPress = (path) => {
    if (path) {
      router.push(path);
    }
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <View key={index} style={styles.breadcrumbItem}>
          {item.path ? (
            <TouchableOpacity onPress={() => handleBreadcrumbPress(item.path)}>
              <Text style={styles.breadcrumbLink}>{item.title}</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.breadcrumbCurrent}>{item.title}</Text>
          )}
          
          {index < items.length - 1 && (
            <Text style={styles.separator}> › </Text>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbLink: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  breadcrumbCurrent: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  separator: {
    fontSize: 14,
    color: '#9CA3AF',
    marginHorizontal: 4,
  },
});