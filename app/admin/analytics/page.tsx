"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts"
import { adminApi } from "@/lib/admin-api"

const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"]

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-sm font-medium">{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [users, setUsers] = useState<any>(null)
  const [nutrition, setNutrition] = useState<any>(null)
  const [fitness, setFitness] = useState<any>(null)
  const [kpis, setKpis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminApi.analyticsUsers(),
      adminApi.analyticsNutrition(),
      adminApi.analyticsFitness(),
      adminApi.analyticsKpis(),
    ]).then(([u, n, f, k]) => {
      setUsers(u); setNutrition(n); setFitness(f); setKpis(k)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </main>
    )
  }

  const kpiCards = kpis ? [
    { label: "Utilisateurs total", value: kpis.total_utilisateurs },
    { label: "Actifs", value: kpis.utilisateurs_actifs },
    { label: "Taux conversion premium", value: kpis.taux_conversion_pct ? `${kpis.taux_conversion_pct}%` : "—" },
    { label: "IMC moyen", value: kpis.imc_moyen ?? "—" },
  ] : []

  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-6 py-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/admin" aria-label="Retour à la vue d'ensemble">
          <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        </Link>
        <nav className="flex gap-4 text-sm" aria-label="Navigation admin">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Vue d'ensemble</Link>
          <Link href="/admin/data" className="text-muted-foreground hover:text-foreground transition-colors">Données</Link>
          <span className="font-semibold text-foreground" aria-current="page">Analytics</span>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* KPIs */}
        <section aria-label="Indicateurs clés">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {kpiCards.map((k) => (
              <Card key={k.label}>
                <CardContent className="p-5">
                  <p className="text-2xl font-bold">{k.value ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{k.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Tabs defaultValue="users">
          <TabsList aria-label="Catégories d'analytics">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="fitness">Fitness</TabsTrigger>
          </TabsList>

          {/* UTILISATEURS */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="Répartition par abonnement">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={users?.par_abonnement ?? []}
                      dataKey="nb"
                      nameKey="abonnement"
                      cx="50%" cy="50%" outerRadius={80}
                      label={({ abonnement, nb }) => `${abonnement} (${nb})`}
                    >
                      {(users?.par_abonnement ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Répartition par sexe">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={users?.par_sexe ?? []} dataKey="nb" nameKey="sexe" cx="50%" cy="50%" outerRadius={80}
                      label={({ sexe, nb }) => `${sexe} (${nb})`}>
                      {(users?.par_sexe ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Tranches d'âge">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={users?.tranches_age ?? []}>
                    <XAxis dataKey="tranche" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="nb" fill="#6366f1" radius={[4, 4, 0, 0]} name="Utilisateurs" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Objectifs santé">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={users?.par_objectif ?? []} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="libelle" type="category" width={140} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="nb" fill="#22c55e" radius={[0, 4, 4, 0]} name="Utilisateurs" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          {/* NUTRITION */}
          <TabsContent value="nutrition" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="Top 10 aliments caloriques">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={nutrition?.top_calories ?? []} layout="vertical">
                    <XAxis type="number" unit=" kcal" />
                    <YAxis dataKey="nom" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="calories_100g" fill="#f59e0b" radius={[0, 4, 4, 0]} name="kcal/100g" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Top 10 aliments protéinés">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={nutrition?.top_proteines ?? []} layout="vertical">
                    <XAxis type="number" unit=" g" />
                    <YAxis dataKey="nom" type="category" width={120} tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="proteines_g" fill="#6366f1" radius={[0, 4, 4, 0]} name="Protéines (g)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Moyennes nutritionnelles par catégorie">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={nutrition?.par_categorie ?? []}>
                    <XAxis dataKey="categorie" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={50} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cal_moy" name="Kcal moy" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="prot_moy" name="Prot moy (g)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </TabsContent>

          {/* FITNESS */}
          <TabsContent value="fitness" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChartCard title="Exercices par type">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={fitness?.par_type ?? []} dataKey="nb" nameKey="type" cx="50%" cy="50%" outerRadius={80}
                      label={({ type, nb }) => `${type} (${nb})`}>
                      {(fitness?.par_type ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Exercices par niveau">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={fitness?.par_niveau ?? []}>
                    <XAxis dataKey="niveau" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="nb" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Exercices" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              <ChartCard title="Muscles les plus ciblés (principal)">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={fitness?.top_muscles ?? []} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="muscle" type="category" width={120} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="nb_exercices" fill="#14b8a6" radius={[0, 4, 4, 0]} name="Exercices" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {fitness?.calories_brulees_moy && (
                <Card>
                  <CardContent className="p-5 flex flex-col justify-center h-full">
                    <p className="text-muted-foreground text-sm">Calories brûlées moyennes</p>
                    <p className="text-4xl font-bold text-primary mt-2">
                      {fitness.calories_brulees_moy.moy}
                      <span className="text-lg text-muted-foreground ml-1">kcal</span>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
