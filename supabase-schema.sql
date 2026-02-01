-- Turniere
create table turniere (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  jahr int not null,
  monat int not null,
  turnier_passwort_hash text not null,
  created_at timestamptz default now()
);

-- Mannschaften
create table mannschaften (
  id uuid default gen_random_uuid() primary key,
  turnier_id uuid references turniere(id) on delete cascade not null,
  team_name text not null,
  kapitaen_name text,
  kapitaen_mobile text
);

-- Gruppen
create table gruppen (
  id uuid default gen_random_uuid() primary key,
  turnier_id uuid references turniere(id) on delete cascade not null,
  gruppe_name text not null
);

-- Gruppen-Mannschaften (Zuordnung)
create table gruppen_mannschaften (
  id uuid default gen_random_uuid() primary key,
  gruppe_id uuid references gruppen(id) on delete cascade not null,
  mannschaft_id uuid references mannschaften(id) on delete cascade not null,
  unique(gruppe_id, mannschaft_id)
);

-- Spiele
create table spiele (
  id uuid default gen_random_uuid() primary key,
  gruppe_id uuid references gruppen(id) on delete cascade not null,
  team_a_id uuid references mannschaften(id) on delete cascade not null,
  team_b_id uuid references mannschaften(id) on delete cascade not null,
  scheduled_at timestamptz,
  score_team_a int,
  score_team_b int,
  status text default 'geplant' check (status in ('geplant', 'laufend', 'beendet'))
);

-- RLS aktivieren
alter table turniere enable row level security;
alter table mannschaften enable row level security;
alter table gruppen enable row level security;
alter table gruppen_mannschaften enable row level security;
alter table spiele enable row level security;

-- Lese-Zugriff fuer alle
create policy "Alle duerfen lesen" on turniere for select using (true);
create policy "Alle duerfen lesen" on mannschaften for select using (true);
create policy "Alle duerfen lesen" on gruppen for select using (true);
create policy "Alle duerfen lesen" on gruppen_mannschaften for select using (true);
create policy "Alle duerfen lesen" on spiele for select using (true);

-- Schreib-Zugriff fuer alle (Passwort-Pruefung erfolgt in Server Actions)
create policy "Alle duerfen schreiben" on turniere for insert with check (true);
create policy "Alle duerfen updaten" on turniere for update using (true);
create policy "Alle duerfen loeschen" on turniere for delete using (true);

create policy "Alle duerfen schreiben" on mannschaften for insert with check (true);
create policy "Alle duerfen updaten" on mannschaften for update using (true);
create policy "Alle duerfen loeschen" on mannschaften for delete using (true);

create policy "Alle duerfen schreiben" on gruppen for insert with check (true);
create policy "Alle duerfen updaten" on gruppen for update using (true);
create policy "Alle duerfen loeschen" on gruppen for delete using (true);

create policy "Alle duerfen schreiben" on gruppen_mannschaften for insert with check (true);
create policy "Alle duerfen updaten" on gruppen_mannschaften for update using (true);
create policy "Alle duerfen loeschen" on gruppen_mannschaften for delete using (true);

create policy "Alle duerfen schreiben" on spiele for insert with check (true);
create policy "Alle duerfen updaten" on spiele for update using (true);
create policy "Alle duerfen loeschen" on spiele for delete using (true);
