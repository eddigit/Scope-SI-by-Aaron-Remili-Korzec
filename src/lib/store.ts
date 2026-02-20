"use client";

export interface UserProgress {
  classCode: string;
  pseudo: string;
  modules: Record<string, ModuleProgress>;
  badges: string[];
}

export interface ModuleProgress {
  fichesRead: string[];
  activitesCompleted: string[];
  scores: Record<string, number>;
}

const STORAGE_KEY = "infoscope_progress";

export function getProgress(): UserProgress | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveProgress(progress: UserProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function initProgress(classCode: string, pseudo: string): UserProgress {
  const progress: UserProgress = {
    classCode,
    pseudo,
    modules: {},
    badges: [],
  };
  saveProgress(progress);
  return progress;
}

export function markFicheRead(moduleId: string, ficheId: string) {
  const progress = getProgress();
  if (!progress) return;
  if (!progress.modules[moduleId]) {
    progress.modules[moduleId] = { fichesRead: [], activitesCompleted: [], scores: {} };
  }
  if (!progress.modules[moduleId].fichesRead.includes(ficheId)) {
    progress.modules[moduleId].fichesRead.push(ficheId);
  }
  saveProgress(progress);
}

export function markActiviteCompleted(moduleId: string, activiteId: string, score: number) {
  const progress = getProgress();
  if (!progress) return;
  if (!progress.modules[moduleId]) {
    progress.modules[moduleId] = { fichesRead: [], activitesCompleted: [], scores: {} };
  }
  if (!progress.modules[moduleId].activitesCompleted.includes(activiteId)) {
    progress.modules[moduleId].activitesCompleted.push(activiteId);
  }
  progress.modules[moduleId].scores[activiteId] = score;
  saveProgress(progress);
}

export function addBadge(badgeId: string) {
  const progress = getProgress();
  if (!progress) return;
  if (!progress.badges.includes(badgeId)) {
    progress.badges.push(badgeId);
  }
  saveProgress(progress);
}

export function getModuleCompletion(moduleId: string, totalFiches: number, totalActivites: number): number {
  const progress = getProgress();
  if (!progress || !progress.modules[moduleId]) return 0;
  const mod = progress.modules[moduleId];
  const total = totalFiches + totalActivites;
  if (total === 0) return 0;
  const done = mod.fichesRead.length + mod.activitesCompleted.length;
  return Math.round((done / total) * 100);
}

export function clearProgress() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// Class-level aggregated data for teachers (stored per class code)
const CLASS_STORAGE_PREFIX = "infoscope_class_";

export function reportProgressToClass() {
  const progress = getProgress();
  if (!progress) return;
  const key = CLASS_STORAGE_PREFIX + progress.classCode;
  const raw = localStorage.getItem(key);
  let classData: Record<string, { modules: Record<string, ModuleProgress>; badges: string[] }> = {};
  if (raw) {
    try { classData = JSON.parse(raw); } catch { classData = {}; }
  }
  const id = progress.pseudo || "anonyme";
  classData[id] = { modules: progress.modules, badges: progress.badges };
  localStorage.setItem(key, JSON.stringify(classData));
}

export function getClassData(classCode: string) {
  if (typeof window === "undefined") return null;
  const key = CLASS_STORAGE_PREFIX + classCode;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}
