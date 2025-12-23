import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width } = Dimensions.get('window');

// --- Configuration Constants ---
const API_BASE_URL = "https://api.sampurnamart.cloud";
const API_ENDPOINT = "/api/banners";
const AUTO_SCROLL_DELAY = 4000;
const SCROLL_RESTART_DELAY = 2000;

export default function PromoCarousel() {
  const navigation = useNavigation();
  const scrollViewRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Stores ALL fetched banners
  const [allPromos, setAllPromos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const CARD_WIDTH = width - 32;

  // --- API Fetch Function ---
  const fetchPromos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}${API_ENDPOINT}`);
      
      const fetchedPromos = response.data.map((banner, index) => ({
        id: banner._id || index,
        title: banner.name || 'Banner Link',
        image: banner.imageUrl,
      }));
      
      // Store all fetched promos
      setAllPromos(fetchedPromos); 
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load promotions. Check API status.");
      setAllPromos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);
  
  // Filter the fetched promos to get only the ones to be displayed (2nd and 3rd)
  // Indices 1 and 2 correspond to the 2nd and 3rd elements.
  const displayedPromos = allPromos.filter((_, index) => index === 1 || index === 2);


  // --- Timer Management Functions ---
  
  const stopAutoScroll = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll();

    if (displayedPromos.length > 1) {
      intervalRef.current = setInterval(() => {
        setActiveIndex(prevIndex => {
          const nextIndex = (prevIndex + 1) % displayedPromos.length;
          
          scrollViewRef.current?.scrollTo({
            x: nextIndex * CARD_WIDTH,
            animated: true
          });
          
          return nextIndex;
        });
      }, AUTO_SCROLL_DELAY);
    }
  };

  /**
   * Auto-Scrolling Effect & Initial Position Setup
   */
  useEffect(() => {
    // We base the logic on the length of the *displayed* banners
    if (displayedPromos.length > 0) {
        
        // Start auto-scroll at the first item displayed (which is the 2nd banner from backend)
        const initialIndex = 0; 
        
        setActiveIndex(initialIndex); 
        
        setTimeout(() => {
            scrollViewRef.current?.scrollTo({
                x: initialIndex * CARD_WIDTH,
                animated: false
            });
            startAutoScroll();
        }, 100); 
    }

    return () => stopAutoScroll();
  }, [displayedPromos.length]); // Dependency is now on the filtered array length

const handleScrollEnd = (event) => {
    // ⭐ DEFENSIVE GUARD: Ensure nativeEvent and contentOffset exist
    const contentOffsetX = event?.nativeEvent?.contentOffset?.x;

    if (contentOffsetX === undefined || displayedPromos.length === 0) {
        // Stop processing if contentOffset.x is unavailable or there are no promos
        return; 
    }
    
    // Use Math.round to get the nearest index, not just Math.floor
    const index = Math.round(contentOffsetX / CARD_WIDTH);
    
    // ... (rest of the logic remains the same)
    if (index !== activeIndex && index >= 0 && index < displayedPromos.length) {
      setActiveIndex(index);
    }
    
    stopAutoScroll();
    if (displayedPromos.length > 1) {
      // Use SCROLL_RESTART_DELAY to give the user time to view the promo
      intervalRef.current = setTimeout(startAutoScroll, SCROLL_RESTART_DELAY);
    }
};
  
  const handleTouchStart = () => {
    stopAutoScroll();
  };


  // --- Conditional Rendering for Status ---
  
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#FF9933" />
        <Text style={{ marginTop: 10, color: '#666' }}>Fetching promotions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
        <TouchableOpacity onPress={fetchPromos}>
            <Text style={{ color: '#00AAFF', fontWeight: 'bold' }}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // Check if we have enough banners to display the 2nd and 3rd
  if (allPromos.length < 3) {
    return (
        <View style={[styles.container, styles.center]}>
            <Text style={{ color: '#999', textAlign: 'center' }}>
                Only {allPromos.length} banner(s) available. Need at least 3 to show the 2nd and 3rd.
            </Text>
        </View>
    );
  }


  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        
        onTouchStart={handleTouchStart} 
        onTouchEnd={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        
        style={styles.scrollView}
      >
        {/* 💡 KEY CHANGE: Mapping over the filtered array */}
        {displayedPromos.map((promo) => (
          <TouchableOpacity
            key={promo.id}
            style={styles.promoCard}
onPress={() => navigation.navigate("OneRupeeDealsScreen")}
            activeOpacity={0.9}
          >
            <Image 
                source={{ uri: promo.image }} 
                style={styles.promoImageFill} 
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {/* Pagination dots based on the length of the *displayed* array */}
        {displayedPromos.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
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
    marginTop: 16,
    height: 150,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { 
    paddingHorizontal: 16 
  }, 
  promoCard: {
    width: width - 32,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    elevation: 4,
    backgroundColor: '#fff',
  },
  promoImageFill: { 
    width: '100%', 
    height: '100%', 
    resizeMode: 'cover',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  paginationDot: {
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