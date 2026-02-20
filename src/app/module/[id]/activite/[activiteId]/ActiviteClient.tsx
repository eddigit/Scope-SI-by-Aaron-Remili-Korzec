"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { modules } from "@/data/modules";
import {
  apiGetMe,
  apiMarkActiviteCompleted,
  apiAddBadge,
  computeModuleCompletion,
} from "@/lib/api";
import type { ProgressData } from "@/lib/api";
import type { QuizQuestion } from "@/data/modules";
import Mascot from "@/components/Mascot";

export default function ActiviteClient() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [rankOrder, setRankOrder] = useState<string[]>([]);
  const [rankSubmitted, setRankSubmitted] = useState(false);
  const [rankScore, setRankScore] = useState(0);

  useEffect(() => {
    apiGetMe().then((session) => {
      if (!session) { router.replace("/"); return; }
      setProgressData(session.progress);
      setLoading(false);
    });
  }, [router]);

  const mod = modules.find((m) => m.id === params.id);
  const activite = mod?.activites.find((a) => a.id === params.activiteId);

  useEffect(() => {
    if (activite?.type === "classement" && activite.items && rankOrder.length === 0) {
      // Shuffle items
      const shuffled = [...activite.items].sort(() => Math.random() - 0.5);
      setRankOrder(shuffled.map((i) => i.id));
    }
  }, [activite, rankOrder.length]);

  const checkBadge = useCallback(async () => {
    if (!mod) return;
    // Re-fetch progress to check completion
    const session = await apiGetMe();
    if (!session) return;
    const completion = computeModuleCompletion(session.progress, mod.id, mod.fiches.length, mod.activites.length);
    if (completion >= 100) {
      await apiAddBadge(mod.badgeId).catch(() => {});
    }
  }, [mod]);

  if (loading || !mod || !activite) return null;

  // Quiz handler
  function handleAnswer(answer: string | number) {
    if (showResult) return;
    setSelected(answer);
    setShowResult(true);

    const q = activite!.questions![currentQ];
    if (answer === q.correctAnswer) {
      setScore((s) => s + 1);
    }
  }

  function nextQuestion() {
    const questions = activite!.questions!;
    if (currentQ + 1 >= questions.length) {
      const finalScore = Math.round((score / questions.length) * 100);
      apiMarkActiviteCompleted(mod!.id, activite!.id, finalScore).catch(() => {});
      checkBadge();
      setFinished(true);
    } else {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setShowResult(false);
    }
  }

  // Ranking handler
  function moveItem(idx: number, direction: "up" | "down") {
    const newOrder = [...rankOrder];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    setRankOrder(newOrder);
  }

  function submitRanking() {
    if (!activite?.items) return;
    let correct = 0;
    rankOrder.forEach((id, idx) => {
      const item = activite.items!.find((i) => i.id === id);
      if (item && item.correctRank === idx + 1) correct++;
    });
    const pct = Math.round((correct / activite.items.length) * 100);
    setRankScore(pct);
    setRankSubmitted(true);
    apiMarkActiviteCompleted(mod!.id, activite!.id, pct).catch(() => {});
    checkBadge();
  }

  // DEFI page
  if (activite.type === "defi") {
    return (
      <DefiPage
        mod={mod}
        activite={activite}
        onComplete={() => {
          apiMarkActiviteCompleted(mod.id, activite.id, 100).catch(() => {});
          checkBadge();
        }}
        onBack={() => router.push(`/module/${mod.id}`)}
      />
    );
  }

  // CLASSEMENT page
  if (activite.type === "classement" && activite.items) {
    return (
      <div className="min-h-dvh bg-[var(--color-surface)]">
        <header className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(to bottom, ${mod.colorLight}, var(--color-surface))` }}>
          <button onClick={() => router.push(`/module/${mod.id}`)} className="flex items-center gap-1 text-[var(--color-text-secondary)] text-sm font-medium mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            {mod.title}
          </button>
          <h1 className="text-xl font-extrabold text-[var(--color-navy)]" style={{ fontFamily: "var(--font-display)" }}>
            {activite.title}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">{activite.description}</p>
        </header>

        <main className="px-5 pb-32">
          {!rankSubmitted ? (
            <>
              <p className="text-xs text-[var(--color-text-secondary)] mb-3 font-medium">
                Utilise les flèches pour réorganiser du plus fiable (haut) au moins fiable (bas) :
              </p>
              <div className="space-y-2">
                {rankOrder.map((id, idx) => {
                  const item = activite.items!.find((i) => i.id === id)!;
                  return (
                    <div key={id} className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <p className="flex-1 text-sm font-medium text-[var(--color-navy)]">{item.label}</p>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveItem(idx, "up")}
                          disabled={idx === 0}
                          className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center disabled:opacity-20 hover:bg-gray-100 transition-colors"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() => moveItem(idx, "down")}
                          disabled={idx === rankOrder.length - 1}
                          className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center disabled:opacity-20 hover:bg-gray-100 transition-colors"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={submitRanking}
                className="w-full mt-6 py-3.5 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-all shadow-md"
                style={{ backgroundColor: mod.color }}
              >
                Valider mon classement
              </button>
            </>
          ) : (
            <div className="text-center py-8 animate-fade-in-up">
              <Mascot size="md" message={rankScore >= 80 ? "Excellent classement !" : rankScore >= 50 ? "Pas mal ! Tu progresses !" : "Continue à t'entraîner !"} />
              <div className="mt-6 bg-white rounded-3xl p-6 shadow-md border border-gray-100">
                <p className="text-4xl font-extrabold" style={{ color: mod.color }}>{rankScore}%</p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">de bonnes réponses</p>

                <div className="mt-4 space-y-2 text-left">
                  {activite.items!.sort((a, b) => a.correctRank - b.correctRank).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center" style={{ backgroundColor: mod.colorLight, color: mod.color }}>
                        {item.correctRank}
                      </span>
                      <span className="text-[var(--color-navy)]">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => router.push(`/module/${mod.id}`)}
                className="mt-6 w-full py-3.5 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-all shadow-md"
                style={{ backgroundColor: mod.color }}
              >
                Retour au module
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // QUIZ page
  if (!activite.questions) return null;
  const questions = activite.questions;

  if (finished) {
    const finalPct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-dvh bg-[var(--color-surface)] flex flex-col items-center justify-center px-5">
        <div className="animate-bounce-in">
          <Mascot
            size="lg"
            message={
              finalPct >= 80
                ? "Bravo, excellent travail !"
                : finalPct >= 50
                  ? "Bien joué ! Tu progresses !"
                  : "Continue, tu vas y arriver !"
            }
          />
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-lg mt-6 w-full max-w-sm text-center border border-gray-100 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-5xl font-extrabold" style={{ color: mod.color }}>
            {finalPct}%
          </p>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">
            {score}/{questions.length} bonnes réponses
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setCurrentQ(0);
                setSelected(null);
                setShowResult(false);
                setScore(0);
                setFinished(false);
              }}
              className="flex-1 py-3 rounded-xl border-2 font-bold text-sm active:scale-[0.98] transition-all"
              style={{ borderColor: mod.color, color: mod.color }}
            >
              Recommencer
            </button>
            <button
              onClick={() => router.push(`/module/${mod.id}`)}
              className="flex-1 py-3 rounded-xl font-bold text-sm text-white active:scale-[0.98] transition-all shadow-md"
              style={{ backgroundColor: mod.color }}
            >
              Continuer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="min-h-dvh bg-[var(--color-surface)]">
      {/* Header */}
      <header className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(to bottom, ${mod.colorLight}, var(--color-surface))` }}>
        <button onClick={() => router.push(`/module/${mod.id}`)} className="flex items-center gap-1 text-[var(--color-text-secondary)] text-sm font-medium mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          {mod.title}
        </button>

        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-[var(--color-navy)]" style={{ fontFamily: "var(--font-display)" }}>
            {activite.title}
          </h1>
          <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ backgroundColor: mod.colorLight, color: mod.color }}>
            {currentQ + 1}/{questions.length}
          </span>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mt-3">
          {questions.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full flex-1 transition-all"
              style={{
                backgroundColor: i <= currentQ ? mod.color : "#E2E8F0",
              }}
            />
          ))}
        </div>
      </header>

      {/* Question */}
      <main className="px-5 pb-32">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mt-2 animate-fade-in-up">
          <p className="text-base font-semibold text-[var(--color-navy)] leading-relaxed">
            {q.question}
          </p>
        </div>

        {/* Options */}
        <div className="mt-4 space-y-2">
          {q.type === "classify" ? (
            <>
              {["fait", "opinion"].map((opt) => {
                const isCorrect = q.correctAnswer === opt;
                const isSelected = selected === opt;
                let bg = "bg-white";
                let border = "border-gray-100";
                let textColor = "text-[var(--color-navy)]";
                if (showResult && isSelected && isCorrect) {
                  bg = "bg-green-50";
                  border = "border-green-300";
                  textColor = "text-green-800";
                } else if (showResult && isSelected && !isCorrect) {
                  bg = "bg-red-50";
                  border = "border-red-300";
                  textColor = "text-red-800";
                } else if (showResult && isCorrect) {
                  bg = "bg-green-50";
                  border = "border-green-200";
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(opt)}
                    disabled={showResult}
                    className={`w-full ${bg} rounded-2xl p-4 shadow-sm border ${border} text-left transition-all active:scale-[0.99] ${textColor}`}
                  >
                    <span className="font-bold text-sm capitalize">
                      {showResult && isCorrect && "✓ "}
                      {showResult && isSelected && !isCorrect && "✗ "}
                      {opt === "fait" ? "📊 Fait" : "💬 Opinion"}
                    </span>
                  </button>
                );
              })}
            </>
          ) : (
            q.options?.map((opt, i) => {
              const isCorrect = q.correctAnswer === i;
              const isSelected = selected === i;
              let bg = "bg-white";
              let border = "border-gray-100";
              let textColor = "text-[var(--color-navy)]";
              if (showResult && isSelected && isCorrect) {
                bg = "bg-green-50";
                border = "border-green-300";
                textColor = "text-green-800";
              } else if (showResult && isSelected && !isCorrect) {
                bg = "bg-red-50";
                border = "border-red-300";
                textColor = "text-red-800";
              } else if (showResult && isCorrect) {
                bg = "bg-green-50";
                border = "border-green-200";
              }

              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={showResult}
                  className={`w-full ${bg} rounded-2xl p-4 shadow-sm border ${border} text-left transition-all active:scale-[0.99] ${textColor}`}
                >
                  <span className="font-medium text-sm">{opt}</span>
                </button>
              );
            })
          )}
        </div>

        {/* Explanation */}
        {showResult && (
          <div className="mt-4 animate-fade-in-up">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-[var(--color-primary)] mb-1">Explication</p>
              <p className="text-sm text-[var(--color-navy)] leading-relaxed">{q.explanation}</p>
            </div>
            <button
              onClick={nextQuestion}
              className="w-full mt-4 py-3.5 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-all shadow-md"
              style={{ backgroundColor: mod.color }}
            >
              {currentQ + 1 < questions.length ? "Question suivante →" : "Voir mes résultats"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// Défi component
function DefiPage({
  mod,
  activite,
  onComplete,
  onBack,
}: {
  mod: { id: string; color: string; colorLight: string; title: string };
  activite: { id: string; title: string; description: string; defiDescription?: string };
  onComplete: () => void;
  onBack: () => void;
}) {
  const [completed, setCompleted] = useState(false);

  function handleComplete() {
    onComplete();
    setCompleted(true);
  }

  return (
    <div className="min-h-dvh bg-[var(--color-surface)]">
      <header className="px-5 pt-10 pb-4" style={{ background: `linear-gradient(to bottom, ${mod.colorLight}, var(--color-surface))` }}>
        <button onClick={onBack} className="flex items-center gap-1 text-[var(--color-text-secondary)] text-sm font-medium mb-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          {mod.title}
        </button>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🏆</span>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--color-navy)]" style={{ fontFamily: "var(--font-display)" }}>
              {activite.title}
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{activite.description}</p>
          </div>
        </div>
      </header>

      <main className="px-5 pb-32">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div
            className="fiche-content text-sm"
            dangerouslySetInnerHTML={{ __html: (activite.defiDescription || "").replace(/\n/g, "<br/>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/---/g, '<hr class="my-4 border-gray-200"/>') }}
          />
        </div>

        {!completed ? (
          <button
            onClick={handleComplete}
            className="w-full mt-6 py-3.5 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-all shadow-md"
            style={{ backgroundColor: mod.color }}
          >
            J'ai relevé le défi ! ✓
          </button>
        ) : (
          <div className="mt-6 text-center animate-bounce-in">
            <Mascot size="sm" message="Super travail d'investigation !" />
            <button
              onClick={onBack}
              className="mt-4 w-full py-3.5 rounded-2xl font-bold text-sm text-white active:scale-[0.98] transition-all shadow-md"
              style={{ backgroundColor: mod.color }}
            >
              Retour au module
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
