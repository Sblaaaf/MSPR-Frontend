"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

const API = process.env.NEXT_PUBLIC_JARMY_API_URL || "http://localhost:8000";

export default function CreatePostPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const uid = localStorage.getItem("user_id");
    const name = localStorage.getItem("user_name") || "Utilisateur";
    if (!uid) { router.replace("/login"); return; }
    setUserId(parseInt(uid));
    setUserName(name);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Ajoute du texte.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch(`${API}/social/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, user_name: userName, content }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Erreur lors de la publication.");
      }

      router.replace("/dashboard/social");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-5 pt-6 pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Nouvelle publication</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-sm">
                {userName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
            <span className="font-semibold text-sm text-foreground">{userName}</span>
          </div>

          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Quoi de neuf ? Partage ton repas, ta séance, tes progrès…"
            rows={4}
            maxLength={2000}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none"
          />
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading || !content.trim()}
          className="w-full h-12 rounded-xl font-semibold"
        >
          {loading ? "Publication…" : "Publier"}
        </Button>
      </form>
    </div>
  );
}
