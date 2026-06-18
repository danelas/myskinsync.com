import type { SkinType, Concern, Budget } from "./types";

export interface QuizOption<T = string> {
  value: T;
  label: string;
  hint?: string;
}
export interface QuizQuestion {
  key: "skinType" | "concern" | "sensitive" | "budget";
  question: string;
  subtext?: string;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    key: "skinType",
    question: "How does your skin usually feel?",
    subtext: "A few hours after washing, with nothing on it.",
    options: [
      { value: "dry", label: "Tight, flaky, or rough", hint: "Dry" },
      { value: "oily", label: "Shiny and greasy all over", hint: "Oily" },
      { value: "combination", label: "Oily T-zone, dry cheeks", hint: "Combination" },
      { value: "normal", label: "Comfortable and balanced", hint: "Normal" },
    ] as QuizOption<SkinType>[],
  },
  {
    key: "concern",
    question: "What's your #1 skin goal right now?",
    subtext: "Pick the one that bothers you most.",
    options: [
      { value: "acne", label: "Clear up breakouts", hint: "Acne" },
      { value: "dryness", label: "Hydrate & stop tightness", hint: "Dryness" },
      { value: "redness", label: "Calm redness & irritation", hint: "Sensitivity" },
      { value: "darkspots", label: "Fade dark spots / marks", hint: "Hyperpigmentation" },
      { value: "texture", label: "Smooth texture & pores", hint: "Texture" },
      { value: "aging", label: "Soften fine lines", hint: "Anti-aging" },
    ] as QuizOption<Concern>[],
  },
  {
    key: "sensitive",
    question: "Does your skin react easily?",
    subtext: "Stinging, redness, or breakouts from new products.",
    options: [
      { value: "yes", label: "Yes, it's reactive", hint: "Gentle picks only" },
      { value: "no", label: "No, it tolerates most things", hint: "Full strength ok" },
    ],
  },
  {
    key: "budget",
    question: "What's your budget per product?",
    options: [
      { value: "budget", label: "Drugstore ($)", hint: "Under ~$15" },
      { value: "mid", label: "Mid-range ($$)", hint: "~$15–35" },
      { value: "premium", label: "Treat myself ($$$)", hint: "$35+" },
    ] as QuizOption<Budget>[],
  },
];
