import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ListChecks, Clock } from 'lucide-react-native';
import { colors } from '@/lib/colors';

const PLANS = [
  { id: 1, name: 'Bíblia em 1 Ano', desc: 'Leia a Bíblia completa em 365 dias', days: 365, chapters: 1189 },
  { id: 2, name: 'Bíblia em 6 Meses', desc: 'Leitura acelerada em 180 dias', days: 180, chapters: 1189 },
  { id: 3, name: 'Os Evangelhos', desc: 'Mateus, Marcos, Lucas e João', days: 30, chapters: 89 },
  { id: 4, name: 'NT em 90 Dias', desc: 'Todo o Novo Testamento', days: 90, chapters: 260 },
  { id: 5, name: 'Salmos e Provérbios', desc: 'Sabedoria bíblica em 30 dias', days: 30, chapters: 181 },
];

export default function PlansScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Planos de Leitura</Text>
        <Text style={styles.subtitle}>Escolha um plano e leia de forma estruturada</Text>

        {PLANS.map(plan => (
          <TouchableOpacity key={plan.id} style={styles.card}>
            <View style={styles.cardIcon}>
              <ListChecks size={24} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardName}>{plan.name}</Text>
              <Text style={styles.cardDesc}>{plan.desc}</Text>
              <View style={styles.cardMeta}>
                <Clock size={14} color={colors.textMuted} />
                <Text style={styles.cardMetaText}>{plan.days} dias • {plan.chapters} capítulos</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.startBtn}>
              <Text style={styles.startBtnText}>Iniciar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textMuted },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: { flex: 1, gap: 4 },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.text },
  cardDesc: { fontSize: 13, color: colors.textMuted },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardMetaText: { fontSize: 12, color: colors.textMuted },
  startBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  startBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
