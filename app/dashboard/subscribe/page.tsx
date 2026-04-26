"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Check,
  ShieldCheck,
  Sparkles,
  Watch,
  AlertTriangle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SubscribePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<"premium" | "premium_plus" | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("freemium");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    setCurrentPlan(localStorage.getItem("user_abonnement") || "freemium");
  }, []);

  const plans = [
    {
      id: "premium",
      name: "Premium",
      price: "9,99€",
      icon: Sparkles,
      color: "text-amber-500",
      features: ["Analyse de repas par IA", "Recommandations personnalisées", "Historique illimité"],
    },
    {
      id: "premium_plus",
      name: "Premium+",
      price: "19,99€",
      icon: Watch,
      color: "text-primary",
      features: ["Tout le Premium", "Données biométriques (Sommeil, BPM)", "Consultations nutritionnistes"],
    },
  ];

  const PLAN_LABELS: Record<string, string> = {
    freemium: "Freemium",
    premium: "Premium",
    premium_plus: "Premium+",
  };

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
        localStorage.setItem("user_abonnement", selectedPlan!);
        setCurrentPlan(selectedPlan!);
        setStep(3);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    setCancelLoading(true);
    const userId = localStorage.getItem("user_id");
    try {
      const res = await fetch(`http://localhost:8003/users/${userId}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ abonnement: "freemium" }),
      });
      if (res.ok) {
        localStorage.setItem("user_abonnement", "freemium");
        setCurrentPlan("freemium");
        setShowCancelConfirm(false);
        setStep(4);
        setTimeout(() => router.push("/dashboard"), 2000);
      }
    } catch {
    } finally {
      setCancelLoading(false);
    }
  }

  const isPaid = currentPlan === "premium" || currentPlan === "premium_plus";

  return (
    <main className="min-h-screen bg-background text-foreground p-5 pb-20">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 hover:bg-accent rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-bold">Gérer mon abonnement</h1>
      </header>

      {/* Abonnement actuel (toujours visible sauf sur écrans de succès) */}
      {step < 3 && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between ${
          isPaid ? "bg-primary/5 border-primary/30" : "bg-card border-border"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              {isPaid ? <Sparkles className="w-4 h-4 text-primary" /> : <Watch className="w-4 h-4 text-muted-foreground" />}
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Plan actuel</p>
              <p className="font-bold text-sm">{PLAN_LABELS[currentPlan] ?? currentPlan}</p>
            </div>
          </div>
          {isPaid && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs font-semibold text-destructive hover:underline"
            >
              Résilier
            </button>
          )}
        </div>
      )}

      {/* Étape 1 : Choix du plan */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">
              {isPaid ? "Changer de plan" : "Choisissez votre plan"}
            </h2>
            <p className="text-muted-foreground text-sm">Passez à la vitesse supérieure pour votre santé.</p>
          </div>

          <div className="grid gap-4">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = plan.id === currentPlan;
              return (
                <div
                  key={plan.id}
                  onClick={() => !isCurrent && setSelectedPlan(plan.id as "premium" | "premium_plus")}
                  className={`p-6 bg-card border-2 rounded-3xl transition-all ${
                    isCurrent
                      ? "border-primary/40 opacity-60 cursor-not-allowed"
                      : selectedPlan === plan.id
                      ? "border-primary shadow-lg cursor-pointer"
                      : "border-border cursor-pointer hover:border-primary/40"
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
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        Actuel
                      </span>
                    )}
                  </div>
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

      {/* Étape 2 : Paiement */}
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
            {loading ? "Traitement..." : `Payer ${plans.find((p) => p.id === selectedPlan)?.price}`}
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setStep(1)}>
            Modifier le plan
          </Button>
        </div>
      )}

      {/* Étape 3 : Succès upgrade */}
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

      {/* Étape 4 : Succès résiliation */}
      {step === 4 && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-scale-in">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Abonnement résilié</h2>
            <p className="text-muted-foreground">Votre compte est repassé en Freemium.</p>
          </div>
        </div>
      )}

      {/* Modale confirmation résiliation */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-5"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCancelConfirm(false); }}
        >
          <div className="w-full max-w-sm bg-card rounded-3xl border border-border shadow-xl p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <button onClick={() => setShowCancelConfirm(false)} className="p-2 rounded-xl hover:bg-accent">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Résilier l'abonnement ?</h3>
              <p className="text-sm text-muted-foreground">
                Vous perdrez l'accès aux fonctionnalités{" "}
                <strong>{PLAN_LABELS[currentPlan]}</strong> et reviendrez au plan Freemium.
              </p>
            </div>
            <div className="space-y-2">
              <Button
                variant="destructive"
                className="w-full h-12 rounded-xl"
                onClick={handleCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? "Résiliation..." : "Confirmer la résiliation"}
              </Button>
              <Button
                variant="ghost"
                className="w-full h-12 rounded-xl"
                onClick={() => setShowCancelConfirm(false)}
              >
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
