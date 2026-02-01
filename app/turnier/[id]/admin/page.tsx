import { supabase } from "@/lib/supabase";
import { istAdmin } from "@/lib/actions";
import { Turnier } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PasswortDialog } from "@/components/PasswortDialog";
import { AdminPanel } from "@/components/AdminPanel";
import { RefreshButton } from "@/components/RefreshButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AdminPage({
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
  const admin = await istAdmin(id);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{t.name}</h1>
            <Badge variant="secondary">Admin</Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Mannschaften, Gruppen und Spielplan verwalten
          </p>
        </div>
        <div className="flex gap-2">
          <RefreshButton />
          <Link href={`/turnier/${id}`}>
            <Button variant="outline" size="sm">
              Zurück
            </Button>
          </Link>
        </div>
      </div>

      {admin ? (
        <AdminPanel turnierId={id} />
      ) : (
        <PasswortDialog turnierId={id} />
      )}
    </div>
  );
}
