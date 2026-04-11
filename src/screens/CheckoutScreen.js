import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#b90000',
  white: '#FFFFFF',
  bg: '#F9FBF4',
  lightWhite: '#ffbaba',
  textDark: '#6b0000',
  textGray: '#555',
};

const PAYMENT_METHODS = [
  { id: 'store', label: 'Pago al recoger en tienda', desc: 'Paga en efectivo o tarjeta al recoger.', emoji: '🏪' },
  { id: 'card', label: 'Pago con Tarjeta (vía App)', desc: 'Paga con tu tarjeta de débito o crédito.', emoji: '💳' },
];

export default function CheckoutScreen({ navigation }) {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user, profile } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState('store');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (selectedPayment === 'card') {
      Alert.alert('💳 Próximamente', 'El pago con tarjeta estará disponible pronto.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'orders'), {
        userId: user.uid,
        userEmail: user.email,
        userName: profile?.nombre || '',
        userLastName: profile?.apellidos || '',
        userAge: profile?.edad || '',
        userPhoto: profile?.photoURL || '',
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, emoji: i.emoji })),
        total: totalPrice,
        paymentMethod: selectedPayment,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      clearCart();
      Alert.alert(
        '✅ ¡Pedido Confirmado!',
        `Tu pedido de ${totalItems} producto(s) por $${totalPrice.toFixed(2)} fue registrado.\n\n📍 Acude a nuestra tienda con tu nombre para recogerlo.`,
        [{ text: '¡Listo!', onPress: () => navigation.popToTop() }]
      );
    } catch (e) {
      Alert.alert('Error', 'No se pudo registrar tu pedido. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
        <View style={styles.pickupBanner}>
          <Text style={styles.pickupEmoji}>🏪</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.pickupTitle}>Recoge en tienda física</Text>
            <Text style={styles.pickupDesc}>Calle Emiliano Zapata #420, Col. Loma Alta· Lun–Sáb 8am–8pm</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📋 Resumen del Pedido</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Text style={styles.orderEmoji}>{item.emoji}</Text>
              <Text style={styles.orderName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.orderQty}>×{item.quantity}</Text>
              <Text style={styles.orderSubtotal}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.orderDivider} />
          <View style={styles.orderTotal}>
            <Text style={styles.orderTotalLabel}>Total a Pagar</Text>
            <Text style={styles.orderTotalValue}>${totalPrice.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Datos del Cliente</Text>
          <Text style={styles.clientInfo}>{profile?.nombre} {profile?.apellidos}</Text>
          <Text style={styles.clientEmail}>{user?.email}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💰 Método de Pago</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentOption, selectedPayment === method.id && styles.paymentOptionSelected]}
              onPress={() => setSelectedPayment(method.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.paymentEmoji}>{method.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.paymentLabel, selectedPayment === method.id && { color: COLORS.primary }]}>{method.label}</Text>
                <Text style={styles.paymentDesc}>{method.desc}</Text>
              </View>
              <View style={[styles.radio, selectedPayment === method.id && styles.radioOn]}>
                {selectedPayment === method.id && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.reminder}>
          <Text style={styles.reminderText}>⏰ Una vez confirmado, tienes hasta 24 horas para recoger en tienda.</Text>
        </View>

        <TouchableOpacity style={[styles.confirmBtn, loading && { opacity: 0.7 }]} onPress={handleConfirm} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>{selectedPayment === 'store' ? '✅ Confirmar Pedido' : '💳 Pagar con Tarjeta'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, paddingBottom: 30 },
  pickupBanner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: COLORS.lightWhite, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1.5, borderColor: '#a7a7a7' },
  pickupEmoji: { fontSize: 36 },
  pickupTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginBottom: 2 },
  pickupDesc: { fontSize: 12, color: COLORS.textGray, lineHeight: 17 },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textDark, marginBottom: 12 },
  orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  orderEmoji: { fontSize: 18 },
  orderName: { flex: 1, fontSize: 13, color: COLORS.textGray, fontWeight: '600' },
  orderQty: { fontSize: 13, color: COLORS.textDark, fontWeight: '700' },
  orderSubtotal: { fontSize: 14, color: COLORS.primary, fontWeight: '800' },
  orderDivider: { height: 1, backgroundColor: COLORS.lightWhite, marginVertical: 10 },
  orderTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotalLabel: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  orderTotalValue: { fontSize: 22, fontWeight: '800', color: COLORS.primary },
  clientInfo: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 2 },
  clientEmail: { fontSize: 13, color: COLORS.textGray },
  paymentOption: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 2, borderColor: '#E0E0E0', borderRadius: 14, padding: 14, marginBottom: 10, backgroundColor: '#FAFAFA' },
  paymentOptionSelected: { backgroundColor: COLORS.lightWhite, borderColor: COLORS.primary },
  paymentEmoji: { fontSize: 26 },
  paymentLabel: { fontSize: 13, fontWeight: '700', color: COLORS.textDark, marginBottom: 2 },
  paymentDesc: { fontSize: 11, color: COLORS.textGray, lineHeight: 16 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#BDBDBD', alignItems: 'center', justifyContent: 'center' },
  radioOn: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  reminder: { backgroundColor: '#FFF8E1', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#FFE082' },
  reminderText: { fontSize: 12, color: '#F57F17', lineHeight: 18, fontWeight: '500' },
  confirmBtn: { backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  confirmBtnText: { color: COLORS.white, fontSize: 17, fontWeight: '800' },
});