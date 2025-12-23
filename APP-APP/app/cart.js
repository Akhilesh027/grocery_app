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
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

export default function CartScreen() {
  const navigation = useNavigation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedSubtitle, setSelectedSubtitle] = useState(null);
  const backendURL = "https://api.sampurnamart.cloud";

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  const fetchCart = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      const response = await fetch(`${backendURL}/api/cart/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log("Cart API Response:", data);

      if (data.success) {
        // Initialize subtitle for each item if it exists
        const itemsWithSubtitle = (data.cartItems || []).map(item => ({
          ...item,
          selectedSubtitle: item.selectedSubtitle || null // Preserve existing selection
        }));
        setCartItems(itemsWithSubtitle);
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

  const parseSubtitleOptions = (subtitle) => {
    if (!subtitle) return [];
    // Split by comma and trim whitespace
    return subtitle.split(',').map(option => option.trim());
  };

  const showSubtitleModal = (item) => {
    setCurrentItem(item);
    setSelectedSubtitle(item.selectedSubtitle || null);
    setModalVisible(true);
  };

  const saveSubtitleSelection = () => {
    if (!currentItem) {
      Alert.alert("Error", "No item selected");
      return;
    }

    // Update the cart item with selected subtitle
    const updatedItems = cartItems.map(item => {
      if (item._id === currentItem._id) {
        return { ...item, selectedSubtitle: selectedSubtitle || item.selectedSubtitle };
      }
      return item;
    });

    setCartItems(updatedItems);
    
    // Save to backend if a subtitle was selected
    if (selectedSubtitle) {
      saveSubtitleToBackend(currentItem._id, selectedSubtitle);
    }
    
    setModalVisible(false);
    setCurrentItem(null);
    setSelectedSubtitle(null);
  };

  const saveSubtitleToBackend = async (itemId, subtitle) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await fetch(`${backendURL}/api/cart/update/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ selectedSubtitle: subtitle }),
      });
    } catch (error) {
      console.log("Subtitle update failed:", error);
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

      const productId = cartItem.productId._id;

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

  const getItemPrice = (item) =>
    item.price || item.productId?.price || item.product?.price || 0;

  const getItemImage = (item) =>
    item.image ||
    item.productId?.image ||
    item.productId?.images?.[0] ||
    item.product?.images?.[0] ||
    item.images?.[0] ||
    "https://via.placeholder.com/100x100?text=No+Image";

  const getItemTitle = (item) =>
    item.title || item.productId?.title || item.product?.title || "Unknown Product";

  const getItemSubtitle = (item) =>
    item.subtitle || item.productId?.subtitle || item.product?.subtitle || null;

  const getItemDisplayText = (item) => {
    const title = getItemTitle(item);
    const subtitle = getItemSubtitle(item);
    
    if (subtitle && subtitle.includes(',')) {
      // Show first option as default before selection
      const options = parseSubtitleOptions(subtitle);
      return `${title} (${item.selectedSubtitle || options[0] || ''})`;
    }
    
    return subtitle ? `${title} (${subtitle})` : title;
  };

  const getTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      const price = getItemPrice(item);
      const quantity = item.quantity || 1;
      return sum + price * quantity;
    }, 0);

    return total.toFixed(2);
  };

  const validateCartForCheckout = () => {
    return true; // All items now have a default selection
  };

  const handleCheckout = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (!userId) return Alert.alert("Login Required", "Please login to checkout");

    if (cartItems.length === 0)
      return Alert.alert("Cart Empty", "Add items before checkout");

    // Prepare cart items with selected subtitles or default first option
    const checkoutItems = cartItems.map(item => {
      const subtitle = getItemSubtitle(item);
      let finalSubtitle = '';
      
      if (subtitle && subtitle.includes(',')) {
        const options = parseSubtitleOptions(subtitle);
        finalSubtitle = item.selectedSubtitle || options[0] || '';
      } else {
        finalSubtitle = item.selectedSubtitle || subtitle || '';
      }
      
      return {
        ...item,
        subtitle: finalSubtitle
      };
    });

    navigation.navigate("checkout", {
      cartItems: checkoutItems,
      total: getTotal(),
      userId,
    });
  };

  const renderItem = ({ item }) => {
    const price = getItemPrice(item);
    const image = getItemImage(item);
    const title = getItemTitle(item);
    const subtitle = getItemSubtitle(item);
    const quantity = item.quantity || 1;
    const hasSubtitleOptions = subtitle && subtitle.includes(',');
    const displayText = getItemDisplayText(item);

    return (
      <View style={styles.card}>
        <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
        <View style={styles.details}>
          <Text style={styles.title}>{displayText}</Text>
          
          {hasSubtitleOptions && (
            <TouchableOpacity 
              style={styles.subtitleContainer}
              onPress={() => showSubtitleModal(item)}
            >
              <Text style={styles.subtitleLabel}>Options:</Text>
              <View style={styles.subtitleOptions}>
                {parseSubtitleOptions(subtitle).map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.subtitleOption,
                      (item.selectedSubtitle === option || (!item.selectedSubtitle && index === 0)) && 
                      styles.subtitleOptionSelected
                    ]}
                    onPress={() => {
                      // Update selection immediately without modal
                      const updatedItems = cartItems.map(cartItem => {
                        if (cartItem._id === item._id) {
                          return { ...cartItem, selectedSubtitle: option };
                        }
                        return cartItem;
                      });
                      setCartItems(updatedItems);
                      saveSubtitleToBackend(item._id, option);
                    }}
                  >
                    <Text style={[
                      styles.subtitleOptionText,
                      (item.selectedSubtitle === option || (!item.selectedSubtitle && index === 0)) && 
                      styles.subtitleOptionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.moreOptionsButton}
                  onPress={() => showSubtitleModal(item)}
                >
                  <Text style={styles.moreOptionsText}>⋯</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          
          <Text style={styles.price}>₹{price}</Text>

          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item._id, -1)}>
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.qtyValue}>{quantity}</Text>

            <TouchableOpacity style={styles.qtyButton} onPress={() => updateQuantity(item._id, +1)}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item)}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSubtitleModal = () => {
    if (!currentItem) return null;
    
    const subtitle = getItemSubtitle(currentItem);
    const options = parseSubtitleOptions(subtitle);
    const title = getItemTitle(currentItem);

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalSubtitle}>Select Option:</Text>
            
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  (selectedSubtitle === option || (currentItem.selectedSubtitle === option && !selectedSubtitle)) && 
                  styles.optionButtonSelected
                ]}
                onPress={() => setSelectedSubtitle(option)}
              >
                <Text style={[
                  styles.optionText,
                  (selectedSubtitle === option || (currentItem.selectedSubtitle === option && !selectedSubtitle)) && 
                  styles.optionTextSelected
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setCurrentItem(null);
                  setSelectedSubtitle(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveSubtitleSelection}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
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

      {!isLoggedIn ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please log in to view your cart</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate("LoginScreen")}
          >
            <Text style={styles.continueShoppingText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🛒 Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueShoppingButton}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalText}>₹{getTotal()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      {renderSubtitleModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 50 },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  image: { width: 80, height: 80, borderRadius: 8, backgroundColor: "#F5F5F5" },
  details: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  title: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  subtitleContainer: {
    marginBottom: 8,
  },
  subtitleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  subtitleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  subtitleOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  subtitleOptionSelected: {
    borderColor: "#00A86B",
    backgroundColor: "#E8F5E9",
  },
  subtitleOptionText: {
    fontSize: 14,
    color: "#333",
  },
  subtitleOptionTextSelected: {
    color: "#00A86B",
    fontWeight: "600",
  },
  moreOptionsButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
  },
  moreOptionsText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#666",
  },
  price: { fontSize: 18, fontWeight: "700", color: "#00A86B", marginTop: 4 },
  quantityContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyButton: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "#00A86B",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: { fontSize: 18, color: "#00A86B", fontWeight: "bold" },
  qtyValue: { fontSize: 16, marginHorizontal: 12, fontWeight: "600" },
  removeButton: { marginTop: 8 },
  removeText: { color: "#FF4444", fontWeight: "600" },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  totalContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  totalLabel: { fontSize: 16, fontWeight: "600" },
  totalText: { fontSize: 20, fontWeight: "700" },
  checkoutButton: { backgroundColor: "#00A86B", padding: 12, borderRadius: 8, alignItems: "center" },
  checkoutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyText: { fontSize: 18, color: "#666", marginBottom: 20, textAlign: "center" },
  continueShoppingButton: { backgroundColor: "#00A86B", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  continueShoppingText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#666", fontSize: 16 },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  optionButton: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  optionButtonSelected: {
    borderColor: '#00A86B',
    backgroundColor: '#E8F5E9',
  },
  optionText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  optionTextSelected: {
    color: '#00A86B',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#00A86B',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});