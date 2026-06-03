import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TrendingUp, BookOpen, Flame, Award } from 'lucide-react-native';
import { colors } from '@/lib/colors';

export default function ProgressScreen() {
  const stats = [
    { icon: BookOpen, label: 'Capítulos lidos', value: '0', color: colors.primary },
    { icon: Flame, label: 'Sequência atual', value: '0 dias', color: '#f59e0b' },
    { icon: TrendingUp, label: 'Bíblia completa', value: '0%', color: colors.success },
    { icon: Award, label: 'Conquistas', value: '0', color: '#ec4899' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Meu Progresso</Text>
        <Text style={styles.subtitle}>Acompanhe sua jornada bíblica</Text>

        <View style={styles.grid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <stat.icon size={28} color={stat.color} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progresso por Testamento</Text>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Antigo Testamento</Text>
              <Text style={styles.progressPercent}>0%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '0%', backgroundColor: colors.primary }]} />
            </View>
          </View>
          <View style={styles.progressItem}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Novo Testamento</Text>
              <Text style={styles.progressPercent}>0%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '0%', backgroundColor: colors.primaryLight }]} />
            </View>
          </View>
        </View>

        <View style={styles.emptyState}>
          <TrendingUp size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>Comece a ler para ver seu progresso aqui!</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, textAlign: 'center' },
  section: { gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  progressItem: { gap: 8 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 14, color: colors.text },
  progressPercent: { fontSize: 14, color: colors.textMuted },
  progressBar: { height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  emptyState: { alignItems: 'center', gap: 12, paddingVertical: 24 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
});
