import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
  ScrollView, Image, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#2E7D32',
  white: '#FFFFFF',
  bg: '#F9FBF4',
  lightGreen: '#E8F5E9',
  textDark: '#1B5E20',
  textGray: '#757575',
  border: '#C8E6C9',
  red: '#E53935',
};

export default function ProfileScreen({ navigation }) {
  const { profile, logout, uploadProfilePhoto, updateProfile, isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombre: profile?.nombre || '',
    apellidos: profile?.apellidos || '',
    edad: String(profile?.edad || ''),
  });
  const [saving, setSaving] = useState(false);

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function pickAndUploadPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setSaving(true);
      try {
        await uploadProfilePhoto(result.assets[0].uri);
        Alert.alert('¡Listo!', 'Tu foto de perfil fue actualizada.');
      } catch {
        Alert.alert('Error', 'No se pudo subir la foto. Intenta de nuevo.');
      } finally {
        setSaving(false);
      }
    }
  }

  async function handleSave() {
    if (!form.nombre || !form.apellidos) {
      Alert.alert('Campos requeridos', 'Nombre y apellidos son obligatorios.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ nombre: form.nombre, apellidos: form.apellidos, edad: Number(form.edad) });
      setEditing(false);
      Alert.alert('✅ Guardado', 'Tu perfil fue actualizado correctamente.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: logout },
    ]);
  }

  const initials = `${profile?.nombre?.[0] || ''}${profile?.apellidos?.[0] || ''}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAndUploadPhoto} activeOpacity={0.85} style={styles.avatarWrap}>
            {profile?.photoURL ? (
              <Image source={{ uri: profile.photoURL }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitials}>{initials || '👤'}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Text style={{ fontSize: 13 }}>📷</Text>
            </View>
          </TouchableOpacity>
          {saving && <ActivityIndicator color={COLORS.primary} style={{ marginTop: 8 }} />}
          <Text style={styles.avatarName}>{profile?.nombre} {profile?.apellidos}</Text>
          <Text style={styles.avatarEmail}>{profile?.email}</Text>
          {isAdmin && (
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>👑 Administrador</Text>
            </View>
          )}
        </View>

        {/* Datos del perfil */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Mis Datos</Text>
            <TouchableOpacity onPress={() => editing ? handleSave() : setEditing(true)} disabled={saving}>
              <Text style={styles.editBtn}>{editing ? (saving ? 'Guardando...' : '💾 Guardar') : '✏️ Editar'}</Text>
            </TouchableOpacity>
          </View>

          <Row label="Nombre(s)" value={form.nombre} editing={editing}
            onChange={(v) => setField('nombre', v)} />
          <Row label="Apellidos" value={form.apellidos} editing={editing}
            onChange={(v) => setField('apellidos', v)} />
          <Row label="Edad" value={form.edad} editing={editing}
            onChange={(v) => setField('edad', v)} keyboardType="number-pad" />
          <Row label="Correo" value={profile?.email} editing={false} />

          {editing && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => {
              setEditing(false);
              setForm({ nombre: profile?.nombre, apellidos: profile?.apellidos, edad: String(profile?.edad || '') });
            }}>
              <Text style={styles.cancelBtnText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Admin: ver pedidos */}
        {isAdmin && (
          <TouchableOpacity
            style={styles.adminBtn}
            onPress={() => navigation.navigate('Admin')}
            activeOpacity={0.85}
          >
            <Text style={styles.adminBtnText}>👑 Ver todos los pedidos</Text>
          </TouchableOpacity>
        )}

        {/* Cerrar sesión */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutBtnText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, editing, onChange, keyboardType }) {
  return (
    <View style={rowStyles.wrap}>
      <Text style={rowStyles.label}>{label}</Text>
      {editing && onChange ? (
        <TextInput
          style={rowStyles.input}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={keyboardType ? 'none' : 'words'}
        />
      ) : (
        <Text style={rowStyles.value}>{value || '—'}</Text>
      )}
    </View>
  );
}

const rowStyles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 11, color: '#757575', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  value: { fontSize: 15, color: '#1B5E20', fontWeight: '600' },
  input: {
    borderWidth: 1.5,
    borderColor: '#C8E6C9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#1B5E20',
    backgroundColor: '#FAFFF8',
  },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FBF4' },
  container: { padding: 20, paddingBottom: 40 },

  avatarSection: { alignItems: 'center', marginBottom: 22, paddingTop: 10 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatarImg: { width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: '#C8E6C9' },
  avatarFallback: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#C8E6C9',
  },
  avatarInitials: { fontSize: 32, fontWeight: '800', color: '#2E7D32' },
  avatarEditBadge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#fff', borderRadius: 14, width: 28, height: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#C8E6C9',
  },
  avatarName: { fontSize: 20, fontWeight: '800', color: '#1B5E20', marginBottom: 2 },
  avatarEmail: { fontSize: 13, color: '#757575', marginBottom: 8 },
  adminBadge: {
    backgroundColor: '#FFF8E1', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: '#FFE082',
  },
  adminBadgeText: { fontSize: 12, color: '#F57F17', fontWeight: '700' },

  card: {
    backgroundColor: '#fff', borderRadius: 18, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#1B5E20' },
  editBtn: { fontSize: 13, color: '#2E7D32', fontWeight: '700' },
  cancelBtn: { paddingVertical: 10, alignItems: 'center' },
  cancelBtnText: { color: '#757575', fontSize: 14 },

  adminBtn: {
    backgroundColor: '#FFF8E1',
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 12,
    borderWidth: 1.5, borderColor: '#FFE082',
  },
  adminBtnText: { fontSize: 15, fontWeight: '800', color: '#F57F17' },

  logoutBtn: {
    borderWidth: 1.5, borderColor: '#FFCDD2',
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', backgroundColor: '#FFF5F5',
  },
  logoutBtnText: { fontSize: 15, fontWeight: '800', color: '#E53935' },
});