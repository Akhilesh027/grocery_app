import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image 
} from 'react-native';

export default function StockStrip() {
  const stockItems = [
    {
      id: '1',
      name: 'Milk',
      price: 65,
      image: 'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '2',
      name: 'Bread',
      price: 35,
      image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '3',
      name: 'Eggs',
      price: 75,
      image: 'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '4',
      name: 'Rice',
      price: 450,
      image: 'https://images.pexels.com/photos/1059947/pexels-photo-1059947.jpeg?auto=compress&cs=tinysrgb&w=100'
    },
    {
      id: '5',
      name: 'Oil',
      price: 180,
      image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=100'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Our Stock Items</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {stockItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.stockItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  scrollContainer: {
    paddingHorizontal: 12,
  },
  stockItem: {
    alignItems: 'center',
    marginHorizontal: 4,
    width: 60,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 10,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563EB',
    textAlign: 'center',
  },
});