import { supabase } from "@/lib/supabase";
import { Turnier } from "@/lib/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshButton } from "@/components/RefreshButton";
import { TurnierFilter } from "@/components/TurnierFilter";

const MONATE = [
  "", "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ suche?: string; jahr?: string; monat?: string }>;
}) {
  const params = await searchParams;
  let query = supabase
    .from("turniere")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.suche) {
    query = query.ilike("name", `%${params.suche}%`);
  }
  if (params.jahr) {
    query = query.eq("jahr", parseInt(params.jahr));
  }
  if (params.monat) {
    query = query.eq("monat", parseInt(params.monat));
  }

  const { data: turniere } = await query;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turniere</h1>
          <p className="mt-1 text-muted-foreground">
            Alle Turniere im Überblick
          </p>
        </div>
        <RefreshButton />
      </div>

      <TurnierFilter />

      {(!turniere || turniere.length === 0) ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl">
              ?
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              Keine Turniere gefunden
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Erstelle ein neues Turnier, um loszulegen.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(turniere as Turnier[]).map((t) => (
            <Link key={t.id} href={`/turnier/${t.id}`}>
              <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
                <div className="absolute inset-x-0 top-0 h-1 bg-primary" />
                <CardHeader className="pt-5">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {t.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="secondary" className="font-medium">
                    {MONATE[t.monat]} {t.jahr}
                  </Badge>
                  <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                    Details anzeigen →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
