"use client";

import { turnierErstellen } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Neues Turnier erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Turniername</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="jahr">Jahr</Label>
                <Input
                  id="jahr"
                  name="jahr"
                  type="number"
                  defaultValue={new Date().getFullYear()}
                  required
                />
              </div>
              <div className="flex-1">
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
            <div>
              <Label htmlFor="passwort">Admin-Passwort</Label>
              <Input id="passwort" name="passwort" type="password" required />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Erstelle..." : "Turnier erstellen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
