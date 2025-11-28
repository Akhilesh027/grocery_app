import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';

export default function CartScreen() {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const backendURL = "https://grocery-c3c0.onrender.com";

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${backendURL}/api/cart/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Cart API Response:", data); // Debug log

      if (data.success) {
        setCartItems(data.cartItems || []);
      } else {
        Alert.alert("Error", data.message || "Failed to load cart");
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      Alert.alert("Error", "Could not load cart. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, change) => {
    try {
      const updatedItems = cartItems.map((item) => {
        if (item._id === itemId) {
          const newQty = Math.max(1, (item.quantity || 1) + change);
          return { ...item, quantity: newQty };
        }
        return item;
      });
      setCartItems(updatedItems);

      const token = await AsyncStorage.getItem("token");
      await fetch(`${backendURL}/api/cart/update/${itemId}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: change > 0 ? 1 : -1 }),
      });
    } catch (error) {
      console.log("Quantity update failed:", error);
      Alert.alert("Error", "Failed to update quantity");
    }
  };
const removeFromCart = async (cartItem) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");

    if (!userId) {
      Alert.alert("Error", "User not found");
      return;
    }

    const productId = cartItem.productId._id; // extracting productId

    const response = await fetch(
      `${backendURL}/api/cart/${userId}/${productId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.success) {
      setCartItems(cartItems.filter((item) => item.productId._id !== productId));
      Alert.alert("Success", "Item removed from cart");
    } else {
      Alert.alert("Error", data.message || "Failed to remove item");
    }
  } catch (error) {
    console.error("Remove failed:", error);
    Alert.alert("Error", "Failed to remove item");
  }
};


  // Safe price access function
  const getItemPrice = (item) => {
    // Try different possible price locations
    if (item.price) return item.price;
    if (item.productId?.price) return item.productId.price;
    if (item.product?.price) return item.product.price;
    return 0;
  };

  // Safe image access function
  const getItemImage = (item) => {
    if (item.image) return item.image;
    if (item.productId?.image) return item.productId.image;
    if (item.productId?.images?.[0]) return item.productId.images[0];
    if (item.product?.images?.[0]) return item.product.images[0];
    if (item.images?.[0]) return item.images[0];
    return "https://via.placeholder.com/100x100?text=No+Image";
  };

  // Safe title access function
  const getItemTitle = (item) => {
    if (item.title) return item.title;
    if (item.productId?.title) return item.productId.title;
    if (item.product?.title) return item.product.title;
    return "Unknown Product";
  };

  const getTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      const price = getItemPrice(item);
      const quantity = item.quantity || 1;
      return sum + (parseFloat(price) || 0) * quantity;
    }, 0);
    
    return total.toFixed(2);
  };

  const renderItem = ({ item }) => {
    const price = getItemPrice(item);
    const image = getItemImage(item);
    const title = getItemTitle(item);
    const quantity = item.quantity || 1;

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: image }}
          style={styles.image}
          resizeMode="contain"
          onError={() => console.log("Image load error for:", image)}
        />
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <Text style={styles.price}>₹{price}</Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => updateQuantity(item._id, -1)}
            >
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{quantity}</Text>

            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => updateQuantity(item._id, +1)}
            >
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => removeFromCart(item)}

            style={styles.removeButton}
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleCheckout = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) {
      Alert.alert("Login Required", "Please login to proceed with checkout");
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Please add items to cart before checkout");
      return;
    }

    navigation.navigate('checkout', {
      cartItems: cartItems.map(item => ({
        ...item,
        price: getItemPrice(item),
        image: getItemImage(item),
        title: getItemTitle(item)
      })),
      total: getTotal(),
      userId,
    });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#00A86B" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Cart</Text>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🛒 Your cart is empty</Text>
          <TouchableOpacity 
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id || Math.random().toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalText}>₹{getTotal()}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    paddingTop: 50 
  },
  header: { 
    fontSize: 24, 
    fontWeight: "bold", 
    textAlign: "center", 
    marginBottom: 10,
    color: "#333"
  },
  list: { 
    paddingHorizontal: 16, 
    paddingBottom: 100 
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  image: { 
    width: 80, 
    height: 80, 
    borderRadius: 8,
    backgroundColor: "#F5F5F5"
  },
  details: { 
    flex: 1, 
    marginLeft: 12, 
    justifyContent: "space-between" 
  },
  title: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#333",
    lineHeight: 20,
    marginBottom: 4
  },
  price: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#00A86B",
    marginBottom: 8
  },
  quantityContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 8 
  },
  qtyButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#00A86B",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FFF8"
  },
  qtyText: { 
    fontSize: 18, 
    color: "#00A86B", 
    fontWeight: "bold",
    lineHeight: 20
  },
  qtyValue: { 
    fontSize: 16, 
    marginHorizontal: 12,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center"
  },
  removeButton: { 
    marginTop: 8,
    alignSelf: "flex-start"
  },
  removeText: { 
    color: "#FF4444", 
    fontSize: 14, 
    fontWeight: "500" 
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666"
  },
  totalText: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#111" 
  },
  checkoutButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    paddingHorizontal: 40
  },
  emptyText: { 
    fontSize: 18, 
    color: "#666",
    marginBottom: 20,
    textAlign: "center"
  },
  continueShoppingButton: {
    backgroundColor: "#00A86B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueShoppingText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  loader: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
});