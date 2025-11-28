import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView
} from 'react-native';

export default function BrandSpotlight() {
  const brands = [
    {
      id: 'unibic',
      name: 'UNIBIC',
      description: 'Premium Biscuits & Cookies',
      image: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=300',
      gradient: ['#66CCFF', '#00CC99'],
      textColor: '#FFFFFF'
    },
    {
      id: 'cupid',
      name: 'CUPID',
      description: 'Quality Hair Care',
      image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=300',
      gradient: ['#FFB366', '#FF9933'],
      textColor: '#FFFFFF'
    },
    {
      id: 'britannia',
      name: 'BRITANNIA',
      description: 'Trusted Food Products',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300',
      gradient: ['#FFE066', '#FFD700'],
      textColor: '#1F2937'
    },
    {
      id: 'cadbury',
      name: 'Cadbury',
      description: 'Chocolate & Confectionery',
      image: 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=300',
      gradient: ['#CC99FF', '#9966FF'],
      textColor: '#FFFFFF'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>BRAND SPOTLIGHT</Text>
        <View style={styles.titleUnderline} />
      </View>
      
      <View style={styles.brandGrid}>
        <View style={styles.row}>
          {brands.slice(0, 2).map((brand) => (
            <TouchableOpacity key={brand.id} style={styles.brandCard}>
              <View style={[
                styles.brandCardBackground,
                { 
                  backgroundColor: brand.gradient[0] // Fallback solid color
                }
              ]}>
                <View style={styles.brandContent}>
                  <View style={styles.brandHeader}>
                    <View style={styles.brandNameContainer}>
                      <Text style={[styles.brandName, { color: brand.textColor }]}>
                        {brand.name}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.productImageContainer}>
                    <Image source={{ uri: brand.image }} style={styles.productImage} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.row}>
          {brands.slice(2, 4).map((brand) => (
            <TouchableOpacity key={brand.id} style={styles.brandCard}>
              <View style={[
                styles.brandCardBackground,
                { 
                  backgroundColor: brand.gradient[0] // Fallback solid color
                }
              ]}>
                <View style={styles.brandContent}>
                  <View style={styles.brandHeader}>
                    <View style={styles.brandNameContainer}>
                      <Text style={[styles.brandName, { color: brand.textColor }]}>
                        {brand.name}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.productImageContainer}>
                    <Image source={{ uri: brand.image }} style={styles.productImage} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: 1.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  titleUnderline: {
    width: 60,
    height: 3,
    backgroundColor: '#FF9933',
    marginTop: 4,
    borderRadius: 2,
  },
  brandGrid: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  brandCard: {
    flex: 1,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  brandCardBackground: {
    flex: 1,
    borderRadius: 16,
  },
  brandContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  brandHeader: {
    alignItems: 'flex-start',
  },
  brandNameContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandName: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  productImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: 8,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    resizeMode: 'cover',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});