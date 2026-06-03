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
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Share2 } from 'lucide-react-native';
import { colors } from '@/lib/colors';
import { useAuthStore } from '@/store/auth';
import {
  useMinistryProfile,
  useMonthSummary,
  generateReportText,
  monthName,
} from '@/lib/ministry-hooks';

const now = new Date();

export default function ReportScreen() {
  const { user } = useAuthStore();
  const userId = user?.id ?? '';

  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [contact, setContact] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [editableText, setEditableText] = useState('');
  const [generated, setGenerated] = useState(false);

  const profileQuery = useMinistryProfile(userId);
  const summaryQuery = useMonthSummary(userId, month, year);

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setGenerated(false);
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setGenerated(false);
  }

  function handleGenerate() {
    const profile = profileQuery.data;
    const summary = summaryQuery.data;
    if (!profile) {
      Alert.alert('Atenção', 'Perfil não carregado.');
      return;
    }
    const text = generateReportText({
      name: profile.report_name ?? profile.congregation ?? 'Publicador',
      month,
      year,
      publisherType: summary?.publisherType ?? profile.publisher_type,
      ministryMinutes: summary?.ministryMinutes ?? 0,
      creditMinutes: summary?.creditMinutes ?? 0,
      bibleStudiesCount: summary?.bibleStudiesCount ?? 0,
      participated: summary?.participatedInMinistry ?? false,
    });
    setGeneratedText(text);
    setEditableText(text);
    setGenerated(true);
  }

  async function handleCopy() {
    try {
      await Share.share({ message: editableText });
    } catch {
      Alert.alert('Erro', 'Não foi possível copiar o texto.');
    }
  }

  function handleWhatsApp() {
    const phone = contact.replace(/\D/g, '');
    const url = phone
      ? `whatsapp://send?phone=55${phone}&text=${encodeURIComponent(editableText)}`
      : `whatsapp://send?text=${encodeURIComponent(editableText)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp. Verifique se está instalado.');
    });
  }

  const isLoading = profileQuery.isLoading || summaryQuery.isLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerar relatório</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Month selector */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>
            {monthName(month)} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <ChevronRight size={22} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Summary hint */}
        {summaryQuery.data && !isLoading && (
          <View style={styles.hintCard}>
            <Text style={styles.hintText}>
              {summaryQuery.data.publisherType === 'PUBLISHER'
                ? `Participação: ${summaryQuery.data.participatedInMinistry ? 'Sim' : 'Não'}  ·  Estudos: ${summaryQuery.data.bibleStudiesCount}`
                : `Total: ${Math.floor((summaryQuery.data.totalMinutes) / 60)}h${summaryQuery.data.totalMinutes % 60 > 0 ? `${summaryQuery.data.totalMinutes % 60}min` : ''}  ·  Estudos: ${summaryQuery.data.bibleStudiesCount}`}
            </Text>
          </View>
        )}

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.label}>Número de destino (opcional)</Text>
          <TextInput
            style={styles.input}
            value={contact}
            onChangeText={setContact}
            placeholder="Ex: 11999999999"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
          />
          <Text style={styles.hint}>Usado para enviar pelo WhatsApp. Deixe vazio para só enviar o texto.</Text>
        </View>

        {/* Generate button */}
        <TouchableOpacity
          style={[styles.generateBtn, isLoading && styles.generateBtnDisabled]}
          onPress={handleGenerate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateBtnText}>Gerar relatório</Text>
          )}
        </TouchableOpacity>

        {/* Preview & edit */}
        {generated && (
          <>
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Prévia do relatório</Text>
              <Text style={styles.previewText}>{generatedText}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>Editar antes de enviar</Text>
              <TextInput
                style={[styles.input, styles.editArea]}
                value={editableText}
                onChangeText={setEditableText}
                multiline
                textAlignVertical="top"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
                <Copy size={18} color={colors.primary} />
                <Text style={styles.actionBtnText}>Copiar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.whatsappBtn]}
                onPress={handleWhatsApp}
              >
                <Share2 size={18} color="#fff" />
                <Text style={styles.whatsappBtnText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
  headerBtn: { width: 40 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text },

  content: { padding: 20, gap: 16 },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  navBtn: { padding: 10 },
  monthLabel: { fontSize: 16, fontWeight: '600', color: colors.text },

  hintCard: {
    backgroundColor: colors.primary + '15',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  hintText: { fontSize: 13, color: colors.primaryLight, textAlign: 'center' },

  section: { gap: 6 },
  label: { fontSize: 13, fontWeight: '500', color: colors.textMuted },
  hint: { fontSize: 11, color: colors.textMuted },
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
  editArea: { minHeight: 120, paddingTop: 13 },

  generateBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  generateBtnDisabled: { opacity: 0.6 },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  previewCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  previewLabel: { fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', fontWeight: '600' },
  previewText: { fontSize: 14, color: colors.text, lineHeight: 22 },

  actionRow: { flexDirection: 'row', gap: 12 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionBtnText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  whatsappBtn: { backgroundColor: '#25d366', borderColor: '#25d366' },
  whatsappBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
