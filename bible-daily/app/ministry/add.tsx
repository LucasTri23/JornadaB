import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import {
  useMinistryProfile,
  addMinistryEntry,
  ActivityType,
} from '@/lib/ministry-hooks';
import { useQueryClient } from '@tanstack/react-query';

const ACTIVITIES: { type: ActivityType; emoji: string; label: string; isCredit?: boolean }[] = [
  { type: 'FIELD_SERVICE', emoji: '🏠', label: 'Campo' },
  { type: 'INFORMAL_WITNESSING', emoji: '💬', label: 'Testemunho informal' },
  { type: 'CART_WITNESSING', emoji: '🛒', label: 'Carrinho' },
  { type: 'RETURN_VISIT', emoji: '🔄', label: 'Revisita' },
  { type: 'BIBLE_STUDY', emoji: '📖', label: 'Estudo bíblico' },
  { type: 'LDC_CREDIT', emoji: '🏗️', label: 'LDC/Crédito', isCredit: true },
  { type: 'COURSE_CREDIT', emoji: '📚', label: 'Curso/Crédito', isCredit: true },
  { type: 'OTHER_CREDIT', emoji: '⭐', label: 'Outro crédito', isCredit: true },
  { type: 'OTHER', emoji: '📝', label: 'Outro' },
];

const QUICK_MINUTES = [
  { label: '15min', value: 15 },
  { label: '30min', value: 30 },
  { label: '1h', value: 60 },
  { label: '1h30', value: 90 },
  { label: '2h', value: 120 },
];

const today = new Date().toISOString().split('T')[0];

export default function AddEntryScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const profileQuery = useMinistryProfile(userId);
  const isRegularPioneer = profileQuery.data?.publisher_type === 'REGULAR_PIONEER';

  const [entryDate, setEntryDate] = useState(today);
  const [activityType, setActivityType] = useState<ActivityType>('FIELD_SERVICE');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const visibleActivities = isRegularPioneer
    ? ACTIVITIES
    : ACTIVITIES.filter((a) => !a.isCredit);

  function applyQuickMinutes(totalMin: number) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    setHours(h > 0 ? String(h) : '');
    setMinutes(m > 0 ? String(m) : '');
  }

  async function handleSave() {
    const totalMinutes = (parseInt(hours || '0', 10) * 60) + parseInt(minutes || '0', 10);
    if (!entryDate) {
      Alert.alert('Atenção', 'Informe a data.');
      return;
    }
    if (totalMinutes <= 0) {
      Alert.alert('Atenção', 'Informe a duração.');
      return;
    }

    const selectedActivity = ACTIVITIES.find((a) => a.type === activityType);
    const isCredit = selectedActivity?.isCredit ?? false;

    setLoading(true);
    try {
      await addMinistryEntry({
        user_id: userId,
        entry_date: entryDate,
        activity_type: activityType,
        minutes: totalMinutes,
        is_credit: isCredit,
        credit_type: isCredit ? activityType : null,
        notes: notes.trim() || null,
      });
      queryClient.invalidateQueries({ queryKey: ['ministry_entries', userId] });
      router.back();
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar o registro.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Registrar atividade</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Date */}
        <View style={styles.section}>
          <Text style={styles.label}>Data</Text>
          <TextInput
            style={styles.input}
            value={entryDate}
            onChangeText={setEntryDate}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        {/* Activity type */}
        <View style={styles.section}>
          <Text style={styles.label}>Tipo de atividade</Text>
          <View style={styles.activityGrid}>
            {visibleActivities.map((act) => (
              <TouchableOpacity
                key={act.type}
                style={[
                  styles.activityCard,
                  activityType === act.type && styles.activityCardActive,
                ]}
                onPress={() => setActivityType(act.type)}
              >
                <Text style={styles.activityEmoji}>{act.emoji}</Text>
                <Text
                  style={[
                    styles.activityLabel,
                    activityType === act.type && styles.activityLabelActive,
                  ]}
                  numberOfLines={2}
                >
                  {act.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <Text style={styles.label}>Duração</Text>
          <View style={styles.durationRow}>
            <View style={styles.durationField}>
              <TextInput
                style={styles.durationInput}
                value={hours}
                onChangeText={setHours}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.durationUnit}>horas</Text>
            </View>
            <View style={styles.durationField}>
              <TextInput
                style={styles.durationInput}
                value={minutes}
                onChangeText={setMinutes}
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={styles.durationUnit}>min</Text>
            </View>
          </View>

          <View style={styles.quickRow}>
            {QUICK_MINUTES.map((q) => (
              <TouchableOpacity
                key={q.value}
                style={styles.quickBtn}
                onPress={() => applyQuickMinutes(q.value)}
              >
                <Text style={styles.quickBtnText}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Observação (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Adicione uma nota..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Salvar registro</Text>
          )}
        </TouchableOpacity>
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
  backBtn: { width: 40 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text },

  content: { padding: 20, gap: 24 },
  section: { gap: 10 },
  label: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.text,
    fontSize: 16,
  },
  textArea: { minHeight: 80, paddingTop: 14 },

  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityCard: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
    minHeight: 72,
    justifyContent: 'center',
  },
  activityCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '18' },
  activityEmoji: { fontSize: 24 },
  activityLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 14 },
  activityLabelActive: { color: colors.primaryLight },

  durationRow: { flexDirection: 'row', gap: 12 },
  durationField: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  durationInput: { flex: 1, fontSize: 20, fontWeight: '600', color: colors.text },
  durationUnit: { fontSize: 14, color: colors.textMuted },

  quickRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.surfaceLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickBtnText: { fontSize: 13, color: colors.text, fontWeight: '500' },

  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
