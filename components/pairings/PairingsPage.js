"use client";

import { useMemo } from "react";
import { useApp } from "@/lib/AppContext";
import { getPairings } from "@/lib/pairingsEngine";
import PairingCard from "./PairingCard";
import EmptyState from "@/components/ui/EmptyState";

export default function PairingsPage() {
  const { inventory, profile, hydrated } = useApp();

  const pairings = useMemo(
    () => getPairings(inventory, profile),
    [inventory, profile]
  );

  if (!hydrated) return null;

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="page-title">Smart Pairings</h1>
      <p className="page-subtitle">
        Colour harmony rules, technique tips, and gap warnings — all based on what you own.
      </p>

      {pairings.length === 0 ? (
        <EmptyState
          icon="✦"
          title="Add more products"
          description="Smart pairings need at least two or three products to generate suggestions and harmony rules."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {pairings.map((pairing, i) => (
            <PairingCard key={i} pairing={pairing} />
          ))}
        </div>
      )}
    </div>
  );
}
