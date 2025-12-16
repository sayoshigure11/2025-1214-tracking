"use client";

import { trackWithExperiment } from "@/lib/trackWithExperiment";
import { useState } from "react";

export default function HomePage({ abVariant }: { abVariant: "A" | "B" }) {
  const [clickCount, setClickCount] = useState<number>(0);

  return (
    <main>
      <h1>
        {abVariant === "A" ? "最短で学ぶ Next.js" : "Next.js を実務レベルへ"}
      </h1>

      <button
        onClick={() => {
          setClickCount((prev) => prev + 1);
          trackWithExperiment(abVariant, "hero-copy-test", "click_cta", {
            location: "hero",
          });
        }}
      >
        CTA：{clickCount}
      </button>
    </main>
  );
}
