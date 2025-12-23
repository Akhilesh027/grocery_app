import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');

// --- Configuration ---
const API_BASE_URL = "https://api.sampurnamart.cloud";
const AUTO_SCROLL_DELAY = 5000; // 5 seconds
const AUTOSCROLL_TRANSITION_TIME = 3000; // 3 seconds before restarting scroll

// Define constants for banner layout
const HORIZONTAL_PADDING = 16;
const BANNER_MARGIN = 16;
const BANNER_WIDTH = screenWidth - (HORIZONTAL_PADDING * 2);

export default function AdvertisementBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const intervalRef = useRef(null); // Ref to hold the interval ID

  // --- Timer Management Functions ---

  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll(); // Clear any existing interval first

    if (banners.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % banners.length;
          const offset = nextIndex * (BANNER_WIDTH + BANNER_MARGIN);
          
          scrollViewRef.current?.scrollTo({ x: offset, animated: true });
          
          return nextIndex;
        });
      }, AUTO_SCROLL_DELAY);
    }
  };

  // Function to fetch banners from the API
  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/banners`);
      
      const fetchedBanners = response.data.map((banner, index) => ({
        id: banner._id || index,
        title: banner.name || 'Promotion',
        subtitle: 'Limited Time Offer!',
        offer: 'Great Deal!',
        backgroundColor: ['#66DD88', '#00CC66'],
        textColor: '#FFFFFF',
        image: banner.imageUrl,
        timer: '00:00:00'
      }));
      
      setBanners(fetchedBanners);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /**
   * Auto-Scrolling Effect
   */
  useEffect(() => {
    // Start auto-scroll once banners are loaded
    startAutoScroll();

    // Cleanup function: stop auto-scroll when component unmounts
    return () => stopAutoScroll();
  }, [banners.length]); // Re-run when banners data changes


  /**
   * Manual Scroll Index Update & Scroll Restart
   */
  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / (BANNER_WIDTH + BANNER_MARGIN));
    
    if (index !== activeIndex && index >= 0 && index < banners.length) {
      setActiveIndex(index);
    }
    
    // After manual scroll ends, wait a moment, then restart auto-scroll
    stopAutoScroll();
    if (banners.length > 1) {
        // Use a timeout to delay the restart slightly after user interaction ends
        intervalRef.current = setTimeout(startAutoScroll, AUTOSCROLL_TRANSITION_TIME); 
    }
  };

  // --- Render Status/Error/Empty States ---

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF9933" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: 'red' }}>{error}</Text>
        <TouchableOpacity onPress={fetchBanners} style={{ marginTop: 10 }}>
            <Text style={{ color: '#00AAFF', fontWeight: 'bold' }}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (banners.length === 0) {
      return (
          <View style={[styles.container, styles.center]}>
              <Text style={{ color: '#999' }}>No active banners found.</Text>
          </View>
      );
  }

  // --- Render Banner Item ---

  const renderBanner = (banner) => (
    <TouchableOpacity 
      key={banner.id} 
      style={styles.bannerContainer}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: banner.image }}
        style={styles.bannerBackground}
        imageStyle={styles.bannerImage}
      >
        
      </ImageBackground>
    </TouchableOpacity>
  );

  // --- Main Component Render ---

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        
        // --- NEW: Interaction Handlers ---
        onTouchStart={stopAutoScroll} // Stop scroll when user starts touching
        onTouchEnd={handleScroll}     // Handle scroll end and restart timer
        onMomentumScrollEnd={handleScroll} // Also use onMomentumScrollEnd for reliability
      >
        {banners.map(renderBanner)}
      </ScrollView>
      
      {/* Dynamic Dots Indicator */}
      <View style={styles.dotsContainer}>
        {banners.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === activeIndex && styles.activeDot
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// --- Styles (Unchanged) ---
const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    height: 180, // Added height for better loading view
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  bannerContainer: {
    width: BANNER_WIDTH,
    height: 140,
    marginRight: BANNER_MARGIN,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
    maxWidth: '100%',
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
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0.5, height: 0.5 },
    textShadowRadius: 1,
    flexShrink: 1,
    maxWidth: 100,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },
  clockIcon: {
    fontSize: 9,
    marginRight: 3,
  },
  timerText: {
    fontSize: 9,
    fontWeight: '500',
  },
  bannerRight: {
    alignItems: 'flex-end',
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  shopNowText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginRight: 6,
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FF9933',
    width: 24,
  },
});