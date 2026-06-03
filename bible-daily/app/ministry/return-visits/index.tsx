import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import { useReturnVisits, ReturnVisit, ReturnVisitStatus } from '@/lib/ministry-hooks';

const STATUS_FILTERS: { label: string; value: ReturnVisitStatus | undefined }[] = [
  { label: 'Todas', value: undefined },
  { label: 'Pendentes', value: 'PENDING' },
  { label: 'Visitadas', value: 'VISITED' },
  { label: 'Encerradas', value: 'CLOSED' },
];

const STATUS_BADGE: Record<ReturnVisitStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: colors.warning },
  VISITED: { label: 'Visitado', color: colors.success },
  RESCHEDULE: { label: 'Remarcar', color: colors.primary },
  BECAME_STUDY: { label: 'Virou estudo', color: colors.primaryLight },
  CLOSED: { label: 'Encerrado', color: colors.textMuted },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function ReturnVisitsScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const [activeFilter, setActiveFilter] = useState<ReturnVisitStatus | undefined>(undefined);

  const { data: visits, isLoading } = useReturnVisits(userId, activeFilter);

  function renderItem({ item }: { item: ReturnVisit }) {
    const badge = STATUS_BADGE[item.status];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/ministry/return-visits/${item.id}`)}
      >
        <View style={styles.cardTop}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={[styles.badge, { backgroundColor: badge.color + '22' }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>
        {item.next_visit_date ? (
          <Text style={styles.cardDate}>Próxima visita: {formatDate(item.next_visit_date)}</Text>
        ) : null}
        {item.subject_discussed ? (
          <Text style={styles.cardSub} numberOfLines={1}>{item.subject_discussed}</Text>
        ) : null}
        {item.address_reference ? (
          <Text style={styles.cardAddr} numberOfLines={1}>{item.address_reference}</Text>
        ) : null}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Revisitas</Text>
        <TouchableOpacity
          style={[styles.headerBtn, styles.addBtn]}
          onPress={() => router.push('/ministry/return-visits/new')}
        >
          <Plus size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={String(f.value)}
            style={[styles.filterBtn, activeFilter === f.value && styles.filterBtnActive]}
            onPress={() => setActiveFilter(f.value)}
          >
            <Text style={[styles.filterText, activeFilter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={visits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhuma revisita encontrada.</Text>
              <TouchableOpacity
                style={styles.newBtn}
                onPress={() => router.push('/ministry/return-visits/new')}
              >
                <Text style={styles.newBtnText}>+ Nova revisita</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  addBtn: { alignItems: 'flex-end' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text },

  filters: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: { backgroundColor: colors.primary + '22', borderColor: colors.primary },
  filterText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  filterTextActive: { color: colors.primary },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, gap: 12 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.text, flex: 1 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardDate: { fontSize: 13, color: colors.primary },
  cardSub: { fontSize: 12, color: colors.textMuted },
  cardAddr: { fontSize: 12, color: colors.textMuted },

  empty: { flex: 1, alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textMuted },
  newBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  newBtnText: { color: '#fff', fontWeight: '600' },
});
