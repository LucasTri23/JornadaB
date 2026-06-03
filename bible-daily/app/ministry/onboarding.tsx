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
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import { updateMinistryProfile, useMinistryProfile, PublisherType } from '@/lib/ministry-hooks';
import { useQueryClient } from '@tanstack/react-query';

const PUBLISHER_TYPES: { value: PublisherType; label: string; desc: string }[] = [
  { value: 'PUBLISHER', label: 'Publicador', desc: 'Registra apenas estudos bíblicos e participação' },
  { value: 'AUXILIARY_PIONEER', label: 'Pioneiro Auxiliar', desc: 'Meta de 30h/mês (ou 15h em mês especial)' },
  {
    value: 'INDEFINITE_AUXILIARY_PIONEER',
    label: 'Pio. Auxiliar Permanente',
    desc: 'Meta mensal 30h (ou 15h especial). Sem meta anual',
  },
  { value: 'REGULAR_PIONEER', label: 'Pioneiro Regular', desc: 'Meta anual 600h. Ref. 50h/mês. Permite créditos' },
];

export default function OnboardingScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [reportName, setReportName] = useState('');
  const [congregation, setCongregation] = useState('');

  // Step 2
  const [publisherType, setPublisherType] = useState<PublisherType>('PUBLISHER');

  // Step 3
  const [useReturnVisits, setUseReturnVisits] = useState(true);
  const [useBibleStudies, setUseBibleStudies] = useState(true);
  const [remindToRegister, setRemindToRegister] = useState(true);

  async function handleFinish() {
    setLoading(true);
    try {
      await updateMinistryProfile(userId, {
        report_name: reportName.trim() || null,
        congregation: congregation.trim() || null,
        publisher_type: publisherType,
        use_return_visits: useReturnVisits,
        use_bible_studies: useBibleStudies,
        remind_to_register: remindToRegister,
        onboarding_completed: true,
      });
      queryClient.invalidateQueries({ queryKey: ['ministry_profile', userId] });
      router.replace('/(tabs)/ministry');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar as configurações.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Progress dots */}
        <View style={styles.dots}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={[styles.dot, step === s && styles.dotActive]} />
          ))}
        </View>

        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Seus dados para o relatório</Text>
            <Text style={styles.stepDesc}>
              Essas informações aparecem no seu relatório mensal.
            </Text>

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

            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
              <Text style={styles.nextBtnText}>Próximo</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Sua modalidade</Text>
            <Text style={styles.stepDesc}>Escolha como você serve.</Text>

            {PUBLISHER_TYPES.map((pt) => (
              <TouchableOpacity
                key={pt.value}
                style={[styles.optionCard, publisherType === pt.value && styles.optionCardActive]}
                onPress={() => setPublisherType(pt.value)}
              >
                <View style={styles.optionRow}>
                  <View style={[styles.radio, publisherType === pt.value && styles.radioActive]} />
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{pt.label}</Text>
                    <Text style={styles.optionDesc}>{pt.desc}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(1)}>
                <Text style={styles.backBtnText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)}>
                <Text style={styles.nextBtnText}>Próximo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Funcionalidades</Text>
            <Text style={styles.stepDesc}>Ative o que você quer usar.</Text>

            <ToggleRow
              label="Revisitas"
              description="Gerencie suas revisitas e próximas visitas"
              value={useReturnVisits}
              onToggle={setUseReturnVisits}
            />
            <ToggleRow
              label="Estudos bíblicos"
              description="Acompanhe seus estudos bíblicos"
              value={useBibleStudies}
              onToggle={setUseBibleStudies}
            />
            <ToggleRow
              label="Lembretes de registro"
              description="Receba lembretes para registrar horas"
              value={remindToRegister}
              onToggle={setRemindToRegister}
            />

            <View style={styles.btnRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => setStep(2)}>
                <Text style={styles.backBtnText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.nextBtn, loading && styles.btnDisabled]}
                onPress={handleFinish}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.nextBtnText}>Concluir</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
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
  content: { padding: 24, gap: 20 },

  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  dotActive: { backgroundColor: colors.primary, width: 24 },

  stepContainer: { gap: 16 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  stepDesc: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },

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

  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  optionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    marginTop: 2,
  },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { flex: 1, gap: 2 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  optionDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 16 },

  btnRow: { flexDirection: 'row', gap: 12 },
  nextBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  backBtn: {
    flex: 0.5,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: { color: colors.text, fontSize: 16, fontWeight: '500' },
  btnDisabled: { opacity: 0.6 },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
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
});
