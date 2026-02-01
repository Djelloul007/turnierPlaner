import { supabase } from "@/lib/supabase";
import { tabelleBerechnen } from "@/lib/actions";
import { Turnier, Gruppe, Mannschaft, Spiel, GruppenMannschaft } from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RefreshButton } from "@/components/RefreshButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const MONATE = [
  "", "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export default async function TurnierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: turnier } = await supabase
    .from("turniere")
    .select("*")
    .eq("id", id)
    .single();

  if (!turnier) notFound();

  const t = turnier as Turnier;

  const { data: gruppen } = await supabase
    .from("gruppen")
    .select("*")
    .eq("turnier_id", id)
    .order("gruppe_name");

  const { data: mannschaften } = await supabase
    .from("mannschaften")
    .select("*")
    .eq("turnier_id", id);

  const { data: gruppenMannschaften } = await supabase
    .from("gruppen_mannschaften")
    .select("*");

  const { data: spiele } = await supabase
    .from("spiele")
    .select("*");

  const mannschaftMap = new Map(
    ((mannschaften || []) as Mannschaft[]).map((m) => [m.id, m])
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge variant="secondary" className="text-sm font-medium">
              {MONATE[t.monat]} {t.jahr}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {(gruppen || []).length} Gruppe(n)
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <RefreshButton />
          <Link href={`/turnier/${id}/admin`}>
            <Button variant="outline" size="sm">
              Admin
            </Button>
          </Link>
        </div>
      </div>

      {(!gruppen || gruppen.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-medium text-muted-foreground">
              Noch keine Gruppen angelegt
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Verwende den Admin-Bereich, um Gruppen und Mannschaften zu erstellen.
            </p>
            <Link href={`/turnier/${id}/admin`} className="mt-4">
              <Button>Zum Admin-Bereich</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        await Promise.all(
          (gruppen as Gruppe[]).map(async (gruppe) => {
            const gm = ((gruppenMannschaften || []) as GruppenMannschaft[]).filter(
              (gm) => gm.gruppe_id === gruppe.id
            );
            const gruppeSpiele = ((spiele || []) as Spiel[]).filter(
              (s) => s.gruppe_id === gruppe.id
            );
            const tabelle = await tabelleBerechnen(gruppe.id);

            return (
              <Card key={gruppe.id} className="relative overflow-hidden shadow-sm">
                <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
                <CardHeader>
                  <CardTitle className="text-xl">{gruppe.gruppe_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tabelle */}
                  {tabelle.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Tabelle
                      </h3>
                      <div className="overflow-hidden rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-10 text-center">#</TableHead>
                              <TableHead>Team</TableHead>
                              <TableHead className="w-12 text-center">Sp</TableHead>
                              <TableHead className="w-10 text-center">S</TableHead>
                              <TableHead className="w-10 text-center">U</TableHead>
                              <TableHead className="w-10 text-center">N</TableHead>
                              <TableHead className="w-16 text-center">Tore</TableHead>
                              <TableHead className="w-14 text-center">Diff</TableHead>
                              <TableHead className="w-12 text-center">Pkt</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tabelle.map((e, i) => (
                              <TableRow
                                key={e.mannschaft_id}
                                className={i === 0 ? "bg-primary/5 font-medium" : ""}
                              >
                                <TableCell className="text-center font-bold text-muted-foreground">
                                  {i + 1}
                                </TableCell>
                                <TableCell className="font-semibold">
                                  {e.team_name}
                                </TableCell>
                                <TableCell className="text-center">{e.spiele}</TableCell>
                                <TableCell className="text-center">{e.siege}</TableCell>
                                <TableCell className="text-center">
                                  {e.unentschieden}
                                </TableCell>
                                <TableCell className="text-center">
                                  {e.niederlagen}
                                </TableCell>
                                <TableCell className="text-center">
                                  {e.tore}:{e.gegentore}
                                </TableCell>
                                <TableCell className="text-center">
                                  <span
                                    className={
                                      e.tordifferenz > 0
                                        ? "text-primary font-medium"
                                        : e.tordifferenz < 0
                                        ? "text-destructive font-medium"
                                        : ""
                                    }
                                  >
                                    {e.tordifferenz > 0
                                      ? `+${e.tordifferenz}`
                                      : e.tordifferenz}
                                  </span>
                                </TableCell>
                                <TableCell className="text-center">
                                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                    {e.punkte}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Spielplan */}
                  {gruppeSpiele.length > 0 && (
                    <div>
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Spielplan
                      </h3>
                      <div className="space-y-2">
                        {gruppeSpiele.map((s) => {
                          const teamA = mannschaftMap.get(s.team_a_id);
                          const teamB = mannschaftMap.get(s.team_b_id);
                          const beendet = s.status === "beendet";
                          return (
                            <div
                              key={s.id}
                              className={`flex items-center rounded-lg border p-3 text-sm transition-colors ${
                                beendet ? "bg-card" : "bg-muted/30"
                              }`}
                            >
                              <span className="flex-1 text-right font-medium">
                                {teamA?.team_name || "?"}
                              </span>
                              <span
                                className={`mx-4 rounded-md px-3 py-1 font-mono text-base font-bold ${
                                  beendet
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {beendet
                                  ? `${s.score_team_a} : ${s.score_team_b}`
                                  : "- : -"}
                              </span>
                              <span className="flex-1 font-medium">
                                {teamB?.team_name || "?"}
                              </span>
                              <Badge
                                variant={beendet ? "default" : "secondary"}
                                className="ml-3"
                              >
                                {s.status}
                              </Badge>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {gm.length === 0 && gruppeSpiele.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Keine Mannschaften zugeordnet.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )
      )}
    </div>
  );
}
