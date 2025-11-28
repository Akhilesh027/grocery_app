import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function CategoryBanner({ category }) {
  // Category-specific banner data
  const getCategoryBanner = (category) => {
    const bannerData = {
      'vegetables': {
        title: 'Super Fresh Vegetables',
        subtitle: 'Farm to your doorstep',
        offer: 'Up to 40% OFF',
        backgroundColor: ['#10B981', '#059669'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '23:45:12',
        icon: '🥬'
      },
      'fruits': {
        title: 'Fresh & Juicy Fruits',
        subtitle: 'Nature\'s sweetest gifts',
        offer: '30% OFF',
        backgroundColor: ['#F59E0B', '#D97706'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '18:20:45',
        icon: '🍎'
      },
      'dairy': {
        title: 'Pure Dairy Products',
        subtitle: 'Fresh from farm',
        offer: 'Buy 2 Get 1 FREE',
        backgroundColor: ['#3B82F6', '#2563EB'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '12:15:30',
        icon: '🥛'
      },
      'grains': {
        title: 'Premium Quality Grains',
        subtitle: 'Best quality at best price',
        offer: '25% OFF',
        backgroundColor: ['#8B5CF6', '#7C3AED'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/1059947/pexels-photo-1059947.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '09:35:20',
        icon: '🌾'
      },
      'personalcare': {
        title: 'Personal Care Essentials',
        subtitle: 'Quality products for you',
        offer: 'Up to 35% OFF',
        backgroundColor: ['#EC4899', '#DB2777'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '15:42:18',
        icon: '🧼'
      },
      'personal care': {
        title: 'Personal Care Essentials',
        subtitle: 'Quality products for you',
        offer: 'Up to 35% OFF',
        backgroundColor: ['#EC4899', '#DB2777'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '15:42:18',
        icon: '🧼'
      },
      'household': {
        title: 'Household Essentials',
        subtitle: 'Everything for your home',
        offer: '20% OFF',
        backgroundColor: ['#06B6D4', '#0891B2'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/4239019/pexels-photo-4239019.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '06:25:40',
        icon: '🧽'
      },
      'fresh vegetables': {
        title: 'Super Fresh Vegetables',
        subtitle: 'Farm to your doorstep',
        offer: 'Up to 40% OFF',
        backgroundColor: ['#10B981', '#059669'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '23:45:12',
        icon: '🥬'
      },
      'fresh fruits': {
        title: 'Fresh & Juicy Fruits',
        subtitle: 'Nature\'s sweetest gifts',
        offer: '30% OFF',
        backgroundColor: ['#F59E0B', '#D97706'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '18:20:45',
        icon: '🍎'
      },
      'hair care': {
        title: 'Hair Care Products',
        subtitle: 'Beautiful hair, naturally',
        offer: 'Up to 30% OFF',
        backgroundColor: ['#EC4899', '#DB2777'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '11:22:35',
        icon: '💇‍♀️'
      },
      'skin care': {
        title: 'Skin Care Essentials',
        subtitle: 'Glow with confidence',
        offer: 'Up to 35% OFF',
        backgroundColor: ['#8B5CF6', '#7C3AED'],
        textColor: '#FFFFFF',
        image: 'https://images.pexels.com/photos/3685530/pexels-photo-3685530.jpeg?auto=compress&cs=tinysrgb&w=800',
        timer: '14:18:27',
        icon: '🧴'
      }
    };

    // Default banner if category not found
    const defaultBanner = {
      title: `Fresh ${category?.name || 'Products'}`,
      subtitle: 'Quality products at great prices',
      offer: 'Special Offers',
      backgroundColor: ['#10B981', '#059669'],
      textColor: '#FFFFFF',
      image: category?.image || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800',
      timer: '12:00:00',
      icon: category?.icon || '🛒'
    };

    return bannerData[category?.name?.toLowerCase()] || defaultBanner;
  };

  if (!category) return null;

  const banner = getCategoryBanner(category);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.bannerContainer}
        activeOpacity={0.9}
      >
        <ImageBackground
          source={{ uri: banner.image }}
          style={styles.bannerBackground}
          imageStyle={styles.bannerImage}
        >
          <View 
            style={[
              styles.bannerOverlay,
              {
                backgroundColor: `${banner.backgroundColor[0]}E6`, // 90% opacity
              }
            ]}
          >
            <View style={styles.bannerContent}>
              <View style={styles.bannerLeft}>
                <View style={styles.titleRow}>
                  <Text style={styles.categoryIcon}>{banner.icon}</Text>
                  <Text style={[styles.bannerTitle, { color: banner.textColor }]}>
                    {banner.title}
                  </Text>
                </View>
                <Text style={[styles.bannerSubtitle, { color: banner.textColor }]}>
                  {banner.subtitle}
                </Text>
                <View style={styles.offerContainer}>
                  <Text style={[styles.offerText, { color: banner.textColor }]}>
                    {banner.offer}
                  </Text>
                  {banner.timer && (
                    <View style={styles.timerContainer}>
                      <Text style={styles.clockIcon}>⏰</Text>
                      <Text style={[styles.timerText, { color: banner.textColor }]}>
                        {banner.timer}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.bannerRight}>
                <View style={styles.shopNowButton}>
                  <Text style={styles.shopNowText}>Explore</Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  bannerContainer: {
    width: screenWidth - 32,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerBackground: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerImage: {
    borderRadius: 12,
  },
  bannerOverlay: {
    flex: 1,
    borderRadius: 12,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 16,
    maxWidth: '70%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
    flex: 1,
  },
  bannerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 6,
    opacity: 0.9,
    flexWrap: 'wrap',
    lineHeight: 14,
    maxWidth: '100%',
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  offerText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  clockIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  timerText: {
    fontSize: 10,
    fontWeight: '600',
  },
  bannerRight: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '30%',
  },
  shopNowButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});