"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { modules, TEACHER_CODES } from "@/data/modules";
import { apiGetMe, apiLogout, apiGetClassData } from "@/lib/api";
import type { StudentSession, ProgressData } from "@/lib/api";

interface ClassStudent {
  id: string;
  pseudo: string;
  modules: { module_id: string; fiches_read: string[]; activites_completed: string[] }[];
  badges: string[];
}

function TeacherContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);

  useEffect(() => {
    const teacherCode = searchParams.get("teacher");
    const code = searchParams.get("code");

    if (teacherCode && code && TEACHER_CODES[teacherCode] === code) {
      setIsTeacher(true);
      setClassCode(code);
      apiGetClassData(code, teacherCode)
        .then((students) => {
          setClassStudents(students as ClassStudent[]);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      apiGetMe().then((session) => {
        if (!session) { router.replace("/"); return; }
        setStudent(session.student);
        setProgress(session.progress);
        setClassCode(session.student.classCode);
        setLoading(false);
      });
    }
  }, [router, searchParams]);

  if (loading) return null;

  // Student profile view
  if (!isTeacher) {
    if (!student || !progress) return null;

    return (
      <div className="min-h-dvh bg-[var(--color-surface)] pb-20">
        <header className="bg-gradient-to-b from-[var(--color-navy)] to-slate-700 text-white px-5 pt-10 pb-8 rounded-b-[2rem]">
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
            Mon Profil
          </h1>
        </header>

        <main className="px-5 -mt-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-2xl">
                🦉
              </div>
              <div>
                <p className="font-bold text-lg text-[var(--color-navy)]">
                  {student.pseudo || "Explorateur"}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Classe : {student.classCode}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-sm font-bold text-[var(--color-navy)] mb-3">Statistiques</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[var(--color-surface)] rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-[var(--color-primary)]">{progress.badges.length}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">Badges</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-[var(--color-accent)]">
                  {Object.values(progress.modules).reduce((s, m) => s + m.fichesRead.length, 0)}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">Fiches lues</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-[var(--color-secondary)]">
                  {Object.values(progress.modules).reduce((s, m) => s + m.activitesCompleted.length, 0)}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">Activités</p>
              </div>
              <div className="bg-[var(--color-surface)] rounded-xl p-3 text-center">
                <p className="text-2xl font-extrabold text-[var(--color-purple)]">
                  {(() => {
                    const allScores = Object.values(progress.modules).flatMap(
                      (m) => Object.values(m.scores)
                    );
                    return allScores.length > 0
                      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
                      : 0;
                  })()}%
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">Score moyen</p>
              </div>
            </div>
          </div>

          <button
            onClick={async () => {
              await apiLogout();
              router.replace("/");
            }}
            className="w-full py-3 rounded-2xl border-2 border-red-200 text-[var(--color-danger)] text-sm font-bold hover:bg-red-50 transition-colors"
          >
            Changer de classe / Se déconnecter
          </button>
        </main>

        <BottomNav />
      </div>
    );
  }

  // Teacher dashboard
  const studentCount = classStudents.length;

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] pb-8">
      <header className="bg-gradient-to-b from-[var(--color-navy)] to-slate-700 text-white px-5 pt-10 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Vue Enseignant</p>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
              Classe {classCode}
            </h1>
          </div>
          <span className="bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold">
            {studentCount} élèves
          </span>
        </div>
      </header>

      <main className="px-5 -mt-4 space-y-4">
        {studentCount === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm font-bold text-[var(--color-navy)]">Pas encore d'élèves</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Les données apparaîtront quand des élèves rejoindront avec le code classe.
            </p>
          </div>
        ) : (
          <>
            {/* Students list */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-sm font-bold text-[var(--color-navy)] mb-3">Élèves</h2>
              <div className="space-y-2">
                {classStudents.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-[var(--color-surface)] rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-sm">
                        🦉
                      </div>
                      <p className="text-sm font-semibold text-[var(--color-navy)]">{s.pseudo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--color-primary)]">
                        {(s.badges || []).length} badges
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Module stats */}
            {modules.map((mod) => {
              let totalFiches = 0;
              let totalActivites = 0;

              classStudents.forEach((s) => {
                const modData = (s.modules || []).find((m) => m.module_id === mod.id);
                if (modData) {
                  totalFiches += (modData.fiches_read || []).length;
                  totalActivites += (modData.activites_completed || []).length;
                }
              });

              const avgFiches = studentCount > 0 ? (totalFiches / studentCount).toFixed(1) : "0";
              const avgActivites = studentCount > 0 ? (totalActivites / studentCount).toFixed(1) : "0";

              return (
                <div key={mod.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: mod.colorLight }}
                    >
                      {mod.icon}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--color-navy)]">{mod.title}</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">{mod.shortTitle}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--color-surface)] rounded-xl p-3 text-center">
                      <p className="text-lg font-extrabold" style={{ color: mod.color }}>{avgFiches}</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">Fiches moy.</p>
                    </div>
                    <div className="bg-[var(--color-surface)] rounded-xl p-3 text-center">
                      <p className="text-lg font-extrabold" style={{ color: mod.color }}>{avgActivites}</p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">Activités moy.</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>
    </div>
  );
}

export default function EnseignantPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center"><p>Chargement...</p></div>}>
      <TeacherContent />
    </Suspense>
  );
}
