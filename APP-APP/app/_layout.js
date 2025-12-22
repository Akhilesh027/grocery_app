import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { CategoryNavigationProvider } from '../context/CategoryNavigationContext';

export default function RootLayout() {
  return (
    <CategoryNavigationProvider>
      <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            height: 75,
            paddingBottom: 12,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 8,
          },
          // Green color for active tab
          tabBarActiveTintColor: '#10B981', 
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
            marginBottom: 0,
            paddingBottom: 2,
          },
        }}>
        
        {/* ======================================================= */}
        {/* VISIBILE TABS (5 TOTAL)                     */}
        {/* ======================================================= */}
        
        {/* 1. Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 20, color: focused ? '#10B981' : '#9CA3AF'}}>🏠</Text>
              </View>
            ),
          }}
        />
        
        {/* 2. Categories */}
        <Tabs.Screen
          name="categories"
          options={{
            title: 'Category',
            tabBarIcon: ({ focused }) => (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 20, color: focused ? '#10B981' : '#9CA3AF'}}>📋</Text>
              </View>
            ),
          }}
        />
        
        {/* 3. Offers */}
        <Tabs.Screen
          name="offers"
          options={{
            title: 'Offers',
            tabBarIcon: ({ focused }) => (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 20, color: focused ? '#10B981' : '#9CA3AF'}}>🎁</Text>
              </View>
            ),
          }}
        />
        
        {/* 4. Cart (New/Updated Visible Tab) */}
        <Tabs.Screen
          name="cart" // Assumes you have app/cart.js
          options={{
            title: 'Cart',
            tabBarIcon: ({ focused }) => (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 20, color: focused ? '#10B981' : '#9CA3AF'}}>🛒</Text>
              </View>
            ),
          }}
        />

        {/* 5. Account */}
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ focused }) => (
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Text style={{fontSize: 20, color: focused ? '#10B981' : '#9CA3AF'}}>👤</Text>
              </View>
            ),
          }}
        />
        
        {/* ======================================================= */}
        {/* HIDDEN/MODAL SCREENS (href: null)           */}
        {/* Note: The original 'cart' entry is no longer hidden  */}
        {/* ======================================================= */}
        
        <Tabs.Screen name="category/[id]" options={{ href: null }} />
        <Tabs.Screen name="category/[id]/[subId]" options={{ href: null }} />
        <Tabs.Screen name="checkout" options={{ href: null }} />
        <Tabs.Screen name="orders" options={{ href: null }} />
        <Tabs.Screen name="product-detail" options={{ href: null }} />
        <Tabs.Screen name="referral" options={{ href: null }} />
        <Tabs.Screen name="admin" options={{ href: null }} />
        <Tabs.Screen name="category" options={{ href: null }} />
        <Tabs.Screen name="+not-found" options={{ href: null }} />
        <Tabs.Screen name="SignupScreen" options={{ href: null }} />
        <Tabs.Screen name="LoginScreen" options={{ href: null }} />
        <Tabs.Screen name="OneRupeeDealsScreen" options={{ href: null }} />
        <Tabs.Screen name="SearchScreen" options={{ href: null }} />
        <Tabs.Screen name="AccountSection" options={{ href: null }} />
        <Tabs.Screen name="OrderSuccess" options={{ href: null }} />
        <Tabs.Screen name="SingleCategory" options={{ href: null }} />

      </Tabs>
      <StatusBar style="dark" />
      </View>
    </CategoryNavigationProvider>
  );
}