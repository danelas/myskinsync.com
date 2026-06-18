import type { Metadata } from "next";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = {
  title: "Skin Type Quiz — Build Your Routine",
  description:
    "Answer 4 quick questions and get a personalized AM/PM skincare routine matched to your skin type, concern, sensitivity, and budget.",
};

export default function QuizPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <Quiz />
    </div>
  );
}
