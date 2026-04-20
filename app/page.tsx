"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  Salad, 
  Plus, 
  Flame, 
  Target, 
  History, 
  TrendingUp, 
  Sparkles, 
  ChevronRight,
  Zap,
  Watch
} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const [userName, setUserName] = useState("Utilisateur")
  const [abonnement, setAbonnement] = useState("freemium")
  const [calories, setCalories] = useState({ consumed: 0, target: 2100 })

  useEffect(() => {
    // Récupération des infos locales
    setUserName(localStorage.getItem("user_name") || "Ami de Jarmy")
    setAbonnement(localStorage.getItem("user_abonnement") || "freemium")
    
    // Simulation de récupération de données (à lier à votre route GET /users/{id}/meals plus tard)
    setCalories({ consumed: 1250, target: 2100 })
  }, [])

  const progressPercentage = Math.min((calories.consumed / calories.target) * 100, 100)

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      {/* Header avec Statut */}
      <header className="px-5 py-6 space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-muted-foreground text-sm font-medium">Bonjour,</p>
            <h1 className="text-2xl font-bold tracking-tight">{userName} 👋</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Salad className="w-5 h-5 text-primary" />
          </div>
        </div>
      </header>

      <section className="px-5 space-y-6 animate-fade-in">
        
        {/* CARTE D'UPGRADE (DYNAMIQUE) */}
        {abonnement === "freemium" ? (
          <div className="relative overflow-hidden p-5 bg-gradient-to-br from-primary to-primary/80 rounded-3xl shadow-lg shadow-primary/20 text-primary-foreground group transition-all active:scale-[0.98]">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 fill-white/20 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-90">Offre Spéciale</span>
              </div>
              <h2 className="text-xl font-black leading-tight">Débloquez l'Analyse IA</h2>
              <p className="text-sm opacity-90 max-w-[200px]">
                Prenez vos repas en photo et laissez l'IA compter les calories pour vous.
              </p>
              <Link href="/dashboard/subscribe" className="block pt-2">
                <Button variant="secondary" className="w-full rounded-2xl font-bold gap-2 text-primary">
                  Passer au Premium
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            {/* Décoration de fond */}
            <Zap className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        ) : (
          <div className="p-4 bg-card border border-primary/20 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                {abonnement === "premium_plus" ? <Watch className="w-5 h-5 text-primary" /> : <Sparkles className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Statut du compte</p>
                <p className="text-sm font-bold capitalize">{abonnement.replace('_', ' ')}</p>
              </div>
            </div>
            <Link href="/dashboard/subscribe">
               <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">Gérer</Button>
            </Link>
          </div>
        )}

        {/* Résumé Calories */}
        <div className="p-6 bg-card border border-border rounded-3xl space-y-6">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                Calories consommées
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black">{calories.consumed}</span>
                <span className="text-muted-foreground font-medium">/ {calories.target} kcal</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-muted flex items-center justify-center relative">
              <span className="text-[10px] font-bold">{Math.round(progressPercentage)}%</span>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  cx="24" cy="24" r="20" 
                  fill="none" stroke="currentColor" 
                  strokeWidth="4" 
                  className="text-primary"
                  strokeDasharray={`${progressPercentage * 1.25} 125`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Actions Rapides */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard/add-meal" className="contents">
            <button className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-3xl gap-3 hover:border-primary/50 transition-colors active:scale-95">
              <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-primary">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold">Analyse IA</span>
            </button>
          </Link>
          <Link href="/dashboard/manual-meal" className="contents">
            <button className="flex flex-col items-center justify-center p-6 bg-card border border-border rounded-3xl gap-3 hover:border-primary/50 transition-colors active:scale-95">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-foreground">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold">Ajout Manuel</span>
            </button>
          </Link>
        </div>

        {/* Historique Récent */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              Historique récent
            </h3>
            <Link href="/dashboard/meals" className="text-xs font-bold text-primary hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="space-y-3">
             {/* Note: À terme, bouclez ici sur vos données fetchées du backend */}
             <div className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 text-xs font-bold">
                    DEJ
                  </div>
                  <div>
                    <p className="text-sm font-bold">Poulet & Riz</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Aujourd'hui, 12:45</p>
                  </div>
                </div>
                <p className="font-bold">450 kcal</p>
             </div>
          </div>
        </div>

      </section>
    </main>
  )
}