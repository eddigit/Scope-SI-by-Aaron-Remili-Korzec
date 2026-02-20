"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Mascot from "@/components/Mascot";
import { VALID_CLASS_CODES, TEACHER_CODES } from "@/data/modules";
import { apiJoin, apiGetMe } from "@/lib/api";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [step, setStep] = useState<"code" | "pseudo">("code");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetMe().then((session) => {
      if (session) {
        router.replace("/dashboard");
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-b from-blue-50 via-white to-blue-50">
        <Mascot size="lg" message="Chargement..." />
      </div>
    );
  }

  function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();

    if (TEACHER_CODES[cleaned]) {
      router.push(`/enseignant?code=${TEACHER_CODES[cleaned]}&teacher=${cleaned}`);
      return;
    }

    if (VALID_CLASS_CODES.includes(cleaned)) {
      setError("");
      setStep("pseudo");
    } else {
      setError("Code classe non reconnu. Vérifie avec ton enseignant !");
    }
  }

  async function handlePseudoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const cleaned = code.trim().toUpperCase();
    try {
      await apiJoin(cleaned, pseudo.trim() || "Explorateur");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <header className="pt-12 pb-4 px-6 text-center">
        <div className="animate-fade-in-up">
          <Mascot size="lg" />
        </div>
        <h1
          className="mt-4 text-3xl font-extrabold text-[var(--color-navy)] animate-fade-in-up"
          style={{ fontFamily: "var(--font-display)", animationDelay: "0.1s" }}
        >
          InfoScope
        </h1>
        <p
          className="text-[var(--color-primary)] font-semibold text-sm mt-1 animate-fade-in-up"
          style={{ animationDelay: "0.15s" }}
        >
          Portail Élève
        </p>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 -mt-4">
        {step === "code" ? (
          <div className="w-full max-w-sm animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-blue-50">
              <p className="text-center text-[var(--color-navy)] font-bold text-lg mb-1">
                Bienvenue, Explorateur !
              </p>
              <p className="text-center text-[var(--color-text-secondary)] text-sm mb-6">
                Prêt à enquêter ? Entre ton code classe ci-dessous.
              </p>

              <form onSubmit={handleCodeSubmit}>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                    🔍
                  </span>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setError("");
                    }}
                    placeholder="EX : FREINET-6B"
                    className="w-full pl-12 pr-4 py-4 bg-[var(--color-surface)] border-2 border-gray-100 rounded-2xl text-center font-bold text-lg tracking-wider uppercase placeholder:text-gray-300 placeholder:font-normal placeholder:text-sm placeholder:normal-case focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all"
                    autoComplete="off"
                    autoCapitalize="characters"
                  />
                </div>

                {error && (
                  <p className="text-[var(--color-danger)] text-xs text-center mt-3 font-medium animate-fade-in-up">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-4 rounded-2xl text-base transition-all active:scale-[0.98] shadow-md shadow-blue-200"
                >
                  Rejoindre →
                </button>
              </form>

              <p className="text-center text-[10px] text-gray-400 mt-4">
                Code DEMO-2026 pour tester librement
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm animate-fade-in-up">
            <div className="bg-white rounded-3xl shadow-lg p-6 border border-blue-50">
              <p className="text-center text-[var(--color-navy)] font-bold text-lg mb-1">
                Choisis un pseudo
              </p>
              <p className="text-center text-[var(--color-text-secondary)] text-sm mb-6">
                Optionnel — aucune donnée personnelle n'est collectée.
              </p>

              <form onSubmit={handlePseudoSubmit}>
                <input
                  type="text"
                  value={pseudo}
                  onChange={(e) => setPseudo(e.target.value)}
                  placeholder="Ton pseudo (ou laisse vide)"
                  className="w-full px-4 py-4 bg-[var(--color-surface)] border-2 border-gray-100 rounded-2xl text-center font-semibold text-base placeholder:text-gray-300 placeholder:font-normal placeholder:text-sm focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-100 transition-all"
                  autoComplete="off"
                  maxLength={20}
                />

                <button
                  type="submit"
                  className="w-full mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold py-4 rounded-2xl text-base transition-all active:scale-[0.98] shadow-md shadow-blue-200"
                >
                  C'est parti ! 🚀
                </button>

                <button
                  type="button"
                  onClick={() => setStep("code")}
                  className="w-full mt-2 text-[var(--color-text-secondary)] text-sm font-medium py-2"
                >
                  ← Retour
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center pb-6 px-6">
        <p className="text-[10px] text-gray-400">
          Zéro donnée personnelle collectée · Conçu avec la pédagogie Freinet
        </p>
      </footer>
    </div>
  );
}
