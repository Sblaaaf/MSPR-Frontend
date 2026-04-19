"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Target, 
  TrendingDown, 
  TrendingUp, 
  Moon, 
  Zap, 
  Activity,
  CheckCircle2,
  Circle,
  Plus,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Objective {
  id: number;
  libelle: string;
  description: string;
  date_debut: string;
  actif: boolean;
}

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (userId) {
      fetchObjectives(userId);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchObjectives(userId: string) {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:8003/users/${userId}/objectives`);
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setObjectives(data);
    } catch (err) {
      setError("Impossible de charger vos objectifs.");
    } finally {
      setLoading(false);
    }
  }

  // Fonction utilitaire pour mapper le libellé technique à un nom lisible et une icône
  const getObjectiveDetails = (libelle: string) => {
    const map: Record<string, { label: string; icon: any; color: string }> = {
      perte_de_poids: { label: "Perte de poids", icon: TrendingDown, color: "text-rose-500 bg-rose-500/10" },
      prise_de_masse: { label: "Prise de masse", icon: TrendingUp, color: "text-blue-500 bg-blue-500/10" },
      amelioration_sommeil: { label: "Mieux dormir", icon: Moon, color: "text-indigo-500 bg-indigo-500/10" },
      maintien_forme: { label: "Maintien de forme", icon: Activity, color: "text-emerald-500 bg-emerald-500/10" },
      endurance: { label: "Endurance", icon: Zap, color: "text-amber-500 bg-amber-500/10" },
    };
    return map[libelle] || { label: libelle, icon: Target, color: "text-primary bg-primary/10" };
  };

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground pb-20">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour</span>
        </Link>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <Target className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="w-16" />
      </header>

      <section className="flex-1 px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Mes Objectifs</h1>
            <p className="text-muted-foreground text-sm">
              Suivez vos défis personnels et votre progression.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
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
                  Définissez ce que vous voulez accomplir pour obtenir un programme sur-mesure.
                </p>
              </div>
              <Button className="w-full rounded-2xl h-12 gap-2">
                <Plus className="w-4 h-4" />
                Définir un objectif
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {objectives.map((obj) => {
                const details = getObjectiveDetails(obj.libelle);
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
                      {obj.actif ? (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" />
                          En cours
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-muted text-muted-foreground rounded-full text-[10px] font-bold uppercase tracking-wider">
                          <Circle className="w-3 h-3" />
                          Terminé
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-foreground">{details.label}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {obj.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
                        Débuté le {new Date(obj.date_debut).toLocaleDateString('fr-FR')}
                      </div>
                      <Button variant="ghost" className="h-8 text-xs font-bold text-primary">
                        Détails
                      </Button>
                    </div>
                  </div>
                );
              })}

              <Button variant="outline" className="w-full h-14 rounded-3xl border-dashed border-2 gap-2 text-muted-foreground hover:text-foreground">
                <Plus className="w-4 h-4" />
                Ajouter un nouvel objectif
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}