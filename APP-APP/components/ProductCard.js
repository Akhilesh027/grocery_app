import React from 'react';
import { 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  StyleSheet,
  Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";


export default function ProductCard({ product }) {
const navigation = useNavigation();
  // Calculate discount
  const discountAmount = product.mrp && product.mrp > product.price
    ? product.mrp - product.price
    : 0;
  const discountPercentage = product.discount || Math.round((discountAmount / product.mrp) * 100);

const handleAdd = async () => {
  if (!product.inStock) {
    return Alert.alert("Out of Stock", "This product is not available currently.");
  }

  try {
    const userId = await AsyncStorage.getItem('userId');
if (!userId) {
  Alert.alert(
    "Login Required",
    "Please log in to add items to your cart.",
    [{ text: "OK", onPress: () => navigation.navigate("LoginScreen") }]
  );
  return;
}

    if (!userId) {
      return Alert.alert("Login Required", "Please log in to add items to your cart.");
    }

    const payload = {
      userId,
      productId: product._id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || product.image,
      quantity: 1,
    };

    const response = await axios.post("https://api.sampurnamart.cloud/api/cart", payload);

    if (response.data.success) {
      Alert.alert("Added!", `${product.title} has been added to your cart.`);
    } else {
      Alert.alert("Error", response.data.message || "Failed to add to cart.");
    }

  } catch (error) {
    console.log("Add to Cart Error:", error?.message);
    Alert.alert("Error", "Something went wrong while adding to cart.");
  }
};


  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(2) : price?.toString() || '';
  };

  return (
    <View style={styles.card}>
      {/* ✅ Discount Badge */}
      {discountAmount > 0 && (
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>₹{discountAmount} OFF</Text>
        </View>
      )}

      {/* ✅ Product Image */}
      <View style={styles.imageContainer}>
        <Image
source={{ uri: product?.images?.[0] || product?.image }}
  style={styles.productImage}
/>
    {product.quantity && (
          <View style={styles.quantityBadge}>
            <Text style={styles.quantityText}>{product.quantity}</Text>
          </View>
        )}

        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* ✅ Product Info */}
      <View style={styles.productInfo}>
        {product.brand && <Text style={styles.brandText}>{product.brand}</Text>}
        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
        {product.subtitle && <Text style={styles.productSubtitle}>{product.subtitle}</Text>}

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{formatPrice(product.price)}</Text>
          {product.mrp && product.mrp > product.price && (
            <Text style={styles.mrp}>₹{product.mrp}</Text>
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsIcon}>⭐</Text>
            <Text style={styles.pointsText}>{product.coinValue || 5} pts</Text>
          </View>
        </View>
      </View>

      {/* ✅ Add to Cart Button */}
      <TouchableOpacity 
        style={[styles.addButton, !product.inStock && styles.addButtonDisabled]}
        disabled={!product.inStock}
        onPress={handleAdd}
      >
        <Text style={[styles.addButtonIcon, !product.inStock && styles.addButtonTextDisabled]}>
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 0,
    marginHorizontal: 0,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
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
    padding: 12,
    paddingBottom: 5,
    position: 'relative',
  },
  brandText: {
    fontSize: 10,
    color: '#FF9933',
    fontWeight: '500',
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 16,
    marginBottom: 2,
  },
  productSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 6,
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
  },
  mrp: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingRight: 35,
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
  },
  addButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#00CC66',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 5,
  },
  addButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#9CA3AF',
  },
  addButtonIcon: {
    color: '#00CC66',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  addButtonTextDisabled: {
    color: '#9CA3AF',
  },
});
