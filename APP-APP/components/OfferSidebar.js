import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';

export default function OfferSidebar({ offers, selectedOffer, onOfferSelect }) {
  const offerData = [
    {
      id: 'hot-deals',
      name: 'Hot Deals',
      icon: '🔥',
      color: '#EF4444',
      discount: '50% Off'
    },
    {
      id: 'flash-sale',
      name: 'Flash Sale',
      icon: '⚡',
      color: '#F59E0B',
      discount: '40% Off'
    },
    {
      id: 'combo-offers',
      name: 'Combo\nOffers',
      icon: '🎁',
      color: '#10B981',
      discount: '₹195 Off'
    },
    {
      id: 'buy-1-get-1',
      name: 'Buy 1\nGet 1',
      icon: '🏷️',
      color: '#8B5CF6',
      discount: 'BOGO'
    },
    {
      id: 'clearance',
      name: 'Clearance',
      icon: '💰',
      color: '#06B6D4',
      discount: '₹370 Off'
    },
    {
      id: 'mega-deals',
      name: 'Mega\nDeals',
      icon: '🎯',
      color: '#EC4899',
      discount: '₹90 Off'
    },
    {
      id: 'baby-care',
      name: 'Baby Care\nSpecial',
      icon: '🍼',
      color: '#84CC16',
      discount: '₹125 Off'
    }
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {offerData.map((offer, index) => (
          <TouchableOpacity
            key={offer.id}
            style={[
              styles.offerItem,
              selectedOffer === offer.id && styles.selectedOfferItem,
              index === offerData.length - 1 && styles.lastItem
            ]}
            onPress={() => onOfferSelect(offer.id)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              { backgroundColor: selectedOffer === offer.id ? offer.color : '#FEF2F2' }
            ]}>
              <Text style={styles.offerIcon}>{offer.icon}</Text>
            </View>
            <Text style={[
              styles.offerName,
              selectedOffer === offer.id && styles.selectedOfferName
            ]}>
              {offer.name}
            </Text>
            <View style={[
              styles.discountBadge,
              { backgroundColor: selectedOffer === offer.id ? offer.color : '#FEE2E2' }
            ]}>
              <Text style={[
                styles.discountText,
                { color: selectedOffer === offer.id ? '#FFFFFF' : offer.color }
              ]}>
                {offer.discount}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 100,
    backgroundColor: '#FFF5F5', // Light red/pink background for offers
    paddingTop: 8,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  offerItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 1,
  },
  selectedOfferItem: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Subtle red background for selected
  },
  lastItem: {
    marginBottom: 0,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  offerIcon: {
    fontSize: 18,
  },
  offerName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 12,
    marginBottom: 6,
  },
  selectedOfferName: {
    color: '#DC2626',
    fontWeight: '600',
  },
  discountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 40,
  },
  discountText: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
});