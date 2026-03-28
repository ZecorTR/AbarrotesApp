import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, ScrollView, Alert, ActivityIndicator, Image,
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

export default function RegisterScreen({ navigation }) {
  const { register, uploadProfilePhoto } = useAuth();
  const [form, setForm] = useState({ nombre: '', apellidos: '', edad: '', email: '', password: '', confirmPassword: '' });
  const [photoUri, setPhotoUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function setField(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para subir una foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  }

  async function handleRegister() {
    const { nombre, apellidos, edad, email, password, confirmPassword } = form;

    if (!nombre || !apellidos || !edad || !email || !password) {
      Alert.alert('Campos requeridos', 'Por favor llena todos los campos.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Contraseñas distintas', 'Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña corta', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (isNaN(Number(edad)) || Number(edad) < 1 || Number(edad) > 120) {
      Alert.alert('Edad inválida', 'Por favor ingresa una edad válida.');
      return;
    }

    setLoading(true);
    try {
      const user = await register({ email: email.trim(), password, nombre, apellidos, edad: Number(edad) });
      if (photoUri) {
        await uploadProfilePhoto(photoUri);
      }
      // AuthContext detecta el usuario y redirige automáticamente
    } catch (e) {
      Alert.alert('Error al registrarse', traducirError(e.code));
    } finally {
      setLoading(false);
    }
  }

  function traducirError(code) {
    const errores = {
      'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
      'auth/invalid-email': 'El correo no es válido.',
      'auth/weak-password': 'La contraseña es muy débil.',
    };
    return errores[code] || 'Ocurrió un error. Intenta de nuevo.';
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Llena tus datos para empezar a pedir</Text>

        {/* Foto de perfil */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoCircle} onPress={pickPhoto} activeOpacity={0.8}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoEmoji}>📷</Text>
                <Text style={styles.photoLabel}>Foto de perfil</Text>
              </View>
            )}
          </TouchableOpacity>
          {photoUri && (
            <TouchableOpacity onPress={() => setPhotoUri(null)}>
              <Text style={styles.removePhoto}>Quitar foto</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          {/* Nombre */}
          <Text style={styles.label}>Nombre(s) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Juan Carlos"
            placeholderTextColor={COLORS.textGray}
            value={form.nombre}
            onChangeText={(v) => setField('nombre', v)}
            autoCapitalize="words"
          />

          {/* Apellidos */}
          <Text style={styles.label}>Apellidos *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: García López"
            placeholderTextColor={COLORS.textGray}
            value={form.apellidos}
            onChangeText={(v) => setField('apellidos', v)}
            autoCapitalize="words"
          />

          {/* Edad */}
          <Text style={styles.label}>Edad *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 34"
            placeholderTextColor={COLORS.textGray}
            value={form.edad}
            onChangeText={(v) => setField('edad', v)}
            keyboardType="number-pad"
            maxLength={3}
          />

          {/* Email */}
          <Text style={styles.label}>Correo electrónico *</Text>
          <TextInput
            style={styles.input}
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor={COLORS.textGray}
            value={form.email}
            onChangeText={(v) => setField('email', v)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password */}
          <Text style={styles.label}>Contraseña *</Text>
          <View style={styles.passRow}>
            <TextInput
              style={[styles.input, styles.passInput]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={COLORS.textGray}
              value={form.password}
              onChangeText={(v) => setField('password', v)}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Text style={{ fontSize: 16 }}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Confirmar Password */}
          <Text style={styles.label}>Confirmar contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu contraseña"
            placeholderTextColor={COLORS.textGray}
            value={form.confirmPassword}
            onChangeText={(v) => setField('confirmPassword', v)}
            secureTextEntry={!showPass}
          />

          {/* Submit */}
          <TouchableOpacity
            style={[styles.registerBtn, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.registerBtnText}>✅ Crear mi cuenta</Text>
            }
          </TouchableOpacity>
        </View>

        {/* Ya tengo cuenta */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.loginLink}>Iniciar sesión</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 22, flexGrow: 1 },

  title: { fontSize: 24, fontWeight: '800', color: COLORS.textDark, marginBottom: 4, marginTop: 10 },
  subtitle: { fontSize: 14, color: COLORS.textGray, marginBottom: 22 },

  photoSection: { alignItems: 'center', marginBottom: 20 },
  photoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: COLORS.lightGreen,
    borderWidth: 2.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center', gap: 4 },
  photoEmoji: { fontSize: 28 },
  photoLabel: { fontSize: 11, color: COLORS.textGray, fontWeight: '600' },
  removePhoto: { fontSize: 12, color: COLORS.red, marginTop: 6, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 18,
  },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textDark, marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: 14,
    backgroundColor: '#FAFFF8',
  },
  passRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 0 },
  passInput: { flex: 1, marginBottom: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRightWidth: 0 },
  eyeBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 13,
    backgroundColor: '#FAFFF8',
    marginBottom: 14,
  },

  registerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },

  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingBottom: 20 },
  loginText: { fontSize: 14, color: COLORS.textGray },
  loginLink: { fontSize: 14, color: COLORS.primary, fontWeight: '800' },
});