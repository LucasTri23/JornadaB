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
import { useBibleStudies, BibleStudy, BibleStudyStatus } from '@/lib/ministry-hooks';

const STATUS_FILTERS: { label: string; value: BibleStudyStatus | undefined }[] = [
  { label: 'Ativos', value: 'ACTIVE' },
  { label: 'Pausados', value: 'PAUSED' },
  { label: 'Encerrados', value: 'CLOSED' },
];

const STATUS_BADGE: Record<BibleStudyStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Ativo', color: colors.success },
  PAUSED: { label: 'Pausado', color: colors.warning },
  CLOSED: { label: 'Encerrado', color: colors.textMuted },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function BibleStudiesScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const [activeFilter, setActiveFilter] = useState<BibleStudyStatus | undefined>('ACTIVE');

  const { data: studies, isLoading } = useBibleStudies(userId, activeFilter);

  function renderItem({ item }: { item: BibleStudy }) {
    const badge = STATUS_BADGE[item.status];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/ministry/bible-studies/${item.id}`)}
      >
        <View style={styles.cardTop}>
          <Text style={styles.cardName}>{item.name}</Text>
          <View style={[styles.badge, { backgroundColor: badge.color + '22' }]}>
            <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>
        {(item.publication || item.current_lesson) ? (
          <Text style={styles.cardPub} numberOfLines={1}>
            {item.publication}
            {item.current_lesson ? ` · Lição ${item.current_lesson}` : ''}
          </Text>
        ) : null}
        {item.next_study_date ? (
          <Text style={styles.cardDate}>Próximo estudo: {formatDate(item.next_study_date)}</Text>
        ) : null}
        {item.usual_day_time ? (
          <Text style={styles.cardSub} numberOfLines={1}>{item.usual_day_time}</Text>
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
        <Text style={styles.headerTitle}>Estudos bíblicos</Text>
        <TouchableOpacity
          style={[styles.headerBtn, styles.addBtn]}
          onPress={() => router.push('/ministry/bible-studies/new')}
        >
          <Plus size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

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
          data={studies}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhum estudo encontrado.</Text>
              <TouchableOpacity
                style={styles.newBtn}
                onPress={() => router.push('/ministry/bible-studies/new')}
              >
                <Text style={styles.newBtnText}>+ Novo estudo</Text>
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
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardPub: { fontSize: 13, color: colors.primary },
  cardDate: { fontSize: 12, color: colors.textMuted },
  cardSub: { fontSize: 12, color: colors.textMuted },

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
