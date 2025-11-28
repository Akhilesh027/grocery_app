import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Linking 
} from 'react-native';

export default function SupportSection() {
  const handlePhonePress = () => {
    Linking.openURL('tel:+919876543210');
  };

  const handleWhatsAppPress = () => {
    Linking.openURL('https://wa.me/919876543210');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Need Help? Contact Us</Text>
        <Text style={styles.subtitle}>We're here to assist you 24/7</Text>
      </View>
      
      <View style={styles.supportOptions}>
        <TouchableOpacity style={styles.supportButton} onPress={handlePhonePress}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📞</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.supportTitle}>Call Us</Text>
            <Text style={styles.supportText}>+91 98765 43210</Text>
            <Text style={styles.supportSubtext}>Available 24/7</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.supportButton} onPress={handleWhatsAppPress}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💬</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.supportTitle}>WhatsApp</Text>
            <Text style={styles.supportText}>Chat with us</Text>
            <Text style={styles.supportSubtext}>Quick responses</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.additionalInfo}>
        <Text style={styles.infoTitle}>Other Ways to Reach Us:</Text>
        <Text style={styles.infoText}>• Email: support@dmartgrocery.com</Text>
        <Text style={styles.infoText}>• Live Chat: Available on website</Text>
        <Text style={styles.infoText}>• Store Locator: Find nearest store</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    marginBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
    paddingVertical: 24,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  supportOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  supportButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    marginBottom: 12,
  },
  icon: {
    fontSize: 32,
  },
  textContainer: {
    alignItems: 'center',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  supportText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10B981',
    marginBottom: 2,
  },
  supportSubtext: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  additionalInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
    lineHeight: 20,
  },
});