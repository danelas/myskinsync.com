"use client";

import { useState } from "react";
import { QUESTIONS } from "@/lib/quiz";
import { buildRoutine } from "@/lib/routine";
import type { Answers } from "@/lib/types";
import { RoutineResult } from "./RoutineResult";

export function Quiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [done, setDone] = useState(false);

  const q = QUESTIONS[step];
  const progress = Math.round(((step + (done ? 1 : 0)) / QUESTIONS.length) * 100);

  function choose(value: string) {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  }

  function restart() {
    setAnswers({});
    setStep(0);
    setDone(false);
  }

  if (done) {
    const routine = buildRoutine(answers as Answers);
    return (
      <RoutineResult
        routine={routine}
        answers={answers as Answers}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs font-medium text-ink/50 mb-2">
        <span>
          Question {step + 1} of {QUESTIONS.length}
        </span>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="hover:text-ink transition-colors">
            ← Back
          </button>
        )}
      </div>
      <div className="h-2 w-full bg-ink/10 rounded-full overflow-hidden mb-10">
        <div
          className="h-full bg-clay rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="text-3xl sm:text-4xl font-semibold">{q.question}</h2>
      {q.subtext && <p className="mt-3 text-ink/60 text-lg">{q.subtext}</p>}

      <div className="mt-7 grid gap-3">
        {q.options.map((opt, i) => (
          <button
            key={opt.value}
            onClick={() => choose(opt.value)}
            className="group text-left rounded-2xl border border-ink/15 bg-white px-5 py-4 shadow-soft hover:border-clay hover:shadow-lift hover:-translate-y-0.5 transition-all flex items-center gap-4"
          >
            <span className="h-8 w-8 shrink-0 rounded-full border border-ink/15 text-ink/50 text-sm font-semibold flex items-center justify-center group-hover:border-clay group-hover:bg-clay group-hover:text-cream transition-colors">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="flex-1 font-medium">{opt.label}</span>
            {opt.hint && (
              <span className="text-xs text-ink/50 shrink-0">{opt.hint}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
