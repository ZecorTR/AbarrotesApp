import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native'; // También necesitaremos Platform

import { CartProvider } from './src/context/CartContext';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import CartIconBadge from './src/components/CartIconBadge';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#680410',
  primaryLight: '#8d0818',
  accent: '#8d0818',
  white: '#FFFFFF',
  gray: '#757575',
};

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '🛒 Abarrotes Mandy' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Detalle del Producto' }}
      />
    </Stack.Navigator>
  );
}

function CartStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
      }}
    >
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Mi Carrito' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Finalizar Compra' }} />
    </Stack.Navigator>
  );
}
// Componente de navegación principal con Safe Area dinámico
function Navigation() {
  const insets = useSafeAreaInsets();

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={COLORS.primary} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.gray,
          tabBarStyle: {
            backgroundColor: COLORS.white,
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            // Altura adaptativa según el dispositivo (botones físicos vs gestos)
            height: Platform.OS === 'ios' ? 62 + insets.bottom : 65 + (insets.bottom > 0 ? insets.bottom : 0), 
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: { fontSize: 12, fontWeight: '600', marginBottom: Platform.OS === 'android' ? 5 : 0 },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Inicio') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === 'Carrito') iconName = focused ? 'cart' : 'cart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Inicio" component={HomeStack} />
        <Tab.Screen
          name="Carrito"
          component={CartStack}
          options={{ 
            tabBarIcon: ({ focused, color, size }) => (
              <CartIconBadge focused={focused} color={color} size={size} />
            ) 
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Punto de entrada de la aplicación
export default function App() {
  return (
    <SafeAreaProvider>
      <CartProvider>
        <Navigation />
      </CartProvider>
    </SafeAreaProvider>
  );
}
