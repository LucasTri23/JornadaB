import { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, ChevronRight, Calendar, Book, BarChart2, FileText, Settings } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import {
  useMinistryProfile,
  useMonthSummary,
  useReturnVisits,
  useBibleStudies,
  formatMinutes,
} from '@/lib/ministry-hooks';

const now = new Date();
const CURRENT_MONTH = now.getMonth() + 1;
const CURRENT_YEAR = now.getFullYear();

export default function MinistryScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';

  const profileQuery = useMinistryProfile(userId);
  const summaryQuery = useMonthSummary(userId, CURRENT_MONTH, CURRENT_YEAR);
  const returnVisitsQuery = useReturnVisits(userId, 'PENDING');
  const bibleStudiesQuery = useBibleStudies(userId, 'ACTIVE');

  useEffect(() => {
    if (
      profileQuery.data &&
      profileQuery.data.onboarding_completed === false
    ) {
      router.replace('/ministry/onboarding');
    }
  }, [profileQuery.data]);

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  const profile = profileQuery.data;
  const summary = summaryQuery.data;
  const nextReturnVisit = returnVisitsQuery.data?.find((v) => v.next_visit_date) ?? null;
  const nextBibleStudy = bibleStudiesQuery.data?.find((s) => s.next_study_date) ?? null;

  const publisherType = profile?.publisher_type ?? 'PUBLISHER';
  const isPublisher = publisherType === 'PUBLISHER';

  const monthStr = now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Ministério</Text>
            <Text style={styles.subtitle}>{monthStr}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/ministry/settings')}>
            <Settings size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Quick action */}
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/ministry/add')}>
          <Plus size={20} color="#fff" />
          <Text style={styles.addButtonText}>Registrar hoje</Text>
        </TouchableOpacity>

        {/* Summary card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumo do mês</Text>
          {summaryQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
          ) : isPublisher ? (
            <View style={styles.summaryPublisher}>
              <Text style={styles.summaryLabel}>Participou no ministério</Text>
              <Text style={[styles.summaryValue, { color: summary?.participatedInMinistry ? colors.success : colors.textMuted }]}>
                {summary?.participatedInMinistry ? 'Sim' : 'Ainda não'}
              </Text>
              {(summary?.bibleStudiesCount ?? 0) > 0 && (
                <Text style={styles.summaryLabel}>
                  Estudos bíblicos: {summary?.bibleStudiesCount}
                </Text>
              )}
            </View>
          ) : (
            <View style={styles.summaryPioneer}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryBig}>{formatMinutes(summary?.totalMinutes ?? 0)}</Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                </View>
                {summary?.goalMinutes ? (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryBig}>{formatMinutes(summary.goalMinutes)}</Text>
                    <Text style={styles.summaryLabel}>Meta</Text>
                  </View>
                ) : null}
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryBig, { color: colors.primary }]}>
                    {summary?.percent ?? 0}%
                  </Text>
                  <Text style={styles.summaryLabel}>Progresso</Text>
                </View>
              </View>

              {summary?.goalMinutes ? (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${summary.percent}%` as any },
                    ]}
                  />
                </View>
              ) : null}

              {summary?.remainingMinutes ? (
                <Text style={styles.remaining}>
                  Faltam {formatMinutes(summary.remainingMinutes)} para a meta
                </Text>
              ) : summary?.goalMinutes ? (
                <Text style={[styles.remaining, { color: colors.success }]}>Meta atingida!</Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Next return visit */}
        {profile?.use_return_visits && (
          <TouchableOpacity style={styles.card} onPress={() => router.push('/ministry/return-visits/')}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Próxima revisita</Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
            {nextReturnVisit ? (
              <View style={styles.nextItem}>
                <Text style={styles.nextName}>{nextReturnVisit.name}</Text>
                {nextReturnVisit.next_visit_date ? (
                  <Text style={styles.nextDate}>{formatDate(nextReturnVisit.next_visit_date)}</Text>
                ) : null}
                {nextReturnVisit.subject_discussed ? (
                  <Text style={styles.nextSub} numberOfLines={1}>
                    {nextReturnVisit.subject_discussed}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text style={styles.emptyText}>Nenhuma revisita pendente</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Next bible study */}
        {profile?.use_bible_studies && (
          <TouchableOpacity style={styles.card} onPress={() => router.push('/ministry/bible-studies/')}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Próximo estudo</Text>
              <ChevronRight size={18} color={colors.textMuted} />
            </View>
            {nextBibleStudy ? (
              <View style={styles.nextItem}>
                <Text style={styles.nextName}>{nextBibleStudy.name}</Text>
                {nextBibleStudy.next_study_date ? (
                  <Text style={styles.nextDate}>{formatDate(nextBibleStudy.next_study_date)}</Text>
                ) : null}
                {nextBibleStudy.publication ? (
                  <Text style={styles.nextSub} numberOfLines={1}>
                    {nextBibleStudy.publication}
                    {nextBibleStudy.current_lesson ? ` · Lição ${nextBibleStudy.current_lesson}` : ''}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text style={styles.emptyText}>Nenhum estudo ativo</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Navigation links */}
        <View style={styles.linksGrid}>
          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/ministry/month')}>
            <Calendar size={24} color={colors.primary} />
            <Text style={styles.linkTitle}>Resumo mensal</Text>
          </TouchableOpacity>

          {profile?.use_return_visits && (
            <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/ministry/return-visits/')}>
              <BarChart2 size={24} color={colors.primary} />
              <Text style={styles.linkTitle}>Revisitas</Text>
            </TouchableOpacity>
          )}

          {profile?.use_bible_studies && (
            <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/ministry/bible-studies/')}>
              <Book size={24} color={colors.primary} />
              <Text style={styles.linkTitle}>Estudos</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/ministry/report')}>
            <FileText size={24} color={colors.primary} />
            <Text style={styles.linkTitle}>Relatório</Text>
          </TouchableOpacity>

          {publisherType === 'REGULAR_PIONEER' && (
            <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/ministry/year')}>
              <BarChart2 size={24} color={colors.primary} />
              <Text style={styles.linkTitle}>Ano de serviço</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 2, textTransform: 'capitalize' },
  settingsBtn: { padding: 8 },

  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },

  summaryPublisher: { gap: 6 },
  summaryPioneer: { gap: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center', gap: 4 },
  summaryBig: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  summaryLabel: { fontSize: 12, color: colors.textMuted },
  summaryValue: { fontSize: 18, fontWeight: '600' },

  progressBar: {
    height: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  remaining: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },

  nextItem: { gap: 4 },
  nextName: { fontSize: 16, fontWeight: '600', color: colors.text },
  nextDate: { fontSize: 13, color: colors.primary },
  nextSub: { fontSize: 12, color: colors.textMuted },
  emptyText: { fontSize: 13, color: colors.textMuted },

  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  linkCard: {
    flex: 1,
    minWidth: '44%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  linkTitle: { fontSize: 13, fontWeight: '500', color: colors.text, textAlign: 'center' },
});
