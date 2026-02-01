"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  mannschaftHinzufuegen,
  mannschaftLoeschen,
  gruppeErstellen,
  gruppeLoeschen,
  mannschaftZuGruppeHinzufuegen,
  mannschaftAusGruppeEntfernen,
  spielplanGenerieren,
  ergebnisEintragen,
} from "@/lib/actions";
import { Mannschaft, Gruppe, GruppenMannschaft, Spiel } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AdminPanel({ turnierId }: { turnierId: string }) {
  const router = useRouter();
  const [mannschaften, setMannschaften] = useState<Mannschaft[]>([]);
  const [gruppen, setGruppen] = useState<Gruppe[]>([]);
  const [gruppenMannschaften, setGruppenMannschaften] = useState<GruppenMannschaft[]>([]);
  const [spiele, setSpiele] = useState<Spiel[]>([]);

  const [teamName, setTeamName] = useState("");
  const [kapitaenName, setKapitaenName] = useState("");
  const [kapitaenMobile, setKapitaenMobile] = useState("");
  const [gruppeName, setGruppeName] = useState("");

  const laden = useCallback(async () => {
    const [m, g, gm, s] = await Promise.all([
      supabase.from("mannschaften").select("*").eq("turnier_id", turnierId),
      supabase.from("gruppen").select("*").eq("turnier_id", turnierId).order("gruppe_name"),
      supabase.from("gruppen_mannschaften").select("*"),
      supabase.from("spiele").select("*"),
    ]);
    setMannschaften((m.data || []) as Mannschaft[]);
    setGruppen((g.data || []) as Gruppe[]);
    setGruppenMannschaften((gm.data || []) as GruppenMannschaft[]);
    setSpiele((s.data || []) as Spiel[]);
  }, [turnierId]);

  useEffect(() => {
    laden();
  }, [laden]);

  async function handleAddTeam(e: React.FormEvent) {
    e.preventDefault();
    await mannschaftHinzufuegen(turnierId, teamName, kapitaenName, kapitaenMobile);
    setTeamName("");
    setKapitaenName("");
    setKapitaenMobile("");
    laden();
    router.refresh();
  }

  async function handleDeleteTeam(id: string) {
    await mannschaftLoeschen(turnierId, id);
    laden();
    router.refresh();
  }

  async function handleAddGruppe(e: React.FormEvent) {
    e.preventDefault();
    await gruppeErstellen(turnierId, gruppeName);
    setGruppeName("");
    laden();
    router.refresh();
  }

  async function handleDeleteGruppe(id: string) {
    await gruppeLoeschen(turnierId, id);
    laden();
    router.refresh();
  }

  async function handleAddToGroup(gruppeId: string, mannschaftId: string) {
    await mannschaftZuGruppeHinzufuegen(turnierId, gruppeId, mannschaftId);
    laden();
    router.refresh();
  }

  async function handleRemoveFromGroup(gruppeId: string, mannschaftId: string) {
    await mannschaftAusGruppeEntfernen(turnierId, gruppeId, mannschaftId);
    laden();
    router.refresh();
  }

  async function handleGenerateSpielplan(gruppeId: string) {
    try {
      await spielplanGenerieren(turnierId, gruppeId);
      laden();
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fehler");
    }
  }

  async function handleErgebnis(spielId: string, scoreA: string, scoreB: string) {
    const a = parseInt(scoreA);
    const b = parseInt(scoreB);
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0) return;
    await ergebnisEintragen(turnierId, spielId, a, b);
    laden();
    router.refresh();
  }

  const mannschaftMap = new Map(mannschaften.map((m) => [m.id, m]));

  return (
    <div className="space-y-8">
      {/* Mannschaften */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Mannschaften
            <Badge variant="secondary" className="text-xs font-normal">
              {mannschaften.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddTeam} className="flex flex-wrap gap-2">
            <Input
              placeholder="Teamname *"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              className="w-44"
            />
            <Input
              placeholder="Kapitän"
              value={kapitaenName}
              onChange={(e) => setKapitaenName(e.target.value)}
              className="w-40"
            />
            <Input
              placeholder="Mobil"
              value={kapitaenMobile}
              onChange={(e) => setKapitaenMobile(e.target.value)}
              className="w-40"
            />
            <Button type="submit">Hinzufügen</Button>
          </form>
          {mannschaften.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mannschaften.map((m) => (
                <Badge
                  key={m.id}
                  variant="outline"
                  className="gap-1.5 py-1.5 px-3 text-sm"
                >
                  {m.team_name}
                  {m.kapitaen_name && (
                    <span className="text-muted-foreground">
                      ({m.kapitaen_name})
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteTeam(m.id)}
                    className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-xs text-destructive hover:bg-destructive/10"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gruppen */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Gruppen
            <Badge variant="secondary" className="text-xs font-normal">
              {gruppen.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleAddGruppe} className="flex gap-2">
            <Input
              placeholder="z.B. Gruppe A"
              value={gruppeName}
              onChange={(e) => setGruppeName(e.target.value)}
              required
              className="w-52"
            />
            <Button type="submit">Gruppe erstellen</Button>
          </form>

          {gruppen.map((gruppe) => {
            const zugeordnet = gruppenMannschaften
              .filter((gm) => gm.gruppe_id === gruppe.id)
              .map((gm) => gm.mannschaft_id);
            const nichtZugeordnet = mannschaften.filter(
              (m) => !zugeordnet.includes(m.id)
            );
            const gruppeSpiele = spiele.filter(
              (s) => s.gruppe_id === gruppe.id
            );

            return (
              <Card key={gruppe.id} className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base font-semibold">
                    {gruppe.gruppe_name}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {zugeordnet.length} Teams
                    </span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateSpielplan(gruppe.id)}
                    >
                      Spielplan generieren
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteGruppe(gruppe.id)}
                    >
                      Löschen
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Zugeordnete Mannschaften */}
                  {zugeordnet.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {zugeordnet.map((mid) => {
                        const m = mannschaftMap.get(mid);
                        return (
                          <Badge key={mid} className="gap-1 py-1">
                            {m?.team_name}
                            <button
                              onClick={() =>
                                handleRemoveFromGroup(gruppe.id, mid)
                              }
                              className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full text-xs hover:opacity-70"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Hinzufügen */}
                  {nichtZugeordnet.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/50 p-2">
                      <span className="mr-1 text-xs font-medium text-muted-foreground">
                        Hinzufügen:
                      </span>
                      {nichtZugeordnet.map((m) => (
                        <Button
                          key={m.id}
                          variant="secondary"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() =>
                            handleAddToGroup(gruppe.id, m.id)
                          }
                        >
                          + {m.team_name}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Spiele / Ergebnisse */}
                  {gruppeSpiele.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Ergebnisse eintragen
                      </h4>
                      <div className="space-y-2">
                        {gruppeSpiele.map((s) => (
                          <SpielErgebnis
                            key={s.id}
                            spiel={s}
                            teamA={mannschaftMap.get(s.team_a_id)?.team_name || "?"}
                            teamB={mannschaftMap.get(s.team_b_id)?.team_name || "?"}
                            onSave={handleErgebnis}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function SpielErgebnis({
  spiel,
  teamA,
  teamB,
  onSave,
}: {
  spiel: Spiel;
  teamA: string;
  teamB: string;
  onSave: (spielId: string, scoreA: string, scoreB: string) => void;
}) {
  const [scoreA, setScoreA] = useState(
    spiel.score_team_a?.toString() || ""
  );
  const [scoreB, setScoreB] = useState(
    spiel.score_team_b?.toString() || ""
  );

  const beendet = spiel.status === "beendet";

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-colors ${
        beendet ? "bg-primary/5 border-primary/20" : "bg-card"
      }`}
    >
      <span className="flex-1 text-right font-medium">{teamA}</span>
      <Input
        type="number"
        min={0}
        value={scoreA}
        onChange={(e) => setScoreA(e.target.value)}
        className="w-16 text-center font-mono font-bold"
      />
      <span className="text-muted-foreground font-bold">:</span>
      <Input
        type="number"
        min={0}
        value={scoreB}
        onChange={(e) => setScoreB(e.target.value)}
        className="w-16 text-center font-mono font-bold"
      />
      <span className="flex-1 font-medium">{teamB}</span>
      <Button
        size="sm"
        onClick={() => onSave(spiel.id, scoreA, scoreB)}
      >
        Speichern
      </Button>
      {beendet && (
        <Badge variant="default" className="ml-1">
          Beendet
        </Badge>
      )}
    </div>
  );
}
