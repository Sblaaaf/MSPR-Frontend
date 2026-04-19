"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Activity, 
  Heart, 
  Moon, 
  Scale, 
  Lock,
  Watch,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface Metric {
  date_mesure: string;
  poids_kg: number;
  heures_sommeil: number;
  bpm_repos: number;
}

export default function HealthDashboardPage() {
  const [isPremiumPlus, setIsPremiumPlus] = useState<boolean | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const abonnement = localStorage.getItem("user_abonnement");
    const userId = localStorage.getItem("user_id");
    const status = abonnement === "premium_plus";
    setIsPremiumPlus(status);

    if (status && userId) {
      fetchMetrics(userId);
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchMetrics(userId: string) {
    try {
      setLoading(true);
      // Appel à la nouvelle route du service meal via le port 8003
      const res = await fetch(`http://localhost:8003/users/${userId}/metrics`);
      if (!res.ok) throw new Error("Erreur lors de la récupération des données");
      const data = await res.json();
      
      // Formatage des dates pour l'affichage (YYYY-MM-DD -> DD/MM)
      const formattedData = data.map((m: any) => ({
        ...m,
        date_display: new Date(m.date_mesure).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
      }));
      
      setMetrics(formattedData);
    } catch (err) {
      setError("Impossible de charger vos données de santé.");
    } finally {
      setLoading(false);
    }
  }

  const lastMetric = metrics[metrics.length - 1];

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-card/80 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Retour</span>
        </Link>
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
          <Activity className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="w-16" />
      </header>

      <section className="flex-1 flex flex-col px-5 py-6 animate-fade-in">
        <div className="max-w-md mx-auto w-full space-y-6">
          
          {isPremiumPlus === false ? (
            /* PAYWALL PREMIUM+ */
            <div className="flex flex-col items-center justify-center p-8 bg-card border border-border rounded-3xl text-center space-y-6 mt-4 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Watch className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">HealthAI Premium+</h2>
                <p className="text-muted-foreground text-sm">
                  Connectez vos objets connectés pour un suivi biométrique complet.
                </p>
              </div>
              <ul className="text-sm text-left space-y-4 w-full border-t border-b border-border py-6">
                <li className="flex gap-3 items-center"><Heart className="w-5 h-5 text-rose-500"/> Fréquence cardiaque en temps réel</li>
                <li className="flex gap-3 items-center"><Moon className="w-5 h-5 text-indigo-500"/> Analyse avancée du sommeil</li>
                <li className="flex gap-3 items-center"><Scale className="w-5 h-5 text-emerald-500"/> Évolution précise du poids et IMC</li>
              </ul>
              <Button className="w-full h-14 rounded-2xl text-base font-semibold bg-gradient-to-r from-primary to-primary/80">
                Débloquer Premium+ (19,99€/mois)
              </Button>
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Synchronisation des données...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-destructive/10 rounded-2xl text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
              <p className="text-sm font-medium text-destructive">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button>
            </div>
          ) : metrics.length === 0 ? (
            <div className="text-center p-10 bg-card rounded-2xl border border-dashed border-border space-y-4">
              <Watch className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Aucune donnée synchronisée pour le moment.</p>
              <Button>Connecter un appareil</Button>
            </div>
          ) : (
            /* DASHBOARD RÉEL */
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Santé & Biométrie</h1>
                <p className="text-muted-foreground text-xs uppercase tracking-widest">Premium+</p>
              </div>

              {/* KPI Cards dynamiques */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card border border-border rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-rose-500">
                    <Heart className="w-4 h-4" />
                    <span className="font-semibold text-xs uppercase">BPM Repos</span>
                  </div>
                  <p className="text-2xl font-bold">{lastMetric?.bpm_repos || '--'} <span className="text-xs font-normal text-muted-foreground">bpm</span></p>
                </div>
                <div className="p-4 bg-card border border-border rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Moon className="w-4 h-4" />
                    <span className="font-semibold text-xs uppercase">Sommeil</span>
                  </div>
                  <p className="text-2xl font-bold">{lastMetric?.heures_sommeil || '--'}h <span className="text-xs font-normal text-muted-foreground">/nuit</span></p>
                </div>
              </div>

              {/* Poids Chart */}
              <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-semibold">Poids (kg)</h3>
                  </div>
                  <span className="text-sm font-bold text-emerald-500">{lastMetric?.poids_kg} kg</span>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="date_display" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff' }} />
                      <Line type="monotone" dataKey="poids_kg" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sommeil Chart */}
              <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-semibold">Sommeil (heures)</h3>
                  </div>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="date_display" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#888'}} />
                      <YAxis hide domain={[0, 12]} />
                      <Tooltip cursor={{fill: '#222'}} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff' }} />
                      <Bar dataKey="heures_sommeil" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}