import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, FileText, X } from 'lucide-react-native';
import { colors } from '@/lib/colors';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [modal, setModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  function saveNote() {
    if (!content.trim()) return;
    setNotes(prev => [{
      id: Date.now().toString(),
      title: title || 'Sem título',
      content,
      createdAt: new Date(),
    }, ...prev]);
    setTitle('');
    setContent('');
    setModal(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Notas</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModal(true)}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {notes.length === 0 ? (
          <View style={styles.empty}>
            <FileText size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Nenhuma nota ainda</Text>
            <Text style={styles.emptySubtext}>Toque no + para adicionar sua primeira nota</Text>
          </View>
        ) : (
          notes.map(note => (
            <View key={note.id} style={styles.noteCard}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.noteContent} numberOfLines={3}>{note.content}</Text>
              <Text style={styles.noteDate}>
                {note.createdAt.toLocaleDateString('pt-BR')}
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova nota</Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <X size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Título (opcional)"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="Escreva sua nota..."
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveNote}>
              <Text style={styles.saveBtnText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  addBtn: { backgroundColor: colors.primary, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20, gap: 12, flexGrow: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: colors.textMuted },
  emptySubtext: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  noteCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  noteContent: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  noteDate: { fontSize: 12, color: colors.border },
  modalOverlay: { flex: 1, backgroundColor: '#000000aa', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 16,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  titleInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  contentInput: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 150,
  },
  saveBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
