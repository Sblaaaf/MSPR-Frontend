"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Salad,
  ArrowLeft,
  Sparkles,
  Check,
  Plus,
  X,
  Utensils,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Composant interne pour le formulaire d'enregistrement final après analyse
function AddAnalyzedMealForm({
  analyzedItems,
  onClose,
}: {
  analyzedItems: { food: string; grams: number; kcal: number }[];
  onClose: () => void;
}) {
  const [typeRepas, setTypeRepas] = useState("petit_dejeuner");
  const today = new Date().toISOString().slice(0, 10);
  const [dateRepas, setDateRepas] = useState(today);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleAdd() {
    setError("");
    setSuccess("");
    if (!dateRepas) {
      setError("Veuillez renseigner la date du repas.");
      return;
    }
    setLoading(true);
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const items = analyzedItems.map((item) => ({
        aliment_nom: item.food,
        quantite_g: item.grams,
        calories_100g:
          item.kcal && item.grams
            ? Math.round((item.kcal / item.grams) * 100)
            : 0,
      }));
      const res = await fetch(`http://localhost:8003/users/${userId}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_repas: typeRepas,
          date_repas: dateRepas,
          notes,
          items,
        }),
      });
      if (!res.ok) throw new Error();
      setSuccess("Repas ajouté !");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1200);
    } catch {
      setError("Erreur lors de l'ajout du repas");
    } finally {
      setLoading(false);
    }
  }

  const mealTypes = [
    { value: "petit_dejeuner", label: "Petit-dej" },
    { value: "dejeuner", label: "Déjeuner" },
    { value: "diner", label: "Dîner" },
    { value: "collation", label: "Collation" },
  ];

  return (
    <div className="mt-6 space-y-4 p-4 bg-card rounded-2xl border border-border animate-scale-in">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Plus className="w-4 h-4 text-primary" />
        Enregistrer ce repas
      </h3>

      <div className="flex flex-wrap gap-2">
        {mealTypes.map((type) => (
          <button
            key={type.value}
            type="button"
            onClick={() => setTypeRepas(type.value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
              typeRepas === type.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      <input
        type="date"
        value={dateRepas}
        onChange={(e) => setDateRepas(e.target.value)}
        className="w-full h-12 px-4 bg-input border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <textarea
        placeholder="Notes (optionnel)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full h-20 p-4 bg-input border border-border rounded-xl text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />

      <div className="flex gap-3">
        <Button
          type="button"
          className="flex-1 h-12 rounded-xl gap-2"
          disabled={loading}
          onClick={handleAdd}
        >
          {loading ? "Ajout..." : <><Check className="w-4 h-4" /> Valider</>}
        </Button>
        <Button
          type="button"
          className="h-12 px-4 rounded-xl"
          variant="secondary"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {error && <p className="text-destructive text-sm text-center">{error}</p>}
      {success && (
        <div className="flex items-center justify-center gap-2 text-primary text-sm font-medium">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}
    </div>
  );
}

// Composant pour afficher les résultats de l'analyse IA
function AddMealResult({
  result,
}: {
  result: {
    total_kcal: number;
    message: string;
    items: { food: string; grams: number; kcal: number }[];
  };
}) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="mt-6 space-y-4 animate-slide-up">
      <div className="p-5 bg-card rounded-2xl border border-border space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="font-medium text-foreground">
            {result.message || "Analyse terminée"}
          </p>
        </div>

        {typeof result.total_kcal !== "undefined" && (
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-foreground">
              {result.total_kcal}
            </span>
            <span className="text-lg text-muted-foreground">kcal</span>
          </div>
        )}

        {Array.isArray(result.items) && result.items.length > 0 ? (
          <ul className="space-y-2 pt-2 border-t border-border">
            {result.items.map((item, idx) => (
              <li key={idx} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                    <Utensils className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{item.food}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">
                    {item.kcal} kcal
                  </p>
                  <p className="text-xs text-muted-foreground">{item.grams}g</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">Aucun aliment trouvé.</p>
        )}
      </div>

      {!showForm && Array.isArray(result.items) && result.items.length > 0 && (
        <Button
          type="button"
          className="w-full h-14 rounded-2xl gap-2 text-base"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-5 h-5" />
          Ajouter ce repas
        </Button>
      )}

      {showForm && (
        <AddAnalyzedMealForm
          analyzedItems={result.items}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

// Page principale
export default function AddMealPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<null | {
    total_kcal: number;
    message: string;
    items: { food: string; grams: number; kcal: number }[];
  }>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  // Vérification du statut d'abonnement au montage
  useEffect(() => {
    const abonnement = localStorage.getItem("user_abonnement");
    setIsPremium(abonnement === "premium" || abonnement === "premium_plus");
  }, []);

  async function handleAnalyze(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/kcal/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer clesecrete",
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'analyse du repas");
      const data = await res.json();
      setResult(data);
    } catch {
      setError("Erreur lors de l'analyse du repas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Salad className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
        <div className="w-16" />
      </header>

      <section className="flex-1 flex flex-col px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          
          {isPremium === false ? (
            /* PAYWALL UI pour les utilisateurs Freemium */
            <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-3xl text-center space-y-6 mt-10 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Fonctionnalité Premium</h2>
                <p className="text-muted-foreground text-sm">
                  Débloquez l'analyse des repas par Intelligence Artificielle pour un suivi instantané.
                </p>
              </div>
              <ul className="text-sm text-left space-y-3 w-full border-t border-b border-border py-4">
                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary"/> Détection automatique des aliments</li>
                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary"/> Calcul des calories instantané</li>
                <li className="flex gap-2 items-center"><Check className="w-4 h-4 text-primary"/> Recommandations de l'IA</li>
              </ul>
              <Button className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20">
                Passer au Premium - 9,99€/mois
              </Button>
              <Link href="/dashboard/manual-meal">
                <Button variant="ghost" className="w-full text-muted-foreground">
                  Saisie manuelle (Gratuit)
                </Button>
              </Link>
            </div>
          ) : isPremium === true ? (
            /* UI ANALYSE pour les utilisateurs Premium */
            <>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  Analyse IA
                </h1>
                <p className="text-muted-foreground text-sm">
                  Décrivez votre repas pour obtenir une estimation calorique
                </p>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                <div className="relative">
                  <textarea
                    className="w-full h-36 p-4 bg-card border border-border rounded-2xl text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                    placeholder="Ex: 200g de riz, 150g de poulet grillé, salade verte..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    required
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                    {text.length}/500
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 rounded-2xl gap-2 text-base font-semibold"
                  disabled={loading || !text.trim()}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyser
                    </>
                  )}
                </Button>
              </form>

              {error && (
                <div className="p-4 bg-destructive/10 rounded-xl">
                  <p className="text-destructive text-sm text-center">{error}</p>
                </div>
              )}

              {result && <AddMealResult result={result} />}
            </>
          ) : (
            /* État de chargement initial */
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Vérification de l'abonnement...</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}