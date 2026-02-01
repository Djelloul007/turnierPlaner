"use server";

import { supabase } from "./supabase";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { TabellenEintrag, Spiel, Mannschaft } from "./types";

// --- Auth ---

export async function pruefePasswort(turnierId: string, passwort: string) {
  const { data } = await supabase
    .from("turniere")
    .select("turnier_passwort_hash")
    .eq("id", turnierId)
    .single();

  if (!data) return false;

  const match = await bcrypt.compare(passwort, data.turnier_passwort_hash);
  if (match) {
    const cookieStore = await cookies();
    cookieStore.set(`admin_${turnierId}`, "true", {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }
  return match;
}

export async function istAdmin(turnierId: string) {
  const cookieStore = await cookies();
  return cookieStore.get(`admin_${turnierId}`)?.value === "true";
}

// --- Turnier ---

export async function turnierErstellen(formData: FormData) {
  const name = formData.get("name") as string;
  const jahr = parseInt(formData.get("jahr") as string);
  const monat = parseInt(formData.get("monat") as string);
  const passwort = formData.get("passwort") as string;

  const hash = await bcrypt.hash(passwort, 10);

  const { data, error } = await supabase
    .from("turniere")
    .insert({ name, jahr, monat, turnier_passwort_hash: hash })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data.id as string;
}

// --- Mannschaften ---

export async function mannschaftHinzufuegen(
  turnierId: string,
  teamName: string,
  kapitaenName: string,
  kapitaenMobile: string
) {
  if (!(await istAdmin(turnierId))) throw new Error("Nicht autorisiert");

  const { error } = await supabase.from("mannschaften").insert({
    turnier_id: turnierId,
    team_name: teamName,
    kapitaen_name: kapitaenName || null,
    kapitaen_mobile: kapitaenMobile || null,
  });
  if (error) throw new Error(error.message);
}

export async function mannschaftLoeschen(turnierId: string, mannschaftId: string) {
  if (!(await istAdmin(turnierId))) throw new Error("Nicht autorisiert");

  const { error } = await supabase
    .from("mannschaften")
    .delete()
    .eq("id", mannschaftId);
  if (error) throw new Error(error.message);
}

// --- Gruppen ---

export async function gruppeErstellen(turnierId: string, gruppeName: string) {
  if (!(await istAdmin(turnierId))) throw new Error("Nicht autorisiert");

  const { error } = await supabase.from("gruppen").insert({
    turnier_id: turnierId,
    gruppe_name: gruppeName,
  });
  if (error) throw new Error(error.message);
}

export async function gruppeLoeschen(turnierId: string, gruppeId: string) {
  if (!(await istAdmin(turnierId))) throw new Error("Nicht autorisiert");

  const { error } = await supabase.from("gruppen").delete().eq("id", gruppeId);
  if (error) throw new Error(error.message);
}

export async function mannschaftZuGruppeHinzufuegen(
  turnierId: string,
  gruppeId: string,
  mannschaftId: string
) {
  if (!(await istAdmin(turnierId))) throw new Error("Nicht autorisiert");

  const { error } = await supabase.from("gruppen_mannschaften").insert({
    gruppe_id: gruppeId,
    mannschaft_id: mannschaftId,
  });
  if (error) throw new Error(error.message);
}

export async function mannschaftAusGruppeEntfernen(
  turnierId: string,
  gruppeId: string,
  mannschaftId: string
) {
  if (!(await istAdmin(turnierId))) throw new Error("Nicht autorisiert");

  const { error } = await supabase
    .from("gruppen_mannschaften")
    .delete()
    .eq("gruppe_id", gruppeId)
    .eq("mannschaft_id", mannschaftId);
  if (error) throw new Error(error.message);
}

// --- Spielplan ---

export async function spielplanGenerieren(turnierId: string, gruppeId: string) {
  if (!(await istAdmin(turnierId))) throw new Error("Nicht autorisiert");

  // Mannschaften der Gruppe laden
  const { data: zuordnungen } = await supabase
    .from("gruppen_mannschaften")
    .select("mannschaft_id")
    .eq("gruppe_id", gruppeId);

  if (!zuordnungen || zuordnungen.length < 2) {
    throw new Error("Mindestens 2 Mannschaften in der Gruppe erforderlich");
  }

  // Bestehende Spiele der Gruppe loeschen
  await supabase.from("spiele").delete().eq("gruppe_id", gruppeId);

  // Round-Robin generieren
  const teams = zuordnungen.map((z) => z.mannschaft_id);
  const spiele: { gruppe_id: string; team_a_id: string; team_b_id: string }[] = [];

  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      spiele.push({
        gruppe_id: gruppeId,
        team_a_id: teams[i],
        team_b_id: teams[j],
      });
    }
  }

  const { error } = await supabase.from("spiele").insert(spiele);
  if (error) throw new Error(error.message);
}

// --- Ergebnisse ---

export async function ergebnisEintragen(
  turnierId: string,
  spielId: string,
  scoreA: number,
  scoreB: number
) {
  if (!(await istAdmin(turnierId))) throw new Error("Nicht autorisiert");

  const { error } = await supabase
    .from("spiele")
    .update({
      score_team_a: scoreA,
      score_team_b: scoreB,
      status: "beendet",
    })
    .eq("id", spielId);
  if (error) throw new Error(error.message);
}

// --- Tabelle ---

export async function tabelleBerechnen(
  gruppeId: string
): Promise<TabellenEintrag[]> {
  const { data: zuordnungen } = await supabase
    .from("gruppen_mannschaften")
    .select("mannschaft_id")
    .eq("gruppe_id", gruppeId);

  if (!zuordnungen) return [];

  const mannschaftIds = zuordnungen.map((z) => z.mannschaft_id);

  const { data: mannschaften } = await supabase
    .from("mannschaften")
    .select("*")
    .in("id", mannschaftIds);

  const { data: spiele } = await supabase
    .from("spiele")
    .select("*")
    .eq("gruppe_id", gruppeId)
    .eq("status", "beendet");

  if (!mannschaften) return [];

  const tabelle: Record<string, TabellenEintrag> = {};

  for (const m of mannschaften as Mannschaft[]) {
    tabelle[m.id] = {
      mannschaft_id: m.id,
      team_name: m.team_name,
      spiele: 0,
      siege: 0,
      unentschieden: 0,
      niederlagen: 0,
      tore: 0,
      gegentore: 0,
      tordifferenz: 0,
      punkte: 0,
    };
  }

  for (const s of (spiele || []) as Spiel[]) {
    if (s.score_team_a === null || s.score_team_b === null) continue;

    const a = tabelle[s.team_a_id];
    const b = tabelle[s.team_b_id];
    if (!a || !b) continue;

    a.spiele++;
    b.spiele++;
    a.tore += s.score_team_a;
    a.gegentore += s.score_team_b;
    b.tore += s.score_team_b;
    b.gegentore += s.score_team_a;

    if (s.score_team_a > s.score_team_b) {
      a.siege++;
      a.punkte += 3;
      b.niederlagen++;
    } else if (s.score_team_a < s.score_team_b) {
      b.siege++;
      b.punkte += 3;
      a.niederlagen++;
    } else {
      a.unentschieden++;
      b.unentschieden++;
      a.punkte += 1;
      b.punkte += 1;
    }
  }

  return Object.values(tabelle)
    .map((e) => ({ ...e, tordifferenz: e.tore - e.gegentore }))
    .sort((a, b) => b.punkte - a.punkte || b.tordifferenz - a.tordifferenz || b.tore - a.tore);
}
