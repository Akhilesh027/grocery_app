import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { useState, useEffect } from 'react';

export default function FirstOrderBanner() {
  const [timeLeft, setTimeLeft] = useState('29:23:45:12'); // days:hours:minutes:seconds
  const [isEligible, setIsEligible] = useState(true);

  useEffect(() => {
    // Countdown timer logic
    const interval = setInterval(() => {
      // Update countdown - simplified for demo
      setTimeLeft('29:23:45:12');
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isEligible) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>🎁</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>First Order ₹1 🎉</Text>
          <Text style={styles.subtitle}>
            Get your first order for just ₹1. Valid once every 30 days!
          </Text>
          
          <View style={styles.timerContainer}>
            <Text style={styles.clockIcon}>⏰</Text>
            <Text style={styles.timerText}>
              Next offer available in: {timeLeft}
            </Text>
          </View>
        </View>
      </View>
      
      <TouchableOpacity style={styles.claimButton}>
        <Text style={styles.claimButtonText}>Claim Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  iconText: {
    fontSize: 24,
  },
  clockIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 6,
  },
  claimButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});