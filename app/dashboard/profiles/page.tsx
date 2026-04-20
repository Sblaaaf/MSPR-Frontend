"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User as UserIcon, Shield, Sparkles, LogOut, Settings, ChevronRight, Watch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "Utilisateur", email: "", abonnement: "freemium" });

  useEffect(() => {
    setUser({
      name: localStorage.getItem("user_name") || "Ami de Jarmy",
      email: localStorage.getItem("user_email") || "utilisateur@mail.com",
      abonnement: localStorage.getItem("user_abonnement") || "freemium",
    });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-background p-5 space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Mon Profil</h1>

      {/* Info Utilisateur */}
      <div className="flex items-center gap-4 p-5 bg-card border border-border rounded-3xl">
        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-primary">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Gestion de l'Abonnement */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Abonnement</h3>
        
        <div className={`p-6 border-2 rounded-3xl relative overflow-hidden ${
          user.abonnement === "freemium" ? "bg-card border-border" : "bg-primary/5 border-primary shadow-lg shadow-primary/10"
        }`}>
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {user.abonnement === "premium_plus" ? <Watch className="w-5 h-5 text-primary" /> : <Shield className="w-5 h-5 text-primary" />}
                <p className="font-bold text-lg capitalize">
                  {user.abonnement === "freemium" ? "Plan Basique (Gratuit)" : user.abonnement.replace('_', ' ')}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                {user.abonnement === "freemium" 
                  ? "Fonctionnalités limitées." 
                  : "Vous profitez des meilleures fonctionnalités."}
              </p>
            </div>
            {user.abonnement !== "freemium" && (
              <div className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">Actif</div>
            )}
          </div>

          {user.abonnement === "freemium" && (
            <Link href="/dashboard/subscribe" className="block mt-6 relative z-10">
              <Button className="w-full h-12 rounded-xl font-bold gap-2 bg-gradient-to-r from-primary to-emerald-400">
                <Sparkles className="w-4 h-4" /> Passer au Premium
              </Button>
            </Link>
          )}
          
          {user.abonnement === "premium" && (
            <Link href="/dashboard/subscribe" className="block mt-6 relative z-10">
              <Button variant="outline" className="w-full h-12 rounded-xl font-bold gap-2 border-primary text-primary hover:bg-primary/10">
                <Watch className="w-4 h-4" /> Débloquer Premium+
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Menu Réglages */}
      <div className="space-y-2 bg-card border border-border rounded-3xl p-2">
        <button className="w-full flex items-center justify-between p-4 hover:bg-accent rounded-2xl transition-colors">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">Paramètres du compte</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
        <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 hover:bg-destructive/10 text-destructive rounded-2xl transition-colors">
          <div className="flex items-center gap-3">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </div>
        </button>
      </div>
    </main>
  );
}