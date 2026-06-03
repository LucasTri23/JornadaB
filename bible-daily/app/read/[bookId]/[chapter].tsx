import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { ChevronLeft, ChevronRight, ArrowLeft, Share2 } from 'lucide-react-native';
import { getChapter, Verse } from '@/lib/bible-api';
import { colors } from '@/lib/colors';

const BOOK_NAMES: Record<number, string> = {
  1: 'Gênesis', 2: 'Êxodo', 3: 'Levítico', 4: 'Números', 5: 'Deuteronômio',
  6: 'Josué', 7: 'Juízes', 8: 'Rute', 9: '1 Samuel', 10: '2 Samuel',
  11: '1 Reis', 12: '2 Reis', 13: '1 Crônicas', 14: '2 Crônicas',
  15: 'Esdras', 16: 'Neemias', 17: 'Ester', 18: 'Jó', 19: 'Salmos',
  20: 'Provérbios', 21: 'Eclesiastes', 22: 'Cânticos', 23: 'Isaías',
  24: 'Jeremias', 25: 'Lamentações', 26: 'Ezequiel', 27: 'Daniel',
  28: 'Oséias', 29: 'Joel', 30: 'Amós', 31: 'Obadias', 32: 'Jonas',
  33: 'Miquéias', 34: 'Naum', 35: 'Habacuque', 36: 'Sofonias',
  37: 'Ageu', 38: 'Zacarias', 39: 'Malaquias',
  40: 'Mateus', 41: 'Marcos', 42: 'Lucas', 43: 'João', 44: 'Atos',
  45: 'Romanos', 46: '1 Coríntios', 47: '2 Coríntios', 48: 'Gálatas',
  49: 'Efésios', 50: 'Filipenses', 51: 'Colossenses', 52: '1 Tessalonicenses',
  53: '2 Tessalonicenses', 54: '1 Timóteo', 55: '2 Timóteo', 56: 'Tito',
  57: 'Filemom', 58: 'Hebreus', 59: 'Tiago', 60: '1 Pedro', 61: '2 Pedro',
  62: '1 João', 63: '2 João', 64: '3 João', 65: 'Judas', 66: 'Apocalipse',
};

const CHAPTER_COUNTS: Record<number, number> = {
  1: 50, 2: 40, 3: 27, 4: 36, 5: 34, 6: 24, 7: 21, 8: 4, 9: 31, 10: 24,
  40: 28, 41: 16, 42: 24, 43: 21, 44: 28, 45: 16, 66: 22,
};

export default function ChapterScreen() {
  const { bookId, chapter } = useLocalSearchParams<{ bookId: string; chapter: string }>();
  const bookNum = Number(bookId);
  const chapterNum = Number(chapter);

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);

  const bookName = BOOK_NAMES[bookNum] ?? 'Livro';
  const totalChapters = CHAPTER_COUNTS[bookNum] ?? 50;

  useEffect(() => {
    setLoading(true);
    setVerses([]);
    getChapter(bookNum, chapterNum)
      .then(setVerses)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookNum, chapterNum]);

  function goChapter(delta: number) {
    const next = chapterNum + delta;
    if (next < 1 || next > totalChapters) return;
    router.replace(`/read/${bookNum}/${next}`);
  }

  async function shareVerse() {
    if (selectedVerse === null) return;
    const v = verses.find(v => v.verse === selectedVerse);
    if (!v) return;
    await Share.share({
      message: `"${v.text}" — ${bookName} ${chapterNum}:${v.verse} (ARC)`,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.bookName}>{bookName}</Text>
          <Text style={styles.chapterNum}>Capítulo {chapterNum}</Text>
        </View>
        {selectedVerse !== null ? (
          <TouchableOpacity onPress={shareVerse} style={styles.backBtn}>
            <Share2 size={22} color={colors.primary} />
          </TouchableOpacity>
        ) : <View style={styles.backBtn} />}
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {verses.map(v => (
            <TouchableOpacity
              key={v.pk}
              onPress={() => setSelectedVerse(prev => prev === v.verse ? null : v.verse)}
              style={[styles.verseRow, selectedVerse === v.verse && styles.verseSelected]}
            >
              <Text style={styles.verseNumber}>{v.verse}</Text>
              <Text style={styles.verseText}>{v.text}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navBtn, chapterNum <= 1 && styles.navBtnDisabled]}
          onPress={() => goChapter(-1)}
          disabled={chapterNum <= 1}
        >
          <ChevronLeft size={20} color={chapterNum <= 1 ? colors.textMuted : colors.text} />
          <Text style={[styles.navText, chapterNum <= 1 && styles.navTextDisabled]}>Anterior</Text>
        </TouchableOpacity>

        <Text style={styles.navCenter}>{chapterNum}/{totalChapters}</Text>

        <TouchableOpacity
          style={[styles.navBtn, chapterNum >= totalChapters && styles.navBtnDisabled]}
          onPress={() => goChapter(1)}
          disabled={chapterNum >= totalChapters}
        >
          <Text style={[styles.navText, chapterNum >= totalChapters && styles.navTextDisabled]}>Próximo</Text>
          <ChevronRight size={20} color={chapterNum >= totalChapters ? colors.textMuted : colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { alignItems: 'center' },
  bookName: { fontSize: 16, fontWeight: '700', color: colors.text },
  chapterNum: { fontSize: 13, color: colors.textMuted },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 20, paddingTop: 16 },
  verseRow: {
    flexDirection: 'row', gap: 12, paddingVertical: 8,
    borderRadius: 8, paddingHorizontal: 8, marginBottom: 4,
  },
  verseSelected: { backgroundColor: colors.primary + '20' },
  verseNumber: { fontSize: 12, color: colors.primary, fontWeight: '700', minWidth: 24, marginTop: 3 },
  verseText: { flex: 1, fontSize: 17, color: colors.text, lineHeight: 28 },
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 },
  navBtnDisabled: { opacity: 0.4 },
  navText: { fontSize: 14, color: colors.text, fontWeight: '500' },
  navTextDisabled: { color: colors.textMuted },
  navCenter: { fontSize: 14, color: colors.textMuted },
});
