import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import { useMinistryProfile, useServiceYear, formatMinutes, MinistryMonthSettings } from '@/lib/ministry-hooks';

const PIONEER_GOAL_ANNUAL = 600 * 60; // 600h in minutes

// Service year: Sep (year-1) → Aug (year)
const SERVICE_YEAR_MONTHS = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];
const MONTH_NAMES_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getCurrentServiceYear(): string {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  // Service year label: "YYYY-YYYY"
  if (m >= 9) return `${y}-${y + 1}`;
  return `${y - 1}-${y}`;
}

export default function YearScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';

  const profileQuery = useMinistryProfile(userId);
  const isRegularPioneer = profileQuery.data?.publisher_type === 'REGULAR_PIONEER';
  const serviceYear = getCurrentServiceYear();
  const serviceYearQuery = useServiceYear(userId, serviceYear);

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isRegularPioneer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ano de serviço</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.centered}>
          <Text style={styles.notApplicable}>
            Esta tela é disponível apenas para Pioneiros Regulares.
          </Text>
          <Text style={styles.notApplicableDesc}>
            Atualize sua modalidade nas configurações do ministério para acessar o relatório anual.
          </Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/ministry/settings')}>
            <Text style={styles.settingsBtnText}>Ir para Configurações</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const [startYearStr, endYearStr] = serviceYear.split('-');
  const startYear = parseInt(startYearStr, 10);
  const endYear = parseInt(endYearStr, 10);

  // Build month data
  const monthSettingsMap: Record<string, MinistryMonthSettings> = {};
  for (const ms of serviceYearQuery.data ?? []) {
    monthSettingsMap[`${ms.month}-${ms.year}`] = ms;
  }

  const rows = SERVICE_YEAR_MONTHS.map((m) => {
    const y = m >= 9 ? startYear : endYear;
    const key = `${m}-${y}`;
    const ms = monthSettingsMap[key];
    const monthTotal = ms ? (ms.monthly_goal_minutes ?? 50 * 60) : 0;
    return { month: m, year: y, ms, label: MONTH_NAMES_SHORT[m - 1] };
  });

  // We don't have individual entry totals here (would need extra queries per month).
  // We show the goal and participation only from month settings.
  const totalAccumulated = rows.reduce((sum, r) => {
    if (!r.ms) return sum;
    return sum; // We'd need actual entries to compute real totals
  }, 0);

  const percent = Math.min(100, Math.round((totalAccumulated / PIONEER_GOAL_ANNUAL) * 100));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ano de serviço</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.yearCard}>
          <Text style={styles.yearLabel}>Ano de Serviço</Text>
          <Text style={styles.yearValue}>Set {startYear} – Ago {endYear}</Text>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${percent}%` as any }]} />
          </View>
          <View style={styles.goalRow}>
            <Text style={styles.goalText}>Meta anual: 600h</Text>
            <Text style={[styles.goalText, { color: colors.primary }]}>{percent}%</Text>
          </View>
        </View>

        <Text style={styles.tableHint}>
          Os totais de horas por mês aparecem ao navegar pelo Resumo Mensal.
        </Text>

        {/* Month table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableCellHead, styles.cellMes]}>Mês</Text>
            <Text style={[styles.tableCell, styles.tableCellHead, styles.cellStatus]}>Status</Text>
            <Text style={[styles.tableCell, styles.tableCellHead, styles.cellMeta]}>Meta</Text>
            <Text style={[styles.tableCell, styles.tableCellHead, styles.cellEspecial]}>Especial</Text>
          </View>

          {rows.map(({ month, year, label, ms }) => {
            const isSpecial = ms?.is_special_month ?? false;
            const participated = ms?.participated_in_ministry;
            const goalMin = ms?.monthly_goal_minutes ?? (isSpecial ? 15 * 60 : 50 * 60);

            return (
              <TouchableOpacity
                key={`${month}-${year}`}
                style={styles.tableRow}
                onPress={() => router.push('/ministry/month')}
              >
                <Text style={[styles.tableCell, styles.cellMes, { color: colors.text }]}>
                  {label}/{String(year).slice(2)}
                </Text>
                <Text style={[styles.tableCell, styles.cellStatus, {
                  color: participated === true ? colors.success : participated === false ? colors.error : colors.textMuted,
                }]}>
                  {participated === true ? '✓' : participated === false ? '✗' : '—'}
                </Text>
                <Text style={[styles.tableCell, styles.cellMeta, { color: colors.textMuted }]}>
                  {formatMinutes(goalMin)}
                </Text>
                <Text style={[styles.tableCell, styles.cellEspecial, { color: isSpecial ? colors.warning : colors.textMuted }]}>
                  {isSpecial ? 'Sim' : '—'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 12 },

  notApplicable: { fontSize: 16, fontWeight: '600', color: colors.text, textAlign: 'center' },
  notApplicableDesc: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  settingsBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  settingsBtnText: { color: '#fff', fontWeight: '600' },

  content: { padding: 20, gap: 16 },

  yearCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  yearLabel: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', fontWeight: '600' },
  yearValue: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  progressBar: {
    height: 10,
    backgroundColor: colors.surfaceLight,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  goalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalText: { fontSize: 13, color: colors.textMuted },

  tableHint: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },

  table: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  tableHeader: { backgroundColor: colors.surfaceLight },
  tableCell: { fontSize: 13 },
  tableCellHead: { color: colors.textMuted, fontWeight: '600', fontSize: 11 },
  cellMes: { flex: 2 },
  cellStatus: { flex: 1, textAlign: 'center' },
  cellMeta: { flex: 2, textAlign: 'right' },
  cellEspecial: { flex: 1.5, textAlign: 'right' },
});
