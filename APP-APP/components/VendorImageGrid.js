import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image 
} from 'react-native';

export default function VendorImageGrid({ title, images = [], showViewAll = true }) {
  // Default vendor images if none provided
  const defaultImages = [
    'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1105166/pexels-photo-1105166.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/416880/pexels-photo-416880.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1059947/pexels-photo-1059947.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=300',
    'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=300'
  ];

  const displayImages = images.length > 0 ? images : defaultImages;

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
      
      <View style={styles.grid}>
        {displayImages.slice(0, 9).map((image, index) => (
          <TouchableOpacity key={index} style={styles.imageWrapper}>
            <Image source={{ uri: image }} style={styles.vendorImage} />
            <View style={styles.imageOverlay}>
              <Text style={styles.overlayText}>Vendor {index + 1}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
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
    fontSize: 19,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  imageWrapper: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  vendorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  overlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});