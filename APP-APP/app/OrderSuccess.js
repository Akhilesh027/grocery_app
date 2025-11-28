// OrderSuccessScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { CheckCircle, Home, Package, ArrowLeft } from 'lucide-react-native';

const COLORS = {
  primary: '#00A86B',
  success: '#059669',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  text: { primary: '#111827', secondary: '#6B7280' },
  border: '#E5E7EB',
};

const formatPrice = (num) => `₹${Number(num || 0).toFixed(2)}`;

export default function OrderSuccessScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    orderId,
    total,
    coinsEarned = 0,
    coinsUsed = 0,
    referralDiscount = 0,
    paymentMethod,
    deliverySlot,
    address,
    items = []
  } = route.params || {};

  const getPaymentMethodName = (method) => {
    const methods = {
      upi: 'UPI',
      card: 'Credit/Debit Card',
      cod: 'Cash on Delivery',
      wallet: 'Wallet'
    };
    return methods[method] || method;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <ArrowLeft size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Confirmed</Text>
        <View style={{ width: 24 }} /> {/* Spacer for balance */}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Icon */}
        <View style={styles.successIconContainer}>
          <CheckCircle size={80} color={COLORS.success} />
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Thank you for your purchase. Your order has been confirmed.
          </Text>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID:</Text>
            <Text style={styles.detailValue}>{orderId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={styles.detailValue}>{formatPrice(total)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>{getPaymentMethodName(paymentMethod)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Slot:</Text>
            <Text style={styles.detailValue}>{deliverySlot}</Text>
          </View>
        </View>

        {/* Rewards Summary */}
        {(coinsEarned > 0 || coinsUsed > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rewards & Coins</Text>
            {coinsEarned > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Coins Earned:</Text>
                <Text style={[styles.detailValue, styles.coinsEarned]}>
                  +{coinsEarned} 🪙
                </Text>
              </View>
            )}
            {coinsUsed > 0 && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Coins Used:</Text>
                <Text style={[styles.detailValue, styles.coinsUsed]}>
                  -{coinsUsed} 🪙 (Saved {formatPrice(referralDiscount)})
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Delivery Address */}
        {address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.addressName}>{address.fullName}</Text>
            <Text style={styles.addressText}>{address.address}</Text>
            <Text style={styles.addressText}>
              {address.locality ? `${address.locality}, ` : ''}
              {address.city}, {address.state} - {address.pincode}
            </Text>
            <Text style={styles.addressMobile}>📱 {address.mobile}</Text>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({items.length})</Text>
          {items.slice(0, 3).map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Image 
                source={{ uri: item.image || item.productId?.image }} 
                style={styles.itemImage}
                defaultSource={{ uri: "https://via.placeholder.com/60x60?text=No+Image" }}
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.title || item.productId?.title}
                </Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {formatPrice((item.price || item.productId?.price) * item.quantity)}
              </Text>
            </View>
          ))}
          {items.length > 3 && (
            <Text style={styles.moreItemsText}>
              +{items.length - 3} more items
            </Text>
          )}
        </View>

        {/* Next Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          <View style={styles.nextStep}>
            <Package size={20} color={COLORS.primary} />
            <Text style={styles.nextStepText}>
              You will receive order confirmation shortly
            </Text>
          </View>
          <View style={styles.nextStep}>
            <Package size={20} color={COLORS.primary} />
            <Text style={styles.nextStepText}>
              Order will be delivered in your selected time slot
            </Text>
          </View>
          {paymentMethod === 'cod' && (
            <View style={styles.nextStep}>
              <Package size={20} color={COLORS.primary} />
              <Text style={styles.nextStepText}>
                Please keep cash ready for delivery
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('orders')}
        >
          <Text style={styles.secondaryButtonText}>View Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={() => navigation.navigate('Home')}
        >
          <Home size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
    paddingBottom: 120,
  },
  successIconContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.surface,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.success,
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  coinsEarned: {
    color: COLORS.success,
    fontWeight: '600',
  },
  coinsUsed: {
    color: '#F59E0B',
    fontWeight: '600',
  },
  addressName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 2,
    lineHeight: 18,
  },
  addressMobile: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  moreItemsText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  nextStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nextStepText: {
    fontSize: 14,
    color: COLORS.text.primary,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});