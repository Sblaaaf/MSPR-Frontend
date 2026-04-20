"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Check, ShieldCheck, Sparkles, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SubscribePage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Choix du plan, 2: Paiement
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "premium_plus" | null>(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: "premium",
      name: "Premium",
      price: "9,99€",
      icon: Sparkles,
      color: "text-amber-500",
      features: ["Analyse de repas par IA", "Recommandations personnalisées", "Historique illimité"]
    },
    {
      id: "premium_plus",
      name: "Premium+",
      price: "19,99€",
      icon: Watch,
      color: "text-primary",
      features: ["Tout le Premium", "Données biométriques (Sommeil, BPM)", "Consultations nutritionnistes"]
    }
  ];

  async function handleUpgrade() {
    setLoading(true);
    const userId = localStorage.getItem("user_id");
    
    try {
      const res = await fetch(`http://localhost:8003/users/${userId}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abonnement: selectedPlan }),
      });

      if (res.ok) {
        // Mise à jour cruciale du localStorage pour que l'interface s'adapte immédiatement
        localStorage.setItem("user_abonnement", selectedPlan!);
        setStep(3); // Écran de succès
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch (error) {
      console.error("Erreur upgrade:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground p-5 pb-20">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 hover:bg-accent rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Améliorer mon compte</h1>
      </header>

      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Choisissez votre plan</h2>
            <p className="text-muted-foreground text-sm">Passez à la vitesse supérieure pour votre santé.</p>
          </div>

          <div className="grid gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div 
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id as any)}
                  className={`p-6 bg-card border-2 rounded-3xl cursor-pointer transition-all ${
                    selectedPlan === plan.id ? "border-primary shadow-lg" : "border-border"
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl bg-accent ${plan.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black">{plan.price}</p>
                      <p className="text-xs text-muted-foreground">par mois</p>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-3">{plan.name}</h3>
                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <Button 
            className="w-full h-14 rounded-2xl text-base font-bold" 
            disabled={!selectedPlan}
            onClick={() => setStep(2)}
          >
            Continuer vers le paiement
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-slide-up">
          <div className="p-6 bg-card border border-border rounded-3xl space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-bold">Paiement Sécurisé</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">Numéro de carte</label>
                <Input placeholder="4242 4242 4242 4242" className="h-12 rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Expiration</label>
                  <Input placeholder="MM/YY" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-muted-foreground">CVC</label>
                  <Input placeholder="123" className="h-12 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-2 text-[10px] text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Vos données sont cryptées et sécurisées.
            </div>
          </div>

          <Button 
            className="w-full h-14 rounded-2xl text-base font-bold" 
            onClick={handleUpgrade}
            disabled={loading}
          >
            {loading ? "Traitement..." : `Payer ${plans.find(p => p.id === selectedPlan)?.price}`}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>Modifier le plan</Button>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-scale-in">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Félicitations !</h2>
            <p className="text-muted-foreground">Votre compte a été mis à jour avec succès.</p>
          </div>
        </div>
      )}
    </main>
  );
}