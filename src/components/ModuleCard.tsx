"use client";

import Link from "next/link";
import { type Module } from "@/data/modules";

interface ModuleCardProps {
  module: Module;
  progress: number;
  index: number;
}

export default function ModuleCard({ module, progress, index }: ModuleCardProps) {
  return (
    <Link
      href={`/module/${module.id}`}
      className="block group"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: module.colorLight }}
          >
            {module.icon}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[var(--color-navy)] text-sm leading-tight">
              {module.title}
            </h3>
            <p className="text-[var(--color-text-secondary)] text-xs mt-0.5">
              {module.description}
            </p>

            {/* Progress bar */}
            <div className="mt-2.5">
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: module.color,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Arrow */}
          <svg
            className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0 mt-1"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
