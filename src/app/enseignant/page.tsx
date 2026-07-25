"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { modules, TEACHER_CODES } from "@/data/modules";
import { getProgress, getClassData, clearProgress } from "@/lib/store";

function TeacherContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [classData, setClassData] = useState<Record<string, { modules: Record<string, { fichesRead: string[]; activitesCompleted: string[] }>; badges: string[] }> | null>(null);
  const [summary, setSummary] = useState<{ studentCount: number; modules: { moduleId: string; startedCount: number; completedActivityCount: number }[] } | null>(null);
  const [invitePseudo, setInvitePseudo] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [teacherError, setTeacherError] = useState("");
  const [deleteUserId, setDeleteUserId] = useState("");
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [exportText, setExportText] = useState("");

  useEffect(() => {
    setMounted(true);

    const invite = searchParams.get("invite");
    const teacherCode = searchParams.get("teacher");
    const code = searchParams.get("code");

    if (invite) {
      setIsTeacher(false);
      return;
    }

    if (teacherCode && code && TEACHER_CODES[teacherCode] === code) {
      setIsTeacher(true);
      setClassCode(code);
      setClassData(getClassData(code));
      fetch(`/api/infoscope/classes/${encodeURIComponent(code)}/summary`)
        .then((response) => response.ok ? response.json() : null)
        .then((data) => setSummary(data))
        .catch(() => setSummary(null));
    } else {
      const p = getProgress();
      if (!p) {
        router.replace("/");
        return;
      }
      setClassCode(p.classCode);
    }
  }, [router, searchParams]);

  if (!mounted) return null;

  const invitationToken = searchParams.get("invite");
  if (invitationToken) {
    async function acceptInvitation(e: React.FormEvent) {
      e.preventDefault();
      setTeacherError("");
      const response = await fetch("/api/infoscope/teacher/sessions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ invitationToken, pseudo: invitePseudo || "Enseignant" }),
      });
      if (!response.ok) {
        setTeacherError("Invitation invalide ou expirée.");
        return;
      }
      setIsTeacher(true);
      setClassCode("FREINET-6A");
    }

    if (isTeacher) {
      return (
        <div className="min-h-dvh bg-[var(--color-surface)] flex items-center justify-center px-5">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full max-w-sm text-center">
            <p className="text-3xl mb-2">🦉</p>
            <h1 className="font-extrabold text-[var(--color-navy)]">Accès enseignant activé</h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-2">
              Votre session est créée côté serveur. Ouvrez un code enseignant de classe pour consulter le suivi.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-dvh bg-[var(--color-surface)] flex items-center justify-center px-5">
        <form onSubmit={acceptInvitation} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full max-w-sm">
          <p className="text-3xl mb-2 text-center">🦉</p>
          <h1 className="font-extrabold text-[var(--color-navy)] text-center">Invitation enseignant</h1>
          <input
            value={invitePseudo}
            onChange={(e) => setInvitePseudo(e.target.value)}
            placeholder="Nom ou pseudo enseignant"
            className="mt-5 w-full px-4 py-3 bg-[var(--color-surface)] border-2 border-gray-100 rounded-2xl text-center font-semibold focus:outline-none focus:border-[var(--color-primary)]"
          />
          {teacherError && <p className="text-xs text-[var(--color-danger)] text-center mt-3">{teacherError}</p>}
          <button className="w-full mt-4 bg-[var(--color-primary)] text-white font-bold py-3 rounded-2xl">
            Activer l'accès
          </button>
        </form>
      </div>
    );
  }

  // Student profile view
  if (!isTeacher) {
    const progress = getProgress();
    if (!progress) return null;

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
                  {progress.pseudo || "Explorateur"}
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Classe : {progress.classCode}
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
                  {Object.values(progress.modules).reduce((s, m) => {
                    const scores = Object.values(m.scores);
                    return s + (scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0);
                  }, 0) || 0}%
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">Score moyen</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              clearProgress();
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
  const studentCount = summary?.studentCount ?? (classData ? Object.keys(classData).length : 0);

  async function createInvitation(e: React.FormEvent) {
    e.preventDefault();
    setTeacherError("");
    setInviteLink("");
    const response = await fetch("/api/infoscope/teacher/invitations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        adminCode,
        schoolId: "default",
        role: "teacher",
        expiresInDays: 7,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setTeacherError("Code admin invalide ou invitations désactivées.");
      return;
    }
    setInviteLink(data.invitationLink);
  }

  async function exportClassData() {
    setTeacherError("");
    setMaintenanceMessage("");
    setExportText("");
    const response = await fetch(`/api/infoscope/classes/${encodeURIComponent(classCode)}/export`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ adminCode }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setTeacherError("Code admin invalide ou export indisponible.");
      return;
    }
    setExportText(JSON.stringify(data, null, 2));
    setMaintenanceMessage("Export classe généré côté serveur.");
  }

  async function deleteStudentData(e: React.FormEvent) {
    e.preventDefault();
    setTeacherError("");
    setMaintenanceMessage("");
    const response = await fetch(`/api/infoscope/users/${encodeURIComponent(deleteUserId)}/delete`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ adminCode }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setTeacherError("Code admin invalide ou suppression indisponible.");
      return;
    }
    setMaintenanceMessage(data.deleted ? "Données élève supprimées." : "Aucun élève supprimé pour cet identifiant.");
    setDeleteUserId("");
  }

  async function purgeExpiredAccess() {
    setTeacherError("");
    setMaintenanceMessage("");
    const response = await fetch("/api/infoscope/retention/purge-expired-access", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ adminCode }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setTeacherError("Code admin invalide ou purge indisponible.");
      return;
    }
    setMaintenanceMessage(
      `${data.expiredInvitationsRevoked ?? 0} invitation(s) expirée(s) révoquée(s), ${data.expiredSessionsDeleted ?? 0} session(s) expirée(s) supprimée(s).`,
    );
  }

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
            <p className="text-sm font-bold text-[var(--color-navy)]">Pas encore de données</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Les données apparaîtront quand des élèves utiliseront l'app sur cet appareil.
            </p>
            <p className="text-[10px] text-gray-400 mt-3">
              Note : les données sont stockées localement (localStorage), pas sur un serveur.
            </p>
          </div>
        ) : (
          <>
            {/* Module completion overview */}
            {modules.map((mod) => {
              let totalFiches = 0;
              let totalActivites = 0;
              let totalScores: number[] = [];
              const serverModule = summary?.modules.find((item) => item.moduleId === mod.id);

              if (classData) {
                Object.values(classData).forEach((student) => {
                  const sm = student.modules[mod.id];
                  if (sm) {
                    totalFiches += sm.fichesRead.length;
                    totalActivites += sm.activitesCompleted.length;
                    Object.values(sm as unknown as Record<string, Record<string, number>>).forEach(() => {});
                  }
                });
              }

              const avgFiches = studentCount > 0 ? (totalFiches / studentCount).toFixed(1) : "0";
              const avgActivites = serverModule
                ? String(serverModule.completedActivityCount)
                : studentCount > 0 ? (totalActivites / studentCount).toFixed(1) : "0";

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
                      <p className="text-[10px] text-[var(--color-text-secondary)]">{serverModule ? "Activités sync" : "Activités moy."}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        <form onSubmit={createInvitation} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-[var(--color-navy)] mb-2">Inviter un enseignant</h2>
          <input
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            placeholder="Code admin"
            className="w-full px-4 py-3 bg-[var(--color-surface)] border-2 border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[var(--color-primary)]"
          />
          {teacherError && <p className="text-xs text-[var(--color-danger)] mt-2">{teacherError}</p>}
          <button className="w-full mt-3 bg-[var(--color-primary)] text-white font-bold py-3 rounded-2xl text-sm">
            Générer un lien copiable
          </button>
          {inviteLink && (
            <div className="mt-3 rounded-xl bg-blue-50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-secondary)] font-bold">Lien invitation</p>
              <p className="mt-1 break-all text-xs text-[var(--color-navy)]">{inviteLink}</p>
            </div>
          )}
        </form>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-[var(--color-navy)] mb-2">Données et rétention</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            Actions réservées au pilote : export, suppression d'un élève pseudonyme et purge des accès expirés.
          </p>
          <button
            type="button"
            onClick={exportClassData}
            className="w-full bg-[var(--color-secondary)] text-white font-bold py-3 rounded-2xl text-sm"
          >
            Exporter la classe
          </button>
          <form onSubmit={deleteStudentData} className="mt-3 flex gap-2">
            <input
              value={deleteUserId}
              onChange={(e) => setDeleteUserId(e.target.value)}
              placeholder="ID élève à supprimer"
              className="min-w-0 flex-1 px-4 py-3 bg-[var(--color-surface)] border-2 border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-[var(--color-primary)]"
            />
            <button className="px-4 bg-red-500 text-white font-bold rounded-2xl text-sm">
              Supprimer
            </button>
          </form>
          <button
            type="button"
            onClick={purgeExpiredAccess}
            className="w-full mt-3 border-2 border-gray-200 text-[var(--color-navy)] font-bold py-3 rounded-2xl text-sm"
          >
            Purger les accès expirés
          </button>
          {maintenanceMessage && <p className="mt-3 text-xs text-[var(--color-navy)] font-semibold">{maintenanceMessage}</p>}
          {exportText && (
            <pre className="mt-3 max-h-56 overflow-auto rounded-xl bg-slate-950 p-3 text-[10px] text-slate-100 whitespace-pre-wrap">
              {exportText}
            </pre>
          )}
        </div>
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
