import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';

export default function CutsAndSproutsProductCard({ product, onAddPress }) {
  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : price.toString();
  };

  return (
    <View style={styles.productCard}>
      {/* Price Badge */}
      {product.mrp && product.mrp > product.price && (
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>₹{product.mrp - product.price} OFF</Text>
        </View>
      )}

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        {/* Special quantity indicator */}
        {product.quantity && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>{product.quantity}</Text>
          </View>
        )}
        {/* Multi-piece indicator */}
        {product.quantity === '2 pieces' && (
          <View style={styles.piecesBadge}>
            <Text style={styles.piecesText}>2 pieces</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        {/* Brand */}
        {product.brand && (
          <Text style={styles.brandText}>{product.brand}</Text>
        )}
        
        {/* Product Title */}
        <Text style={styles.productTitle} numberOfLines={2}>
          {product.title}
        </Text>

        {/* Subtitle/Weight */}
        {product.subtitle && (
          <Text style={styles.productSubtitle}>{product.subtitle}</Text>
        )}

        {/* Price Container */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{formatPrice(product.price)}</Text>
          {product.mrp && (
            <Text style={styles.mrp}>₹{product.mrp}</Text>
          )}
        </View>

        {/* Points and Delivery Time */}
        <View style={styles.bottomRow}>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsIcon}>⭐</Text>
            <Text style={styles.pointsText}>{product.points || 5} pts</Text>
          </View>
          
          {product.deliveryTime && (
            <View style={styles.deliveryInfo}>
              <Text style={styles.deliveryIcon}>⚡</Text>
              <Text style={styles.deliveryText}>{product.deliveryTime}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => onAddPress && onAddPress(product)}
      >
        <Text style={styles.addButtonIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 0,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  priceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 10,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  quantityBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  piecesBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  piecesText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  productInfo: {
    padding: 12,
    paddingBottom: 8,
  },
  brandText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 16,
    marginBottom: 2,
  },
  productSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 6,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 6,
  },
  mrp: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryIcon: {
    fontSize: 10,
    marginRight: 2,
  },
  deliveryText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsIcon: {
    fontSize: 12,
    marginRight: 2,
  },
  pointsText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#10B981',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addButtonIcon: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 16,
  },
});