"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Mascot from "@/components/Mascot";
import { allBadges } from "@/data/modules";
import { getProgress } from "@/lib/store";

export default function BadgesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [earned, setEarned] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    const p = getProgress();
    if (!p) {
      router.replace("/");
      return;
    }
    setEarned(p.badges);
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="min-h-dvh bg-[var(--color-surface)] pb-20">
      <header className="bg-gradient-to-b from-[var(--color-secondary)] to-amber-400 text-white px-5 pt-10 pb-8 rounded-b-[2rem]">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
          Mes Badges
        </h1>
        <p className="text-amber-100 text-sm mt-1">
          {earned.length}/{allBadges.length} débloqués
        </p>
      </header>

      <main className="px-5 -mt-4">
        {earned.length === 0 && (
          <div className="text-center py-8">
            <Mascot size="md" message="Complete un module pour gagner ton premier badge !" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-2 stagger-children">
          {allBadges.map((badge) => {
            const isEarned = earned.includes(badge.id);
            return (
              <div
                key={badge.id}
                className={`rounded-2xl p-5 text-center border transition-all ${
                  isEarned
                    ? "bg-white shadow-md border-gray-100"
                    : "bg-gray-50 border-gray-100 opacity-40 grayscale"
                }`}
              >
                <div className={`text-4xl mb-2 ${isEarned ? "animate-pulse-soft" : ""}`}>
                  {badge.icon}
                </div>
                <p className="text-sm font-bold text-[var(--color-navy)]">{badge.name}</p>
                <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
                  {badge.moduleTitle}
                </p>
                {isEarned && (
                  <span
                    className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: badge.color }}
                  >
                    OBTENU
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
