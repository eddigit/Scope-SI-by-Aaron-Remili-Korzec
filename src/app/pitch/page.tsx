"use client";

import { useState } from "react";

const slides = [
  {
    id: 1,
    title: "InfoScope",
    subtitle: "Deviens un detective de l'information !",
    content: null,
    isTitleSlide: true,
    bg: "bg-primary",
    notes: "Bonjour ! Je m'appelle [TON PRENOM] et je vais vous presenter InfoScope, une application que j'ai creee.",
  },
  {
    id: 2,
    title: "Le probleme",
    subtitle: null,
    content: [
      "Chaque jour, on voit des centaines d'infos sur nos telephones",
      "Sur TikTok, Instagram, YouTube, WhatsApp...",
      "Mais comment savoir si c'est VRAI ou FAUX ?",
    ],
    isTitleSlide: false,
    bg: "bg-danger",
    notes: "Vous avez deja vu une info bizarre sur internet et vous ne saviez pas si c'etait vrai ?",
  },
  {
    id: 3,
    title: "La solution : InfoScope !",
    subtitle: "3 super-pouvoirs a debloquer",
    content: null,
    isTitleSlide: false,
    bg: "bg-accent",
    notes: "InfoScope vous apprend 3 super-pouvoirs pour ne plus vous faire avoir !",
  },
  {
    id: 4,
    title: "Super-pouvoir 1",
    subtitle: "Fait ou Opinion ?",
    content: [
      "\"Le chocolat c'est le meilleur\" = OPINION (c'est un avis)",
      "\"La Tour Eiffel fait 330m\" = FAIT (on peut verifier)",
      "Apprendre a faire la difference, c'est la cle !",
    ],
    isTitleSlide: false,
    bg: "bg-primary",
    notes: "Premier pouvoir : savoir si quelqu'un donne un fait ou juste son opinion personnelle.",
  },
  {
    id: 5,
    title: "Super-pouvoir 2",
    subtitle: "Verifier les sources",
    content: [
      "Qui a ecrit ca ? Un expert ou n'importe qui ?",
      "Un message WhatsApp transfere 10 fois = pas fiable",
      "Un article de journal serieux = plus fiable",
    ],
    isTitleSlide: false,
    bg: "bg-secondary",
    notes: "Deuxieme pouvoir : toujours regarder QUI donne l'information.",
  },
  {
    id: 6,
    title: "Super-pouvoir 3",
    subtitle: "Les pieges du cerveau",
    content: [
      "Notre cerveau prend des raccourcis",
      "On croit plus facilement quelqu'un de celebre",
      "On croit ce qu'on VEUT croire",
      "InfoScope vous apprend a eviter ces pieges !",
    ],
    isTitleSlide: false,
    bg: "bg-purple",
    notes: "Troisieme pouvoir : comprendre que notre cerveau peut nous tromper parfois.",
  },
  {
    id: 7,
    title: "Comment ca marche ?",
    subtitle: null,
    content: [
      "1. Entre le code de ta classe",
      "2. Choisis un pseudo (pas ton vrai nom !)",
      "3. Lis les fiches explicatives",
      "4. Fais des quiz et des defis",
      "5. Gagne des badges !",
    ],
    isTitleSlide: false,
    bg: "bg-primary",
    notes: "C'est super simple a utiliser. Je vais vous montrer !",
  },
  {
    id: 8,
    title: "Les badges a gagner",
    subtitle: null,
    content: [
      "Detecteur de faits",
      "Chasseur de sources",
      "Expert anti-biais",
      "Maitre InfoScope",
    ],
    isTitleSlide: false,
    bg: "bg-secondary",
    notes: "Plus vous progressez, plus vous gagnez de badges !",
  },
  {
    id: 9,
    title: "Demo en direct !",
    subtitle: "Je vous montre l'application",
    content: null,
    isTitleSlide: true,
    bg: "bg-accent",
    notes: "Maintenant, je vais vous montrer comment fonctionne l'application en vrai.",
  },
  {
    id: 10,
    title: "Merci !",
    subtitle: "Des questions ?",
    content: null,
    isTitleSlide: true,
    bg: "bg-primary",
    notes: "Merci de m'avoir ecoute ! Est-ce que vous avez des questions ?",
  },
];

// Owl mascot SVG
function Mascot({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mascotte hibou InfoScope"
    >
      {/* Body */}
      <ellipse cx="50" cy="58" rx="32" ry="34" fill="#3B82F6" />
      {/* Belly */}
      <ellipse cx="50" cy="65" rx="20" ry="22" fill="#DBEAFE" />
      {/* Left eye white */}
      <circle cx="38" cy="45" r="14" fill="white" />
      {/* Right eye white */}
      <circle cx="62" cy="45" r="14" fill="white" />
      {/* Left pupil */}
      <circle cx="40" cy="46" r="7" fill="#1E293B" />
      {/* Right pupil */}
      <circle cx="64" cy="46" r="7" fill="#1E293B" />
      {/* Left eye shine */}
      <circle cx="42" cy="44" r="2.5" fill="white" />
      {/* Right eye shine */}
      <circle cx="66" cy="44" r="2.5" fill="white" />
      {/* Beak */}
      <path d="M50 52 L46 58 L50 62 L54 58 Z" fill="#F59E0B" />
      {/* Left ear tuft */}
      <path
        d="M25 30 Q30 20 35 28 Q32 35 28 32 Z"
        fill="#3B82F6"
      />
      {/* Right ear tuft */}
      <path
        d="M75 30 Q70 20 65 28 Q68 35 72 32 Z"
        fill="#3B82F6"
      />
      {/* Magnifying glass handle */}
      <rect
        x="72"
        y="70"
        width="6"
        height="18"
        rx="3"
        fill="#92400E"
        transform="rotate(-30 72 70)"
      />
      {/* Magnifying glass ring */}
      <circle
        cx="68"
        cy="62"
        r="12"
        stroke="#F59E0B"
        strokeWidth="4"
        fill="#DBEAFE"
        fillOpacity="0.5"
      />
    </svg>
  );
}

export default function PitchPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const slide = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Keyboard navigation
  if (typeof window !== "undefined") {
    window.onkeydown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        nextSlide();
      } else if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "n") {
        setShowNotes(!showNotes);
      }
    };
  }

  return (
    <div className={`min-h-screen ${slide.bg} flex flex-col transition-colors duration-500`}>
      {/* Header with progress */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <Mascot size={48} />
          <span className="text-white font-bold text-lg font-[var(--font-display)]">InfoScope</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/80 text-sm">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="text-white/80 hover:text-white text-sm px-3 py-1 rounded-full border border-white/30 hover:border-white/60 transition-colors"
          >
            {showNotes ? "Cacher notes" : "Voir notes"}
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="px-6">
        <div className="h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Slide content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12 text-center">
        {slide.isTitleSlide ? (
          <div className="animate-fade-in-up">
            <Mascot size={160} />
            <h1 className="text-5xl md:text-7xl font-[var(--font-display)] font-black text-white mt-8 mb-4">
              {slide.title}
            </h1>
            {slide.subtitle && (
              <p className="text-2xl md:text-3xl text-white/90 font-medium">
                {slide.subtitle}
              </p>
            )}
          </div>
        ) : (
          <div className="max-w-3xl animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-[var(--font-display)] font-black text-white mb-4">
              {slide.title}
            </h2>
            {slide.subtitle && (
              <p className="text-xl md:text-2xl text-white/90 font-semibold mb-8">
                {slide.subtitle}
              </p>
            )}
            {slide.content && (
              <ul className="text-left space-y-4 mt-8">
                {slide.content.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-4 text-xl md:text-2xl text-white"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </main>

      {/* Notes panel */}
      {showNotes && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-navy text-white px-6 py-4 rounded-2xl shadow-2xl max-w-xl mx-auto animate-fade-in-up">
          <p className="text-sm font-medium text-white/60 mb-1">Notes pour le presentateur :</p>
          <p className="text-base">{slide.notes}</p>
        </div>
      )}

      {/* Navigation */}
      <footer className="flex items-center justify-between px-6 py-6 safe-bottom">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Precedent
        </button>

        {/* Slide dots */}
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/20 text-white font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/30 transition-colors"
        >
          Suivant
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </footer>

      {/* Keyboard hints */}
      <div className="fixed bottom-4 right-4 text-white/50 text-xs">
        Fleches pour naviguer | N pour notes
      </div>
    </div>
  );
}
