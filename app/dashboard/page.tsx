
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      router.replace("/login");
      return;
    }
    const name = localStorage.getItem("user_name") || "Utilisateur";
    setUserName(name);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Bonjour, {userName} !</h1>
        <p className="text-muted-foreground mb-8">Bienvenue sur votre espace personnel.</p>
        <div className="flex flex-col items-center gap-4">
          <a href="/dashboard/add-meal" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-accent transition-colors">
            Analyse automatique d'un repas
          </a>
          <a href="/dashboard/manual-meal" className="inline-block px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-accent/60 transition-colors">
            Ajouter un repas manuellement
          </a>
          <a href="/dashboard/meals" className="inline-block px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-primary/60 transition-colors">
            Visualiser mes repas
          </a>
        </div>
      </div>
    </main>
  );
}
