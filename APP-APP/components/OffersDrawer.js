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

// DMart-inspired offers and deals with specific colors
const allOffers = [
  { 
    id: 'super-deals', 
    name: 'Super Deals', 
    icon: '⚡', 
    offer: 'Up to 50% Off',
    color: '#DC2626',
    description: 'Lightning deals with massive discounts'
  },
  { 
    id: 'buy-1-get-1', 
    name: 'Buy 1 Get 1', 
    icon: '🎁', 
    offer: 'BOGO Offers',
    color: '#7C3AED',
    description: 'Double the value for your money'
  },
  { 
    id: 'flash-sale', 
    name: 'Flash Sale', 
    icon: '⏰', 
    offer: 'Limited Time',
    color: '#F59E0B',
    description: 'Hurry! Limited time offers'
  },
  { 
    id: 'combo-deals', 
    name: 'Combo Deals', 
    icon: '📦', 
    offer: '30% Off',
    color: '#059669',
    description: 'Smart combos for smart savings'
  },
  { 
    id: 'weekend-special', 
    name: 'Weekend Special', 
    icon: '🎉', 
    offer: 'Weekend Only',
    color: '#EC4899',
    description: 'Special weekend discounts'
  },
  { 
    id: 'clearance-sale', 
    name: 'Clearance Sale', 
    icon: '🏷️', 
    offer: 'Up to 70% Off',
    color: '#EF4444',
    description: 'Clear out old stock at low prices'
  },
  { 
    id: 'daily-essentials', 
    name: 'Daily Essentials', 
    icon: '🛒', 
    offer: '25% Off',
    color: '#10B981',
    description: 'Everyday items at great prices'
  },
  { 
    id: 'bulk-discounts', 
    name: 'Bulk Discounts', 
    icon: '📋', 
    offer: 'Buy More Save More',
    color: '#3B82F6',
    description: 'Greater quantities, greater savings'
  },
  { 
    id: 'fresh-arrivals', 
    name: 'Fresh Arrivals', 
    icon: '✨', 
    offer: 'New Launch',
    color: '#8B5CF6',
    description: 'Latest products with introductory offers'
  },
  { 
    id: 'loyalty-rewards', 
    name: 'Loyalty Rewards', 
    icon: '🏆', 
    offer: 'Member Special',
    color: '#F97316',
    description: 'Exclusive offers for loyal customers'
  }
];

// Quick access offers (most popular)
const quickAccessOffers = ['super-deals', 'buy-1-get-1', 'flash-sale', 'combo-deals'];

// Recently viewed offers
const recentlyViewedOffers = ['weekend-special', 'daily-essentials', 'bulk-discounts'];

export default function OffersDrawer({ visible, onClose, selectedOffer, onOfferSelect }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [slideAnim] = useState(new Animated.Value(-screenWidth));

  // Filter offers based on search query
  const filteredOffers = useMemo(() => {
    if (!searchQuery.trim()) return allOffers;
    return allOffers.filter(offer =>
      offer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.offer.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleOfferPress = (offerId) => {
    onOfferSelect(offerId);
    router.push({ 
      pathname: '/(tabs)/offers', 
      params: { offer: offerId } 
    });
    onClose();
  };

  const renderOfferItem = (offer, isSelected = false) => (
    <TouchableOpacity
      key={offer.id}
      style={[
        styles.offerItem,
        isSelected && styles.selectedOfferItem
      ]}
      onPress={() => handleOfferPress(offer.id)}
      activeOpacity={0.7}
    >
      <View style={styles.offerContent}>
        <Text style={styles.offerIcon}>{offer.icon}</Text>
        <View style={styles.offerTextContainer}>
          <Text style={[
            styles.offerName,
            isSelected && styles.selectedOfferName
          ]}>
            {offer.name}
          </Text>
          <Text style={styles.offerDescription}>{offer.description}</Text>
          <View style={[styles.offerBadge, { backgroundColor: offer.color }]}>
            <Text style={styles.offerText}>{offer.offer}</Text>
          </View>
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
            <Text style={styles.drawerTitle}>Offers & Deals</Text>
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
              placeholder="Search offers & deals..."
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
                  <Text style={styles.sectionTitle}>Hot Deals</Text>
                </View>
                <View style={styles.quickAccessGrid}>
                  {quickAccessOffers.map(offerId => {
                    const offer = allOffers.find(off => off.id === offerId);
                    return (
                      <TouchableOpacity
                        key={offerId}
                        style={[styles.quickAccessItem, { borderColor: offer.color }]}
                        onPress={() => handleOfferPress(offerId)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.quickAccessIcon}>{offer.icon}</Text>
                        <Text style={styles.quickAccessName}>{offer.name.split(' ')[0]}</Text>
                        <Text style={[styles.quickAccessOffer, { color: offer.color }]}>
                          {offer.offer}
                        </Text>
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
                  {recentlyViewedOffers.map(offerId => {
                    const offer = allOffers.find(off => off.id === offerId);
                    return (
                      <TouchableOpacity
                        key={offerId}
                        style={styles.recentlyViewedItem}
                        onPress={() => handleOfferPress(offerId)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.recentlyViewedIcon}>{offer.icon}</Text>
                        <Text style={styles.recentlyViewedName}>{offer.name.split(' ')[0]}</Text>
                        <Text style={styles.recentlyViewedOffer}>{offer.offer}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* All Offers Section */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>All Offers</Text>
                </View>
              </>
            )}

            {/* Offers List */}
            <View style={styles.offersContainer}>
              {filteredOffers.map(offer => 
                renderOfferItem(offer, selectedOffer === offer.id)
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
    width: screenWidth * 0.85,
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
    width: '47%',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  quickAccessIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickAccessName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickAccessOffer: {
    fontSize: 12,
    fontWeight: '500',
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
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    minWidth: 100,
  },
  recentlyViewedIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  recentlyViewedName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369A1',
    textAlign: 'center',
    marginBottom: 4,
  },
  recentlyViewedOffer: {
    fontSize: 10,
    color: '#0369A1',
    fontWeight: '500',
    textAlign: 'center',
  },
  offersContainer: {
    paddingHorizontal: 16,
  },
  offerItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  selectedOfferItem: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 2,
  },
  offerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  offerIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  offerTextContainer: {
    flex: 1,
  },
  offerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  selectedOfferName: {
    color: '#92400E',
  },
  offerDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  offerBadge: {
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
    backgroundColor: '#F59E0B',
    borderRadius: 2,
  },
  bottomPadding: {
    height: 100,
  },
});