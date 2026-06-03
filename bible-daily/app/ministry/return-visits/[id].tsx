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
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Trash2, Edit3, Check } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import {
  ReturnVisit,
  ReturnVisitStatus,
  updateReturnVisit,
  deleteReturnVisit,
} from '@/lib/ministry-hooks';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const STATUS_OPTIONS: { value: ReturnVisitStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pendente', color: colors.warning },
  { value: 'VISITED', label: 'Visitado', color: colors.success },
  { value: 'RESCHEDULE', label: 'Remarcar', color: colors.primary },
  { value: 'BECAME_STUDY', label: 'Virou estudo', color: colors.primaryLight },
  { value: 'CLOSED', label: 'Encerrado', color: colors.textMuted },
];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function ReturnVisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: visit, isLoading } = useQuery({
    queryKey: ['return_visit', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('return_visits')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ReturnVisit;
    },
    enabled: !!id,
  });

  // Edit state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [firstDate, setFirstDate] = useState('');
  const [subject, setSubject] = useState('');
  const [scripture, setScripture] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ReturnVisitStatus>('PENDING');

  useEffect(() => {
    if (visit) {
      setName(visit.name);
      setPhone(visit.phone ?? '');
      setAddress(visit.address_reference ?? '');
      setFirstDate(visit.first_conversation_date ?? '');
      setSubject(visit.subject_discussed ?? '');
      setScripture(visit.scripture_used ?? '');
      setNextDate(visit.next_visit_date ?? '');
      setNotes(visit.notes ?? '');
      setStatus(visit.status);
    }
  }, [visit]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      await updateReturnVisit(id!, {
        name: name.trim(),
        phone: phone.trim() || null,
        address_reference: address.trim() || null,
        first_conversation_date: firstDate.trim() || null,
        subject_discussed: subject.trim() || null,
        scripture_used: scripture.trim() || null,
        next_visit_date: nextDate.trim() || null,
        notes: notes.trim() || null,
        status,
      });
      queryClient.invalidateQueries({ queryKey: ['return_visit', id] });
      queryClient.invalidateQueries({ queryKey: ['return_visits', userId] });
      setEditing(false);
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(s: ReturnVisitStatus) {
    setStatus(s);
    try {
      await updateReturnVisit(id!, { status: s });
      queryClient.invalidateQueries({ queryKey: ['return_visit', id] });
      queryClient.invalidateQueries({ queryKey: ['return_visits', userId] });
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível atualizar status.');
    }
  }

  async function handleDelete() {
    Alert.alert('Confirmar', 'Deseja excluir esta revisita?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReturnVisit(id!);
            queryClient.invalidateQueries({ queryKey: ['return_visits', userId] });
            router.back();
          } catch (e: any) {
            Alert.alert('Erro', e?.message ?? 'Não foi possível excluir.');
          }
        },
      },
    ]);
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
          {visit?.name ?? 'Revisita'}
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
        {/* Status selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.statusBtn, status === opt.value && { backgroundColor: opt.color + '22', borderColor: opt.color }]}
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
            <EditField label="Data da primeira conversa" value={firstDate} onChange={setFirstDate} placeholder="AAAA-MM-DD" keyboardType="numeric" />
            <EditField label="Assunto conversado" value={subject} onChange={setSubject} multiline />
            <EditField label="Texto bíblico" value={scripture} onChange={setScripture} />
            <EditField label="Próxima visita" value={nextDate} onChange={setNextDate} placeholder="AAAA-MM-DD" keyboardType="numeric" />
            <EditField label="Observações" value={notes} onChange={setNotes} multiline />
          </View>
        ) : (
          <View style={styles.section}>
            <InfoRow label="Nome" value={name} />
            <InfoRow label="Telefone" value={phone || '—'} />
            <InfoRow label="Endereço / referência" value={address || '—'} />
            <InfoRow label="Primeira conversa" value={formatDate(firstDate || null)} />
            <InfoRow label="Assunto conversado" value={subject || '—'} />
            <InfoRow label="Texto bíblico" value={scripture || '—'} />
            <InfoRow label="Próxima visita" value={formatDate(nextDate || null)} highlight />
            <InfoRow label="Observações" value={notes || '—'} />
          </View>
        )}
      </ScrollView>
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
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
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

  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBtnText: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },

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
});
