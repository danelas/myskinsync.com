"use client";

import { useState } from "react";
import type { Answers } from "@/lib/types";
import { MailIcon } from "./Icons";

type RoutineSummary = Record<string, { label: string; id: string; brand: string; name: string }[]>;

export function EmailCapture({ profile, routine }: { profile: Answers; routine: RoutineSummary }) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setMsg("");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, hp, profile, routine }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) {
        setState("done");
      } else {
        setState("error");
        setMsg(j.error || "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Network error. Please try again.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-4xl bg-sage/15 border border-sage/40 p-7 text-center">
        <p className="font-display text-2xl font-semibold">You&apos;re on the list ✓</p>
        <p className="mt-2 text-ink/70">
          We saved your routine to <span className="font-medium">{email}</span>. Keep an eye on
          your inbox for it, plus simple skincare tips.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-4xl bg-white border border-ink/10 shadow-soft p-7 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blush/40 text-clayDark">
        <MailIcon className="h-6 w-6" />
      </span>
      <h3 className="mt-3 font-display text-2xl font-semibold">Want this routine emailed to you?</h3>
      <p className="mt-2 text-ink/70">
        Get your personalized routine in your inbox so you have it when you shop — plus
        occasional, no-spam skincare tips.
      </p>
      {/* Honeypot (hidden from humans) */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="hidden"
        aria-hidden="true"
      />
      <div className="mt-5 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          required
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-full border border-ink/15 bg-cream px-5 py-3 focus:border-clay outline-none"
        />
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-full bg-ink text-cream font-semibold px-6 py-3 shadow-soft hover:bg-clay hover:-translate-y-0.5 transition-all disabled:opacity-60"
        >
          {state === "loading" ? "Sending…" : "Email me my routine"}
        </button>
      </div>
      {state === "error" && <p className="mt-3 text-sm text-clayDark">{msg}</p>}
      <p className="mt-3 text-xs text-ink/45">No spam. Unsubscribe anytime.</p>
    </form>
  );
}
