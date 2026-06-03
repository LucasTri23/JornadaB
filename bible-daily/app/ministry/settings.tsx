import { useState, useEffect } from 'react';
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
import { ArrowLeft, Check } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import {
  useMinistryProfile,
  updateMinistryProfile,
  PublisherType,
} from '@/lib/ministry-hooks';
import { useQueryClient } from '@tanstack/react-query';

const PUBLISHER_TYPES: { value: PublisherType; label: string }[] = [
  { value: 'PUBLISHER', label: 'Publicador' },
  { value: 'AUXILIARY_PIONEER', label: 'Pioneiro Auxiliar' },
  { value: 'INDEFINITE_AUXILIARY_PIONEER', label: 'Pio. Auxiliar Permanente' },
  { value: 'REGULAR_PIONEER', label: 'Pioneiro Regular' },
];

export default function MinistrySettingsScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const profileQuery = useMinistryProfile(userId);
  const [saving, setSaving] = useState(false);

  const [reportName, setReportName] = useState('');
  const [congregation, setCongregation] = useState('');
  const [publisherType, setPublisherType] = useState<PublisherType>('PUBLISHER');
  const [defaultContact, setDefaultContact] = useState('');
  const [includeObservation, setIncludeObservation] = useState(false);
  const [useReturnVisits, setUseReturnVisits] = useState(true);
  const [useBibleStudies, setUseBibleStudies] = useState(true);
  const [remindToRegister, setRemindToRegister] = useState(true);

  useEffect(() => {
    if (profileQuery.data) {
      const p = profileQuery.data;
      setReportName(p.report_name ?? '');
      setCongregation(p.congregation ?? '');
      setPublisherType(p.publisher_type);
      setDefaultContact(p.default_report_contact ?? '');
      setIncludeObservation(p.include_observation ?? false);
      setUseReturnVisits(p.use_return_visits ?? true);
      setUseBibleStudies(p.use_bible_studies ?? true);
      setRemindToRegister(p.remind_to_register ?? true);
    }
  }, [profileQuery.data]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateMinistryProfile(userId, {
        report_name: reportName.trim() || null,
        congregation: congregation.trim() || null,
        publisher_type: publisherType,
        default_report_contact: defaultContact.trim() || null,
        include_observation: includeObservation,
        use_return_visits: useReturnVisits,
        use_bible_studies: useBibleStudies,
        remind_to_register: remindToRegister,
      });
      queryClient.invalidateQueries({ queryKey: ['ministry_profile', userId] });
      Alert.alert('Salvo', 'Configurações atualizadas com sucesso.');
      router.back();
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações do ministério</Text>
        <TouchableOpacity onPress={handleSave} style={styles.headerBtn} disabled={saving}>
          {saving ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Check size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Report info */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Dados do relatório</Text>

          <Text style={styles.label}>Nome no relatório</Text>
          <TextInput
            style={styles.input}
            value={reportName}
            onChangeText={setReportName}
            placeholder="Ex: João Silva"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Congregação</Text>
          <TextInput
            style={styles.input}
            value={congregation}
            onChangeText={setCongregation}
            placeholder="Ex: Congregação Central"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Contato padrão (WhatsApp)</Text>
          <TextInput
            style={styles.input}
            value={defaultContact}
            onChangeText={setDefaultContact}
            placeholder="Ex: 11999999999"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />
        </View>

        {/* Publisher type */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Modalidade</Text>
          <View style={styles.typeGrid}>
            {PUBLISHER_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt.value}
                style={[styles.typeBtn, publisherType === pt.value && styles.typeBtnActive]}
                onPress={() => setPublisherType(pt.value)}
              >
                <Text
                  style={[styles.typeBtnText, publisherType === pt.value && styles.typeBtnTextActive]}
                  numberOfLines={2}
                >
                  {pt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Toggles */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>Funcionalidades</Text>

          <ToggleRow
            label="Incluir observação"
            description="Incluir observação no relatório"
            value={includeObservation}
            onToggle={setIncludeObservation}
          />
          <ToggleRow
            label="Revisitas"
            description="Gerenciar revisitas"
            value={useReturnVisits}
            onToggle={setUseReturnVisits}
          />
          <ToggleRow
            label="Estudos bíblicos"
            description="Acompanhar estudos"
            value={useBibleStudies}
            onToggle={setUseBibleStudies}
          />
          <ToggleRow
            label="Lembretes de registro"
            description="Receber lembretes para registrar"
            value={remindToRegister}
            onToggle={setRemindToRegister}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Salvar configurações</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  label, description, value, onToggle,
}: {
  label: string; description: string; value: boolean; onToggle: (v: boolean) => void;
}) {
  return (
    <TouchableOpacity style={styles.toggleRow} onPress={() => onToggle(!value)}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{description}</Text>
      </View>
      <View style={[styles.toggleTrack, value && styles.toggleTrackActive]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </View>
    </TouchableOpacity>
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
  headerBtn: { width: 40, alignItems: 'flex-end' },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text, flex: 1, textAlign: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  content: { padding: 20, gap: 24 },
  group: { gap: 12 },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },

  label: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 15,
  },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '48%',
  },
  typeBtnActive: { backgroundColor: colors.primary + '22', borderColor: colors.primary },
  typeBtnText: { fontSize: 13, color: colors.textMuted, fontWeight: '500', textAlign: 'center' },
  typeBtnTextActive: { color: colors.primary },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 15, fontWeight: '500', color: colors.text },
  toggleDesc: { fontSize: 12, color: colors.textMuted },
  toggleTrack: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceLight,
    padding: 2,
    justifyContent: 'center',
  },
  toggleTrackActive: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.textMuted,
  },
  toggleThumbActive: { backgroundColor: '#fff', marginLeft: 'auto' },

  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
