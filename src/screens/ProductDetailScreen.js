import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert,
} from 'react-native';
import { useCart } from '../context/CartContext';

const COLORS = {
  primary: '#b90000',
  primaryLight: '#370000',
  white: '#FFFFFF',
  bg: '#ffffff',
  lightRed: '#cbbbbbad',
  textDark: '#6b0000',
  textGray: '#555',
  accent: '#ff8888',
};

export default function ProductDetailScreen({ route }) {
  const { product } = route.params;
  const { addItem, items, increment } = useCart();
  const [quantity, setQuantity] = useState(1);

  const cartItem = items.find((i) => i.id === product.id);
  const subtotal = (product.price * quantity).toFixed(2);

  // Pasos de cantidad según la unidad del producto
  const step = ['kilo', 'litro'].includes(product.unit) ? 0.5 : 1;
  const minQty = step;

  function increase() {
    setQuantity((prev) => parseFloat((prev + step).toFixed(1)));
  }

  function decrease() {
    setQuantity((prev) => {
      const next = parseFloat((prev - step).toFixed(1));
      return next < minQty ? minQty : next;
    });
  }

  function handleAddToCart() {
    addItem(product, quantity);
    Alert.alert(
      '¡Agregado! 🛒',
      `${quantity} ${product.unit}${quantity > 1 ? 's' : ''} de ${product.name} añadido al carrito.\nSubtotal: $${subtotal}`,
      [{ text: 'Seguir comprando' }]
    );
  }

  const formatQty = (q) => {
    return Number.isInteger(q) ? String(q) : q.toFixed(1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Imagen */}
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

          {/* Nombre + Precio unitario */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.unitLabel}>Por {product.unit} · Stock: {product.stock} disponibles</Text>
            </View>
            <View style={styles.priceBox}>
              <Text style={styles.priceLabel}>precio</Text>
              <Text style={styles.price}>${product.price.toFixed(2)}</Text>
              <Text style={styles.priceUnit}>/{product.unit}</Text>
            </View>
          </View>

          {/* ── Selector de cantidad ── */}
          <View style={styles.quantityCard}>
            <Text style={styles.quantityTitle}>¿Cuánto deseas?</Text>

            <View style={styles.quantityRow}>
              {/* Botón menos */}
              <TouchableOpacity
                style={[styles.qtyBtn, quantity <= minQty && styles.qtyBtnDisabled]}
                onPress={decrease}
                disabled={quantity <= minQty}
                activeOpacity={0.8}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>

              {/* Cantidad actual */}
              <View style={styles.qtyDisplay}>
                <Text style={styles.qtyNumber}>{formatQty(quantity)}</Text>
                <Text style={styles.qtyUnit}>{product.unit}{quantity !== 1 ? 's' : ''}</Text>
              </View>

              {/* Botón más */}
              <TouchableOpacity
                style={[styles.qtyBtn, styles.qtyBtnAdd]}
                onPress={increase}
                activeOpacity={0.8}
              >
                <Text style={[styles.qtyBtnText, { color: COLORS.white }]}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Accesos rápidos de cantidad */}
            <View style={styles.quickRow}>
              {(step === 0.5
                ? [0.5, 1, 1.5, 2, 3, 5]
                : [1, 2, 3, 5, 10, 20]
              ).map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[styles.quickChip, quantity === q && styles.quickChipActive]}
                  onPress={() => setQuantity(q)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.quickChipText, quantity === q && styles.quickChipTextActive]}>
                    {q}{step === 0.5 ? ' kg' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Subtotal dinámico */}
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>
                {formatQty(quantity)} {product.unit}{quantity !== 1 ? 's' : ''} × ${product.price.toFixed(2)}
              </Text>
              <Text style={styles.subtotalValue}>${subtotal}</Text>
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Descripción</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Nutrición o contenido */}
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

          {/* Ya en carrito */}
          {cartItem && (
            <View style={styles.alreadyInCart}>
              <Text style={styles.alreadyText}>
                🛒 Ya tienes {cartItem.quantity} en tu carrito
              </Text>
            </View>
          )}

          {/* Botón agregar */}
          <TouchableOpacity style={styles.addButton} onPress={handleAddToCart} activeOpacity={0.85}>
            <Text style={styles.addButtonText}>
              🛒 Agregar {formatQty(quantity)} {product.unit}{quantity !== 1 ? 's' : ''} — ${subtotal}
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
    height: 240,
    backgroundColor: COLORS.lightRed,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  emojiLarge: { fontSize: 90 },
  emojiOverlay: {
    position: 'absolute', bottom: 12, right: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24, padding: 8,
  },

  content: { padding: 16 },

  titleRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 14, gap: 10,
  },
  productName: {
    fontSize: 20, fontWeight: '800',
    color: COLORS.textDark, marginBottom: 4,
  },
  unitLabel: { fontSize: 12, color: COLORS.textGray },
  priceBox: {
    backgroundColor: COLORS.primary, borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 8,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  priceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' },
  price: { color: COLORS.white, fontSize: 20, fontWeight: '800' },
  priceUnit: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600' },

  // ── Selector de cantidad ──────────────────────────────────────────────────
  quantityCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18, padding: 16,
    marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
    borderWidth: 1.5, borderColor: COLORS.border,
  },
  quantityTitle: {
    fontSize: 14, fontWeight: '800',
    color: COLORS.textDark, marginBottom: 14,
  },
  quantityRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 16, marginBottom: 14,
  },
  qtyBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: COLORS.lightRed,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnAdd: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  qtyBtnDisabled: {
    opacity: 0.35,
  },
  qtyBtnText: {
    fontSize: 22, fontWeight: '700',
    color: COLORS.primary, lineHeight: 26,
  },
  qtyDisplay: {
    alignItems: 'center', minWidth: 80,
    backgroundColor: COLORS.lightRed,
    borderRadius: 14, paddingVertical: 8, paddingHorizontal: 16,
  },
  qtyNumber: {
    fontSize: 28, fontWeight: '800', color: COLORS.primary,
  },
  qtyUnit: {
    fontSize: 11, color: COLORS.textGray,
    fontWeight: '600', textTransform: 'uppercase',
  },

  quickRow: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 6, marginBottom: 14,
  },
  quickChip: {
    borderWidth: 1.5, borderColor: COLORS.border,
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: '#FAFFF8',
  },
  quickChipActive: {
    backgroundColor: COLORS.primary, borderColor: COLORS.primary,
  },
  quickChipText: {
    fontSize: 12, fontWeight: '700', color: COLORS.textGray,
  },
  quickChipTextActive: { color: COLORS.white },

  subtotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: COLORS.lightRed,
    borderRadius: 12, padding: 12,
  },
  subtotalLabel: { fontSize: 13, color: COLORS.textGray, fontWeight: '600' },
  subtotalValue: { fontSize: 20, fontWeight: '800', color: COLORS.primary },

  // ── Tarjetas de info ──────────────────────────────────────────────────────
  card: {
    backgroundColor: COLORS.white, borderRadius: 16,
    padding: 16, marginBottom: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  cardTitle: {
    fontSize: 14, fontWeight: '800',
    color: COLORS.textDark, marginBottom: 10,
  },
  description: { fontSize: 14, color: COLORS.textGray, lineHeight: 22 },
  nutritionNote: { fontSize: 11, color: COLORS.textGray, marginBottom: 10, marginTop: -6 },
  nutritionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nutritionItem: {
    backgroundColor: COLORS.lightRed, borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 8,
    alignItems: 'center', minWidth: 76, flex: 1,
  },
  nutritionValue: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  nutritionKey: { fontSize: 10, color: COLORS.textGray, marginTop: 2, textAlign: 'center' },

  alreadyInCart: {
    backgroundColor: COLORS.lightRed, borderRadius: 12,
    padding: 12, marginBottom: 12, alignItems: 'center',
  },
  alreadyText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  addButton: {
    backgroundColor: COLORS.primary, borderRadius: 16,
    paddingVertical: 18, alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    marginBottom: 10,
  },
  addButtonText: {
    color: COLORS.white, fontSize: 16,
    fontWeight: '800', letterSpacing: 0.2,
  },
});