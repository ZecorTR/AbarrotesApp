import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, Image,
} from 'react-native';
import { useCart } from '../context/CartContext';

const COLORS = {
  primary: '#b90000',
  white: '#FFFFFF',
  bg: '#F9FBF4',
  lightWhite: '#E8F5E9',
  textDark: '#6b0000',
  textGray: '#555',
  red: '#E53935',
};

function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <View style={styles.item}>
      <View style={styles.itemImageBox}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="cover" />
        ) : (
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
        <Text style={styles.itemUnit}>${item.price.toFixed(2)} c/u</Text>
      </View>
      <View style={styles.qtyControls}>
        <TouchableOpacity style={styles.qtyBtn} onPress={onDecrement}>
          <Text style={styles.qtyBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyValue}>{item.quantity}</Text>
        <TouchableOpacity style={[styles.qtyBtn, styles.qtyBtnAdd]} onPress={onIncrement}>
          <Text style={[styles.qtyBtnText, { color: '#fff' }]}>+</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
        <Text style={styles.removeBtnText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function CartScreen({ navigation }) {
  const { items, totalItems, totalPrice, increment, decrement, removeItem, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
          <Text style={styles.emptyText}>Agrega productos desde la pantalla de inicio</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        renderItem={({ item }) => (
          <CartItem
            item={item}
            onIncrement={() => increment(item.id)}
            onDecrement={() => decrement(item.id)}
            onRemove={() => removeItem(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderTitle}>{totalItems} productos en tu carrito</Text>
            <TouchableOpacity onPress={clearCart}>
              <Text style={styles.clearText}>Limpiar todo</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${totalPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Costo de envío</Text>
              <Text style={[styles.summaryValue, { color: COLORS.primary }]}>Recoge en tienda 🏪</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>${totalPrice.toFixed(2)}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => navigation.navigate('Checkout')}
              activeOpacity={0.85}
            >
              <Text style={styles.checkoutBtnText}>Proceder al Pago →</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyEmoji: { fontSize: 72, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textGray, textAlign: 'center' },

  list: { padding: 16 },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  listHeaderTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  clearText: { fontSize: 13, color: COLORS.red, fontWeight: '600' },

  item: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 3,
  },
  itemImageBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: COLORS.lightWhite,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 10,
  },
  itemImage: { width: '100%', height: '100%' },
  itemEmoji: { fontSize: 30 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark, marginBottom: 3 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  itemUnit: { fontSize: 11, color: COLORS.textGray, marginTop: 1 },

  qtyControls: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.lightWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  qtyBtnAdd: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  qtyBtnText: { fontSize: 18, fontWeight: '700', color: COLORS.primary, lineHeight: 22 },
  qtyValue: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginHorizontal: 10, minWidth: 20, textAlign: 'center' },

  removeBtn: { padding: 6 },
  removeBtnText: { fontSize: 18 },

  summary: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 14, color: COLORS.textGray, fontWeight: '600' },
  summaryValue: { fontSize: 14, color: COLORS.textDark, fontWeight: '700' },
  totalRow: { borderTopWidth: 1.5, borderTopColor: '#E8F5E9', paddingTop: 12, marginTop: 4, marginBottom: 16 },
  totalLabel: { fontSize: 17, fontWeight: '800', color: COLORS.textDark },
  totalValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },

  checkoutBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkoutBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});