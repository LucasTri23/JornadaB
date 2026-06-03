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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2, Edit3, Check, Plus } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import {
  BibleStudy,
  BibleStudyStatus,
  StudySession,
  updateBibleStudy,
  deleteBibleStudy,
  useStudySessions,
  addStudySession,
  formatMinutes,
} from '@/lib/ministry-hooks';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const STATUS_OPTIONS: { value: BibleStudyStatus; label: string; color: string }[] = [
  { value: 'ACTIVE', label: 'Ativo', color: colors.success },
  { value: 'PAUSED', label: 'Pausado', color: colors.warning },
  { value: 'CLOSED', label: 'Encerrado', color: colors.textMuted },
];

function formatDate(d: string | null): string {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

const today = new Date().toISOString().split('T')[0];

export default function BibleStudyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);

  const { data: study, isLoading } = useQuery({
    queryKey: ['bible_study', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministry_bible_studies')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as BibleStudy;
    },
    enabled: !!id,
  });

  const sessionsQuery = useStudySessions(id ?? '');

  // Edit state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [usualDayTime, setUsualDayTime] = useState('');
  const [publication, setPublication] = useState('');
  const [currentLesson, setCurrentLesson] = useState('');
  const [nextStudyDate, setNextStudyDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<BibleStudyStatus>('ACTIVE');

  // Session modal state
  const [sessionDate, setSessionDate] = useState(today);
  const [sessionHours, setSessionHours] = useState('');
  const [sessionMinutes, setSessionMinutes] = useState('');
  const [sessionLesson, setSessionLesson] = useState('');
  const [sessionNotes, setSessionNotes] = useState('');
  const [savingSession, setSavingSession] = useState(false);

  useEffect(() => {
    if (study) {
      setName(study.name);
      setPhone(study.phone ?? '');
      setAddress(study.address_reference ?? '');
      setUsualDayTime(study.usual_day_time ?? '');
      setPublication(study.publication ?? '');
      setCurrentLesson(study.current_lesson ?? '');
      setNextStudyDate(study.next_study_date ?? '');
      setNotes(study.notes ?? '');
      setStatus(study.status);
    }
  }, [study]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      await updateBibleStudy(id!, {
        name: name.trim(),
        phone: phone.trim() || null,
        address_reference: address.trim() || null,
        usual_day_time: usualDayTime.trim() || null,
        publication: publication.trim() || null,
        current_lesson: currentLesson.trim() || null,
        next_study_date: nextStudyDate.trim() || null,
        notes: notes.trim() || null,
        status,
      });
      queryClient.invalidateQueries({ queryKey: ['bible_study', id] });
      queryClient.invalidateQueries({ queryKey: ['bible_studies', userId] });
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(s: BibleStudyStatus) {
    setStatus(s);
    try {
      await updateBibleStudy(id!, { status: s });
      queryClient.invalidateQueries({ queryKey: ['bible_study', id] });
      queryClient.invalidateQueries({ queryKey: ['bible_studies', userId] });
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível atualizar status.');
    }
  }

  async function handleDelete() {
    Alert.alert('Confirmar', 'Deseja excluir este estudo bíblico?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBibleStudy(id!);
            queryClient.invalidateQueries({ queryKey: ['bible_studies', userId] });
            router.back();
          } catch (e: any) {
            Alert.alert('Erro', e?.message ?? 'Não foi possível excluir.');
          }
        },
      },
    ]);
  }

  async function handleAddSession() {
    const totalMin =
      (parseInt(sessionHours || '0', 10) * 60) + parseInt(sessionMinutes || '0', 10);
    if (!sessionDate || totalMin <= 0) {
      Alert.alert('Atenção', 'Informe a data e duração da sessão.');
      return;
    }
    setSavingSession(true);
    try {
      await addStudySession({
        user_id: userId,
        bible_study_id: id!,
        session_date: sessionDate,
        minutes: totalMin,
        lesson_studied: sessionLesson.trim() || null,
        notes: sessionNotes.trim() || null,
      });
      queryClient.invalidateQueries({ queryKey: ['study_sessions', id] });
      setShowSessionModal(false);
      setSessionDate(today);
      setSessionHours('');
      setSessionMinutes('');
      setSessionLesson('');
      setSessionNotes('');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível registrar sessão.');
    } finally {
      setSavingSession(false);
    }
  }

  if (isLoading) {
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
        <Text style={styles.headerTitle} numberOfLines={1}>
          {study?.name ?? 'Estudo'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => (editing ? handleSave() : setEditing(true))} style={styles.iconBtn}>
            {saving ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : editing ? (
              <Check size={22} color={colors.success} />
            ) : (
              <Edit3 size={22} color={colors.primary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.iconBtn}>
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.statusBtn,
                  status === opt.value && { backgroundColor: opt.color + '22', borderColor: opt.color },
                ]}
                onPress={() => handleStatusChange(opt.value)}
              >
                <Text style={[styles.statusBtnText, status === opt.value && { color: opt.color }]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Fields */}
        {editing ? (
          <View style={styles.section}>
            <EditField label="Nome *" value={name} onChange={setName} autoCapitalize="words" />
            <EditField label="Telefone" value={phone} onChange={setPhone} keyboardType="phone-pad" />
            <EditField label="Endereço / referência" value={address} onChange={setAddress} />
            <EditField label="Dia e horário habitual" value={usualDayTime} onChange={setUsualDayTime} />
            <EditField label="Publicação" value={publication} onChange={setPublication} />
            <EditField label="Lição atual" value={currentLesson} onChange={setCurrentLesson} />
            <EditField label="Próximo estudo" value={nextStudyDate} onChange={setNextStudyDate} placeholder="AAAA-MM-DD" keyboardType="numeric" />
            <EditField label="Observações" value={notes} onChange={setNotes} multiline />
          </View>
        ) : (
          <View style={styles.section}>
            <InfoRow label="Nome" value={name} />
            <InfoRow label="Telefone" value={phone || '—'} />
            <InfoRow label="Endereço / referência" value={address || '—'} />
            <InfoRow label="Dia e horário habitual" value={usualDayTime || '—'} />
            <InfoRow label="Publicação" value={publication || '—'} />
            <InfoRow label="Lição atual" value={currentLesson || '—'} highlight />
            <InfoRow label="Próximo estudo" value={formatDate(nextStudyDate || null)} highlight />
            <InfoRow label="Último estudo" value={formatDate(study?.last_study_date ?? null)} />
            <InfoRow label="Observações" value={notes || '—'} />
          </View>
        )}

        {/* Sessions */}
        <View style={styles.section}>
          <View style={styles.sessionsHeader}>
            <Text style={styles.sectionTitle}>Sessões anteriores</Text>
            <TouchableOpacity style={styles.addSessionBtn} onPress={() => setShowSessionModal(true)}>
              <Plus size={16} color={colors.primary} />
              <Text style={styles.addSessionText}>Registrar sessão</Text>
            </TouchableOpacity>
          </View>

          {sessionsQuery.isLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (sessionsQuery.data ?? []).length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma sessão registrada.</Text>
          ) : (
            (sessionsQuery.data ?? []).map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionTop}>
                  <Text style={styles.sessionDate}>{formatDate(session.session_date)}</Text>
                  <Text style={styles.sessionDuration}>{formatMinutes(session.minutes)}</Text>
                </View>
                {session.lesson_studied ? (
                  <Text style={styles.sessionLesson}>Lição: {session.lesson_studied}</Text>
                ) : null}
                {session.notes ? (
                  <Text style={styles.sessionNotes}>{session.notes}</Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Session modal */}
      <Modal
        visible={showSessionModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSessionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Registrar sessão</Text>

            <Text style={styles.label}>Data</Text>
            <TextInput
              style={styles.input}
              value={sessionDate}
              onChangeText={setSessionDate}
              placeholder="AAAA-MM-DD"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Duração</Text>
            <View style={styles.durationRow}>
              <View style={styles.durationField}>
                <TextInput
                  style={styles.durationInput}
                  value={sessionHours}
                  onChangeText={setSessionHours}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.durationUnit}>h</Text>
              </View>
              <View style={styles.durationField}>
                <TextInput
                  style={styles.durationInput}
                  value={sessionMinutes}
                  onChangeText={setSessionMinutes}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <Text style={styles.durationUnit}>min</Text>
              </View>
            </View>

            <Text style={styles.label}>Lição estudada</Text>
            <TextInput
              style={styles.input}
              value={sessionLesson}
              onChangeText={setSessionLesson}
              placeholder="Ex: Lição 5"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={sessionNotes}
              onChangeText={setSessionNotes}
              placeholder="Notas da sessão..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowSessionModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, savingSession && styles.saveBtnDisabled]}
                onPress={handleAddSession}
                disabled={savingSession}
              >
                {savingSession ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, highlight && { color: colors.primary }]}>{value}</Text>
    </View>
  );
}

function EditField({
  label, value, onChange, placeholder, multiline, keyboardType, autoCapitalize,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; multiline?: boolean; keyboardType?: any; autoCapitalize?: any;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textArea]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
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
  },
  headerBtn: { width: 40 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: colors.text },
  headerActions: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  content: { padding: 20, gap: 20 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase' },

  statusRow: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBtnText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },

  infoRow: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  infoLabel: { fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', fontWeight: '600' },
  infoValue: { fontSize: 15, color: colors.text },

  sessionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary + '18',
    borderRadius: 16,
  },
  addSessionText: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  emptyText: { fontSize: 13, color: colors.textMuted },

  sessionCard: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  sessionTop: { flexDirection: 'row', justifyContent: 'space-between' },
  sessionDate: { fontSize: 13, color: colors.text, fontWeight: '600' },
  sessionDuration: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  sessionLesson: { fontSize: 12, color: colors.textMuted },
  sessionNotes: { fontSize: 12, color: colors.textMuted },

  field: { gap: 6 },
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
  textArea: { minHeight: 80, paddingTop: 13 },

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

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 4 },
  modalBtnRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: colors.text, fontSize: 15, fontWeight: '500' },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
