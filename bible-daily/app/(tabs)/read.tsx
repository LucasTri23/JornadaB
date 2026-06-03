import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronRight, X } from 'lucide-react-native';
import { colors } from '@/lib/colors';

const BOOKS = [
  { id: 1, name: 'Gênesis', chapters: 50, testament: 'AT' },
  { id: 2, name: 'Êxodo', chapters: 40, testament: 'AT' },
  { id: 3, name: 'Levítico', chapters: 27, testament: 'AT' },
  { id: 4, name: 'Números', chapters: 36, testament: 'AT' },
  { id: 5, name: 'Deuteronômio', chapters: 34, testament: 'AT' },
  { id: 6, name: 'Josué', chapters: 24, testament: 'AT' },
  { id: 7, name: 'Juízes', chapters: 21, testament: 'AT' },
  { id: 8, name: 'Rute', chapters: 4, testament: 'AT' },
  { id: 9, name: '1 Samuel', chapters: 31, testament: 'AT' },
  { id: 10, name: '2 Samuel', chapters: 24, testament: 'AT' },
  { id: 11, name: '1 Reis', chapters: 22, testament: 'AT' },
  { id: 12, name: '2 Reis', chapters: 25, testament: 'AT' },
  { id: 13, name: '1 Crônicas', chapters: 29, testament: 'AT' },
  { id: 14, name: '2 Crônicas', chapters: 36, testament: 'AT' },
  { id: 15, name: 'Esdras', chapters: 10, testament: 'AT' },
  { id: 16, name: 'Neemias', chapters: 13, testament: 'AT' },
  { id: 17, name: 'Ester', chapters: 10, testament: 'AT' },
  { id: 18, name: 'Jó', chapters: 42, testament: 'AT' },
  { id: 19, name: 'Salmos', chapters: 150, testament: 'AT' },
  { id: 20, name: 'Provérbios', chapters: 31, testament: 'AT' },
  { id: 21, name: 'Eclesiastes', chapters: 12, testament: 'AT' },
  { id: 22, name: 'Cânticos', chapters: 8, testament: 'AT' },
  { id: 23, name: 'Isaías', chapters: 66, testament: 'AT' },
  { id: 24, name: 'Jeremias', chapters: 52, testament: 'AT' },
  { id: 25, name: 'Lamentações', chapters: 5, testament: 'AT' },
  { id: 26, name: 'Ezequiel', chapters: 48, testament: 'AT' },
  { id: 27, name: 'Daniel', chapters: 12, testament: 'AT' },
  { id: 28, name: 'Oséias', chapters: 14, testament: 'AT' },
  { id: 29, name: 'Joel', chapters: 3, testament: 'AT' },
  { id: 30, name: 'Amós', chapters: 9, testament: 'AT' },
  { id: 31, name: 'Obadias', chapters: 1, testament: 'AT' },
  { id: 32, name: 'Jonas', chapters: 4, testament: 'AT' },
  { id: 33, name: 'Miquéias', chapters: 7, testament: 'AT' },
  { id: 34, name: 'Naum', chapters: 3, testament: 'AT' },
  { id: 35, name: 'Habacuque', chapters: 3, testament: 'AT' },
  { id: 36, name: 'Sofonias', chapters: 3, testament: 'AT' },
  { id: 37, name: 'Ageu', chapters: 2, testament: 'AT' },
  { id: 38, name: 'Zacarias', chapters: 14, testament: 'AT' },
  { id: 39, name: 'Malaquias', chapters: 4, testament: 'AT' },
  { id: 40, name: 'Mateus', chapters: 28, testament: 'NT' },
  { id: 41, name: 'Marcos', chapters: 16, testament: 'NT' },
  { id: 42, name: 'Lucas', chapters: 24, testament: 'NT' },
  { id: 43, name: 'João', chapters: 21, testament: 'NT' },
  { id: 44, name: 'Atos', chapters: 28, testament: 'NT' },
  { id: 45, name: 'Romanos', chapters: 16, testament: 'NT' },
  { id: 46, name: '1 Coríntios', chapters: 16, testament: 'NT' },
  { id: 47, name: '2 Coríntios', chapters: 13, testament: 'NT' },
  { id: 48, name: 'Gálatas', chapters: 6, testament: 'NT' },
  { id: 49, name: 'Efésios', chapters: 6, testament: 'NT' },
  { id: 50, name: 'Filipenses', chapters: 4, testament: 'NT' },
  { id: 51, name: 'Colossenses', chapters: 4, testament: 'NT' },
  { id: 52, name: '1 Tessalonicenses', chapters: 5, testament: 'NT' },
  { id: 53, name: '2 Tessalonicenses', chapters: 3, testament: 'NT' },
  { id: 54, name: '1 Timóteo', chapters: 6, testament: 'NT' },
  { id: 55, name: '2 Timóteo', chapters: 4, testament: 'NT' },
  { id: 56, name: 'Tito', chapters: 3, testament: 'NT' },
  { id: 57, name: 'Filemom', chapters: 1, testament: 'NT' },
  { id: 58, name: 'Hebreus', chapters: 13, testament: 'NT' },
  { id: 59, name: 'Tiago', chapters: 5, testament: 'NT' },
  { id: 60, name: '1 Pedro', chapters: 5, testament: 'NT' },
  { id: 61, name: '2 Pedro', chapters: 3, testament: 'NT' },
  { id: 62, name: '1 João', chapters: 5, testament: 'NT' },
  { id: 63, name: '2 João', chapters: 1, testament: 'NT' },
  { id: 64, name: '3 João', chapters: 1, testament: 'NT' },
  { id: 65, name: 'Judas', chapters: 1, testament: 'NT' },
  { id: 66, name: 'Apocalipse', chapters: 22, testament: 'NT' },
];

export default function ReadScreen() {
  const [tab, setTab] = useState<'AT' | 'NT'>('AT');
  const [selectedBook, setSelectedBook] = useState<typeof BOOKS[0] | null>(null);

  const filtered = BOOKS.filter(b => b.testament === tab);

  function openBook(book: typeof BOOKS[0]) {
    if (book.chapters === 1) {
      router.push(`/read/${book.id}/1`);
    } else {
      setSelectedBook(book);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bíblia</Text>
        <View style={styles.tabs}>
          {(['AT', 'NT'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => setTab(t)}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === 'AT' ? 'Antigo' : 'Novo'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.bookItem} onPress={() => openBook(item)}>
            <View>
              <Text style={styles.bookName}>{item.name}</Text>
              <Text style={styles.bookChapters}>{item.chapters} capítulos</Text>
            </View>
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      />

      <Modal visible={!!selectedBook} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedBook?.name}</Text>
              <TouchableOpacity onPress={() => setSelectedBook(null)}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.chaptersGrid}>
              {Array.from({ length: selectedBook?.chapters ?? 0 }, (_, i) => i + 1).map(ch => (
                <TouchableOpacity
                  key={ch}
                  style={styles.chapterBtn}
                  onPress={() => {
                    setSelectedBook(null);
                    router.push(`/read/${selectedBook!.id}/${ch}`);
                  }}
                >
                  <Text style={styles.chapterBtnText}>{ch}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  tabs: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  bookItem: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  bookName: { fontSize: 16, fontWeight: '500', color: colors.text },
  bookChapters: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '70%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  chaptersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chapterBtn: {
    width: 52, height: 52, backgroundColor: colors.surfaceLight,
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  chapterBtnText: { fontSize: 16, color: colors.text, fontWeight: '500' },
});
