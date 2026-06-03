const BASE_URL = 'https://bolls.life';

export type Translation = 'ARC' | 'NVI' | 'ACF';

export interface Verse {
  pk: number;
  verse: number;
  text: string;
}

export async function getChapter(
  book: number,
  chapter: number,
  translation: Translation = 'ARC'
): Promise<Verse[]> {
  const res = await fetch(`${BASE_URL}/get-chapter/${translation}/${book}/${chapter}/`);
  if (!res.ok) throw new Error('Erro ao buscar capítulo');
  return res.json();
}
