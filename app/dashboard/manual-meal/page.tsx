"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ManualMealPage() {
  const [aliments, setAliments] = useState<any[]>([]);
  const [selectedAliment, setSelectedAliment] = useState("");
  const [quantite, setQuantite] = useState("");
  const [calories100g, setCalories100g] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [typeRepas, setTypeRepas] = useState("dejeuner");
  const [dateRepas, setDateRepas] = useState("");
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8003/aliments")
      .then(res => res.json())
      .then(data => setAliments(data))
      .catch(() => setError("Erreur lors du chargement des aliments"));
  }, []);

  function addItem() {
    if (!selectedAliment || !quantite || !calories100g) return;
    setItems([...items, { aliment_nom: selectedAliment, quantite_g: Number(quantite), calories_100g: Number(calories100g) }]);
    setSelectedAliment("");
    setQuantite("");
    setCalories100g("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Validation côté client
    if (!dateRepas) {
      setError("Veuillez renseigner la date du repas.");
      return;
    }
    if (!typeRepas) {
      setError("Veuillez sélectionner le type de repas.");
      return;
    }
    if (!items.length) {
      setError("Veuillez ajouter au moins un aliment.");
      return;
    }
    setLoading(true);
    try {
      const userId = localStorage.getItem("user_id") || "1";
      const res = await fetch(`http://localhost:8003/users/${userId}/meals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type_repas: typeRepas,
          date_repas: dateRepas,
          notes,
          items
        })
      });
      if (!res.ok) throw new Error();
      setSuccess("Repas ajouté !");
      setItems([]);
      setNotes("");
      setDateRepas("");
    } catch {
      setError("Erreur lors de l'ajout du repas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md bg-white/80 p-8 rounded-xl shadow">
        <h2 className="text-2xl font-bold mb-4 text-center">Ajouter un repas manuellement</h2>
        <div className="flex gap-2">
          <select value={selectedAliment} onChange={e => {
            setSelectedAliment(e.target.value);
            const alim = aliments.find(a => a.nom === e.target.value);
            setCalories100g(alim ? alim.calories_100g : "");
          }} className="flex-1 p-2 border rounded">
            <option value="">Choisir un aliment</option>
            {aliments.map((a, idx) => (
              <option key={idx} value={a.nom}>{a.nom}</option>
            ))}
          </select>
          <input type="number" min="1" placeholder="Quantité (g)" value={quantite} onChange={e => setQuantite(e.target.value)} className="w-28 p-2 border rounded" />
          <input type="number" min="0" placeholder="Kcal/100g" value={calories100g} onChange={e => setCalories100g(e.target.value)} className="w-28 p-2 border rounded" />
          <Button type="button" onClick={addItem}>Ajouter</Button>
        </div>
        <ul className="mb-2">
          {items.map((item, idx) => (
            <li key={idx}>{item.aliment_nom} : {item.quantite_g}g, {item.calories_100g} kcal/100g</li>
          ))}
        </ul>
        <div className="flex gap-2">
          <select value={typeRepas} onChange={e => setTypeRepas(e.target.value)} className="flex-1 p-2 border rounded">
            <option value="dejeuner">Déjeuner</option>
            <option value="diner">Dîner</option>
            <option value="petit_dejeuner">Petit-déjeuner</option>
            <option value="collation">Collation</option>
          </select>
          <input type="date" value={dateRepas} onChange={e => setDateRepas(e.target.value)} className="flex-1 p-2 border rounded" />
        </div>
        <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border rounded" />
        <Button type="submit" className="w-full" disabled={loading || items.length === 0}>{loading ? "Ajout..." : "Ajouter le repas"}</Button>
        {error && <div className="text-red-500 text-center">{error}</div>}
        {success && <div className="text-green-600 text-center">{success}</div>}
        <a href="/dashboard" className="block mt-4 text-center text-primary underline">Retour au menu</a>
      </form>
    </main>
  );
}
