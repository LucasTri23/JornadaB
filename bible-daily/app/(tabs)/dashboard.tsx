import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BookOpen, TrendingUp, ListChecks, LogOut } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';
import { colors } from '@/lib/colors';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const name = user?.user_metadata?.name ?? user?.email?.split('@')[0] ?? 'Usuário';

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Olá, {name} 👋</Text>
            <Text style={styles.subtitle}>Continue sua jornada bíblica</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <LogOut size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acesso rápido</Text>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/read')}>
              <BookOpen size={32} color={colors.primary} />
              <Text style={styles.cardTitle}>Ler Bíblia</Text>
              <Text style={styles.cardDesc}>Continue de onde parou</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/plans')}>
              <ListChecks size={32} color={colors.primary} />
              <Text style={styles.cardTitle}>Planos</Text>
              <Text style={styles.cardDesc}>Planos de leitura</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/progress')}>
              <TrendingUp size={32} color={colors.primary} />
              <Text style={styles.cardTitle}>Progresso</Text>
              <Text style={styles.cardDesc}>Veja seu avanço</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.verseCard}>
          <Text style={styles.verseLabel}>Versículo do Dia</Text>
          <Text style={styles.verseText}>
            "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho."
          </Text>
          <Text style={styles.verseRef}>Salmos 119:105</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 24 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  logoutBtn: { padding: 8 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardDesc: { fontSize: 12, color: colors.textMuted },
  verseCard: {
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    gap: 12,
  },
  verseLabel: { fontSize: 12, color: colors.primary, fontWeight: '600', textTransform: 'uppercase' },
  verseText: { fontSize: 16, color: colors.text, lineHeight: 24, fontStyle: 'italic' },
  verseRef: { fontSize: 14, color: colors.primaryLight, fontWeight: '500' },
});
