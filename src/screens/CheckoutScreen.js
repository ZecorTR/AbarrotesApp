import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert,
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
  orange: '#F57C00',
  blue: '#1565C0',
};

const PAYMENT_METHODS = [
  {
    id: 'store',
    label: 'Pago al recoger en tienda',
    desc: 'Paga en efectivo o con tarjeta al momento de recoger.',
    emoji: '🏪',
    color: COLORS.primary,
  },
  {
    id: 'card',
    label: 'Pago con Tarjeta (vía App)',
    desc: 'Paga de forma segura con tu tarjeta de débito o crédito.',
    emoji: '💳',
    color: COLORS.blue,
  },
];

export default function CheckoutScreen({ navigation }) {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('store');

  const handleConfirm = () => {
    if (selectedPayment === 'card') {
      Alert.alert(
        '💳 Pago con Tarjeta',
        'Esta función está disponible próximamente. Por ahora puedes pagar en tienda.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    Alert.alert(
      '✅ ¡Pedido Confirmado!',
      `Tu pedido de ${totalItems} producto(s) por $${totalPrice.toFixed(2)} está listo.\n\n📍 Acude a nuestra tienda y muestra este pedido para recogerlo.`,
      [
        {
          text: '¡Listo, gracias!',
          onPress: () => {
            clearCart();
            navigation.popToTop();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        {/* Store Pickup Banner */}
        <View style={styles.pickupBanner}>
          <Text style={styles.pickupEmoji}>🏪</Text>
          <View style={styles.pickupText}>
            <Text style={styles.pickupTitle}>Recoge en tienda física</Text>
            <Text style={styles.pickupDesc}>
              Av. Juárez #42, Col. Centro · Lun–Sáb 8am–8pm
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Resumen del Pedido</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.orderEmoji}>{item.emoji}</Text>
              <Text style={styles.orderName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.orderQty}>x{item.quantity}</Text>
              <Text style={styles.orderSubtotal}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.orderDivider} />
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Total a Pagar</Text>
            <Text style={styles.orderTotalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Método de Pago</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.paymentOptionSelected,
                selectedPayment === method.id && { borderColor: method.color },
              ]}
              onPress={() => setSelectedPayment(method.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.paymentEmoji}>{method.emoji}</Text>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, selectedPayment === method.id && { color: method.color }]}>
                  {method.label}
                </Text>
                <Text style={styles.paymentDesc}>{method.desc}</Text>
              </View>
              <View style={[styles.radio, selectedPayment === method.id && { backgroundColor: method.color, borderColor: method.color }]}>
                {selectedPayment === method.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reminder */}
        <View style={styles.reminder}>
          <Text style={styles.reminderText}>
            ⏰ Una vez confirmado, tienes hasta 24 horas para recoger tu pedido en tienda.
          </Text>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={styles.confirmBtnText}>
            {selectedPayment === 'store' ? '✅ Confirmar Pedido' : '💳 Pagar con Tarjeta'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, paddingBottom: 30 },

  pickupBanner: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A5D6A7',
  },
  pickupEmoji: { fontSize: 40, marginRight: 14 },
  pickupText: { flex: 1 },
  pickupTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 },
  pickupDesc: { fontSize: 13, color: COLORS.textGray, lineHeight: 18 },

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
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginBottom: 14 },

  orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  orderEmoji: { fontSize: 20, marginRight: 10 },
  orderName: { flex: 1, fontSize: 13, color: COLORS.textGray, fontWeight: '600' },
  orderQty: { fontSize: 13, color: COLORS.textDark, fontWeight: '700', marginHorizontal: 8 },
  orderSubtotal: { fontSize: 14, color: COLORS.primary, fontWeight: '800' },
  orderDivider: { height: 1, backgroundColor: '#E8F5E9', marginVertical: 12 },
  orderTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  orderTotalValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },

  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#FAFAFA',
  },
  paymentOptionSelected: { backgroundColor: '#F1F8E9' },
  paymentEmoji: { fontSize: 28, marginRight: 12 },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginBottom: 2 },
  paymentDesc: { fontSize: 12, color: COLORS.textGray, lineHeight: 17 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },

  reminder: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  reminderText: { fontSize: 13, color: '#F57F17', lineHeight: 19, fontWeight: '500' },

  confirmBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
});
