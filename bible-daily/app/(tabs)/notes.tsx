import { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, Modal, KeyboardAvoidingView, Platform,
  FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Plus, FileText, X, Trash2, ChevronRight, Users, BookOpen, Phone, Calendar } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useNotes, addNote, deleteNote } from '@/lib/supabase-hooks';
import { useAuthStore } from '@/store/auth';
import { useReturnVisits, useBibleStudies } from '@/lib/ministry-hooks';

type Tab = 'notas' | 'revisitas' | 'estudos';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente', VISITED: 'Visitado', RESCHEDULE: 'Remarcar',
  BECAME_STUDY: 'Virou estudo', CLOSED: 'Encerrado',
  ACTIVE: 'Ativo', PAUSED: 'Pausado',
};
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#f59e0b', VISITED: colors.success, RESCHEDULE: colors.primary,
  BECAME_STUDY: '#ec4899', CLOSED: colors.textMuted,
  ACTIVE: colors.success, PAUSED: '#f59e0b',
};

export default function NotesScreen() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('notas');
  const [noteModal, setNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: notes = [], isLoading: loadingNotes } = useNotes();
  const { data: returnVisits = [], isLoading: loadingVisits } = useReturnVisits(user?.id ?? '');
  const { data: bibleStudies = [], isLoading: loadingStudies } = useBibleStudies(user?.id ?? '');

  async function handleSaveNote() {
    if (!noteContent.trim() || !user?.id) return;
    setSaving(true);
    await addNote(user.id, { title: noteTitle || undefined, content: noteContent });
    setNoteTitle(''); setNoteContent('');
    setNoteModal(false); setSaving(false);
  }

  async function handleDeleteNote(id: string) {
    Alert.alert('Excluir nota', 'Deseja excluir esta anotação?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteNote(id) },
    ]);
  }

  const tabDefs = [
    { id: 'notas' as Tab, label: 'Anotações', icon: FileText },
    { id: 'revisitas' as Tab, label: 'Revisitas', icon: Users },
    { id: 'estudos' as Tab, label: 'Estudos', icon: BookOpen },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notas</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            if (tab === 'notas') setNoteModal(true);
            else if (tab === 'revisitas') router.push('/ministry/return-visits/new');
            else router.push('/ministry/bible-studies/new');
          }}
        >
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Sub-tabs */}
      <View style={styles.subTabs}>
        {tabDefs.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <TouchableOpacity key={t.id} style={[styles.subTab, active && styles.subTabActive]} onPress={() => setTab(t.id)}>
              <Icon size={13} color={active ? '#fff' : colors.textMuted} />
              <Text style={[styles.subTabText, active && styles.subTabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ANOTAÇÕES */}
      {tab === 'notas' && (
        loadingNotes ? <ActivityIndicator color={colors.primary} style={styles.loader} /> :
        notes.length === 0 ? (
          <EmptyState icon={<FileText size={44} color={colors.textMuted} />} text="Nenhuma anotação" sub="Toque no + para adicionar" />
        ) : (
          <FlatList
            data={notes}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.noteCard}>
                <View style={styles.noteBody}>
                  {item.title ? <Text style={styles.noteTitle}>{item.title}</Text> : null}
                  <Text style={styles.noteContent} numberOfLines={3}>{item.content}</Text>
                  <Text style={styles.noteDate}>{new Date(item.created_at).toLocaleDateString('pt-BR')}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDeleteNote(item.id)} style={styles.deleteBtn}>
                  <Trash2 size={15} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
          />
        )
      )}

      {/* REVISITAS */}
      {tab === 'revisitas' && (
        loadingVisits ? <ActivityIndicator color={colors.primary} style={styles.loader} /> :
        returnVisits.length === 0 ? (
          <EmptyState icon={<Users size={44} color={colors.textMuted} />} text="Nenhuma revisita" sub="Toque no + para adicionar" />
        ) : (
          <FlatList
            data={returnVisits}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.personCard} onPress={() => router.push(`/ministry/return-visits/${item.id}`)}>
                <View style={styles.personBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.personName}>{item.name}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  {item.subject_discussed && <Text style={styles.personDetail} numberOfLines={1}>{item.subject_discussed}</Text>}
                  <View style={styles.metaRow}>
                    {item.phone && <MetaItem icon={<Phone size={11} color={colors.textMuted} />} text={item.phone} />}
                    {item.next_visit_date && <MetaItem icon={<Calendar size={11} color={colors.textMuted} />} text={new Date(item.next_visit_date + 'T00:00:00').toLocaleDateString('pt-BR')} />}
                  </View>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          />
        )
      )}

      {/* ESTUDOS */}
      {tab === 'estudos' && (
        loadingStudies ? <ActivityIndicator color={colors.primary} style={styles.loader} /> :
        bibleStudies.length === 0 ? (
          <EmptyState icon={<BookOpen size={44} color={colors.textMuted} />} text="Nenhum estudo bíblico" sub="Toque no + para adicionar" />
        ) : (
          <FlatList
            data={bibleStudies}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.personCard} onPress={() => router.push(`/ministry/bible-studies/${item.id}`)}>
                <View style={styles.personBody}>
                  <View style={styles.nameRow}>
                    <Text style={styles.personName}>{item.name}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  {item.publication && (
                    <Text style={styles.personDetail} numberOfLines={1}>
                      {item.publication}{item.current_lesson ? ` — Lição ${item.current_lesson}` : ''}
                    </Text>
                  )}
                  <View style={styles.metaRow}>
                    {item.usual_day_time && <MetaItem icon={<Calendar size={11} color={colors.textMuted} />} text={item.usual_day_time} />}
                    {item.next_study_date && (
                      <MetaItem
                        icon={<Calendar size={11} color={colors.primary} />}
                        text={`Próximo: ${new Date(item.next_study_date + 'T00:00:00').toLocaleDateString('pt-BR')}`}
                        color={colors.primary}
                      />
                    )}
                  </View>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          />
        )
      )}

      {/* Add Note Modal */}
      <Modal visible={noteModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova anotação</Text>
              <TouchableOpacity onPress={() => { setNoteModal(false); setNoteTitle(''); setNoteContent(''); }}>
                <X size={22} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.titleInput} value={noteTitle} onChangeText={setNoteTitle} placeholder="Título (opcional)" placeholderTextColor={colors.textMuted} color={colors.text} />
            <TextInput style={styles.contentInput} value={noteContent} onChangeText={setNoteContent} placeholder="Escreva sua anotação..." placeholderTextColor={colors.textMuted} color={colors.text} multiline textAlignVertical="top" />
            <TouchableOpacity style={[styles.saveBtn, (!noteContent.trim() || saving) && styles.saveBtnDisabled]} onPress={handleSaveNote} disabled={!noteContent.trim() || saving}>
              {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Salvar</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub: string }) {
  return (
    <View style={styles.empty}>
      {icon}
      <Text style={styles.emptyText}>{text}</Text>
      <Text style={styles.emptySubtext}>{sub}</Text>
    </View>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] ?? colors.textMuted;
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.statusText, { color }]}>{STATUS_LABELS[status] ?? status}</Text>
    </View>
  );
}

function MetaItem({ icon, text, color }: { icon: React.ReactNode; text: string; color?: string }) {
  return (
    <View style={styles.metaItem}>
      {icon}
      <Text style={[styles.metaText, color ? { color } : null]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: colors.text },
  addBtn: { backgroundColor: colors.primary, width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  loader: { marginTop: 60 },

  subTabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: colors.border },
  subTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8 },
  subTabActive: { backgroundColor: colors.primary },
  subTabText: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  subTabTextActive: { color: '#fff', fontWeight: '600' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textMuted },
  emptySubtext: { fontSize: 13, color: colors.textMuted },

  list: { padding: 16, gap: 10, paddingBottom: 24 },

  noteCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, flexDirection: 'row', borderWidth: 1, borderColor: colors.border, gap: 10 },
  noteBody: { flex: 1, gap: 4 },
  noteTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  noteContent: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  noteDate: { fontSize: 11, color: colors.border, marginTop: 2 },
  deleteBtn: { padding: 4, alignSelf: 'flex-start' },

  personCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 10 },
  personBody: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  personName: { fontSize: 15, fontWeight: '600', color: colors.text },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '600' },
  personDetail: { fontSize: 12, color: colors.textMuted },
  metaRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: colors.textMuted },

  modalOverlay: { flex: 1, backgroundColor: '#000000bb', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 12, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  titleInput: { backgroundColor: colors.surfaceLight, borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: colors.border },
  contentInput: { backgroundColor: colors.surfaceLight, borderRadius: 10, padding: 12, fontSize: 14, borderWidth: 1, borderColor: colors.border, minHeight: 140 },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 10, padding: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
