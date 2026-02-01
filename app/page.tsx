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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Turniere</h1>
        <RefreshButton />
      </div>

      <TurnierFilter />

      {(!turniere || turniere.length === 0) ? (
        <p className="text-muted-foreground">Keine Turniere gefunden.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(turniere as Turnier[]).map((t) => (
            <Link key={t.id} href={`/turnier/${t.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{t.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">
                    {MONATE[t.monat]} {t.jahr}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
