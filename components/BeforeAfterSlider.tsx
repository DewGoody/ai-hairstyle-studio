"use client";

import { useRef, useState } from "react";

export function BeforeAfterSlider({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);

  const setFromClientX = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    setPct((x / rect.width) * 100);
  };

  return (
    <div
      ref={wrapRef}
      className="relative aspect-[3/4] rounded-xl overflow-hidden bg-paper select-none touch-none"
      onPointerDown={(e) => {
        (e.target as Element).setPointerCapture?.(e.pointerId);
        setFromClientX(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 0) return;
        setFromClientX(e.clientX);
      }}
    >
      <img src={after} alt="after" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <img src={before} alt="before" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${100 / (pct || 1) * 100}%` }} />
      </div>
      <div className="absolute inset-y-0" style={{ left: `${pct}%` }}>
        <div className="h-full w-[2px] bg-cream" />
        <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-cream shadow-md" />
      </div>
      <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.2em] bg-cream/80 text-ink rounded px-1.5 py-0.5">
        Before
      </span>
      <span className="absolute top-2 right-2 text-[9px] uppercase tracking-[0.2em] bg-coral/90 text-cream rounded px-1.5 py-0.5">
        After
      </span>
    </div>
  );
}
