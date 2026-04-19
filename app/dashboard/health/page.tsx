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
  Watch
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

// Données de démonstration pour l'affichage
const mockHealthData = [
  { date: "01/05", weight: 78.5, sleep: 6.5, heartRate: 68 },
  { date: "08/05", weight: 78.2, sleep: 7.0, heartRate: 66 },
  { date: "15/05", weight: 77.8, sleep: 7.5, heartRate: 65 },
  { date: "22/05", weight: 77.1, sleep: 6.8, heartRate: 64 },
  { date: "29/05", weight: 76.5, sleep: 8.0, heartRate: 62 },
];

export default function HealthDashboardPage() {
  const [isPremiumPlus, setIsPremiumPlus] = useState<boolean | null>(null);

  useEffect(() => {
    // On vérifie si l'utilisateur a l'abonnement maximum
    const abonnement = localStorage.getItem("user_abonnement");
    setIsPremiumPlus(abonnement === "premium_plus");
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
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
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
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
                  Connectez vos montres et balances intelligentes pour un suivi biométrique complet de votre santé.
                </p>
              </div>
              
              <ul className="text-sm text-left space-y-4 w-full border-t border-b border-border py-6">
                <li className="flex gap-3 items-center">
                  <Heart className="w-5 h-5 text-rose-500"/> 
                  <span>Suivi de la fréquence cardiaque</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Moon className="w-5 h-5 text-indigo-500"/> 
                  <span>Analyse détaillée du sommeil</span>
                </li>
                <li className="flex gap-3 items-center">
                  <Scale className="w-5 h-5 text-emerald-500"/> 
                  <span>Évolution de la masse corporelle (IMC/Gras)</span>
                </li>
              </ul>
              
              <Button className="w-full h-14 rounded-2xl text-base font-semibold shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-primary/80">
                Débloquer Premium+ (19,99€/mois)
              </Button>
            </div>
          ) : isPremiumPlus === true ? (
            /* DASHBOARD BIOMÉTRIQUE */
            <>
              <div className="text-center space-y-2 mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Vos Constantes
                </h1>
                <p className="text-muted-foreground text-sm">
                  Synchronisé il y a 2 heures via HealthKit
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card border border-border rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-rose-500">
                    <Heart className="w-4 h-4" />
                    <span className="font-semibold text-sm">BPM Repos</span>
                  </div>
                  <p className="text-2xl font-bold">62 <span className="text-sm font-normal text-muted-foreground">bpm</span></p>
                </div>
                <div className="p-4 bg-card border border-border rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-indigo-500">
                    <Moon className="w-4 h-4" />
                    <span className="font-semibold text-sm">Sommeil</span>
                  </div>
                  <p className="text-2xl font-bold">8h <span className="text-sm font-normal text-muted-foreground">/nuit</span></p>
                </div>
              </div>

              {/* Poids Chart */}
              <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-semibold">Évolution du Poids</h3>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockHealthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} width={30} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff' }} />
                      <Line type="monotone" dataKey="weight" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sommeil Chart */}
              <div className="p-5 bg-card border border-border rounded-2xl space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold">Durée du Sommeil</h3>
                </div>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockHealthData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} />
                      <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#888'}} width={30} />
                      <Tooltip cursor={{fill: '#222'}} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff' }} />
                      <Bar dataKey="sleep" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center p-20">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}