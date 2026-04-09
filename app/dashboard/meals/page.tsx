"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function MealsPage() {
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem("user_id") || "1";
    fetch(`http://localhost:8003/users/${userId}/meals`)
      .then(res => res.json())
      .then(data => setMeals(data))
      .catch(() => setError("Erreur lors du chargement des repas"))
      .finally(() => setLoading(false));
  }, [deleting]);

  const handleShowDetails = (meal: any) => {
    setSelectedMeal(meal);
    setShowPopup(true);
  };

  const handleDelete = async (mealId: number) => {
    setDeleting(true);
    await fetch(`http://localhost:8003/meals/${mealId}`, { method: "DELETE" });
    setShowPopup(false);
    setDeleting(false);
    setMeals(meals.filter(m => m.id !== mealId));
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <div className="w-full max-w-2xl bg-white/80 p-8 rounded-xl shadow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mes repas</h2>
          <a href="/dashboard/manual-meal" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-accent transition-colors">Ajouter</a>
        </div>
        {loading ? (
          <div>Chargement...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : meals.length === 0 ? (
          <div>Aucun repas trouvé.</div>
        ) : (
          <ul className="divide-y">
            {meals.map(meal => (
              <li key={meal.id} className="py-3 cursor-pointer hover:bg-accent/20 rounded transition" onClick={() => handleShowDetails(meal)}>
                <div className="flex justify-between items-center">
                  <span>{meal.type_repas} - {meal.date_repas}</span>
                  <span className="text-muted-foreground">{meal.total_calories} kcal</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <a href="/dashboard" className="block mt-6 text-center text-primary underline">Retour au menu</a>
      </div>
      {showPopup && selectedMeal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md relative">
            <button onClick={() => setShowPopup(false)} className="absolute top-2 right-2 text-xl">×</button>
            <h3 className="text-xl font-bold mb-2">Détails du repas</h3>
            <div>Date : {selectedMeal.date_repas}</div>
            <div>Type : {selectedMeal.type_repas}</div>
            <div>Total kcal : {selectedMeal.total_calories}</div>
            <div className="mt-2 mb-2">Notes : {selectedMeal.notes || "-"}</div>
            <ul className="mb-4">
              {selectedMeal.items.map((item: any, idx: number) => (
                <li key={idx}>{item.aliment_nom} : {item.quantite_g}g, {item.calories_100g} kcal/100g</li>
              ))}
            </ul>
            <Button onClick={() => handleDelete(selectedMeal.id)} disabled={deleting} className="bg-destructive text-white w-full mb-2">
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
