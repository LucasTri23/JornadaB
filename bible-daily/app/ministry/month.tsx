import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Trash2, FileText } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import {
  useMinistryEntries,
  useMonthSummary,
  deleteMinistryEntry,
  formatMinutes,
  monthName,
  MinistryEntry,
  ActivityType,
} from '@/lib/ministry-hooks';
import { useQueryClient } from '@tanstack/react-query';

const ACTIVITY_INFO: Record<ActivityType, { emoji: string; label: string }> = {
  FIELD_SERVICE: { emoji: '🏠', label: 'Campo' },
  INFORMAL_WITNESSING: { emoji: '💬', label: 'Testemunho informal' },
  CART_WITNESSING: { emoji: '🛒', label: 'Carrinho' },
  RETURN_VISIT: { emoji: '🔄', label: 'Revisita' },
  BIBLE_STUDY: { emoji: '📖', label: 'Estudo bíblico' },
  LDC_CREDIT: { emoji: '🏗️', label: 'LDC/Crédito' },
  COURSE_CREDIT: { emoji: '📚', label: 'Curso/Crédito' },
  OTHER_CREDIT: { emoji: '⭐', label: 'Outro crédito' },
  OTHER: { emoji: '📝', label: 'Outro' },
};

const now = new Date();

export default function MonthScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const entriesQuery = useMinistryEntries(userId, month, year);
  const summaryQuery = useMonthSummary(userId, month, year);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  async function handleDelete(entry: MinistryEntry) {
    Alert.alert('Confirmar', 'Deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMinistryEntry(entry.id);
            queryClient.invalidateQueries({ queryKey: ['ministry_entries', userId] });
          } catch (e: any) {
            Alert.alert('Erro', e?.message ?? 'Não foi possível excluir.');
          }
        },
      },
    ]);
  }

  // Group entries by day
  const grouped: Record<string, MinistryEntry[]> = {};
  for (const entry of entriesQuery.data ?? []) {
    if (!grouped[entry.entry_date]) grouped[entry.entry_date] = [];
    grouped[entry.entry_date].push(entry);
  }
  const sortedDays = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const summary = summaryQuery.data;
  const isPublisher = summary?.publisherType === 'PUBLISHER';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resumo mensal</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/ministry/report')}>
          <FileText size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {monthName(month)} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <ChevronRight size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Summary card */}
        <View style={styles.card}>
          {summaryQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : isPublisher ? (
            <View style={styles.publisherSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Participou no ministério</Text>
                <Text style={[styles.summaryVal, { color: summary?.participatedInMinistry ? colors.success : colors.textMuted }]}>
                  {summary?.participatedInMinistry ? 'Sim' : 'Não'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Estudos bíblicos</Text>
                <Text style={styles.summaryVal}>{summary?.bibleStudiesCount ?? 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Dias de campo</Text>
                <Text style={styles.summaryVal}>{summary?.uniqueDays ?? 0}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.pioneerSummary}>
              <View style={styles.statRow}>
                <Stat label="Ministério" value={formatMinutes(summary?.ministryMinutes ?? 0)} />
                {(summary?.creditMinutes ?? 0) > 0 && (
                  <Stat label="Crédito" value={formatMinutes(summary?.creditMinutes ?? 0)} />
                )}
                <Stat label="Total" value={formatMinutes(summary?.totalMinutes ?? 0)} highlight />
              </View>

              {summary?.goalMinutes ? (
                <>
                  <View style={styles.progressBar}>
                    <View
                      style={[styles.progressFill, { width: `${summary.percent}%` as any }]}
                    />
                  </View>
                  <View style={styles.goalRow}>
                    <Text style={styles.goalText}>
                      Meta: {formatMinutes(summary.goalMinutes)}
                    </Text>
                    <Text style={[styles.goalText, { color: colors.primary }]}>
                      {summary.percent}%
                    </Text>
                  </View>
                  {summary.remainingMinutes > 0 ? (
                    <Text style={styles.remainText}>
                      Faltam {formatMinutes(summary.remainingMinutes)}
                    </Text>
                  ) : (
                    <Text style={[styles.remainText, { color: colors.success }]}>Meta atingida!</Text>
                  )}
                </>
              ) : null}

              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Estudos bíblicos</Text>
                <Text style={styles.summaryVal}>{summary?.bibleStudiesCount ?? 0}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryKey}>Dias de campo</Text>
                <Text style={styles.summaryVal}>{summary?.uniqueDays ?? 0}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Entries by day */}
        {entriesQuery.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : sortedDays.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Nenhum registro neste mês.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/ministry/add')}>
              <Text style={styles.addBtnText}>+ Adicionar registro</Text>
            </TouchableOpacity>
          </View>
        ) : (
          sortedDays.map((day) => {
            const dayEntries = grouped[day];
            const dayTotal = dayEntries.reduce((s, e) => s + e.minutes, 0);
            const [y, m, d] = day.split('-');
            const dayFormatted = `${d}/${m}/${y}`;
            return (
              <View key={day} style={styles.dayGroup}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayTitle}>{dayFormatted}</Text>
                  <Text style={styles.dayTotal}>{formatMinutes(dayTotal)}</Text>
                </View>
                {dayEntries.map((entry) => {
                  const info = ACTIVITY_INFO[entry.activity_type] ?? { emoji: '📝', label: entry.activity_type };
                  return (
                    <View key={entry.id} style={styles.entryRow}>
                      <Text style={styles.entryEmoji}>{info.emoji}</Text>
                      <View style={styles.entryInfo}>
                        <Text style={styles.entryLabel}>{info.label}</Text>
                        {entry.notes ? (
                          <Text style={styles.entryNote} numberOfLines={1}>{entry.notes}</Text>
                        ) : null}
                      </View>
                      <Text style={styles.entryDuration}>{formatMinutes(entry.minutes)}</Text>
                      <TouchableOpacity onPress={() => handleDelete(entry)} style={styles.deleteBtn}>
                        <Trash2 size={16} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            );
          })
        )}

        {sortedDays.length > 0 && (
          <TouchableOpacity style={styles.reportBtn} onPress={() => router.push('/ministry/report')}>
            <FileText size={18} color="#fff" />
            <Text style={styles.reportBtnText}>Gerar relatório</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, highlight && { color: colors.primary }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'space-between',
  },
  headerBtn: { width: 40 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text },

  content: { padding: 20, gap: 16 },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navBtn: { padding: 10 },
  monthLabel: { fontSize: 16, fontWeight: '600', color: colors.text },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },

  publisherSummary: { gap: 10 },
  pioneerSummary: { gap: 10 },

  statRow: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center', gap: 2 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted },

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
  goalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalText: { fontSize: 12, color: colors.textMuted },
  remainText: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryKey: { fontSize: 14, color: colors.textMuted },
  summaryVal: { fontSize: 14, fontWeight: '600', color: colors.text },

  emptyBox: { alignItems: 'center', gap: 12, paddingVertical: 32 },
  emptyText: { fontSize: 14, color: colors.textMuted },
  addBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  addBtnText: { color: '#fff', fontWeight: '600' },

  dayGroup: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceLight,
  },
  dayTitle: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  dayTotal: { fontSize: 13, fontWeight: '600', color: colors.primary },

  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  entryEmoji: { fontSize: 20, width: 28 },
  entryInfo: { flex: 1 },
  entryLabel: { fontSize: 14, color: colors.text, fontWeight: '500' },
  entryNote: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  entryDuration: { fontSize: 14, fontWeight: '600', color: colors.text, marginRight: 4 },
  deleteBtn: { padding: 6 },

  reportBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    marginTop: 4,
  },
  reportBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
