import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function getGreeting(name?: string | null): string {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  return name ? `${greeting}, ${name.split(" ")[0]}!` : `${greeting}!`;
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export const TOTAL_BIBLE_CHAPTERS = 1189;

export function estimateDaysToFinish(
  remainingChapters: number,
  chaptersPerDay: number
): number {
  if (chaptersPerDay <= 0) return 0;
  return Math.ceil(remainingChapters / chaptersPerDay);
}

export function generateCode(length = 6): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}
