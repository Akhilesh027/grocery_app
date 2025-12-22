import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import ProductCard from './ProductCard';

export default function ProductGrid({ title, products, showViewAll = true }) {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {showViewAll && (
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Scroll Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {products.map((product, index) => (
          <View key={product.id || index} style={styles.productWrapper}>
            <ProductCard product={product} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF9933',
  },
  row: {
    paddingHorizontal: 16,
  },
  productWrapper: {
    marginRight: 12,
    width: 160, // You can adjust based on product card size
  },
});
