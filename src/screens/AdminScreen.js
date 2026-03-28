import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  TouchableOpacity, Image, ActivityIndicator, Alert,
} from 'react-native';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#2E7D32',
  white: '#FFFFFF',
  bg: '#F9FBF4',
  lightGreen: '#E8F5E9',
  textDark: '#1B5E20',
  textGray: '#757575',
};

const STATUS_CONFIG = {
  pending:   { label: 'Pendiente',  color: '#F57C00', bg: '#FFF3E0', emoji: '⏳' },
  paid:      { label: 'Pagado',     color: '#2E7D32', bg: '#E8F5E9', emoji: '✅' },
  picked_up: { label: 'Recogido',  color: '#1565C0', bg: '#E3F2FD', emoji: '📦' },
  cancelled: { label: 'Cancelado', color: '#E53935', bg: '#FFEBEE', emoji: '❌' },
};

export default function AdminScreen() {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!isAdmin) return;
    // Escucha en tiempo real todos los pedidos
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [isAdmin]);

  async function changeStatus(orderId, newStatus) {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el estado.');
    }
  }

  function confirmChangeStatus(orderId, current) {
    const options = Object.entries(STATUS_CONFIG)
      .filter(([key]) => key !== current)
      .map(([key, val]) => ({
        text: `${val.emoji} ${val.label}`,
        onPress: () => changeStatus(orderId, key),
      }));
    Alert.alert('Cambiar estado del pedido', 'Selecciona el nuevo estado:', [
      ...options,
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    picked_up: orders.filter((o) => o.status === 'picked_up').length,
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.denied}>
          <Text style={{ fontSize: 48 }}>🚫</Text>
          <Text style={styles.deniedText}>Acceso restringido</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderOrder = ({ item }) => {
    const st = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    return (
      <View style={styles.orderCard}>
        {/* Cliente */}
        <View style={styles.clientRow}>
          {item.userPhoto ? (
            <Image source={{ uri: item.userPhoto }} style={styles.clientAvatar} />
          ) : (
            <View style={styles.clientAvatarFallback}>
              <Text style={{ fontSize: 18, color: COLORS.primary }}>
                {item.userName?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName}>{item.userName} {item.userLastName}</Text>
            <Text style={styles.clientEmail}>{item.userEmail}</Text>
            {item.userAge ? <Text style={styles.clientAge}>{item.userAge} años</Text> : null}
          </View>
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: st.bg }]}
            onPress={() => confirmChangeStatus(item.id, item.status)}
            activeOpacity={0.8}
          >
            <Text style={[styles.statusText, { color: st.color }]}>{st.emoji} {st.label}</Text>
            <Text style={[styles.statusHint, { color: st.color }]}>toca para cambiar</Text>
          </TouchableOpacity>
        </View>

        {/* Método de pago */}
        <View style={styles.payRow}>
          <Text style={styles.payLabel}>
            {item.paymentMethod === 'store' ? '🏪 Paga en tienda' : '💳 Pagó con tarjeta'}
          </Text>
          <Text style={styles.orderDate}>
            {item.createdAt?.toDate
              ? item.createdAt.toDate().toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
              : 'Fecha no disponible'}
          </Text>
        </View>

        {/* Productos */}
        <View style={styles.productsList}>
          {item.items?.map((p, i) => (
            <View key={i} style={styles.productRow}>
              <Text style={styles.productEmoji}>{p.emoji}</Text>
              <Text style={styles.productName} numberOfLines={1}>{p.name}</Text>
              <Text style={styles.productQty}>×{p.quantity}</Text>
              <Text style={styles.productSubtotal}>${(p.price * p.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total del pedido</Text>
          <Text style={styles.totalValue}>${item.total?.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Stats */}
      <View style={styles.statsRow}>
        <StatBox label="Total" value={stats.total} color="#1B5E20" />
        <StatBox label="Pendientes" value={stats.pending} color="#F57C00" />
        <StatBox label="Pagados" value={stats.paid} color="#2E7D32" />
        <StatBox label="Recogidos" value={stats.picked_up} color="#1565C0" />
      </View>

      {/* Filtros */}
      <View style={styles.filtersRow}>
        {[['all','Todos'],['pending','Pendientes'],['paid','Pagados'],['picked_up','Recogidos']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.filterChip, filter === key && styles.filterChipActive]}
            onPress={() => setFilter(key)}
          >
            <Text style={[styles.filterLabel, filter === key && styles.filterLabelActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 40 }}>📭</Text>
          <Text style={styles.emptyText}>Sin pedidos en esta categoría</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function StatBox({ label, value, color }) {
  return (
    <View style={statStyles.box}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, marginHorizontal: 3 },
  value: { fontSize: 22, fontWeight: '800' },
  label: { fontSize: 10, color: '#757575', fontWeight: '600', marginTop: 2 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FBF4' },
  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  deniedText: { fontSize: 18, fontWeight: '700', color: '#1B5E20' },

  statsRow: { flexDirection: 'row', padding: 12, gap: 4 },
  filtersRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8, gap: 6 },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#C8E6C9', backgroundColor: '#fff',
  },
  filterChipActive: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#757575' },
  filterLabelActive: { color: '#fff' },

  list: { padding: 12 },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14,
    marginBottom: 12, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08,
    shadowRadius: 6, elevation: 3,
  },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  clientAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#C8E6C9' },
  clientAvatarFallback: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#C8E6C9',
  },
  clientName: { fontSize: 14, fontWeight: '700', color: '#1B5E20' },
  clientEmail: { fontSize: 11, color: '#757575' },
  clientAge: { fontSize: 11, color: '#757575' },
  statusBadge: { borderRadius: 10, padding: 8, alignItems: 'center' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusHint: { fontSize: 9, opacity: 0.7, marginTop: 1 },

  payRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  payLabel: { fontSize: 12, fontWeight: '600', color: '#555' },
  orderDate: { fontSize: 11, color: '#757575' },

  productsList: { borderTopWidth: 1, borderTopColor: '#E8F5E9', paddingTop: 10, marginBottom: 10 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  productEmoji: { fontSize: 16 },
  productName: { flex: 1, fontSize: 12, color: '#555' },
  productQty: { fontSize: 12, color: '#757575', fontWeight: '600' },
  productSubtotal: { fontSize: 13, fontWeight: '700', color: '#2E7D32' },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#E8F5E9', paddingTop: 8 },
  totalLabel: { fontSize: 13, fontWeight: '700', color: '#1B5E20' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#2E7D32' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptyText: { fontSize: 14, color: '#757575' },
});