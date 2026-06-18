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
      <div className="flex items-center justify-between text-xs text-ink/50 mb-2">
        <span>
          Question {step + 1} of {QUESTIONS.length}
        </span>
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="hover:text-ink">
            ← Back
          </button>
        )}
      </div>
      <div className="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-clay transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
        {q.question}
      </h2>
      {q.subtext && <p className="mt-2 text-ink/60">{q.subtext}</p>}

      <div className="mt-6 grid gap-3">
        {q.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => choose(opt.value)}
            className="text-left rounded-2xl border border-ink/15 bg-white px-5 py-4 hover:border-clay hover:bg-blush/20 transition-colors flex items-center justify-between gap-4"
          >
            <span className="font-medium">{opt.label}</span>
            {opt.hint && (
              <span className="text-xs text-ink/50 shrink-0">{opt.hint}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
