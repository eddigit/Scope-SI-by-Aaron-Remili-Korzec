"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { modules } from "@/data/modules";
import { getProgress, markFicheRead, reportProgressToClass } from "@/lib/store";

export default function FicheClient() {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!getProgress()) {
      router.replace("/");
      return;
    }
    // Mark fiche as read
    if (typeof params.id === "string" && typeof params.ficheId === "string") {
      markFicheRead(params.id, params.ficheId);
      reportProgressToClass();
    }
  }, [params.id, params.ficheId, router]);

  const mod = modules.find((m) => m.id === params.id);
  const fiche = mod?.fiches.find((f) => f.id === params.ficheId);

  if (!mounted || !mod || !fiche) return null;

  // Find next fiche or first activity
  const ficheIdx = mod.fiches.findIndex((f) => f.id === fiche.id);
  const nextFiche = mod.fiches[ficheIdx + 1];
  const nextLink = nextFiche
    ? `/module/${mod.id}/fiche/${nextFiche.id}`
    : mod.activites[0]
      ? `/module/${mod.id}/activite/${mod.activites[0].id}`
      : `/module/${mod.id}`;
  const nextLabel = nextFiche
    ? `Suivant : ${nextFiche.title}`
    : mod.activites[0]
      ? "Passer aux activités →"
      : "Retour au module";

  return (
    <div className="min-h-dvh bg-white">
      {/* Header */}
      <header
        className="px-5 pt-10 pb-4 sticky top-0 z-10"
        style={{ background: `linear-gradient(to bottom, ${mod.colorLight}, white)` }}
      >
        <button
          onClick={() => router.push(`/module/${mod.id}`)}
          className="flex items-center gap-1 text-[var(--color-text-secondary)] text-sm font-medium mb-2 hover:text-[var(--color-navy)] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {mod.title}
        </button>

        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: mod.color, color: "white" }}
          >
            {ficheIdx + 1}
          </div>
          <h1 className="text-lg font-extrabold text-[var(--color-navy)]" style={{ fontFamily: "var(--font-display)" }}>
            {fiche.title}
          </h1>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mt-3">
          {mod.fiches.map((f, i) => (
            <div
              key={f.id}
              className="h-1 rounded-full flex-1 transition-all"
              style={{
                backgroundColor: i <= ficheIdx ? mod.color : "#E2E8F0",
              }}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="px-5 pb-32">
        <div
          className="fiche-content"
          dangerouslySetInnerHTML={{ __html: fiche.content }}
        />
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 safe-bottom">
        <Link href={nextLink}>
          <button
            className="w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-[0.98] shadow-md"
            style={{ backgroundColor: mod.color }}
          >
            {nextLabel}
          </button>
        </Link>
      </div>
    </div>
  );
}
