"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function AddMealPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<null | { total_kcal: number; message: string; items: any[] }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      // Correction de l'URL pour garantir le bon endpoint
      const apiUrl = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/kcal/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer clesecrete"
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'analyse du repas");
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Erreur lors de l'analyse du repas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <form onSubmit={handleAnalyze} className="space-y-6 w-full max-w-md bg-white/80 p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Analyser un repas</h2>
        <textarea
          className="w-full h-24 p-2 border rounded"
          placeholder="Décris ton repas en anglais..."
          value={text}
          onChange={e => setText(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Analyse..." : "Analyser"}</Button>
        {error && <div className="text-red-500 text-center">{error}</div>}
        {result && (
          <div className="mt-4 text-center">
            <div className="font-semibold">{result.message || "Réponse reçue"}</div>
            {typeof result.total_kcal !== "undefined" && (
              <div className="text-lg">Total kcal : <span className="font-bold">{result.total_kcal}</span></div>
            )}
            {Array.isArray(result.items) && result.items.length > 0 ? (
              <ul className="mt-2">
                {result.items.map((item, idx) => (
                  <li key={idx}>{item.food} : {item.grams}g, {item.kcal} kcal</li>
                ))}
              </ul>
            ) : (
              <div className="text-muted-foreground mt-2">Aucun aliment trouvé.</div>
            )}
            {/* Affiche la réponse brute pour debug si items n'est pas un tableau */}
            {!Array.isArray(result.items) && (
              <pre className="mt-4 text-xs bg-gray-100 p-2 rounded text-left">{JSON.stringify(result, null, 2)}</pre>
            )}
          </div>
        )}
        <a href="/dashboard" className="block mt-4 text-center text-primary underline">Retour au menu</a>
      </form>
    </main>
  );
}
