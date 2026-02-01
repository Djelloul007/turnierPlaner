import { supabase } from "@/lib/supabase";
import { istAdmin } from "@/lib/actions";
import { Turnier } from "@/lib/types";
import { notFound } from "next/navigation";
import { PasswortDialog } from "@/components/PasswortDialog";
import { AdminPanel } from "@/components/AdminPanel";
import { RefreshButton } from "@/components/RefreshButton";

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin: {t.name}</h1>
        <RefreshButton />
      </div>

      {admin ? (
        <AdminPanel turnierId={id} />
      ) : (
        <PasswortDialog turnierId={id} />
      )}
    </div>
  );
}
