# TurnierPlaner – Benutzerhandbuch

## Inhaltsverzeichnis

1. [Voraussetzungen](#1-voraussetzungen)
2. [Installation & Start](#2-installation--start)
3. [Datenbank einrichten](#3-datenbank-einrichten)
4. [Turnier erstellen](#4-turnier-erstellen)
5. [Turnier ansehen](#5-turnier-ansehen)
6. [Admin-Bereich](#6-admin-bereich)
7. [Mannschaften verwalten](#7-mannschaften-verwalten)
8. [Gruppen verwalten](#8-gruppen-verwalten)
9. [Spielplan generieren](#9-spielplan-generieren)
10. [Ergebnisse eintragen](#10-ergebnisse-eintragen)
11. [Tabelle & Sortierung](#11-tabelle--sortierung)
12. [Suche & Filter](#12-suche--filter)
13. [Aktualisieren-Button](#13-aktualisieren-button)

---

## 1. Voraussetzungen

- **Node.js** (Version 18 oder höher)
- **npm** (wird mit Node.js mitgeliefert)
- Ein **Supabase-Projekt** (kostenlos unter [supabase.com](https://supabase.com))

---

## 2. Installation & Start

1. Terminal öffnen und in den Projektordner wechseln:
   ```
   cd turnier-planer
   ```

2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Entwicklungsserver starten:
   ```
   npm run dev
   ```

4. Im Browser öffnen: **http://localhost:3000**

---

## 3. Datenbank einrichten

1. Im Supabase-Dashboard den **SQL Editor** öffnen.
2. Den Inhalt der Datei `supabase-schema.sql` aus dem Projektordner kopieren und einfügen.
3. Auf **Run** klicken.
4. Die Datei `.env.local` im Projektordner enthält die Zugangsdaten. Diese müssen mit den Werten aus dem Supabase-Dashboard übereinstimmen:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
   ```
   Die Werte findest du unter **Settings > API** im Supabase-Dashboard.

---

## 4. Turnier erstellen

1. Auf der Startseite oben rechts auf **Neues Turnier** klicken.
2. Folgende Felder ausfüllen:
   - **Turniername** – z. B. „Sommerturnier 2026"
   - **Jahr** – z. B. 2026
   - **Monat** – 1 bis 12
   - **Admin-Passwort** – wird für den Verwaltungszugang benötigt. Dieses Passwort gut merken!
3. Auf **Turnier erstellen** klicken.
4. Du wirst automatisch zur Turnier-Detailseite weitergeleitet.

---

## 5. Turnier ansehen

- Auf der **Startseite** werden alle Turniere als Karten angezeigt.
- Auf eine Karte klicken, um die **Detailseite** zu öffnen.
- Die Detailseite zeigt pro Gruppe:
  - Die aktuelle **Tabelle** (Punkte, Tore, Tordifferenz)
  - Den **Spielplan** mit Ergebnissen

---

## 6. Admin-Bereich

1. Auf der Turnier-Detailseite oben rechts auf **Admin** klicken.
2. Das **Turnier-Passwort** eingeben (das bei der Erstellung gewählte Passwort).
3. Nach erfolgreicher Anmeldung wird das Admin-Panel angezeigt.
4. Die Admin-Sitzung bleibt für 24 Stunden aktiv (per Cookie).

---

## 7. Mannschaften verwalten

Im Admin-Panel unter **Mannschaften**:

### Mannschaft hinzufügen
1. **Teamname** eingeben (Pflichtfeld).
2. Optional: **Kapitän-Name** und **Mobilnummer** eingeben.
3. Auf **Hinzufügen** klicken.

### Mannschaft entfernen
- Neben dem Teamnamen auf das **×** klicken.
- **Achtung:** Beim Löschen werden auch alle Gruppenzuordnungen und Spiele dieser Mannschaft entfernt.

---

## 8. Gruppen verwalten

Im Admin-Panel unter **Gruppen**:

### Gruppe erstellen
1. Einen **Gruppennamen** eingeben (z. B. „Gruppe A").
2. Auf **Gruppe erstellen** klicken.

### Mannschaften einer Gruppe zuordnen
- Unterhalb einer Gruppe werden nicht zugeordnete Mannschaften mit einem **+**-Button angezeigt.
- Auf **+ Teamname** klicken, um die Mannschaft der Gruppe hinzuzufügen.

### Mannschaft aus Gruppe entfernen
- Auf das **×** neben dem Teamnamen innerhalb der Gruppe klicken.

### Gruppe löschen
- Auf **Löschen** neben dem Gruppennamen klicken.
- **Achtung:** Alle Spiele der Gruppe werden ebenfalls gelöscht.

---

## 9. Spielplan generieren

1. Mindestens **2 Mannschaften** müssen der Gruppe zugeordnet sein.
2. Auf **Spielplan generieren** klicken.
3. Es wird ein **Round-Robin-Spielplan** erstellt: Jede Mannschaft spielt gegen jede andere.
4. **Hinweis:** Beim erneuten Generieren werden alle bestehenden Spiele der Gruppe gelöscht und neu erstellt.

### Beispiel
Bei 4 Mannschaften (A, B, C, D) entstehen 6 Spiele:
- A vs B, A vs C, A vs D
- B vs C, B vs D
- C vs D

---

## 10. Ergebnisse eintragen

1. Im Admin-Panel unter der jeweiligen Gruppe werden alle Spiele angezeigt.
2. Für jedes Spiel die **Tore** beider Mannschaften in die Eingabefelder eintragen.
3. Auf **Speichern** klicken.
4. Das Spiel wird als **beendet** markiert.
5. Die Tabelle auf der Detailseite wird automatisch aktualisiert.

---

## 11. Tabelle & Sortierung

Die Gruppentabelle wird automatisch aus den Spielergebnissen berechnet.

### Angezeigte Spalten
| Spalte | Bedeutung |
|--------|-----------|
| # | Platzierung |
| Team | Mannschaftsname |
| Sp | Anzahl Spiele |
| S | Siege |
| U | Unentschieden |
| N | Niederlagen |
| Tore | Erzielte : Kassierte Tore |
| Diff | Tordifferenz |
| Pkt | Punkte |

### Punktevergabe
- **Sieg:** 3 Punkte
- **Unentschieden:** 1 Punkt
- **Niederlage:** 0 Punkte

### Sortierung (bei Punktgleichheit)
1. **Punkte** (höher = besser)
2. **Tordifferenz** (höher = besser)
3. **Erzielte Tore** (mehr = besser)

---

## 12. Suche & Filter

Auf der Startseite stehen drei Filteroptionen zur Verfügung:

- **Name suchen** – Freitextsuche im Turniernamen
- **Jahr** – Nach Jahr filtern (z. B. 2026)
- **Monat** – Nach Monat filtern (1–12)

Auf **Filtern** klicken oder Enter drücken, um die Suche auszuführen.
Auf **Zurücksetzen** klicken, um alle Filter zu entfernen.

---

## 13. Aktualisieren-Button

Auf jeder Seite befindet sich oben rechts ein **Aktualisieren**-Button. Damit werden die neuesten Daten vom Server geladen, ohne die Seite komplett neu zu laden. Nützlich, wenn mehrere Personen gleichzeitig Ergebnisse eintragen.
