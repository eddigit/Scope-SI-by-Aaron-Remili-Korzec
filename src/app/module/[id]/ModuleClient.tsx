"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import ProgressBar from "@/components/ProgressBar";
import { modules } from "@/data/modules";
import { getProgress, getModuleCompletion } from "@/lib/store";

export default function ModuleClient() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getProgress()) router.replace("/");
  }, [router]);

  const mod = modules.find((m) => m.id === params.id);

  if (!mounted || !mod) return null;

  const progress = getModuleCompletion(mod.id, mod.fiches.length, mod.activites.length);
  const userProgress = getProgress();
  const modProgress = userProgress?.modules[mod.id];

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] pb-20">
      {/* Header */}
      <header
        className="px-5 pt-10 pb-6 rounded-b-[2rem] text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${mod.color}, ${mod.color}dd)` }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-1 text-white/80 text-sm font-medium mb-4 hover:text-white transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Retour
        </button>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
            {mod.icon}
          </div>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">
              {mod.shortTitle}
            </p>
            <h1
              className="text-2xl font-extrabold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {mod.title}
            </h1>
          </div>
        </div>

        <div className="mt-4">
          <ProgressBar value={progress} color="rgba(255,255,255,0.9)" height="h-1.5" showLabel />
        </div>
      </header>

      <main className="px-5 mt-4">
        {/* Fiches section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-[var(--color-navy)] mb-3 flex items-center gap-2">
            📖 Fiches pédagogiques
            <span className="text-xs font-normal text-[var(--color-text-secondary)]">
              ({modProgress?.fichesRead.length ?? 0}/{mod.fiches.length})
            </span>
          </h2>
          <div className="space-y-2 stagger-children">
            {mod.fiches.map((fiche, i) => {
              const isRead = modProgress?.fichesRead.includes(fiche.id);
              return (
                <Link
                  key={fiche.id}
                  href={`/module/${mod.id}/fiche/${fiche.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 hover:shadow-md transition-all active:scale-[0.99]">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        backgroundColor: isRead ? mod.colorLight : "#F1F5F9",
                        color: isRead ? mod.color : "#94A3B8",
                      }}
                    >
                      {isRead ? "✓" : i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${isRead ? "text-[var(--color-navy)]" : "text-[var(--color-text-secondary)]"}`}>
                        {fiche.title}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Activities section */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-[var(--color-navy)] mb-3 flex items-center gap-2">
            🎮 Activités
            <span className="text-xs font-normal text-[var(--color-text-secondary)]">
              ({modProgress?.activitesCompleted.length ?? 0}/{mod.activites.length})
            </span>
          </h2>
          <div className="space-y-2 stagger-children">
            {mod.activites.map((act) => {
              const isDone = modProgress?.activitesCompleted.includes(act.id);
              const score = modProgress?.scores[act.id];
              return (
                <Link
                  key={act.id}
                  href={`/module/${mod.id}/activite/${act.id}`}
                  className="block"
                >
                  <div
                    className="rounded-2xl p-4 shadow-sm border flex items-center gap-3 hover:shadow-md transition-all active:scale-[0.99]"
                    style={{
                      backgroundColor: isDone ? mod.colorLight : "white",
                      borderColor: isDone ? mod.color + "30" : "#F1F5F9",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: mod.color + "20" }}
                    >
                      {act.type === "quiz" ? "❓" : act.type === "classement" ? "📊" : "🏆"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--color-navy)]">{act.title}</p>
                      <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 line-clamp-1">
                        {act.description}
                      </p>
                      {isDone && score !== undefined && (
                        <p className="text-xs font-bold mt-1" style={{ color: mod.color }}>
                          Score : {score}%
                        </p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Badge info */}
        <div
          className="rounded-2xl p-4 text-center border"
          style={{ backgroundColor: mod.colorLight, borderColor: mod.color + "20" }}
        >
          <p className="text-3xl mb-1">{mod.badgeIcon}</p>
          <p className="text-sm font-bold" style={{ color: mod.color }}>
            Badge : {mod.badgeName}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Complete toutes les fiches et activités pour débloquer ce badge !
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
