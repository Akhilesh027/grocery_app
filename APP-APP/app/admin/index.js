import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch
} from 'react-native';
import { ArrowLeft, DollarSign, ShoppingBag, Users, TrendingUp, Gift, MapPin, Settings, ChartBar as BarChart3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const router = useRouter();

  const [referralEnabled, setReferralEnabled] = useState(true);
  const [firstOrderOfferEnabled, setFirstOrderOfferEnabled] = useState(true);
  const [activities, setActivities] = useState([
    { id: 'a1', time: '2 minutes ago', text: 'New order #ORD127 - ₹450' },
    { id: 'a2', time: '5 minutes ago', text: 'Product "Basmati Rice 5kg" added to cart by 3 users' },
    { id: 'a3', time: '10 minutes ago', text: 'Referral code RAHUL2025 used - ₹10 credited' },
  ]);

  
  const todayStats = {
    sales: 45280,
    orders: 127,
    customers: 89,
    profit: 8450
  };

  const adminMenuItems = [
    {
      id: 'products',
      title: 'Product Management',
      subtitle: 'Add, edit products & inventory',
      icon: <ShoppingBag size={24} color="#6B7280" />,
      route: '/admin/products'
    },
    {
      id: 'orders',
      title: 'Orders Management',
      subtitle: 'Pending, success, cancelled orders',
      icon: <BarChart3 size={24} color="#6B7280" />,
      route: '/admin/orders'
    },
    {
      id: 'analytics',
      title: 'Sales & Analytics',
      subtitle: 'Revenue, P&L, customer insights',
      icon: <TrendingUp size={24} color="#6B7280" />,
      route: '/admin/analytics'
    },
    {
      id: 'customers',
      title: 'Customer Management',
      subtitle: 'User profiles, loyalty tracking',
      icon: <Users size={24} color="#6B7280" />,
      route: '/admin/customers'
    },
    {
      id: 'delivery',
      title: 'Delivery Management',
      subtitle: 'Pincode settings, time slots',
      icon: <MapPin size={24} color="#6B7280" />,
      route: '/admin/delivery'
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity>
          <Settings size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Today's Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <DollarSign size={24} color="#059669" />
              <Text style={styles.statValue}>₹{todayStats.sales.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Sales</Text>
            </View>
            
            <View style={styles.statCard}>
              <ShoppingBag size={24} color="#2563EB" />
              <Text style={styles.statValue}>{todayStats.orders}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            
            <View style={styles.statCard}>
              <Users size={24} color="#7C3AED" />
              <Text style={styles.statValue}>{todayStats.customers}</Text>
              <Text style={styles.statLabel}>Customers</Text>
            </View>
            
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#F59E0B" />
              <Text style={styles.statValue}>₹{todayStats.profit.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Profit</Text>
            </View>
          </View>
        </View>

        {/* Quick Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Settings</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <Gift size={24} color="#2563EB" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Referral Program</Text>
                <Text style={styles.settingDescription}>
                  ₹10 reward after friend's first order
                </Text>
              </View>
            </View>
            <Switch
              value={referralEnabled}
              onValueChange={setReferralEnabled}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={referralEnabled ? '#2563EB' : '#F3F4F6'}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingInfo}>
              <DollarSign size={24} color="#F59E0B" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>First Order ₹1 Offer</Text>
                <Text style={styles.settingDescription}>
                  Special pricing for first-time customers
                </Text>
              </View>
            </View>
            <Switch
              value={firstOrderOfferEnabled}
              onValueChange={setFirstOrderOfferEnabled}
              trackColor={{ false: '#D1D5DB', true: '#FEF3C7' }}
              thumbColor={firstOrderOfferEnabled ? '#F59E0B' : '#F3F4F6'}
            />
          </View>
        </View>

        {/* Management Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          
          {adminMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => router.push(item.route)}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <View style={styles.menuItemText}>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {activities.map((a) => (
            <View key={a.id} style={styles.activityCard}>
              <Text style={styles.activityTime}>{a.time}</Text>
              <Text style={styles.activityText}>{a.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 45,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  statsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  settingCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  activityText: {
    fontSize: 14,
    color: '#374151',
  },
  bottomSpacer: {
    height: 30,
  },
});