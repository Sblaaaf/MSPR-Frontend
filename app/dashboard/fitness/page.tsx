"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Dumbbell,
  Zap,
  Clock,
  Calendar,
  RefreshCw,
  Target,
  Home,
  Building2,
  ListChecks,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n-context";
import { apiFetch } from "@/lib/api";

interface Exercise {
  id: number;
  nom: string;
  type: string;
  niveau: string;
  equipement: string | null;
}

interface WorkoutResult {
  workout_type: string;
  intensity: string;
  duration_hours: number;
  frequency_per_week: number;
  focus: string;
  exercises: Exercise[];
  recommendation_id: string;
}

interface FitnessProfile {
  age: number | null;
  weight_kg: number | null;
  height_m: number | null;
  sex: "male" | "female" | null;
  fat_percentage: number | null;
  resting_bpm: number | null;
  experience_level: number;
  goal: "weight_loss" | "muscle_gain" | "maintenance" | null;
  objective_label: string | null;
}

type Equipment = "home" | "gym";

const MEAL_API = "http://localhost:8003";
const RECO_API = process.env.NEXT_PUBLIC_RECOMMENDATION_API_URL || "http://localhost:8006";
const RECO_KEY = process.env.NEXT_PUBLIC_RECOMMENDATION_API_KEY || "";

const INTENSITY_COLORS: Record<string, string> = {
  Low: "text-blue-500",
  Medium: "text-yellow-500",
  High: "text-orange-500",
  "Very High": "text-red-500",
};

// Libellé brut FR de l'objectif -> libellé affiché lisible.
const OBJECTIVE_LABEL: Record<string, string> = {
  perte_de_poids: "Weight loss",
  prise_de_masse: "Muscle gain",
  maintien_forme: "Stay fit",
  endurance: "Endurance",
  flexibilite: "Flexibility",
  amelioration_sommeil: "Better sleep",
};

// niveau brut DB (FR) -> clé i18n
const NIVEAU_KEY = {
  debutant: "fitness_level_beginner",
  intermediaire: "fitness_level_intermediate",
  avance: "fitness_level_advanced",
} as const;

const TYPE_BADGE: Record<string, string> = {
  cardio: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  musculation: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
  stretching: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  yoga: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
};

export default function FitnessPage() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<FitnessProfile | null>(null);
  const [result, setResult] = useState<WorkoutResult | null>(null);
  const [equipment, setEquipment] = useState<Equipment>("gym");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [noProfile, setNoProfile] = useState(false);

  const levelLabel = useCallback(
    (lvl: number) =>
      lvl >= 3
        ? t("fitness_level_advanced")
        : lvl === 2
        ? t("fitness_level_intermediate")
        : t("fitness_level_beginner"),
    [t]
  );

  // Génère le programme depuis le profil + l'équipement choisi.
  const generate = useCallback(
    async (p: FitnessProfile, equip: Equipment) => {
      setGenerating(true);
      setError("");
      try {
        const res = await fetch(`${RECO_API}/recommend/workout`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-Key": RECO_KEY },
          body: JSON.stringify({
            age: p.age,
            weight_kg: p.weight_kg,
            height_m: p.height_m,
            sex: p.sex,
            fat_percentage: p.fat_percentage ?? undefined,
            resting_bpm: p.resting_bpm ?? undefined,
            experience_level: p.experience_level,
            goal: p.goal ?? undefined,
            objective_label: p.objective_label ?? undefined,
            equipment: equip,
          }),
        });
        if (!res.ok) throw new Error("error");
        const data: WorkoutResult = await res.json();
        setResult(data);
      } catch {
        setError(t("fitness_error"));
      } finally {
        setGenerating(false);
      }
    },
    [t]
  );

  // Au montage : récupère le profil fitness (zéro formulaire) puis génère.
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setLoading(false);
      setNoProfile(true);
      return;
    }
    (async () => {
      try {
        const p: FitnessProfile = await apiFetch(
          `${MEAL_API}/users/${userId}/fitness-profile`
        ).then((r) => r.json());
        // Sans poids/taille/âge, le moteur ML ne peut rien prédire.
        if (p.age == null || p.weight_kg == null || p.height_m == null || !p.sex) {
          setNoProfile(true);
          return;
        }
        setProfile(p);
        await generate(p, "gym");
      } catch {
        setError(t("fitness_error"));
      } finally {
        setLoading(false);
      }
    })();
  }, [generate, t]);

  function selectEquipment(equip: Equipment) {
    if (equip === equipment || !profile) return;
    setEquipment(equip);
    generate(profile, equip);
  }

  const equipOptions: { value: Equipment; label: string; icon: typeof Home }[] = [
    { value: "gym", label: t("fitness_equipment_gym"), icon: Building2 },
    { value: "home", label: t("fitness_equipment_home"), icon: Home },
  ];

  return (
    <main id="main-content" className="min-h-screen flex flex-col bg-background pb-24">
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">{t("back")}</span>
        </Link>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <Dumbbell className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="w-16" />
      </header>

      <section className="flex-1 px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{t("fitness_title")}</h1>
            <p className="text-muted-foreground text-sm">{t("fitness_subtitle")}</p>
          </div>

          {/* Initial loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">{t("fitness_loading")}</p>
            </div>
          )}

          {/* No usable profile → point user to Health, no manual form */}
          {!loading && noProfile && (
            <div className="p-6 bg-card rounded-3xl border border-border text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">{t("fitness_no_profile")}</p>
              <Button asChild className="rounded-xl">
                <Link href="/dashboard/health">{t("fitness_open_health")}</Link>
              </Button>
            </div>
          )}

          {/* Profile + objective + equipment + plan */}
          {!loading && !noProfile && profile && (
            <>
              {/* Objective banner */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15 flex items-center gap-3">
                <Target className="w-5 h-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                    {t("fitness_objective")}
                  </p>
                  <p className="font-bold text-foreground truncate">
                    {profile.objective_label
                      ? OBJECTIVE_LABEL[profile.objective_label] ?? profile.objective_label
                      : t("fitness_no_objective")}
                  </p>
                </div>
              </div>

              {/* Stats auto-fetched (read-only chips, no form) */}
              <div className="flex flex-wrap gap-2">
                <Chip label={t("fitness_age")} value={`${profile.age}`} />
                <Chip label={t("fitness_weight")} value={`${profile.weight_kg}`} />
                <Chip label={t("fitness_height")} value={`${profile.height_m}`} />
                <Chip label={t("fitness_level")} value={levelLabel(profile.experience_level)} />
                {profile.fat_percentage != null && (
                  <Chip label={t("fitness_fat")} value={`${profile.fat_percentage}%`} />
                )}
                {profile.resting_bpm != null && (
                  <Chip label={t("fitness_bpm")} value={`${profile.resting_bpm}`} />
                )}
              </div>

              {/* Equipment selector — the only interaction */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  {t("fitness_equipment")}
                </label>
                <div className="flex gap-2">
                  {equipOptions.map((opt) => {
                    const Icon = opt.icon;
                    const active = equipment === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => selectEquipment(opt.value)}
                        disabled={generating}
                        className={`flex-1 h-12 rounded-xl text-sm font-medium border transition-all flex items-center justify-center gap-2 disabled:opacity-60 ${
                          active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-input border-border text-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 rounded-xl">
                  <p className="text-destructive text-sm text-center">{error}</p>
                </div>
              )}

              {/* Generating overlay state */}
              {generating && !result && (
                <div className="flex items-center justify-center py-12 gap-3">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">{t("fitness_loading")}</p>
                </div>
              )}

              {/* Plan */}
              {result && (
                <div
                  className={`p-5 bg-card rounded-3xl border border-border space-y-5 animate-scale-in ${
                    generating ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-foreground leading-tight">
                        {t("fitness_result_title")}
                      </h2>
                      {result.focus && (
                        <p className="text-xs text-muted-foreground">{result.focus}</p>
                      )}
                    </div>
                    {generating && (
                      <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin ml-auto" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-accent rounded-2xl space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {t("fitness_workout_type")}
                      </p>
                      <p className="font-bold text-foreground text-base">{result.workout_type}</p>
                    </div>
                    <div className="p-4 bg-accent rounded-2xl space-y-1">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {t("fitness_intensity")}
                      </p>
                      <p
                        className={`font-bold text-base ${
                          INTENSITY_COLORS[result.intensity] ?? "text-foreground"
                        }`}
                      >
                        {result.intensity}
                      </p>
                    </div>
                    <div className="p-4 bg-accent rounded-2xl space-y-1 flex flex-col">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {t("fitness_duration")}
                      </p>
                      <p className="font-bold text-foreground text-base">
                        {result.duration_hours}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {t("fitness_duration_unit")}
                        </span>
                      </p>
                    </div>
                    <div className="p-4 bg-accent rounded-2xl space-y-1 flex flex-col">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {t("fitness_frequency")}
                      </p>
                      <p className="font-bold text-foreground text-base">
                        {result.frequency_per_week}{" "}
                        <span className="text-xs font-normal text-muted-foreground">
                          {t("fitness_frequency_unit")}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Real exercises from the catalogue */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                      <ListChecks className="w-3.5 h-3.5" /> {t("fitness_exercises_title")}
                    </p>
                    {result.exercises.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">
                        {t("fitness_no_exercises")}
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {result.exercises.map((ex) => (
                          <li
                            key={ex.id}
                            className="flex items-center gap-3 p-3 bg-accent rounded-2xl"
                          >
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Dumbbell className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-foreground truncate capitalize">
                                {ex.nom}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span
                                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md capitalize ${
                                    TYPE_BADGE[ex.type] ?? "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {ex.type}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {ex.niveau in NIVEAU_KEY
                                    ? t(NIVEAU_KEY[ex.niveau as keyof typeof NIVEAU_KEY])
                                    : ex.niveau}
                                </span>
                                {ex.equipement && (
                                  <span className="text-[10px] text-muted-foreground capitalize">
                                    · {ex.equipement}
                                  </span>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-1.5 bg-accent rounded-xl">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="ml-1.5 text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
