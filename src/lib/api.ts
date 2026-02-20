// Client-side API wrapper for InfoScope backend

export interface StudentSession {
  id: string;
  pseudo: string;
  classCode: string;
}

export interface ProgressData {
  modules: Record<
    string,
    {
      fichesRead: string[];
      activitesCompleted: string[];
      scores: Record<string, number>;
    }
  >;
  badges: string[];
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const data = await res.json();
  if (!res.ok || !data.ok) {
    throw new Error(data.error || `API error ${res.status}`);
  }
  return data;
}

// Join a class (register)
export async function apiJoin(
  classCode: string,
  pseudo: string
): Promise<{ studentId: string; pseudo: string; classCode: string }> {
  const data = await apiFetch<{
    ok: boolean;
    studentId: string;
    pseudo: string;
    classCode: string;
  }>("/api/auth/join", {
    method: "POST",
    body: JSON.stringify({ classCode, pseudo }),
  });
  return { studentId: data.studentId, pseudo: data.pseudo, classCode: data.classCode };
}

// Get current session (checks cookie)
export async function apiGetMe(): Promise<{
  student: StudentSession;
  progress: ProgressData;
} | null> {
  try {
    const data = await apiFetch<{
      ok: boolean;
      student: StudentSession;
      progress: ProgressData;
    }>("/api/auth/me");
    return { student: data.student, progress: data.progress };
  } catch {
    return null;
  }
}

// Logout
export async function apiLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

// Mark a fiche as read
export async function apiMarkFicheRead(moduleId: string, ficheId: string): Promise<void> {
  await apiFetch("/api/progress/fiche", {
    method: "POST",
    body: JSON.stringify({ moduleId, ficheId }),
  });
}

// Mark an activite as completed
export async function apiMarkActiviteCompleted(
  moduleId: string,
  activiteId: string,
  score: number
): Promise<void> {
  await apiFetch("/api/progress/activite", {
    method: "POST",
    body: JSON.stringify({ moduleId, activiteId, score }),
  });
}

// Add a badge
export async function apiAddBadge(badgeId: string): Promise<void> {
  await apiFetch("/api/progress/badge", {
    method: "POST",
    body: JSON.stringify({ badgeId }),
  });
}

// Get class data (teacher)
export async function apiGetClassData(
  classCode: string,
  teacherCode: string
): Promise<unknown[]> {
  const data = await apiFetch<{ ok: boolean; students: unknown[] }>(
    `/api/class/${classCode}?teacher=${teacherCode}`
  );
  return data.students;
}

// Initialize database (one-time setup)
export async function apiInitDB(): Promise<void> {
  await apiFetch("/api/init", { method: "POST" });
}

// Utility: compute module completion percentage
export function computeModuleCompletion(
  progress: ProgressData,
  moduleId: string,
  totalFiches: number,
  totalActivites: number
): number {
  const mod = progress.modules[moduleId];
  if (!mod) return 0;
  const total = totalFiches + totalActivites;
  if (total === 0) return 0;
  const done = mod.fichesRead.length + mod.activitesCompleted.length;
  return Math.round((done / total) * 100);
}
