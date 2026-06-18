export type SkinType = "dry" | "oily" | "combination" | "normal" | "sensitive";
export type Concern =
  | "acne"
  | "dryness"
  | "aging"
  | "redness"
  | "darkspots"
  | "texture";
export type Budget = "budget" | "mid" | "premium";
export type Step = "cleanser" | "exfoliant" | "treatment" | "moisturizer" | "spf";
export type Phase = "am" | "pm" | "both";

export interface Product {
  id: string;
  brand: string;
  name: string;
  step: Step;
  phase?: Phase; // for treatments: when to use it
  skinTypes: (SkinType | "all")[];
  concerns: Concern[];
  sensitiveSafe: boolean;
  budget: Budget;
  popularity: number; // demand rank from The Listener brief (mentions)
  asin?: string; // fill in once you have the exact product; falls back to search
  searchTerms?: string;
  blurb: string;
}

export interface Answers {
  skinType: SkinType;
  concern: Concern;
  sensitive: "yes" | "no";
  budget: Budget;
}

export interface RoutineStep {
  label: string;
  product: Product;
  why: string;
  frequency?: string;
}

export interface Routine {
  am: RoutineStep[];
  pm: RoutineStep[];
  weekly: RoutineStep[];
}
