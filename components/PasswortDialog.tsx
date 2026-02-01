"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pruefePasswort } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function PasswortDialog({ turnierId }: { turnierId: string }) {
  const [passwort, setPasswort] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const ok = await pruefePasswort(turnierId, passwort);
    if (ok) {
      router.refresh();
    } else {
      setError("Falsches Passwort");
    }
    setLoading(false);
  }

  return (
    <div className="flex items-center justify-center pt-8">
      <Card className="relative w-full max-w-sm overflow-hidden shadow-lg">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-primary" />
        <CardHeader className="pt-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <span className="text-xl font-bold text-primary">A</span>
          </div>
          <CardTitle className="text-xl">Admin-Zugang</CardTitle>
          <CardDescription>
            Gib das Turnier-Passwort ein, um fortzufahren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwort">Turnier-Passwort</Label>
              <Input
                id="passwort"
                type="password"
                value={passwort}
                onChange={(e) => setPasswort(e.target.value)}
                placeholder="Passwort eingeben"
                required
              />
            </div>
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Prüfe..." : "Anmelden"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
