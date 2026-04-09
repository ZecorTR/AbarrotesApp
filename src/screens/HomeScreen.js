import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, ScrollView, FlatList,
  TouchableOpacity, StyleSheet, SafeAreaView, useWindowDimensions,
} from 'react-native';
import { PRODUCTS, CATEGORIES } from '../data/products';
import ProductCard from '../components/ProductCard';

const COLORS = {
  primary: '#850000',
  primaryLight: '#8d0818',
  accent: '#8d0818',
  white: '#FFFFFF',
  bg: '#F9FBF4',
  lightGreen: '#E8F5E9',
  textDark: '#6f0000',
  textGray: '#212121',
  border: '#ff0000',
};

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { width } = useWindowDimensions();

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [search, selectedCategory]);

  // Sin wrapper View extra — el card calcula su propio ancho con useWindowDimensions
  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Hero Banner */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>¡Abarrotes Mandy te la bienvenida! 👋</Text>
          <Text style={styles.heroSub}>Tu tienda de confianza, cerca de casa</Text>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>📦 Recoge en tienda · Sin costo extra</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={COLORS.textGray}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category Selector */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>CATEGORÍAS</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[styles.categoryChip, selectedCategory === cat.id && styles.categoryChipActive]}
              activeOpacity={0.8}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryLabel, selectedCategory === cat.id && styles.categoryLabelActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all'
              ? 'Productos Destacados'
              : CATEGORIES.find(c => c.id === selectedCategory)?.label}
          </Text>
          <Text style={styles.productCount}>{filtered.length} productos</Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No encontramos "{search}"</Text>
            <Text style={styles.emptySubText}>Intenta con otro nombre</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderProduct}
            numColumns={2}
            scrollEnabled={false}
            // columnWrapperStyle centra los cards sin wrapper flex externo
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.grid}
          />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },

  hero: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
  heroSub: { fontSize: 14, color: '#ffffff', marginBottom: 12 },
  heroBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  heroBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: '600' },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: -18,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 8,
  },
  searchIcon: { fontSize: 18, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#333' },
  clearBtn: { fontSize: 16, color: COLORS.textGray, paddingHorizontal: 4 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textDark },
  productCount: { fontSize: 13, color: COLORS.textGray, fontWeight: '600' },

  categoriesRow: { paddingHorizontal: 12, paddingBottom: 4 },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 9,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryEmoji: { fontSize: 16, marginRight: 6 },
  categoryLabel: { fontSize: 13, color: COLORS.textGray, fontWeight: '600' },
  categoryLabelActive: { color: COLORS.white },

  // padding horizontal del grid + gap entre columnas lo maneja el margin del card
  grid: { paddingHorizontal: 6, paddingTop: 4 },
  columnWrapper: { justifyContent: 'flex-start' },

  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  emptySubText: { fontSize: 14, color: COLORS.textGray },
});