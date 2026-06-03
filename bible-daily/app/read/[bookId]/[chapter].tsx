import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Circle,
  BookmarkPlus,
  Settings2,
  Share2,
  X,
} from 'lucide-react-native';
import { getChapter, Verse, Translation } from '@/lib/bible-api';
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import { useQueryClient } from '@tanstack/react-query';
import {
  useUserProgress,
  markChapterRead,
  addNote,
  useProfile,
  updateProfile,
} from '@/lib/supabase-hooks';

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
  11: 22, 12: 25, 13: 29, 14: 36, 15: 10, 16: 13, 17: 10, 18: 42, 19: 150,
  20: 31, 21: 12, 22: 8, 23: 66, 24: 52, 25: 5, 26: 48, 27: 12, 28: 14,
  29: 3, 30: 9, 31: 1, 32: 4, 33: 7, 34: 3, 35: 3, 36: 3, 37: 2, 38: 14,
  39: 4, 40: 28, 41: 16, 42: 24, 43: 21, 44: 28, 45: 16, 46: 16, 47: 13,
  48: 6, 49: 6, 50: 4, 51: 4, 52: 5, 53: 3, 54: 6, 55: 4, 56: 3, 57: 1,
  58: 13, 59: 5, 60: 5, 61: 3, 62: 5, 63: 1, 64: 1, 65: 1, 66: 22,
};

const TRANSLATIONS: Translation[] = ['ARC', 'NVI', 'ACF'];

export default function ChapterScreen() {
  const { bookId, chapter } = useLocalSearchParams<{ bookId: string; chapter: string }>();
  const bookNum = Number(bookId);
  const chapterNum = Number(chapter);

  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: progressData } = useUserProgress();
  const { data: profile } = useProfile();

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [marking, setMarking] = useState(false);

  // Settings panel
  const [showSettings, setShowSettings] = useState(false);

  // Font size — use profile value or default
  const [fontSize, setFontSize] = useState(17);
  useEffect(() => {
    if (profile?.font_size) setFontSize(profile.font_size);
  }, [profile?.font_size]);

  // Translation — use profile value or default
  const [translation, setTranslation] = useState<Translation>('ARC');
  useEffect(() => {
    if (profile?.translation && TRANSLATIONS.includes(profile.translation as Translation)) {
      setTranslation(profile.translation as Translation);
    }
  }, [profile?.translation]);

  // Note modal
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const bookName = BOOK_NAMES[bookNum] ?? 'Livro';
  const totalChapters = CHAPTER_COUNTS[bookNum] ?? 50;
  const chapterKey = `${bookNum}-${chapterNum}`;
  const isRead = progressData?.set.has(chapterKey) ?? false;

  // Fetch chapter when bookNum, chapterNum, or translation changes
  useEffect(() => {
    setLoading(true);
    setVerses([]);
    setSelectedVerse(null);
    getChapter(bookNum, chapterNum, translation)
      .then(setVerses)
      .catch(() => {
        Alert.alert('Erro', 'Não foi possível carregar o capítulo. Verifique sua conexão.');
      })
      .finally(() => setLoading(false));
  }, [bookNum, chapterNum, translation]);

  function goChapter(delta: number) {
    const next = chapterNum + delta;
    if (next < 1 || next > totalChapters) return;
    router.replace(`/read/${bookNum}/${next}`);
  }

  async function handleMarkRead() {
    if (!user?.id || marking) return;
    setMarking(true);
    try {
      await markChapterRead(user.id, bookNum, chapterNum);
      queryClient.invalidateQueries({ queryKey: ['user_progress', user.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o progresso.');
    } finally {
      setMarking(false);
    }
  }

  async function handleShareVerse() {
    if (selectedVerse === null) return;
    const v = verses.find(v => v.verse === selectedVerse);
    if (!v) return;
    await Share.share({
      message: `"${v.text}" — ${bookName} ${chapterNum}:${v.verse} (${translation})`,
    });
  }

  async function handleChangeFontSize(delta: number) {
    const next = Math.min(24, Math.max(12, fontSize + delta));
    setFontSize(next);
    if (user?.id) {
      try {
        await updateProfile(user.id, { font_size: next });
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      } catch {}
    }
  }

  async function handleChangeTranslation(t: Translation) {
    setTranslation(t);
    setShowSettings(false);
    if (user?.id) {
      try {
        await updateProfile(user.id, { translation: t });
        queryClient.invalidateQueries({ queryKey: ['profile', user.id] });
      } catch {}
    }
  }

  function openNoteModal() {
    const preTitle = selectedVerse !== null
      ? `${bookName} ${chapterNum}:${selectedVerse}`
      : `${bookName} ${chapterNum}`;
    setNoteTitle(preTitle);
    setNoteContent('');
    setShowNoteModal(true);
  }

  async function handleSaveNote() {
    if (!user?.id || !noteContent.trim()) return;
    setSavingNote(true);
    try {
      await addNote(user.id, {
        bookId: bookNum,
        chapter: chapterNum,
        verse: selectedVerse ?? undefined,
        title: noteTitle || undefined,
        content: noteContent.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ['user_notes', user.id] });
      setShowNoteModal(false);
      setNoteTitle('');
      setNoteContent('');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a nota.');
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.bookName}>{bookName}</Text>
          <Text style={styles.chapterNum}>Capítulo {chapterNum}</Text>
        </View>

        <View style={styles.headerActions}>
          {selectedVerse !== null && (
            <TouchableOpacity onPress={handleShareVerse} style={styles.iconBtn}>
              <Share2 size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={openNoteModal} style={styles.iconBtn}>
            <BookmarkPlus size={20} color={colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconBtn}>
            <Settings2 size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Translation badge */}
      <View style={styles.translationRow}>
        <View style={styles.translationBadge}>
          <Text style={styles.translationBadgeText}>{translation}</Text>
        </View>
        {isRead && (
          <View style={styles.readBadge}>
            <CheckCircle size={14} color={colors.success} />
            <Text style={styles.readBadgeText}>Lido</Text>
          </View>
        )}
      </View>

      {/* Verses */}
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando capítulo...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {verses.map(v => (
            <TouchableOpacity
              key={v.pk}
              activeOpacity={0.7}
              onPress={() => setSelectedVerse(prev => prev === v.verse ? null : v.verse)}
              style={[
                styles.verseRow,
                selectedVerse === v.verse && styles.verseSelected,
              ]}
            >
              <Text style={styles.verseNumber}>{v.verse}</Text>
              <Text style={[styles.verseText, { fontSize }]}>{v.text}</Text>
            </TouchableOpacity>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Footer nav + mark as read */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navBtn, chapterNum <= 1 && styles.navBtnDisabled]}
          onPress={() => goChapter(-1)}
          disabled={chapterNum <= 1}
        >
          <ChevronLeft size={20} color={chapterNum <= 1 ? colors.textMuted : colors.text} />
          <Text style={[styles.navText, chapterNum <= 1 && styles.navTextMuted]}>Anterior</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.markBtn, isRead && styles.markBtnRead]}
          onPress={handleMarkRead}
          disabled={marking || isRead}
        >
          {marking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : isRead ? (
            <CheckCircle size={18} color={colors.success} />
          ) : (
            <Circle size={18} color="#fff" />
          )}
          <Text style={[styles.markBtnText, isRead && styles.markBtnTextRead]}>
            {isRead ? 'Lido' : 'Marcar como lido'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, chapterNum >= totalChapters && styles.navBtnDisabled]}
          onPress={() => goChapter(1)}
          disabled={chapterNum >= totalChapters}
        >
          <Text style={[styles.navText, chapterNum >= totalChapters && styles.navTextMuted]}>Próximo</Text>
          <ChevronRight size={20} color={chapterNum >= totalChapters ? colors.textMuted : colors.text} />
        </TouchableOpacity>
      </View>

      {/* Settings Modal */}
      <Modal visible={showSettings} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Configurações de Leitura</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Font size */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Tamanho da fonte</Text>
              <View style={styles.fontControls}>
                <TouchableOpacity
                  style={styles.fontBtn}
                  onPress={() => handleChangeFontSize(-1)}
                  disabled={fontSize <= 12}
                >
                  <Text style={[styles.fontBtnText, fontSize <= 12 && { opacity: 0.4 }]}>A-</Text>
                </TouchableOpacity>
                <Text style={styles.fontSize}>{fontSize}</Text>
                <TouchableOpacity
                  style={styles.fontBtn}
                  onPress={() => handleChangeFontSize(1)}
                  disabled={fontSize >= 24}
                >
                  <Text style={[styles.fontBtnText, fontSize >= 24 && { opacity: 0.4 }]}>A+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Translation */}
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Tradução</Text>
              <View style={styles.translationOptions}>
                {TRANSLATIONS.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.translationOption, translation === t && styles.translationOptionActive]}
                    onPress={() => handleChangeTranslation(t)}
                  >
                    <Text style={[styles.translationOptionText, translation === t && styles.translationOptionTextActive]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Note Modal */}
      <Modal visible={showNoteModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Nota</Text>
              <TouchableOpacity onPress={() => setShowNoteModal(false)}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.noteInput}
              value={noteTitle}
              onChangeText={setNoteTitle}
              placeholder="Título (opcional)"
              placeholderTextColor={colors.textMuted}
            />

            <TextInput
              style={[styles.noteInput, styles.noteContentInput]}
              value={noteContent}
              onChangeText={setNoteContent}
              placeholder="Escreva sua nota..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.saveBtn, (!noteContent.trim() || savingNote) && styles.saveBtnDisabled]}
              onPress={handleSaveNote}
              disabled={!noteContent.trim() || savingNote}
            >
              {savingNote ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Salvar nota</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  bookName: { fontSize: 16, fontWeight: '700', color: colors.text },
  chapterNum: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },

  // Translation + read badge row
  translationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  translationBadge: {
    backgroundColor: colors.primary + '25',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  translationBadgeText: {
    fontSize: 12,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.success + '20',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  readBadgeText: { fontSize: 12, color: colors.success, fontWeight: '600' },

  // Loading
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: colors.textMuted },

  // Verses
  content: { paddingHorizontal: 20, paddingTop: 8 },
  verseRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  verseSelected: { backgroundColor: colors.primary + '22' },
  verseNumber: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '700',
    minWidth: 22,
    marginTop: 4,
  },
  verseText: {
    flex: 1,
    color: colors.text,
    lineHeight: 28,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 8,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 72,
  },
  navBtnDisabled: { opacity: 0.35 },
  navText: { fontSize: 13, color: colors.text, fontWeight: '500' },
  navTextMuted: { color: colors.textMuted },
  markBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  markBtnRead: {
    backgroundColor: colors.success + '20',
    borderWidth: 1,
    borderColor: colors.success + '50',
  },
  markBtnText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  markBtnTextRead: { color: colors.success },

  // Modal shared
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },

  // Settings
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: { fontSize: 15, color: colors.text },
  fontControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  fontBtn: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fontBtnText: { fontSize: 16, color: colors.text, fontWeight: '600' },
  fontSize: { fontSize: 16, color: colors.textMuted, minWidth: 24, textAlign: 'center' },
  translationOptions: { flexDirection: 'row', gap: 8 },
  translationOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  translationOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  translationOptionText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  translationOptionTextActive: { color: '#fff' },

  // Note modal inputs
  noteInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteContentInput: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
