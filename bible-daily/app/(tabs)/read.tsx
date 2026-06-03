import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronRight, X, ListChecks, Clock, CheckCircle } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useUserProgress } from '@/lib/supabase-hooks';
import { useAuthStore } from '@/store/auth';
import { supabase } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

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

const PLANS = [
  { id: 1, name: 'Bíblia em 1 Ano', desc: 'De Gênesis a Apocalipse em 365 dias', days: 365, totalChapters: 1189, chapPerDay: 3 },
  { id: 2, name: 'Bíblia em 6 Meses', desc: 'Ritmo intensivo em 180 dias', days: 180, totalChapters: 1189, chapPerDay: 7 },
  { id: 3, name: 'Os Evangelhos', desc: 'Mateus, Marcos, Lucas e João', days: 89, totalChapters: 89, chapPerDay: 1 },
  { id: 4, name: 'NT em 90 Dias', desc: 'Todo o Novo Testamento', days: 90, totalChapters: 260, chapPerDay: 3 },
  { id: 5, name: 'Salmos e Provérbios', desc: 'Sabedoria bíblica em 30 dias', days: 30, totalChapters: 30, chapPerDay: 1 },
];

type Tab = 'ler' | 'planos';

export default function ReadScreen() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('ler');
  const [testament, setTestament] = useState<'AT' | 'NT'>('AT');
  const [selectedBook, setSelectedBook] = useState<typeof BOOKS[0] | null>(null);
  const [activatingPlan, setActivatingPlan] = useState<number | null>(null);

  const { data: progressData } = useUserProgress();
  const readSet = progressData?.set ?? new Set<string>();

  function getBookProgress(bookId: number, totalChapters: number) {
    let done = 0;
    for (let c = 1; c <= totalChapters; c++) {
      if (readSet.has(`${bookId}-${c}`)) done++;
    }
    return { done, pct: Math.round((done / totalChapters) * 100) };
  }

  function openBook(book: typeof BOOKS[0]) {
    if (book.chapters === 1) {
      router.push(`/read/${book.id}/1`);
    } else {
      setSelectedBook(book);
    }
  }

  async function startPlan(planId: number) {
    if (!user?.id) return;
    setActivatingPlan(planId);
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return;
    await supabase.from('user_reading_plans').upsert({
      user_id: user.id,
      plan_id: planId,
      plan_name: plan.name,
      total_days: plan.days,
      current_day: 1,
      is_active: true,
      start_date: new Date().toISOString().split('T')[0],
    }, { onConflict: 'user_id,plan_id' });
    queryClient.invalidateQueries({ queryKey: ['user_reading_plans'] });
    setActivatingPlan(null);
  }

  const filtered = BOOKS.filter(b => b.testament === testament);

  return (
    <SafeAreaView style={styles.container}>
      {/* Top tab selector: Ler / Planos */}
      <View style={styles.topTabs}>
        {(['ler', 'planos'] as Tab[]).map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.topTab, tab === t && styles.topTabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.topTabText, tab === t && styles.topTabTextActive]}>
              {t === 'ler' ? '📖 Ler' : '📋 Planos'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'ler' ? (
        <>
          {/* AT / NT switcher */}
          <View style={styles.testamentRow}>
            <Text style={styles.screenTitle}>Bíblia</Text>
            <View style={styles.testamentTabs}>
              {(['AT', 'NT'] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.testamentTab, testament === t && styles.testamentTabActive]}
                  onPress={() => setTestament(t)}
                >
                  <Text style={[styles.testamentText, testament === t && styles.testamentTextActive]}>
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
            renderItem={({ item }) => {
              const { done, pct } = getBookProgress(item.id, item.chapters);
              const isDone = pct === 100;
              return (
                <TouchableOpacity style={styles.bookItem} onPress={() => openBook(item)}>
                  <View style={styles.bookInfo}>
                    <View style={styles.bookNameRow}>
                      <Text style={styles.bookName}>{item.name}</Text>
                      {isDone && <CheckCircle size={14} color={colors.success} />}
                    </View>
                    <Text style={styles.bookChapters}>{item.chapters} cap. · {done > 0 ? `${done} lidos` : 'não iniciado'}</Text>
                    {done > 0 && (
                      <View style={styles.bookProgress}>
                        <View style={[styles.bookProgressFill, { width: `${pct}%` }]} />
                      </View>
                    )}
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </TouchableOpacity>
              );
            }}
          />
        </>
      ) : (
        /* Plans */
        <ScrollView contentContainerStyle={styles.plansContent}>
          <Text style={styles.plansTitle}>Planos de Leitura</Text>
          <Text style={styles.plansSubtitle}>Escolha um plano e leia de forma estruturada</Text>
          {PLANS.map(plan => (
            <View key={plan.id} style={styles.planCard}>
              <View style={styles.planIcon}>
                <ListChecks size={22} color={colors.primary} />
              </View>
              <View style={styles.planContent}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planDesc}>{plan.desc}</Text>
                <View style={styles.planMeta}>
                  <Clock size={12} color={colors.textMuted} />
                  <Text style={styles.planMetaText}>{plan.days} dias · ~{plan.chapPerDay} cap/dia</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.startBtn, activatingPlan === plan.id && styles.startBtnDisabled]}
                onPress={() => startPlan(plan.id)}
                disabled={activatingPlan === plan.id}
              >
                {activatingPlan === plan.id
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.startBtnText}>Iniciar</Text>
                }
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Chapter selector modal */}
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
              {Array.from({ length: selectedBook?.chapters ?? 0 }, (_, i) => i + 1).map(ch => {
                const isRead = selectedBook ? readSet.has(`${selectedBook.id}-${ch}`) : false;
                return (
                  <TouchableOpacity
                    key={ch}
                    style={[styles.chapterBtn, isRead && styles.chapterBtnRead]}
                    onPress={() => {
                      setSelectedBook(null);
                      router.push(`/read/${selectedBook!.id}/${ch}`);
                    }}
                  >
                    <Text style={[styles.chapterBtnText, isRead && styles.chapterBtnTextRead]}>{ch}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  // Top tabs (Ler / Planos)
  topTabs: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 4,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  topTabActive: { backgroundColor: colors.primary },
  topTabText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  topTabTextActive: { color: '#fff', fontWeight: '600' },

  // Read view
  testamentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  screenTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  testamentTabs: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    padding: 3,
  },
  testamentTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 7 },
  testamentTabActive: { backgroundColor: colors.primary },
  testamentText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  testamentTextActive: { color: '#fff' },

  list: { paddingHorizontal: 16, paddingBottom: 20, gap: 8 },
  bookItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookInfo: { flex: 1 },
  bookNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bookName: { fontSize: 15, fontWeight: '500', color: colors.text },
  bookChapters: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  bookProgress: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  bookProgressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },

  // Plans view
  plansContent: { padding: 16, gap: 12 },
  plansTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  plansSubtitle: { fontSize: 13, color: colors.textMuted },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planIcon: {
    width: 44, height: 44,
    backgroundColor: colors.primary + '20',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planContent: { flex: 1, gap: 2 },
  planName: { fontSize: 15, fontWeight: '600', color: colors.text },
  planDesc: { fontSize: 12, color: colors.textMuted },
  planMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  planMetaText: { fontSize: 11, color: colors.textMuted },
  startBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, minWidth: 60, alignItems: 'center' },
  startBtnDisabled: { opacity: 0.6 },
  startBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Chapter modal
  modalOverlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  chaptersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingBottom: 20 },
  chapterBtn: {
    width: 50, height: 50,
    backgroundColor: colors.surfaceLight,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chapterBtnRead: { backgroundColor: colors.primary + '30', borderColor: colors.primary },
  chapterBtnText: { fontSize: 15, color: colors.text, fontWeight: '500' },
  chapterBtnTextRead: { color: colors.primary, fontWeight: '700' },
});
