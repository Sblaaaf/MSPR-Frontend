"use client";

import { useEffect, useState } from "react";
import { Scale, Lightbulb, AlertCircle, ChevronDown } from "lucide-react";
import { apiFetch } from "@/lib/api";

// Mapping objectif (FR, base) -> objectif du modèle (3 classes).
const GOAL_MAP: Record<string, "weight_loss" | "muscle_gain" | "maintenance"> = {
  perte_de_poids: "weight_loss",
  prise_de_masse: "muscle_gain",
  maintien_forme: "maintenance",
  endurance: "maintenance",
  flexibilite: "maintenance",
  amelioration_sommeil: "maintenance",
};
// Priorité quand plusieurs objectifs actifs (le plus "actionnable" d'abord).
const GOAL_PRIORITY = ["perte_de_poids", "prise_de_masse", "maintien_forme", "endurance", "flexibilite", "amelioration_sommeil"];
const GOAL_LABEL: Record<string, string> = {
  weight_loss: "Weight loss",
  muscle_gain: "Muscle gain",
  maintenance: "Maintenance",
};

const NUTRIENT_LABEL: Record<string, string> = {
  calories: "Calories",
  protein: "Protein",
  carbs: "Carbs",
  fat: "Fat",
};

type BalanceItem = {
  nutrient: string;
  intake: number;
  target: number;
  pct: number;
  status: "deficit" | "ok" | "excess";
};
type BalanceData = {
  goal: string;
  items: BalanceItem[];
  suggestions: string[];
  summary: string;
};

const MEAL_API = "http://localhost:8003";
const RECO_API = process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL || "http://localhost:8006";
const RECO_KEY = process.env.NEXT_PUBLIC_RECOMMENDATION_API_KEY || "";

const STATUS_BAR: Record<string, string> = {
  deficit: "bg-amber-500",
  ok: "bg-primary",
  excess: "bg-red-500",
};
const STATUS_TEXT: Record<string, string> = {
  deficit: "Low",
  ok: "OK",
  excess: "High",
};

export default function NutritionBalanceCard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BalanceData | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [showTips, setShowTips] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const [summary, objectives] = await Promise.all([
          apiFetch(`${MEAL_API}/users/${userId}/nutrition-summary`).then((r) => r.json()),
          apiFetch(`${MEAL_API}/users/${userId}/objectives`).then((r) => r.json()),
        ]);

        if (!summary || summary.meals_count === 0) {
          setNotice("No meals logged today. Add a meal to get your balance.");
          return;
        }
        const p = summary.profile || {};
        if (p.age == null || p.weight_kg == null || p.height_m == null || !p.sex) {
          setNotice("Complete your profile (age, weight, height, sex) to enable the balance.");
          return;
        }

        // Objectif : 1er objectif actif selon la priorité, sinon maintien.
        const actifs: string[] = Array.isArray(objectives)
          ? objectives.filter((o: { actif: boolean }) => o.actif).map((o: { libelle: string }) => o.libelle)
          : [];
        const chosen = GOAL_PRIORITY.find((g) => actifs.includes(g));
        const goal = chosen ? GOAL_MAP[chosen] : "maintenance";

        const res = await fetch(`${RECO_API}/recommend/nutrition/balance`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-Key": RECO_KEY },
          body: JSON.stringify({
            age: p.age,
            weight_kg: p.weight_kg,
            height_m: p.height_m,
            sex: p.sex,
            goal,
            intake: {
              calories: summary.calories,
              protein_g: summary.protein_g,
              carbs_g: summary.carbs_g,
              fat_g: summary.fat_g,
            },
          }),
        });
        if (!res.ok) {
          setNotice("Balance unavailable right now.");
          return;
        }
        setData(await res.json());
      } catch {
        setNotice("Balance unavailable right now.");
      } finally {
        setLoading(false);
      }
    })();
    // Au montage uniquement.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="p-6 bg-card border border-border rounded-3xl flex justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notice) {
    return (
      <div className="p-5 bg-card border border-border rounded-3xl flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-sm flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" /> Daily balance
          </p>
          <p className="text-sm text-muted-foreground mt-1">{notice}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const unit = (n: string) => (n === "calories" ? "kcal" : "g");

  return (
    <div className="p-5 bg-card border border-border rounded-3xl space-y-4">
      {/* Header simplifié : titre + objectif sur une ligne */}
      <div className="flex items-center justify-between">
        <p className="font-bold text-sm flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" /> Daily balance
        </p>
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">
          {GOAL_LABEL[data.goal] ?? data.goal}
        </span>
      </div>

      {/* Barres colorées (contenu principal toujours visible) */}
      <div className="space-y-3">
        {data.items.map((it) => {
          const width = Math.min(it.pct * 100, 100);
          const txtColor =
            it.status === "ok" ? "text-primary" : it.status === "excess" ? "text-red-500" : "text-amber-500";
          return (
            <div key={it.nutrient} className="space-y-1">
              <div className="flex justify-between items-baseline text-sm">
                <span className="font-medium">{NUTRIENT_LABEL[it.nutrient] ?? it.nutrient}</span>
                <span className="text-muted-foreground text-xs">
                  {Math.round(it.intake)} / {Math.round(it.target)} {unit(it.nutrient)}
                  <span className={`ml-2 font-semibold ${txtColor}`}>{STATUS_TEXT[it.status]}</span>
                </span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${STATUS_BAR[it.status]} transition-all duration-700`} style={{ width: `${width}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Conseils repliés derrière un toggle */}
      {data.suggestions.length > 0 && (
        <div className="pt-1 border-t border-border">
          <button
            type="button"
            onClick={() => setShowTips((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-medium text-foreground/80 hover:text-foreground transition-colors py-1"
            aria-expanded={showTips}
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-warning" />
              {data.summary}
            </span>
            <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${showTips ? "rotate-180" : ""}`} />
          </button>

          {showTips && (
            <div className="space-y-2 pt-2 animate-fade-in">
              {data.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/90">{s}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
