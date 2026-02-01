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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.name}</h1>
          <Badge variant="secondary">
            {MONATE[t.monat]} {t.jahr}
          </Badge>
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
        <p className="text-muted-foreground">
          Noch keine Gruppen angelegt. Verwende den Admin-Bereich.
        </p>
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
              <Card key={gruppe.id}>
                <CardHeader>
                  <CardTitle>{gruppe.gruppe_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tabelle.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-semibold">Tabelle</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Team</TableHead>
                            <TableHead className="text-center">Sp</TableHead>
                            <TableHead className="text-center">S</TableHead>
                            <TableHead className="text-center">U</TableHead>
                            <TableHead className="text-center">N</TableHead>
                            <TableHead className="text-center">Tore</TableHead>
                            <TableHead className="text-center">Diff</TableHead>
                            <TableHead className="text-center">Pkt</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tabelle.map((e, i) => (
                            <TableRow key={e.mannschaft_id}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell className="font-medium">
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
                                {e.tordifferenz > 0
                                  ? `+${e.tordifferenz}`
                                  : e.tordifferenz}
                              </TableCell>
                              <TableCell className="text-center font-bold">
                                {e.punkte}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {gruppeSpiele.length > 0 && (
                    <div>
                      <h3 className="mb-2 font-semibold">Spielplan</h3>
                      <div className="space-y-2">
                        {gruppeSpiele.map((s) => {
                          const teamA = mannschaftMap.get(s.team_a_id);
                          const teamB = mannschaftMap.get(s.team_b_id);
                          return (
                            <div
                              key={s.id}
                              className="flex items-center justify-between rounded border p-2 text-sm"
                            >
                              <span className="flex-1 text-right">
                                {teamA?.team_name || "?"}
                              </span>
                              <span className="mx-4 font-mono font-bold">
                                {s.status === "beendet"
                                  ? `${s.score_team_a} : ${s.score_team_b}`
                                  : "– : –"}
                              </span>
                              <span className="flex-1">
                                {teamB?.team_name || "?"}
                              </span>
                              <Badge
                                variant={
                                  s.status === "beendet"
                                    ? "default"
                                    : "secondary"
                                }
                                className="ml-2"
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
