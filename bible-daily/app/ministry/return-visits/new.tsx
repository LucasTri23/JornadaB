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
import { createReturnVisit } from '@/lib/ministry-hooks';
import { useQueryClient } from '@tanstack/react-query';

export default function NewReturnVisitScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [firstConversationDate, setFirstConversationDate] = useState('');
  const [subject, setSubject] = useState('');
  const [scripture, setScripture] = useState('');
  const [nextVisitDate, setNextVisitDate] = useState('');
  const [notes, setNotes] = useState('');

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      const created = await createReturnVisit({
        user_id: userId,
        name: name.trim(),
        phone: phone.trim() || null,
        address_reference: address.trim() || null,
        first_conversation_date: firstConversationDate.trim() || null,
        subject_discussed: subject.trim() || null,
        scripture_used: scripture.trim() || null,
        next_visit_date: nextVisitDate.trim() || null,
        notes: notes.trim() || null,
        status: 'PENDING',
      });
      queryClient.invalidateQueries({ queryKey: ['return_visits', userId] });
      router.replace(`/ministry/return-visits/${created.id}`);
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Não foi possível salvar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova revisita</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Field label="Nome *" value={name} onChange={setName} placeholder="Nome da pessoa" autoCapitalize="words" />
        <Field label="Telefone" value={phone} onChange={setPhone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
        <Field label="Endereço / referência" value={address} onChange={setAddress} placeholder="Endereço ou ponto de referência" />
        <Field label="Data da primeira conversa" value={firstConversationDate} onChange={setFirstConversationDate} placeholder="AAAA-MM-DD" keyboardType="numeric" />
        <Field label="Assunto conversado" value={subject} onChange={setSubject} placeholder="Ex: O que a Bíblia promete..." multiline />
        <Field label="Texto bíblico usado" value={scripture} onChange={setScripture} placeholder="Ex: João 3:16" />
        <Field label="Próxima visita" value={nextVisitDate} onChange={setNextVisitDate} placeholder="AAAA-MM-DD" keyboardType="numeric" />
        <Field label="Observações" value={notes} onChange={setNotes} placeholder="Notas adicionais..." multiline />

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Salvar revisita</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
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
    justifyContent: 'space-between',
  },
  headerBtn: { width: 40 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text },

  content: { padding: 20, gap: 16 },
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
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
