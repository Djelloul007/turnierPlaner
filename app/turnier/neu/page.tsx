"use client";

import { turnierErstellen } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NeuTurnierPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData(e.currentTarget);
      const id = await turnierErstellen(formData);
      router.push(`/turnier/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Erstellen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card className="relative overflow-hidden shadow-lg">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
        <CardHeader className="pt-8 text-center">
          <CardTitle className="text-2xl">Neues Turnier erstellen</CardTitle>
          <CardDescription>
            Erstelle ein neues Turnier und lade Mannschaften ein.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Turniername</Label>
              <Input id="name" name="name" placeholder="z.B. Sommerturnier 2026" required />
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="jahr">Jahr</Label>
                <Input
                  id="jahr"
                  name="jahr"
                  type="number"
                  defaultValue={new Date().getFullYear()}
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="monat">Monat</Label>
                <Input
                  id="monat"
                  name="monat"
                  type="number"
                  min={1}
                  max={12}
                  defaultValue={new Date().getMonth() + 1}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwort">Admin-Passwort</Label>
              <Input id="passwort" name="passwort" type="password" placeholder="Sicheres Passwort wählen" required />
              <p className="text-xs text-muted-foreground">
                Dieses Passwort wird für den Admin-Zugang benötigt.
              </p>
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Erstelle..." : "Turnier erstellen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
