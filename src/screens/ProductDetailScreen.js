import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';

const COLORS = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  white: '#FFFFFF',
  bg: '#F9FBF4',
  lightGreen: '#E8F5E9',
  textDark: '#1B5E20',
  textGray: '#555',
  accent: '#8BC34A',
};

export default function ProductDetailScreen({ route }) {
  const { product } = route.params;
  const { addItem, items } = useCart();
  const [added, setAdded] = useState(false);

  const cartItem = items.find((i) => i.id === product.id);

  const handleAddToCart = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    Alert.alert(
      '¡Agregado! 🛒',
      `${product.name} fue añadido a tu carrito.`,
      [{ text: 'Seguir comprando', style: 'default' }, { text: 'Ver carrito', onPress: () => {} }]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {product.image ? (
            <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.emojiLarge}>{product.emoji}</Text>
          )}
          <View style={styles.emojiOverlay}>
            <Text style={{ fontSize: 28 }}>{product.emoji}</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Title + Price */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.unitLabel}>Por {product.unit} · Stock: {product.stock} disponibles</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Descripción</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Nutrition or Ingredients */}
          {product.nutrition ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🥗 Información Nutricional</Text>
              <Text style={styles.nutritionNote}>(Por 100g / 100ml)</Text>
              <View style={styles.nutritionGrid}>
                {Object.entries(product.nutrition).map(([key, val]) => (
                  <View key={key} style={styles.nutritionItem}>
                    <Text style={styles.nutritionValue}>{val}</Text>
                    <Text style={styles.nutritionKey}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : product.contenido ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🧪 Ingredientes / Contenido</Text>
              <Text style={styles.description}>{product.contenido}</Text>
            </View>
          ) : null}

          {/* Cart status if already in cart */}
          {cartItem && (
            <View style={styles.alreadyInCart}>
              <Text style={styles.alreadyText}>
                ✅ Ya tienes {cartItem.quantity} en tu carrito
              </Text>
            </View>
          )}

          {/* Add to Cart Button */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart} activeOpacity={0.85}>
            <Text style={styles.addButtonText}>
              {added ? '¡Agregado! ✓' : '🛒 Agregar al Carrito'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  imageContainer: {
    height: 260,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  emojiLarge: { fontSize: 90 },
  emojiOverlay: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 8,
  },
  content: { padding: 18 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  productName: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 },
  unitLabel: { fontSize: 13, color: COLORS.textGray },
  priceBox: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginLeft: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  price: { color: COLORS.white, fontSize: 22, fontWeight: '800' },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  description: { fontSize: 14, color: COLORS.textGray, lineHeight: 22 },
  nutritionNote: { fontSize: 11, color: COLORS.textGray, marginBottom: 12, marginTop: -6 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  nutritionItem: {
    backgroundColor: COLORS.lightGreen,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 80,
    flex: 1,
  },
  nutritionValue: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  nutritionKey: { fontSize: 11, color: COLORS.textGray, marginTop: 2, textAlign: 'center' },

  alreadyInCart: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  alreadyText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },

  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 4,
  },
  addButtonText: { color: COLORS.white, fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
});
