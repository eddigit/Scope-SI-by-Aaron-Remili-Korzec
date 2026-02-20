"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Mascot from "@/components/Mascot";
import ModuleCard from "@/components/ModuleCard";
import BottomNav from "@/components/BottomNav";
import { modules } from "@/data/modules";
import { getProgress, getModuleCompletion, reportProgressToClass } from "@/lib/store";
import type { UserProgress } from "@/lib/store";

export default function DashboardPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const p = getProgress();
    if (!p) {
      router.replace("/");
      return;
    }
    setProgress(p);
    reportProgressToClass();
  }, [router]);

  if (!mounted || !progress) return null;

  const pseudo = progress.pseudo || "Explorateur";
  const totalBadges = progress.badges.length;

  const mascotMessages = [
    `Salut ${pseudo} ! Prêt à enquêter ?`,
    `Hey ${pseudo} ! Quel module aujourd'hui ?`,
    `${pseudo}, ton esprit critique est en forme ?`,
    `Bonne investigation, ${pseudo} !`,
  ];
  const message = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] pb-20">
      {/* Header */}
      <header className="bg-gradient-to-b from-[var(--color-primary)] to-blue-500 text-white px-5 pt-10 pb-8 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1
              className="text-2xl font-extrabold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              InfoScope
            </h1>
            <p className="text-blue-100 text-xs font-medium mt-0.5">
              Portail Élève
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
            <span className="text-sm">🏅</span>
            <span className="text-xs font-bold">{totalBadges}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Mascot size="sm" animate={false} />
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-2.5 flex-1">
            <p className="text-sm font-medium text-white/95">{message}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 -mt-4">
        {/* Module cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[var(--color-navy)]">
              Tes outils d'enquête
            </h2>
            <span className="text-xs text-[var(--color-text-secondary)] font-medium">
              {modules.length} modules
            </span>
          </div>
          <div className="space-y-3 stagger-children">
            {modules.map((mod, i) => (
              <ModuleCard
                key={mod.id}
                module={mod}
                progress={getModuleCompletion(
                  mod.id,
                  mod.fiches.length,
                  mod.activites.length
                )}
                index={i}
              />
            ))}
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-extrabold text-[var(--color-primary)]">
              {totalBadges}
            </p>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium mt-0.5">
              Badges
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-extrabold text-[var(--color-accent)]">
              {Object.keys(progress.modules).filter(
                (k) => progress.modules[k].activitesCompleted.length > 0
              ).length}
            </p>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium mt-0.5">
              Résolus
            </p>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-extrabold text-[var(--color-secondary)]">
              {Object.values(progress.modules).reduce(
                (sum, m) => sum + m.fichesRead.length,
                0
              )}
            </p>
            <p className="text-[10px] text-[var(--color-text-secondary)] font-medium mt-0.5">
              Fiches lues
            </p>
          </div>
        </div>

        {/* Class code badge */}
        <div className="bg-[var(--color-navy)] rounded-2xl p-4 text-white flex items-center justify-between">
          <div>
            <p className="text-[10px] text-blue-300 font-medium uppercase tracking-wider">
              Code Classe
            </p>
            <p className="font-bold text-sm mt-0.5">{progress.classCode}</p>
          </div>
          <div className="text-2xl">📋</div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
