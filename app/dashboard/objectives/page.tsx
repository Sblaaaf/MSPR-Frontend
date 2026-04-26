"use client";

import { useState, useEffect } from "react";
import {
  Target,
  TrendingDown,
  TrendingUp,
  Moon,
  Zap,
  Activity,
  CheckCircle2,
  Circle,
  Plus,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Objective {
  id: number;
  libelle: string;
  description: string;
  date_debut: string;
  actif: boolean;
}

interface AvailableObjectif {
  id: number;
  libelle: string;
  description: string;
}

const OBJECTIVE_MAP: Record<string, { label: string; icon: any; color: string }> = {
  perte_de_poids: { label: "Perte de poids", icon: TrendingDown, color: "text-rose-500 bg-rose-500/10" },
  prise_de_masse: { label: "Prise de masse", icon: TrendingUp, color: "text-blue-500 bg-blue-500/10" },
  amelioration_sommeil: { label: "Mieux dormir", icon: Moon, color: "text-indigo-500 bg-indigo-500/10" },
  maintien_forme: { label: "Maintien de forme", icon: Activity, color: "text-emerald-500 bg-emerald-500/10" },
  endurance: { label: "Endurance", icon: Zap, color: "text-amber-500 bg-amber-500/10" },
};

function getDetails(libelle: string) {
  return OBJECTIVE_MAP[libelle] ?? { label: libelle, icon: Target, color: "text-primary bg-primary/10" };
}

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [available, setAvailable] = useState<AvailableObjectif[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      loadData(userId);
    } else {
      setLoading(false);
    }
  }, []);

  async function loadData(userId: string) {
    try {
      setLoading(true);
      const [objRes, availRes] = await Promise.all([
        fetch(`http://localhost:8003/users/${userId}/objectives`),
        fetch(`http://localhost:8003/objectifs`),
      ]);
      if (!objRes.ok || !availRes.ok) throw new Error();
      setObjectives(await objRes.json());
      setAvailable(await availRes.json());
    } catch {
      setError("Impossible de charger vos objectifs.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(objectifId: number) {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    setAdding(true);
    try {
      const res = await fetch(`http://localhost:8003/users/${userId}/objectives`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objectif_id: objectifId }),
      });
      if (!res.ok) throw new Error();
      const newObj: Objective = await res.json();
      setObjectives((prev) => [newObj, ...prev]);
      setShowModal(false);
    } catch {
      setError("Erreur lors de l'ajout de l'objectif.");
    } finally {
      setAdding(false);
    }
  }

  async function handleToggle(obj: Objective) {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    setToggling(obj.id);
    try {
      const res = await fetch(`http://localhost:8003/users/${userId}/objectives/${obj.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actif: !obj.actif }),
      });
      if (!res.ok) throw new Error();
      const updated: Objective = await res.json();
      setObjectives((prev) => prev.map((o) => (o.id === obj.id ? updated : o)));
    } catch {
      setError("Erreur lors de la mise à jour.");
    } finally {
      setToggling(null);
    }
  }

  const addedIds = new Set(objectives.map((o) => o.id));
  const notAdded = available.filter((a) => !addedIds.has(a.id));

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground pb-20">
      <header className="flex items-center justify-between px-5 py-5 bg-background sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Objectifs</h1>
          <p className="text-xs text-muted-foreground">Vos défis personnels</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-primary" />
        </div>
      </header>

      <section className="flex-1 px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="p-6 bg-destructive/10 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          ) : objectives.length === 0 ? (
            <div className="text-center p-10 bg-card rounded-3xl border border-dashed border-border space-y-6">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-lg">Aucun objectif actif</p>
                <p className="text-muted-foreground text-sm">
                  Définissez ce que vous voulez accomplir pour obtenir un suivi sur-mesure.
                </p>
              </div>
              <Button className="w-full rounded-2xl h-12 gap-2" onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4" />
                Définir un objectif
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {objectives.map((obj) => {
                const details = getDetails(obj.libelle);
                const Icon = details.icon;
                return (
                  <div
                    key={obj.id}
                    className={`p-5 bg-card border rounded-3xl transition-all duration-300 ${
                      obj.actif ? "border-primary/50 shadow-lg shadow-primary/5" : "border-border opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${details.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <button
                        onClick={() => handleToggle(obj)}
                        disabled={toggling === obj.id}
                        className="focus:outline-none"
                      >
                        {obj.actif ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-primary/20 transition-colors">
                            <CheckCircle2 className="w-3 h-3" />
                            En cours
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-accent transition-colors">
                            <Circle className="w-3 h-3" />
                            Terminé
                          </div>
                        )}
                      </button>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-foreground">{details.label}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{obj.description}</p>
                    </div>
                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                        Débuté le {new Date(obj.date_debut).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                );
              })}

              {notAdded.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-3xl border-dashed border-2 gap-2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un nouvel objectif
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal sélection objectif */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
              <h2 className="font-bold text-lg">Choisir un objectif</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-accent transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {notAdded.length === 0 ? (
                <p className="text-center text-muted-foreground py-6 text-sm">Vous avez déjà tous les objectifs disponibles.</p>
              ) : (
                notAdded.map((a) => {
                  const details = getDetails(a.libelle);
                  const Icon = details.icon;
                  return (
                    <button
                      key={a.id}
                      disabled={adding}
                      onClick={() => handleAdd(a.id)}
                      className="w-full flex items-center gap-4 p-4 bg-background border border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                    >
                      <div className={`p-3 rounded-2xl shrink-0 ${details.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold">{details.label}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{a.description}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
