import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ScrollView, Alert, ActivityIndicator, Image,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useAuth } from '../context/AuthContext';

WebBrowser.maybeCompleteAuthSession();

// 🔴 Pon tu Client ID de Google (lo encuentras en Firebase Console → Auth → Google → Web client ID)
const GOOGLE_WEB_CLIENT_ID = '729938513547-5kkuqg9cvbhthsaq19ncp1rba29m7d3m.apps.googleusercontent.com  ';
const GOOGLE_ANDROID_CLIENT_ID = '729938513547-5kkuqg9cvbhthsaq19ncp1rba29m7d3m.apps.googleusercontent.com';

const COLORS = {
  primary: '#b00000',
  white: '#ffffff',
  bg: '#ffffff',
  lightGreen: '#E8F5E9',
  textDark: '#000000',
  textGray: '#757575',
  border: '#840000',
  red: '#E53935',
};

export default function LoginScreen({ navigation }) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const [, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
  });

  // Manejar respuesta de Google
  React.useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  async function handleGoogleLogin(idToken) {
    setLoading(true);
    try {
      await loginWithGoogle(idToken);
    } catch (e) {
      Alert.alert('Error con Google', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailLogin() {
    if (!email || !password) {
      Alert.alert('Campos requeridos', 'Por favor llena todos los campos.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      Alert.alert('Error al iniciar sesión', traducirError(e.code));
    } finally {
      setLoading(false);
    }
  }

  function traducirError(code) {
    const errores = {
      'auth/user-not-found': 'No existe una cuenta con ese correo.',
      'auth/wrong-password': 'Contraseña incorrecta.',
      'auth/invalid-email': 'El correo no es válido.',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
    };
    return errores[code] || 'Ocurrió un error. Intenta de nuevo.';
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo / Header */}
        <View style={styles.header}>
          <Image 
    source={require('../../assets/logo.png')} // ../../assets/logo.png es la ruta de como llegar a tu imagen desde esta pantalla
    style={styles.logoImage} 
  />
        {/*<Text style={styles.subtitle}>Inicia sesión para hacer tu pedido</Text>*/}
        </View>
        {/* Card de login */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Iniciar Sesión</Text>

          

          {/* Email */}
          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor={COLORS.textGray}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Password */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textGray}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
            />
            <TouchableOpacity
              style={styles.showPassBtn}
              onPress={() => setShowPass(!showPass)}
            >
              <Text style={{ fontSize: 14 }}>{showPass ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>
          {/* Botón Login */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleEmailLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.loginBtnText}>Iniciar Sesion→</Text>
            }
          </TouchableOpacity>
            <Text> </Text>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o con tus cuentas</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Botón Google */}
          <TouchableOpacity
            style={styles.googleBtn}
            onPress={() => promptAsync()}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleText}>Continuar con Google</Text>
          </TouchableOpacity>

        </View>

        {/* Ir a Registro */}
        <View style={styles.registerRow}>
          <Text style={styles.registerText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Crear cuenta</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 24, flexGrow: 1, justifyContent: 'center' },

  header: { alignItems: 'center', marginBottom: 28 },
  logo: { fontSize: 60, marginBottom: 8 },
  appName: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.textGray },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginBottom: 18 , textAlign: 'center'},

  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 16,
    gap: 10,
    backgroundColor: COLORS.white,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4285F4',
    fontFamily: 'serif',
  },
  googleText: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },

  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: 12, color: COLORS.textGray },

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
  passContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  showPassBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderLeftWidth: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 13,
    backgroundColor: '#FAFFF8',
  },
  logoImage: {
    width: 150,           // Ajusta según el tamaño de tu logo
    height: 150,          // Ajusta según el tamaño de tu logo
    borderRadius: 60,     // Opcional: si quieres que sea circular (la mitad del ancho)
    resizeMode: 'contain', // Mantiene la forma de la imagen sin estirarla
  },

  loginBtn: {
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
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },

  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  registerText: { fontSize: 14, color: COLORS.textGray },
  registerLink: { fontSize: 14, color: COLORS.primary, fontWeight: '800' },
});