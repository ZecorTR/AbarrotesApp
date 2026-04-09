import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CartProvider } from './src/context/CartContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import CartScreen from './src/screens/CartScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminScreen from './src/screens/AdminScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CartIconBadge from './src/components/CartIconBadge';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#4f0000',
  white: '#FFFFFF',
  gray: '#757575',
};

const HEADER_OPTS = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: '700', fontSize: 18 },
};

// ─── Stack: pantallas de inicio ─────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTS}>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Abarrotes Mandy' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalle del Producto' }} />
    </Stack.Navigator>
  );
}

// ─── Stack: carrito + checkout ───────────────────────────────────────────────
function CartStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTS}>
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Mi Carrito' }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: 'Finalizar Compra' }} />
    </Stack.Navigator>
  );
}

// ─── Stack: perfil + admin ───────────────────────────────────────────────────
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_OPTS}>
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Mi Perfil' }} />
      <Stack.Screen name="Admin" component={AdminScreen} options={{ title: '👑 Panel de Pedidos' }} />
    </Stack.Navigator>
  );
}

// ─── Stack: auth (sin tabs) ──────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...HEADER_OPTS, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── Tabs (solo si hay sesión) ───────────────────────────────────────────────
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: '#E8F5E9',
          paddingBottom: 6,
          paddingTop: 4,
          height: 62,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            Inicio: focused ? 'home' : 'home-outline',
            Carrito: focused ? 'cart' : 'cart-outline',
            Perfil: focused ? 'person-circle' : 'person-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
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
          ),
        }}
      />
      <Tab.Screen name="Perfil" component={ProfileStack} />
    </Tab.Navigator>
  );
}

// ─── Root: decide si mostrar auth o app ─────────────────────────────────────
function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FBF4' }}>
        <ActivityIndicator size="large" color="#710202" />
      </View>
    );
  }

  return user ? <AppTabs /> : <AuthStack />;
}

// ─── App entry ───────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <StatusBar style='light' backgroundColor={COLORS.primary} />
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
