import { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const API_BASE_URL = 'http://31.97.233.212:5000/api';

export default function OneRupeeDealsScreen() {
    const navigation = useNavigation();

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [addingToCart, setAddingToCart] = useState({});

    // --- Data Fetching ---

    const fetchOneRupeeProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch all products
            const response = await axios.get(`${API_BASE_URL}/products`);
            const allProducts = response.data.products || response.data || [];

            // ⭐ FILTER: Find products where the price is exactly 1 (₹1)
            const oneRupeeProducts = allProducts.filter(p => p.price === 1);
            
            setProducts(oneRupeeProducts);

        } catch (err) {
            console.error('Error fetching products:', err.response?.data || err.message);
            setError('Failed to load deals. Please try again.');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCartItems = async () => {
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const response = await axios.get(`${API_BASE_URL}/cart/${userId}`);
            if (response.data.success) {
                setCartItems(response.data.items || []);
            }
        } catch (error) {
            console.error('Error fetching cart:', error.response?.data || error.message);
        }
    };

    useEffect(() => {
        fetchOneRupeeProducts();
        fetchCartItems();
    }, []);

    // --- Cart Logic ---

    const isInCart = (productId) => {
        return cartItems.some(item => item.productId === productId || item.productId?._id === productId);
    };
const handleAddToCart = async (product) => {
    if (!product.inStock) {
        return Alert.alert("Out of Stock", "This product is not available currently.");
    }
    if (product.price !== 1) {
        return Alert.alert("Price Mismatch", "This item is not a ₹1 deal.");
    }

    try {
        setAddingToCart(prev => ({ ...prev, [product._id]: true }));

        const userId = await AsyncStorage.getItem('userId');

        if (!userId) {
            navigation.navigate("Login");
            return Alert.alert("Login Required", "Please log in to add items to your cart.");
        }

        const response = await axios.post(`${API_BASE_URL}/cart`, {
            userId,
            productId: product._id,
            title: product.title,
            price: product.price,
            image: product.images?.[0] || product.image,
            quantity: 1,
        });

        if ((response.status === 200 || response.status === 201) && response.data.success) {
            Alert.alert("Added to Cart", `${product.title} has been added successfully.`);
            await fetchCartItems();
        } else {
            Alert.alert("Error", response.data.message || "Failed to add to cart.");
        }
    } catch (error) {
        console.error("Add to Cart Error:", error.response?.data || error.message);
        Alert.alert("Error", "Something went wrong while adding to cart.");
    } finally {
        setAddingToCart(prev => ({ ...prev, [product._id]: false }));
    }
};

    
    // --- Render Loading/Error States ---

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF9933" />
                <Text style={styles.loadingText}>Fetching 1 Rupee Deals...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>🚨 {error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchOneRupeeProducts}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- Main Render ---

    return (
        <SafeAreaView style={styles.container}>
            {/* Top Bar/Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>🔥 1 Rupee Deals</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartButton}>
                    <Text style={styles.cartIcon}>🛒</Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar Placeholder */}
            <TouchableOpacity 
                style={styles.searchBar}
                onPress={() => navigation.navigate('SearchScreen', { allProducts: products })}
            >
                <Text style={styles.searchIcon}>🔍</Text>
                <Text style={styles.searchText}>Search within deals</Text>
            </TouchableOpacity>

            {/* Product List */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {products.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>💸</Text>
                        <Text style={styles.emptyStateTitle}>No ₹1 Deals Available</Text>
                        <Text style={styles.emptyStateText}>Check back soon for new flash sales!</Text>
                    </View>
                ) : (
                    products.map((product) => {
                        const isProductInCart = isInCart(product._id);
                        
                        return (
                            <View key={product._id} style={styles.productCard}>
                                {/* Wrap the header in TouchableOpacity to allow navigation to product details */}
                                <TouchableOpacity style={styles.productHeader} onPress={() => navigation.navigate('ProductDetail', { productId: product._id })}>
                                    <Image 
                                        source={{ uri: product.images?.[0] || product.image }} 
                                        style={styles.productImage}
                                    />
                                    <View style={styles.productContent}>
                                        <Text style={styles.productTitle} numberOfLines={2}>{product.title}</Text>
                                        <Text style={styles.productSubtitle}>{product.subtitle || 'Flash Sale Item'}</Text>
                                        <View style={styles.priceContainer}>
                                            <Text style={styles.priceDeal}>₹1</Text>
                                            {product.mrp > 1 && (
                                                <Text style={styles.mrp}>M.R.P: ₹{product.mrp}</Text>
                                            )}
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                
                                <View style={styles.productFooter}>
                                    <View style={styles.stockInfo}>
                                        <Text style={[
                                            styles.stockText,
                                            { color: product.inStock ? '#00CC66' : '#EF4444' }
                                        ]}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </Text>
                                    </View>
                                    
                                    {/* Add to Cart Button */}
                                    <TouchableOpacity 
                                        style={[
                                            styles.addButton,
                                            (!product.inStock || addingToCart[product._id]) && styles.addButtonDisabled
                                        ]}
                                        onPress={() => handleAddToCart(product)}
                                        disabled={!product.inStock || addingToCart[product._id]}
                                    >
                                        {addingToCart[product._id] ? (
                                            <ActivityIndicator size="small" color="#FFFFFF" />
                                        ) : (
                                            <Text style={styles.addButtonText}>
                                                {isProductInCart ? 'Add Again' : 'Add to Cart'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
                <View style={{ height: 50 }} /> 
            </ScrollView>
        </SafeAreaView>
    );
}

// --- Stylesheet ---

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#FF9933',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // Header Styles
    header: {
        backgroundColor: '#FFFFFF',
        paddingTop: 45,
        paddingHorizontal: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        flex: 1,
        textAlign: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backText: {
        fontSize: 24,
        color: '#1F2937',
    },
    cartButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cartIcon: {
        fontSize: 24,
    },

    // Search Bar Styles
    searchBar: { 
        backgroundColor: "#FFF", 
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: "row", 
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    searchIcon: { fontSize: 16, marginRight: 12 },
    searchText: { fontSize: 14, color: "#94A3B8" },

    // Content & Product List Styles
    content: {
        flex: 1,
        padding: 16,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyStateIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    productCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    productHeader: {
        flexDirection: 'row',
        padding: 12,
    },
    productImage: {
        width: 90,
        height: 90,
        borderRadius: 8,
        marginRight: 12,
        resizeMode: 'cover',
    },
    productContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    productTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    productSubtitle: {
        fontSize: 12,
        color: '#6B7280',
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    priceDeal: {
        fontSize: 20,
        fontWeight: '900',
        color: '#FF9933', // Highlight deal price
        marginRight: 10,
    },
    mrp: {
        fontSize: 13,
        color: '#9CA3AF',
        textDecorationLine: 'line-through',
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#F9FAFB',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    stockInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockText: {
        fontSize: 12,
        fontWeight: '500',
    },
    addButton: {
        backgroundColor: '#00CC66',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    addButtonDisabled: {
        backgroundColor: '#9CA3AF',
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
});