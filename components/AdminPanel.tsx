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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AdminPanel({ turnierId }: { turnierId: string }) {
  const router = useRouter();
  const [mannschaften, setMannschaften] = useState<Mannschaft[]>([]);
  const [gruppen, setGruppen] = useState<Gruppe[]>([]);
  const [gruppenMannschaften, setGruppenMannschaften] = useState<GruppenMannschaft[]>([]);
  const [spiele, setSpiele] = useState<Spiel[]>([]);

  // Form states
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
      <Card>
        <CardHeader>
          <CardTitle>Mannschaften</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddTeam} className="flex flex-wrap gap-2">
            <Input
              placeholder="Teamname *"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
              className="w-40"
            />
            <Input
              placeholder="Kapitän"
              value={kapitaenName}
              onChange={(e) => setKapitaenName(e.target.value)}
              className="w-36"
            />
            <Input
              placeholder="Mobil"
              value={kapitaenMobile}
              onChange={(e) => setKapitaenMobile(e.target.value)}
              className="w-36"
            />
            <Button type="submit">Hinzufügen</Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {mannschaften.map((m) => (
              <Badge key={m.id} variant="outline" className="gap-1 py-1">
                {m.team_name}
                <button
                  onClick={() => handleDeleteTeam(m.id)}
                  className="ml-1 text-destructive hover:text-destructive/80"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gruppen */}
      <Card>
        <CardHeader>
          <CardTitle>Gruppen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleAddGruppe} className="flex gap-2">
            <Input
              placeholder="Gruppenname"
              value={gruppeName}
              onChange={(e) => setGruppeName(e.target.value)}
              required
              className="w-48"
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
              <Card key={gruppe.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">
                    {gruppe.gruppe_name}
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
                <CardContent className="space-y-3">
                  {/* Zugeordnete Mannschaften */}
                  <div className="flex flex-wrap gap-1">
                    {zugeordnet.map((mid) => {
                      const m = mannschaftMap.get(mid);
                      return (
                        <Badge key={mid} className="gap-1">
                          {m?.team_name}
                          <button
                            onClick={() =>
                              handleRemoveFromGroup(gruppe.id, mid)
                            }
                            className="ml-1 hover:opacity-70"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Hinzufügen */}
                  {nichtZugeordnet.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-sm text-muted-foreground mr-1 self-center">
                        Hinzufügen:
                      </span>
                      {nichtZugeordnet.map((m) => (
                        <Button
                          key={m.id}
                          variant="ghost"
                          size="sm"
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
                      <h4 className="text-sm font-semibold">Ergebnisse eintragen</h4>
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

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="flex-1 text-right">{teamA}</span>
      <Input
        type="number"
        min={0}
        value={scoreA}
        onChange={(e) => setScoreA(e.target.value)}
        className="w-16 text-center"
      />
      <span>:</span>
      <Input
        type="number"
        min={0}
        value={scoreB}
        onChange={(e) => setScoreB(e.target.value)}
        className="w-16 text-center"
      />
      <span className="flex-1">{teamB}</span>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onSave(spiel.id, scoreA, scoreB)}
      >
        Speichern
      </Button>
      {spiel.status === "beendet" && (
        <Badge variant="default">Beendet</Badge>
      )}
    </div>
  );
}
