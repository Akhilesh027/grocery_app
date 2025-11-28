import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet
} from 'react-native';

export default function HorizontalProductCard({ product, onLongPress, showVendorHint }) {
  const discountAmount = product.mrp - product.price;
  const discountPercentage = product.discount || Math.round((discountAmount / product.mrp) * 100);

  const handleAdd = () => {
    if (!product.inStock) return;
    console.log(`Added ${product.title} to cart`);
  };

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : price.toString();
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onLongPress={onLongPress}
      delayLongPress={800}
    >
      {/* Price Badge */}
      {product.mrp && product.mrp > product.price && (
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>₹{product.mrp - product.price} OFF</Text>
        </View>
      )}

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        {/* Quantity Badge */}
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
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
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
          {product.mrp && product.mrp > product.price && (
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
        style={[
          styles.addButton,
          !product.inStock && styles.addButtonDisabled
        ]}
        disabled={!product.inStock}
        onPress={handleAdd}
      >
        <Text style={[
          styles.addButtonIcon,
          !product.inStock && styles.addButtonTextDisabled
        ]}>+</Text>
      </TouchableOpacity>

      {/* Vendor Upload Hint */}
      {showVendorHint && (
        <View style={styles.uploadHint}>
          <Text style={styles.uploadHintText}>Hold to edit</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 0,
    marginHorizontal: 2,
    marginVertical: 6,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 140,
  },
  priceBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#00CC66',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    zIndex: 10,
  },
  priceText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  imageContainer: {
    position: 'relative',
    width: 140,
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
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    flex: 1,
    padding: 12,
    paddingBottom: 8,
    paddingRight: 50,
    justifyContent: 'space-between',
  },
  brandText: {
    fontSize: 10,
    color: '#FF9933',
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 16,
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  productSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '400',
    letterSpacing: 0.1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginRight: 6,
    letterSpacing: 0,
  },
  mrp: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '400',
    letterSpacing: 0,
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
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '500',
    letterSpacing: 0.1,
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
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  addButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#00CC66',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#9CA3AF',
  },
  addButtonIcon: {
    color: '#00CC66',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  addButtonTextDisabled: {
    color: '#9CA3AF',
  },
  uploadHint: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  uploadHintText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '500',
  },
});