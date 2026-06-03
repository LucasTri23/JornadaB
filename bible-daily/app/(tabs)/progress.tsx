import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { TrendingUp, BookOpen, Flame, Briefcase, ChevronRight, ChevronLeft } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useUserProgress, useProfile } from '@/lib/supabase-hooks';
import { useMonthSummary, useServiceYear, formatMinutes } from '@/lib/ministry-hooks';
import { useAuthStore } from '@/store/auth';

const TOTAL = 1189;
const OT_TOTAL = 929;
const NT_TOTAL = 260;

const BOOKS_INFO: { id: number; name: string; chapters: number; testament: 'AT' | 'NT' }[] = [
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

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

function getCurrentServiceYear() {
  const now = new Date();
  const y = now.getFullYear(); const m = now.getMonth() + 1;
  return m >= 9 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

type Section = 'leitura' | 'ministerio';

export default function ProgressScreen() {
  const { user } = useAuthStore();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const [section, setSection] = useState<Section>('leitura');
  const [monthNav, setMonthNav] = useState({ month, year });

  const { data: progressData, isLoading: loadingProg } = useUserProgress();
  const { data: profile } = useProfile();
  const { data: ministrySummary, isLoading: loadingMin } = useMonthSummary(user?.id ?? '', monthNav.month, monthNav.year);

  const readSet = progressData?.set ?? new Set<string>();
  const totalRead = readSet.size;
  const biblePct = Math.round((totalRead / TOTAL) * 100);
  const streak = profile?.streak ?? 0;
  const bestStreak = profile?.best_streak ?? 0;

  let otRead = 0, ntRead = 0;
  for (const key of readSet) {
    const bookId = parseInt(key.split('-')[0]);
    if (bookId <= 39) otRead++; else ntRead++;
  }
  const otPct = Math.round((otRead / OT_TOTAL) * 100);
  const ntPct = Math.round((ntRead / NT_TOTAL) * 100);

  const booksWithProgress = BOOKS_INFO
    .map(b => {
      let done = 0;
      for (let c = 1; c <= b.chapters; c++) if (readSet.has(`${b.id}-${c}`)) done++;
      return { ...b, done, pct: Math.round((done / b.chapters) * 100) };
    })
    .filter(b => b.done > 0)
    .sort((a, b) => b.pct - a.pct);

  function prevMonth() {
    setMonthNav(prev => prev.month === 1 ? { month: 12, year: prev.year - 1 } : { month: prev.month - 1, year: prev.year });
  }
  function nextMonth() {
    setMonthNav(prev => prev.month === 12 ? { month: 1, year: prev.year + 1 } : { month: prev.month + 1, year: prev.year });
  }

  const isPublisher = ministrySummary?.publisherType === 'PUBLISHER';

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Progresso</Text>

      {/* Section toggle */}
      <View style={styles.sectionToggle}>
        <TouchableOpacity style={[styles.sectionBtn, section === 'leitura' && styles.sectionBtnActive]} onPress={() => setSection('leitura')}>
          <BookOpen size={14} color={section === 'leitura' ? '#fff' : colors.textMuted} />
          <Text style={[styles.sectionBtnText, section === 'leitura' && styles.sectionBtnTextActive]}>Leitura</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.sectionBtn, section === 'ministerio' && styles.sectionBtnActive]} onPress={() => setSection('ministerio')}>
          <Briefcase size={14} color={section === 'ministerio' ? '#fff' : colors.textMuted} />
          <Text style={[styles.sectionBtnText, section === 'ministerio' && styles.sectionBtnTextActive]}>Ministério</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── LEITURA ── */}
        {section === 'leitura' && (
          loadingProg ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : (
            <>
              {/* Stats */}
              <View style={styles.statsGrid}>
                <StatCard icon={<BookOpen size={20} color={colors.primary} />} value={`${biblePct}%`} label="Bíblia completa" bg={colors.primary + '18'} />
                <StatCard icon={<Flame size={20} color="#f59e0b" />} value={`${streak}`} label={`Sequência (melhor ${bestStreak})`} bg="#f59e0b18" />
                <StatCard icon={<BookOpen size={20} color={colors.success} />} value={String(totalRead)} label={`de ${TOTAL} capítulos`} bg={colors.success + '18'} />
                <StatCard icon={<TrendingUp size={20} color="#ec4899" />} value={`${booksWithProgress.filter(b => b.pct === 100).length}`} label="Livros completos" bg="#ec489918" />
              </View>

              {/* Overall progress bar */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Progresso geral</Text>
                  <Text style={styles.cardPercent}>{biblePct}%</Text>
                </View>
                <ProgressBar pct={biblePct} color={colors.primary} />
                <View style={styles.testamentRow}>
                  <MiniProgress label="Antigo Testamento" pct={otPct} done={otRead} total={OT_TOTAL} color={colors.primary} />
                  <MiniProgress label="Novo Testamento" pct={ntPct} done={ntRead} total={NT_TOTAL} color={colors.primaryLight} />
                </View>
              </View>

              {/* Books in progress */}
              {booksWithProgress.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Livros iniciados</Text>
                  <View style={styles.bookList}>
                    {booksWithProgress.map(b => (
                      <View key={b.id} style={styles.bookRow}>
                        <View style={styles.bookMeta}>
                          <Text style={styles.bookName}>{b.name}</Text>
                          <Text style={styles.bookCount}>{b.done}/{b.chapters}</Text>
                        </View>
                        <View style={styles.bookBarBg}>
                          <View style={[styles.bookBarFill, { width: `${b.pct}%`, backgroundColor: b.pct === 100 ? colors.success : colors.primary }]} />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )
        )}

        {/* ── MINISTÉRIO ── */}
        {section === 'ministerio' && (
          <>
            {/* Month navigation */}
            <View style={styles.monthNav}>
              <TouchableOpacity onPress={prevMonth} style={styles.monthBtn}>
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{MONTH_NAMES[monthNav.month - 1]} {monthNav.year}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.monthBtn}>
                <ChevronRight size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {loadingMin ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : ministrySummary && (
              isPublisher ? (
                <View style={styles.card}>
                  <View style={styles.publisherRow}>
                    <Text style={styles.cardTitle}>Participação</Text>
                    <View style={[styles.participatedBadge, { backgroundColor: ministrySummary.participatedInMinistry ? colors.success + '25' : colors.textMuted + '20' }]}>
                      <Text style={{ color: ministrySummary.participatedInMinistry ? colors.success : colors.textMuted, fontSize: 13, fontWeight: '600' }}>
                        {ministrySummary.participatedInMinistry ? 'Participou ✓' : 'Não registrado'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.studiesCount}>{ministrySummary.bibleStudiesCount} estudo{ministrySummary.bibleStudiesCount !== 1 ? 's' : ''} bíblico{ministrySummary.bibleStudiesCount !== 1 ? 's' : ''}</Text>
                  <Text style={styles.daysCount}>{ministrySummary.uniqueDays} dia{ministrySummary.uniqueDays !== 1 ? 's' : ''} no campo</Text>
                </View>
              ) : (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.hoursMain}>{formatMinutes(ministrySummary.totalMinutes)}</Text>
                      <Text style={styles.hoursLabel}>
                        {ministrySummary.goalMinutes ? `de ${formatMinutes(ministrySummary.goalMinutes)}` : 'sem meta definida'}
                      </Text>
                    </View>
                    {ministrySummary.percent !== undefined && (
                      <Text style={styles.cardPercent}>{ministrySummary.percent}%</Text>
                    )}
                  </View>
                  {ministrySummary.goalMinutes && (
                    <>
                      <ProgressBar pct={ministrySummary.percent ?? 0} color={ministrySummary.percent >= 100 ? colors.success : colors.primary} />
                      {ministrySummary.remainingMinutes > 0 && (
                        <Text style={styles.remaining}>Faltam {formatMinutes(ministrySummary.remainingMinutes)}</Text>
                      )}
                    </>
                  )}
                  <View style={styles.hoursBreakdown}>
                    <BreakdownItem label="Campo" value={formatMinutes(ministrySummary.ministryMinutes)} />
                    {ministrySummary.publisherType === 'REGULAR_PIONEER' && (
                      <BreakdownItem label="Crédito" value={formatMinutes(ministrySummary.creditMinutes)} />
                    )}
                    <BreakdownItem label="Estudos" value={String(ministrySummary.bibleStudiesCount)} />
                    <BreakdownItem label="Dias" value={String(ministrySummary.uniqueDays)} />
                  </View>
                </View>
              )
            )}

            <TouchableOpacity style={styles.detailLink} onPress={() => router.push('/ministry/month')}>
              <Text style={styles.detailLinkText}>Ver detalhes do mês →</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailLink} onPress={() => router.push('/ministry/year')}>
              <Text style={styles.detailLinkText}>Ver ano de serviço →</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label, bg }: { icon: React.ReactNode; value: string; label: string; bg: string }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

function MiniProgress({ label, pct, done, total, color }: { label: string; pct: number; done: number; total: number; color: string }) {
  return (
    <View style={styles.miniProg}>
      <View style={styles.miniProgHeader}>
        <Text style={styles.miniProgLabel}>{label}</Text>
        <Text style={styles.miniProgValue}>{pct}%</Text>
      </View>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.miniProgCount}>{done}/{total} cap.</Text>
    </View>
  );
}

function BreakdownItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.breakdownItem}>
      <Text style={styles.breakdownValue}>{value}</Text>
      <Text style={styles.breakdownLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.text, paddingHorizontal: 20, paddingTop: 8 },
  loader: { marginTop: 60 },

  sectionToggle: { flexDirection: 'row', marginHorizontal: 16, marginVertical: 10, backgroundColor: colors.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: colors.border },
  sectionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 8 },
  sectionBtnActive: { backgroundColor: colors.primary },
  sectionBtnText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  sectionBtnTextActive: { color: '#fff', fontWeight: '600' },

  content: { padding: 16, gap: 12, paddingBottom: 32 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47.5%', borderRadius: 12, padding: 14, gap: 6, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center' },

  card: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: colors.border, gap: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  cardPercent: { fontSize: 22, fontWeight: 'bold', color: colors.primary },

  progressBg: { height: 7, backgroundColor: colors.surfaceLight, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },

  testamentRow: { gap: 8 },
  miniProg: { gap: 4 },
  miniProgHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  miniProgLabel: { fontSize: 13, color: colors.textMuted },
  miniProgValue: { fontSize: 13, fontWeight: '600', color: colors.text },
  miniProgCount: { fontSize: 11, color: colors.textMuted },

  bookList: { gap: 8 },
  bookRow: { gap: 4 },
  bookMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  bookName: { fontSize: 13, color: colors.text },
  bookCount: { fontSize: 12, color: colors.textMuted },
  bookBarBg: { height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: 'hidden' },
  bookBarFill: { height: '100%', borderRadius: 2 },

  // Ministry section
  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  monthBtn: { padding: 8 },
  monthLabel: { fontSize: 17, fontWeight: '600', color: colors.text, minWidth: 120, textAlign: 'center' },

  hoursMain: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  hoursLabel: { fontSize: 13, color: colors.textMuted },
  remaining: { fontSize: 12, color: colors.textMuted },
  hoursBreakdown: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  breakdownItem: { alignItems: 'center', gap: 2 },
  breakdownValue: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  breakdownLabel: { fontSize: 11, color: colors.textMuted },

  publisherRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  participatedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  studiesCount: { fontSize: 14, color: colors.textMuted },
  daysCount: { fontSize: 14, color: colors.textMuted },

  detailLink: { padding: 2 },
  detailLinkText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
});
