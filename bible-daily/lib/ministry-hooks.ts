import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PublisherType =
  | 'PUBLISHER'
  | 'AUXILIARY_PIONEER'
  | 'INDEFINITE_AUXILIARY_PIONEER'
  | 'REGULAR_PIONEER';

export type ActivityType =
  | 'FIELD_SERVICE'
  | 'INFORMAL_WITNESSING'
  | 'CART_WITNESSING'
  | 'RETURN_VISIT'
  | 'BIBLE_STUDY'
  | 'LDC_CREDIT'
  | 'COURSE_CREDIT'
  | 'OTHER_CREDIT'
  | 'OTHER';

export type ReturnVisitStatus = 'PENDING' | 'VISITED' | 'RESCHEDULE' | 'BECAME_STUDY' | 'CLOSED';
export type BibleStudyStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

export interface MinistryProfile {
  id: string;
  user_id: string;
  report_name: string | null;
  congregation: string | null;
  publisher_type: PublisherType;
  default_report_contact: string | null;
  include_observation: boolean;
  remind_to_register: boolean;
  use_return_visits: boolean;
  use_bible_studies: boolean;
  onboarding_completed: boolean;
}

export interface MinistryEntry {
  id: string;
  user_id: string;
  entry_date: string;
  activity_type: ActivityType;
  minutes: number;
  is_credit: boolean;
  credit_type: string | null;
  notes: string | null;
}

export interface MinistryMonthSettings {
  id: string;
  user_id: string;
  month: number;
  year: number;
  service_year: string | null;
  publisher_type_for_month: PublisherType | null;
  monthly_goal_minutes: number | null;
  is_special_month: boolean;
  participated_in_ministry: boolean;
  notes: string | null;
}

export interface ReturnVisit {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  address_reference: string | null;
  first_conversation_date: string | null;
  subject_discussed: string | null;
  scripture_used: string | null;
  material_left: string | null;
  next_visit_date: string | null;
  status: ReturnVisitStatus;
  notes: string | null;
}

export interface BibleStudy {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  address_reference: string | null;
  usual_day_time: string | null;
  publication: string | null;
  current_lesson: string | null;
  next_study_date: string | null;
  last_study_date: string | null;
  status: BibleStudyStatus;
  notes: string | null;
}

export interface StudySession {
  id: string;
  user_id: string;
  bible_study_id: string;
  session_date: string;
  minutes: number;
  lesson_studied: string | null;
  notes: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return h === 0 ? '0min' : `${h}h`;
  if (h === 0) return `${m}min`;
  return `${h}h${m}min`;
}

export function getDefaultGoalMinutes(
  publisherType: PublisherType,
  isSpecialMonth = false,
): number | null {
  switch (publisherType) {
    case 'REGULAR_PIONEER':
      return 50 * 60;
    case 'INDEFINITE_AUXILIARY_PIONEER':
    case 'AUXILIARY_PIONEER':
      return isSpecialMonth ? 15 * 60 : 30 * 60;
    case 'PUBLISHER':
    default:
      return null;
  }
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function monthName(month: number): string {
  return MONTHS_PT[month - 1] ?? '';
}

// ─── Ministry Profile ────────────────────────────────────────────────────────

export function useMinistryProfile(userId: string) {
  return useQuery({
    queryKey: ['ministry_profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministry_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Auto-create default profile
        const { data: created, error: createError } = await supabase
          .from('ministry_profiles')
          .insert({ user_id: userId, publisher_type: 'PUBLISHER', onboarding_completed: false })
          .select()
          .single();
        if (createError) throw createError;
        return created as MinistryProfile;
      }

      return data as MinistryProfile;
    },
    enabled: !!userId,
  });
}

export async function updateMinistryProfile(
  userId: string,
  updates: Partial<MinistryProfile>,
): Promise<MinistryProfile> {
  const { data, error } = await supabase
    .from('ministry_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as MinistryProfile;
}

// ─── Ministry Entries ─────────────────────────────────────────────────────────

export function useMinistryEntries(userId: string, month: number, year: number) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0);
  const endStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  return useQuery({
    queryKey: ['ministry_entries', userId, month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministry_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('entry_date', startDate)
        .lte('entry_date', endStr)
        .order('entry_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as MinistryEntry[];
    },
    enabled: !!userId,
  });
}

export async function addMinistryEntry(entry: Omit<MinistryEntry, 'id'>): Promise<MinistryEntry> {
  const { data, error } = await supabase
    .from('ministry_entries')
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as MinistryEntry;
}

export async function deleteMinistryEntry(id: string): Promise<void> {
  const { error } = await supabase.from('ministry_entries').delete().eq('id', id);
  if (error) throw error;
}

// ─── Month Summary ────────────────────────────────────────────────────────────

export interface MonthSummary {
  ministryMinutes: number;
  creditMinutes: number;
  totalMinutes: number;
  goalMinutes: number | null;
  percent: number;
  remainingMinutes: number;
  bibleStudiesCount: number;
  uniqueDays: number;
  participatedInMinistry: boolean;
  publisherType: PublisherType;
}

const CREDIT_TYPES: ActivityType[] = ['LDC_CREDIT', 'COURSE_CREDIT', 'OTHER_CREDIT'];

export function useMonthSummary(userId: string, month: number, year: number) {
  const entriesQuery = useMinistryEntries(userId, month, year);
  const profileQuery = useMinistryProfile(userId);

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0);
  const endStr = `${year}-${String(month).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;

  const monthSettingsQuery = useQuery({
    queryKey: ['ministry_month_settings', userId, month, year],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministry_month_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();
      if (error) throw error;
      return data as MinistryMonthSettings | null;
    },
    enabled: !!userId,
  });

  const isLoading =
    entriesQuery.isLoading || profileQuery.isLoading || monthSettingsQuery.isLoading;
  const error = entriesQuery.error || profileQuery.error || monthSettingsQuery.error;

  const summary: MonthSummary | null = (() => {
    if (!entriesQuery.data || !profileQuery.data) return null;

    const entries = entriesQuery.data;
    const profile = profileQuery.data;
    const monthSettings = monthSettingsQuery.data;
    const publisherType = monthSettings?.publisher_type_for_month ?? profile.publisher_type;
    const isSpecialMonth = monthSettings?.is_special_month ?? false;

    let ministryMinutes = 0;
    let creditMinutes = 0;
    const days = new Set<string>();

    for (const e of entries) {
      if (CREDIT_TYPES.includes(e.activity_type)) {
        creditMinutes += e.minutes;
      } else {
        ministryMinutes += e.minutes;
      }
      days.add(e.entry_date);
    }

    const totalMinutes = ministryMinutes + creditMinutes;
    const goalMinutes = monthSettings?.monthly_goal_minutes ?? getDefaultGoalMinutes(publisherType, isSpecialMonth);
    const percent = goalMinutes ? Math.min(100, Math.round((totalMinutes / goalMinutes) * 100)) : 0;
    const remainingMinutes = goalMinutes ? Math.max(0, goalMinutes - totalMinutes) : 0;

    const bibleStudiesCount = entries.filter((e) => e.activity_type === 'BIBLE_STUDY').length;
    const participatedInMinistry = monthSettings?.participated_in_ministry ?? entries.length > 0;

    return {
      ministryMinutes,
      creditMinutes,
      totalMinutes,
      goalMinutes,
      percent,
      remainingMinutes,
      bibleStudiesCount,
      uniqueDays: days.size,
      participatedInMinistry,
      publisherType,
    };
  })();

  return { data: summary, isLoading, error };
}

// ─── Service Year (Regular Pioneer) ──────────────────────────────────────────

export function useServiceYear(userId: string, serviceYear: string) {
  return useQuery({
    queryKey: ['ministry_service_year', userId, serviceYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ministry_month_settings')
        .select('*')
        .eq('user_id', userId)
        .eq('service_year', serviceYear);
      if (error) throw error;
      return (data ?? []) as MinistryMonthSettings[];
    },
    enabled: !!userId && !!serviceYear,
  });
}

// ─── Return Visits ────────────────────────────────────────────────────────────

export function useReturnVisits(userId: string, status?: ReturnVisitStatus) {
  return useQuery({
    queryKey: ['return_visits', userId, status],
    queryFn: async () => {
      let q = supabase
        .from('return_visits')
        .select('*')
        .eq('user_id', userId)
        .order('next_visit_date', { ascending: true });
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ReturnVisit[];
    },
    enabled: !!userId,
  });
}

export async function createReturnVisit(visit: Partial<ReturnVisit>): Promise<ReturnVisit> {
  const { data, error } = await supabase
    .from('return_visits')
    .insert({ status: 'PENDING', ...visit })
    .select()
    .single();
  if (error) throw error;
  return data as ReturnVisit;
}

export async function updateReturnVisit(
  id: string,
  updates: Partial<ReturnVisit>,
): Promise<ReturnVisit> {
  const { data, error } = await supabase
    .from('return_visits')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as ReturnVisit;
}

export async function deleteReturnVisit(id: string): Promise<void> {
  const { error } = await supabase.from('return_visits').delete().eq('id', id);
  if (error) throw error;
}

// ─── Bible Studies ────────────────────────────────────────────────────────────

export function useBibleStudies(userId: string, status?: BibleStudyStatus) {
  return useQuery({
    queryKey: ['bible_studies', userId, status],
    queryFn: async () => {
      let q = supabase
        .from('ministry_bible_studies')
        .select('*')
        .eq('user_id', userId)
        .order('next_study_date', { ascending: true });
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as BibleStudy[];
    },
    enabled: !!userId,
  });
}

export async function createBibleStudy(study: Partial<BibleStudy>): Promise<BibleStudy> {
  const { data, error } = await supabase
    .from('ministry_bible_studies')
    .insert({ status: 'ACTIVE', ...study })
    .select()
    .single();
  if (error) throw error;
  return data as BibleStudy;
}

export async function updateBibleStudy(
  id: string,
  updates: Partial<BibleStudy>,
): Promise<BibleStudy> {
  const { data, error } = await supabase
    .from('ministry_bible_studies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as BibleStudy;
}

export async function deleteBibleStudy(id: string): Promise<void> {
  const { error } = await supabase.from('ministry_bible_studies').delete().eq('id', id);
  if (error) throw error;
}

// ─── Study Sessions ───────────────────────────────────────────────────────────

export function useStudySessions(bibleStudyId: string) {
  return useQuery({
    queryKey: ['study_sessions', bibleStudyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('bible_study_id', bibleStudyId)
        .order('session_date', { ascending: false });
      if (error) throw error;
      return (data ?? []) as StudySession[];
    },
    enabled: !!bibleStudyId,
  });
}

export async function addStudySession(session: Partial<StudySession>): Promise<StudySession> {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data as StudySession;
}

// ─── Report Text Generator ────────────────────────────────────────────────────

export function generateReportText(data: {
  name: string;
  month: number;
  year: number;
  publisherType: PublisherType;
  ministryMinutes: number;
  creditMinutes: number;
  bibleStudiesCount: number;
  participated: boolean;
}): string {
  const { name, month, year, publisherType, ministryMinutes, creditMinutes, bibleStudiesCount, participated } = data;
  const mes = monthName(month);

  if (publisherType === 'PUBLISHER') {
    const participou = participated ? 'Sim' : 'Não';
    const estudos = bibleStudiesCount > 0 ? `\nEstudos bíblicos: ${bibleStudiesCount}` : '';
    return `Relatório de ${mes}/${year}\nPublicador(a): ${name}\nParticipou no ministério: ${participou}${estudos}`;
  }

  const totalMin = ministryMinutes + creditMinutes;
  const horas = formatMinutes(totalMin);
  let tipo = '';
  if (publisherType === 'REGULAR_PIONEER') tipo = 'Pioneiro(a) Regular';
  else if (publisherType === 'AUXILIARY_PIONEER') tipo = 'Pioneiro(a) Auxiliar';
  else tipo = 'Pio. Auxiliar Permanente';

  const credito = creditMinutes > 0 ? `\nCrédito: ${formatMinutes(creditMinutes)}` : '';
  const estudos = bibleStudiesCount > 0 ? `\nEstudos bíblicos: ${bibleStudiesCount}` : '';

  return `Relatório de ${mes}/${year}\n${tipo}: ${name}\nHoras: ${horas}${credito}${estudos}`;
}
