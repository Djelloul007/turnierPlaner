"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";

export function TurnierFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [suche, setSuche] = useState(searchParams.get("suche") || "");
  const [jahr, setJahr] = useState(searchParams.get("jahr") || "");
  const [monat, setMonat] = useState(searchParams.get("monat") || "");

  const anwenden = useCallback(() => {
    const params = new URLSearchParams();
    if (suche) params.set("suche", suche);
    if (jahr) params.set("jahr", jahr);
    if (monat) params.set("monat", monat);
    router.push(`/?${params.toString()}`);
  }, [suche, jahr, monat, router]);

  const zuruecksetzen = () => {
    setSuche("");
    setJahr("");
    setMonat("");
    router.push("/");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Input
        placeholder="Name suchen..."
        value={suche}
        onChange={(e) => setSuche(e.target.value)}
        className="w-48"
        onKeyDown={(e) => e.key === "Enter" && anwenden()}
      />
      <Input
        placeholder="Jahr"
        type="number"
        value={jahr}
        onChange={(e) => setJahr(e.target.value)}
        className="w-24"
        onKeyDown={(e) => e.key === "Enter" && anwenden()}
      />
      <Input
        placeholder="Monat (1-12)"
        type="number"
        min={1}
        max={12}
        value={monat}
        onChange={(e) => setMonat(e.target.value)}
        className="w-32"
        onKeyDown={(e) => e.key === "Enter" && anwenden()}
      />
      <Button onClick={anwenden}>Filtern</Button>
      <Button variant="ghost" onClick={zuruecksetzen}>
        Zurücksetzen
      </Button>
    </div>
  );
}
