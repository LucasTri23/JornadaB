import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/auth';

export interface Profile {
  id: string;
  name: string | null;
  streak: number;
  best_streak: number;
  last_read_at: string | null;
  font_size: number;
  translation: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  book_id: number;
  chapter: number;
  read_count: number;
  read_at: string;
}

export interface UserNote {
  id: string;
  user_id: string;
  book_id: number | null;
  chapter: number | null;
  verse: number | null;
  title: string | null;
  content: string;
  created_at: string;
}

// Returns all chapters read by the user as Set<string> where key = "bookId-chapter"
export function useUserProgress() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['user_progress', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user!.id);

      if (error) throw error;

      const set = new Set<string>();
      const rows: UserProgress[] = data ?? [];
      for (const row of rows) {
        set.add(`${row.book_id}-${row.chapter}`);
      }
      return { set, rows };
    },
  });
}

// Marks a chapter as read (upsert)
export async function markChapterRead(
  userId: string,
  bookId: number,
  chapter: number
): Promise<void> {
  const now = new Date().toISOString();

  // Check if already exists
  const { data: existing } = await supabase
    .from('user_progress')
    .select('id, read_count')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .eq('chapter', chapter)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('user_progress')
      .update({ read_count: existing.read_count + 1, read_at: now })
      .eq('id', existing.id);
  } else {
    await supabase.from('user_progress').insert({
      user_id: userId,
      book_id: bookId,
      chapter,
      read_count: 1,
      read_at: now,
    });
  }

  // Update profile streak and last_read_at
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak, best_streak, last_read_at')
    .eq('id', userId)
    .maybeSingle();

  if (profile) {
    const lastRead = profile.last_read_at ? new Date(profile.last_read_at) : null;
    const today = new Date();
    const todayStr = today.toDateString();
    const yesterdayStr = new Date(today.getTime() - 86400000).toDateString();

    let newStreak = profile.streak;
    if (!lastRead) {
      newStreak = 1;
    } else if (lastRead.toDateString() === todayStr) {
      // Same day, no streak change
    } else if (lastRead.toDateString() === yesterdayStr) {
      newStreak = profile.streak + 1;
    } else {
      newStreak = 1;
    }

    const newBest = Math.max(newStreak, profile.best_streak ?? 0);

    await supabase
      .from('profiles')
      .update({ streak: newStreak, best_streak: newBest, last_read_at: now })
      .eq('id', userId);
  }
}

// Returns notes, optionally filtered by book_id and chapter
export function useNotes(bookId?: number, chapter?: number) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['user_notes', user?.id, bookId, chapter],
    enabled: !!user?.id,
    queryFn: async () => {
      let query = supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (bookId !== undefined) query = query.eq('book_id', bookId);
      if (chapter !== undefined) query = query.eq('chapter', chapter);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as UserNote[];
    },
  });
}

// Creates a note
export async function addNote(
  userId: string,
  note: {
    bookId?: number;
    chapter?: number;
    verse?: number;
    title?: string;
    content: string;
  }
): Promise<void> {
  const { error } = await supabase.from('user_notes').insert({
    user_id: userId,
    book_id: note.bookId ?? null,
    chapter: note.chapter ?? null,
    verse: note.verse ?? null,
    title: note.title ?? null,
    content: note.content,
  });
  if (error) throw error;
}

// Deletes a note
export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('user_notes').delete().eq('id', id);
  if (error) throw error;
}

// Returns user profile
export function useProfile() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    },
  });
}

// Updates profile
export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  if (error) throw error;
}
