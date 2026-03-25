import React from 'react';
import {
  View, Text, TouchableOpacity, Image,
  StyleSheet, useWindowDimensions,
} from 'react-native';

const COLORS = {
  primary: '#2E7D32',
  white: '#FFFFFF',
  lightGray: '#F1F8E9',
  textDark: '#1B5E20',
  textGray: '#555',
};

export default function ProductCard({ product, onPress }) {
  const { width } = useWindowDimensions();

  // Ancho real del card: mitad de pantalla menos márgenes del grid (10px*2) y márgenes del card (6px*2)
  const cardWidth = (width / 2) - 22;

  // En pantallas menores a 360px apilamos precio y botón verticalmente
  const isNarrow = cardWidth < 150;

  // Altura de imagen proporcional al ancho del card
  const imageHeight = Math.round(cardWidth * 0.72);

  // Tamaño de fuente del precio adaptable
  const priceSize = cardWidth < 160 ? 10 : 17;

  return (
    <TouchableOpacity style={[styles.card, { width: cardWidth }]} onPress={onPress} activeOpacity={0.88}>

      {/* Imagen / Emoji */}
      <View style={[styles.imageContainer, { height: imageHeight }]}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.emojiPlaceholder}>{product.emoji}</Text>
        )}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryEmoji}>{product.emoji}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.unit}>Por {product.unit}</Text>

        {/* Footer: apilado en pantallas muy angostas, en fila en normales */}
        <View style={isNarrow ? styles.footerColumn : styles.footerRow}>
          <Text style={[styles.price, { fontSize: priceSize }]}>
            ${product.price.toFixed(2)}
          </Text>
          <TouchableOpacity
            style={[styles.button, isNarrow && styles.buttonFull]}
            onPress={onPress}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText} numberOfLines={1}>
              Ver Detalles
            </Text>
          </TouchableOpacity>
        </View>
      </View>

    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 6,
    elevation: 3,
    margin: 5,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emojiPlaceholder: {
    fontSize: 44,
  },
  categoryBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryEmoji: {
    fontSize: 14,
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
    lineHeight: 18,
  },
  unit: {
    fontSize: 10,
    color: COLORS.textGray,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // Footer en fila (pantallas normales)
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  // Footer apilado (pantallas muy angostas)
  footerColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 6,
  },

  price: {
    fontWeight: '800',
    color: COLORS.primary,
    flexShrink: 1,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    flexShrink: 0,
  },
  // Botón ancho completo cuando el layout es columna
  buttonFull: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
});