export interface Turnier {
  id: string;
  name: string;
  jahr: number;
  monat: number;
  turnier_passwort_hash: string;
  created_at: string;
}

export interface Mannschaft {
  id: string;
  turnier_id: string;
  team_name: string;
  kapitaen_name: string | null;
  kapitaen_mobile: string | null;
}

export interface Gruppe {
  id: string;
  turnier_id: string;
  gruppe_name: string;
}

export interface GruppenMannschaft {
  id: string;
  gruppe_id: string;
  mannschaft_id: string;
}

export interface Spiel {
  id: string;
  gruppe_id: string;
  team_a_id: string;
  team_b_id: string;
  scheduled_at: string | null;
  score_team_a: number | null;
  score_team_b: number | null;
  status: "geplant" | "laufend" | "beendet";
}

export interface TabellenEintrag {
  mannschaft_id: string;
  team_name: string;
  spiele: number;
  siege: number;
  unentschieden: number;
  niederlagen: number;
  tore: number;
  gegentore: number;
  tordifferenz: number;
  punkte: number;
}
