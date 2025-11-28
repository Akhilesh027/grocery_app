import { useState } from 'react';
import { 
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  ImageBackground
} from 'react-native';
import { ArrowLeft, Star, Plus, Minus, Heart, Share2, Play } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  
  // Mock product data - in real app this would come from route params
  const product = {
    id: '1',
    title: 'Fresh Organic Tomatoes 1kg',
    price: 45,
    mrp: 55,
    discount: 18,
    rating: 4.2,
    reviewCount: 128,
    description: 'Fresh, juicy organic tomatoes sourced directly from local farms. Perfect for cooking, salads, and daily use. Rich in vitamins and antioxidants.',
    images: [
      'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400'
    ],
    videoThumbnail: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400',
    inStock: true,
    category: 'Vegetables',
    brand: 'Fresh Farm',
    weight: '1kg',
    origin: 'Local Farms',
    shelfLife: '3-4 days',
    nutritionInfo: {
      calories: '18 per 100g',
      protein: '0.9g',
      carbs: '3.9g',
      fiber: '1.2g'
    }
  };

  const discountAmount = product.mrp - product.price;
  const savings = discountAmount * quantity;

  const relatedProducts = [
    {
      id: '2',
      title: 'Fresh Onions 1kg',
      price: 35,
      mrp: 42,
      image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: '3',
      title: 'Green Capsicum 500g',
      price: 28,
      mrp: 35,
      image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=200'
    }
  ];

  const handleShare = () => {
    // Share functionality would be implemented here
    console.log('Share product');
  };

  const addToCart = () => {
    // Add to cart logic
    console.log(`Added ${quantity} ${product.title} to cart`);
    router.push('/cart');
  };

  return (
    <View style={styles.container}>
      {/* Header with background */}
      <ImageBackground
        source={{ uri: product.images[0] }}
        style={styles.headerBackground}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <BlurView intensity={40} tint="light" style={styles.headerBlur}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#111827" />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleShare}>
                <Share2 size={24} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.favoriteButton}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Heart 
                  size={24} 
                  color={isFavorite ? "#EF4444" : "#111827"}
                  fill={isFavorite ? "#EF4444" : "none"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </ImageBackground>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.imageContainer}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false}
            style={styles.imageScroll}
          >
            {product.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.productImage} />
            ))}
          </ScrollView>
          
          {/* Video Thumbnail */}
          <TouchableOpacity 
            style={styles.videoThumbnail}
            onPress={() => setShowVideoModal(true)}
          >
            <Image source={{ uri: product.videoThumbnail }} style={styles.videoImage} />
            <View style={styles.playButton}>
              <Play size={20} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.brandCategory}>
            <Text style={styles.brand}>{product.brand}</Text>
            <Text style={styles.category}>{product.category}</Text>
          </View>
          
          <Text style={styles.productTitle}>{product.title}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.rating}>
              <Star size={16} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{product.rating}</Text>
              <Text style={styles.reviewCount}>({product.reviewCount} reviews)</Text>
            </View>
            {product.inStock && (
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>In Stock</Text>
              </View>
            )}
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{product.price}</Text>
              <Text style={styles.mrp}>₹{product.mrp}</Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{product.discount}% OFF</Text>
              </View>
            </View>
            <Text style={styles.savingsText}>You save ₹{discountAmount}</Text>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus size={20} color="#6B7280" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Plus size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Details */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Product Details</Text>
            <Text style={styles.description}>{product.description}</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Weight</Text>
                <Text style={styles.detailValue}>{product.weight}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Origin</Text>
                <Text style={styles.detailValue}>{product.origin}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Shelf Life</Text>
                <Text style={styles.detailValue}>{product.shelfLife}</Text>
              </View>
            </View>
          </View>

          {/* Nutrition Info */}
          <View style={styles.nutritionSection}>
            <Text style={styles.sectionTitle}>Nutrition Information</Text>
            <View style={styles.nutritionGrid}>
              {Object.entries(product.nutritionInfo).map(([key, value]) => (
                <View key={key} style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  <Text style={styles.nutritionValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Related Products */}
          <View style={styles.relatedSection}>
            <Text style={styles.sectionTitle}>You might also like</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedProducts.map((item) => (
                <TouchableOpacity key={item.id} style={styles.relatedProduct}>
                  <Image source={{ uri: item.image }} style={styles.relatedImage} />
                  <Text style={styles.relatedTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.relatedPrice}>
                    <Text style={styles.relatedPriceText}>₹{item.price}</Text>
                    <Text style={styles.relatedMRP}>₹{item.mrp}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total: ₹{product.price * quantity}</Text>
          {savings > 0 && (
            <Text style={styles.totalSavings}>Save ₹{savings}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* Video Modal */}
      <Modal visible={showVideoModal} animationType="slide">
        <View style={styles.videoModal}>
          <View style={styles.videoHeader}>
            <TouchableOpacity onPress={() => setShowVideoModal(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.videoContainer}>
            <Image source={{ uri: product.videoThumbnail }} style={styles.fullVideo} />
            <View style={styles.videoOverlay}>
              <TouchableOpacity style={styles.playButtonLarge}>
                <Play size={40} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerBackground: {
    paddingTop: 45,
  },
  headerBlur: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    marginLeft: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  imageScroll: {
    height: 300,
  },
  productImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  videoThumbnail: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoImage: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 16,
  },
  brandCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  category: {
    fontSize: 14,
    color: '#6B7280',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 32,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 6,
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  stockBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  priceSection: {
    marginBottom: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginRight: 12,
  },
  mrp: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  savingsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  quantitySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    padding: 12,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 20,
  },
  detailsSection: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    minWidth: '45%',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  nutritionSection: {
    marginBottom: 24,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
  },
  nutritionLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  relatedSection: {
    marginBottom: 100,
  },
  relatedProduct: {
    width: 120,
    marginRight: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 8,
  },
  relatedImage: {
    width: '100%',
    height: 80,
    borderRadius: 6,
    marginBottom: 8,
  },
  relatedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
    lineHeight: 16,
  },
  relatedPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relatedPriceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginRight: 6,
  },
  relatedMRP: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 34,
  },
  totalSection: {
    flex: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  totalSavings: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  addToCartButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  videoModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoHeader: {
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullVideo: {
    width: width,
    height: width * 0.75,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonLarge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 50,
  },
});