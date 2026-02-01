"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { pruefePasswort } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle>Admin-Zugang</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="passwort">Turnier-Passwort</Label>
            <Input
              id="passwort"
              type="password"
              value={passwort}
              onChange={(e) => setPasswort(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Prüfe..." : "Anmelden"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
