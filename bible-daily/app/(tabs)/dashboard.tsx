import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BookOpen, LogOut, Flame, ChevronRight, Briefcase, Plus } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { colors } from '@/lib/colors';
import { useUserProgress, useProfile } from '@/lib/supabase-hooks';
import { useMonthSummary, formatMinutes } from '@/lib/ministry-hooks';

const TOTAL_CHAPTERS = 1189;

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

function getGreeting(name: string): string {
  const h = new Date().getHours();
  const part = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  return `${part}, ${name}`;
}

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: progressData, isLoading: loadingProgress } = useUserProgress();
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: ministrySummary, isLoading: loadingMinistry } = useMonthSummary(
    user?.id ?? '',
    month,
    year
  );

  const isLoading = loadingProgress || loadingProfile;

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário';
  const firstName = displayName.split(' ')[0];

  const rows = progressData?.rows ?? [];
  const totalRead = progressData?.set.size ?? 0;
  const biblePercent = Math.round((totalRead / TOTAL_CHAPTERS) * 100);
  const streak = profile?.streak ?? 0;

  // Last chapter read
  let lastChapter: { book: string; chapter: number; bookId: number } | null = null;
  if (rows.length > 0) {
    const sorted = [...rows].sort((a, b) => new Date(b.read_at).getTime() - new Date(a.read_at).getTime());
    const last = sorted[0];
    lastChapter = { book: BOOK_NAMES[last.book_id] ?? `Livro ${last.book_id}`, chapter: last.chapter, bookId: last.book_id };
  }

  // Ministry
  const isPublisher = ministrySummary?.publisherType === 'PUBLISHER';
  const hasMinistryGoal = !!ministrySummary?.goalMinutes;
  const ministryPercent = ministrySummary?.percent ?? 0;
  const ministryTotal = ministrySummary?.totalMinutes ?? 0;
  const ministryGoal = ministrySummary?.goalMinutes ?? 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting(firstName)} 👋</Text>
            <Text style={styles.subtitle}>Sua jornada de hoje</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Stats strip */}
            <View style={styles.statsRow}>
              <StatPill icon={<Flame size={16} color="#f59e0b" />} value={`${streak} dias`} label="Sequência" />
              <View style={styles.statsDivider} />
              <StatPill icon={<BookOpen size={16} color={colors.primary} />} value={`${biblePercent}%`} label="Bíblia" />
              <View style={styles.statsDivider} />
              <StatPill icon={<BookOpen size={16} color={colors.success} />} value={String(totalRead)} label="Capítulos" />
            </View>

            {/* ── LEITURA ── */}
            <SectionHeader title="Leitura bíblica" onPress={() => router.push('/(tabs)/read')} />

            {lastChapter ? (
              <TouchableOpacity
                style={styles.mainCard}
                onPress={() => router.push(`/read/${lastChapter!.bookId}/${lastChapter!.chapter}`)}
              >
                <View style={styles.mainCardIcon}>
                  <BookOpen size={22} color={colors.primary} />
                </View>
                <View style={styles.mainCardBody}>
                  <Text style={styles.mainCardLabel}>Continuar leitura</Text>
                  <Text style={styles.mainCardTitle}>{lastChapter.book} {lastChapter.chapter}</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.mainCard} onPress={() => router.push('/(tabs)/read')}>
                <View style={styles.mainCardIcon}>
                  <BookOpen size={22} color={colors.primary} />
                </View>
                <View style={styles.mainCardBody}>
                  <Text style={styles.mainCardLabel}>Começar agora</Text>
                  <Text style={styles.mainCardTitle}>Escolha um livro para ler</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}

            {/* Bible progress bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${biblePercent}%`, backgroundColor: colors.primary }]} />
            </View>
            <Text style={styles.progressLabel}>{totalRead} de {TOTAL_CHAPTERS} capítulos lidos</Text>

            {/* ── MINISTÉRIO ── */}
            <SectionHeader title="Ministério" onPress={() => router.push('/(tabs)/ministry')} />

            {!loadingMinistry && (
              isPublisher ? (
                /* Publisher: just show participation */
                <TouchableOpacity style={styles.mainCard} onPress={() => router.push('/(tabs)/ministry')}>
                  <View style={[styles.mainCardIcon, { backgroundColor: colors.primary + '20' }]}>
                    <Briefcase size={22} color={colors.primary} />
                  </View>
                  <View style={styles.mainCardBody}>
                    <Text style={styles.mainCardLabel}>
                      {ministrySummary?.participatedInMinistry ? 'Participou este mês' : 'Ainda sem registro'}
                    </Text>
                    <Text style={styles.mainCardTitle}>
                      {ministrySummary?.bibleStudiesCount ?? 0} estudo{(ministrySummary?.bibleStudiesCount ?? 0) !== 1 ? 's' : ''} bíblico{(ministrySummary?.bibleStudiesCount ?? 0) !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : (
                /* Pioneer: show hours + goal */
                <TouchableOpacity style={styles.ministryCard} onPress={() => router.push('/(tabs)/ministry')}>
                  <View style={styles.ministryCardTop}>
                    <View style={styles.ministryCardLeft}>
                      <Briefcase size={18} color={colors.primary} />
                      <Text style={styles.ministryHours}>{formatMinutes(ministryTotal)}</Text>
                      {hasMinistryGoal && (
                        <Text style={styles.ministryGoal}>/ {formatMinutes(ministryGoal)}</Text>
                      )}
                    </View>
                    {hasMinistryGoal && (
                      <Text style={styles.ministryPercent}>{ministryPercent}%</Text>
                    )}
                  </View>
                  {hasMinistryGoal && (
                    <>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${Math.min(ministryPercent, 100)}%`, backgroundColor: ministryPercent >= 100 ? colors.success : colors.primary }]} />
                      </View>
                      {ministrySummary && ministrySummary.remainingMinutes > 0 && (
                        <Text style={styles.progressLabel}>Faltam {formatMinutes(ministrySummary.remainingMinutes)} para a meta</Text>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              )
            )}

            {/* Quick register button */}
            <TouchableOpacity style={styles.quickRegisterBtn} onPress={() => router.push('/ministry/add')}>
              <Plus size={16} color="#fff" />
              <Text style={styles.quickRegisterText}>Registrar atividade de hoje</Text>
            </TouchableOpacity>

            {/* Verse of the day */}
            <View style={styles.verseCard}>
              <Text style={styles.verseLabel}>Versículo do Dia</Text>
              <Text style={styles.verseText}>
                "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho."
              </Text>
              <Text style={styles.verseRef}>Salmos 119:105</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onPress}>
        <Text style={styles.sectionLink}>Ver mais</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <View style={styles.statPill}>
      {icon}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 12, paddingBottom: 32 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  logoutBtn: { padding: 8 },

  // Stats strip
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  statPill: { flex: 1, alignItems: 'center', gap: 3 },
  statsDivider: { width: 1, backgroundColor: colors.border, marginHorizontal: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted },

  // Section header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  sectionLink: { fontSize: 13, color: colors.primary },

  // Main card (reading)
  mainCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  mainCardIcon: {
    width: 42, height: 42,
    backgroundColor: colors.primary + '20',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainCardBody: { flex: 1 },
  mainCardLabel: { fontSize: 11, color: colors.primary, fontWeight: '500' },
  mainCardTitle: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 2 },

  // Progress bar (shared)
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 2,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressLabel: { fontSize: 11, color: colors.textMuted, marginTop: 3 },

  // Ministry card (pioneers)
  ministryCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  ministryCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ministryCardLeft: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  ministryHours: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  ministryGoal: { fontSize: 14, color: colors.textMuted },
  ministryPercent: { fontSize: 20, fontWeight: 'bold', color: colors.primary },

  // Quick register
  quickRegisterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 2,
  },
  quickRegisterText: { color: '#fff', fontWeight: '600', fontSize: 14 },

  // Verse
  verseCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    gap: 10,
    marginTop: 4,
  },
  verseLabel: { fontSize: 10, color: colors.primary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  verseText: { fontSize: 15, color: colors.text, lineHeight: 22, fontStyle: 'italic' },
  verseRef: { fontSize: 13, color: colors.primaryLight, fontWeight: '500' },
});
