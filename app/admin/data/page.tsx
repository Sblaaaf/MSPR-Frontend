"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ArrowLeft, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { adminApi } from "@/lib/admin-api"

function DataTable({
  columns, rows, onDelete, loading,
}: {
  columns: string[]
  rows: any[]
  onDelete?: (id: number) => void
  loading: boolean
}) {
  if (loading) return <div className="py-8 text-center text-muted-foreground text-sm">Chargement…</div>
  if (!rows.length) return <div className="py-8 text-center text-muted-foreground text-sm">Aucune donnée</div>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" role="table">
        <thead>
          <tr className="border-b text-muted-foreground">
            {columns.map((c) => <th key={c} scope="col" className="text-left py-2 pr-4 font-medium">{c}</th>)}
            {onDelete && <th scope="col" className="text-left py-2">Action</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
              {columns.map((c) => (
                <td key={c} className="py-2 pr-4 truncate max-w-[180px]" title={String(row[c] ?? "")}>
                  {row[c] === null || row[c] === undefined ? (
                    <span className="text-muted-foreground/50 italic">null</span>
                  ) : String(row[c])}
                </td>
              ))}
              {onDelete && (
                <td className="py-2">
                  <Button
                    variant="ghost" size="sm"
                    aria-label={`Supprimer l'enregistrement ${row.id}`}
                    onClick={() => { if (confirm("Supprimer cet enregistrement ?")) onDelete(row.id) }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground" role="navigation" aria-label="Pagination">
      <span>{total} enregistrements — page {page + 1}/{pages}</span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => onChange(page - 1)} disabled={page === 0} aria-label="Page précédente">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => onChange(page + 1)} disabled={page >= pages - 1} aria-label="Page suivante">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function ApprovalPanel() {
  const [anomalies, setAnomalies] = useState<any[]>([])
  const [corrections, setCorrections] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try { const r = await adminApi.approvals(); setAnomalies(r.anomalies ?? []) } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function approve(table: string, id: number, key: string) {
    const val = parseFloat(corrections[key])
    if (isNaN(val)) return alert("Valeur invalide")
    try {
      await adminApi.approve(table, id, val)
      await load()
    } catch { alert("Erreur lors de la correction") }
  }

  if (loading) return <div className="py-4 text-sm text-muted-foreground">Chargement…</div>
  if (!anomalies.length) return (
    <div className="py-4 text-sm text-green-600">Aucune anomalie détectée.</div>
  )

  return (
    <div className="space-y-3">
      {anomalies.map((a, i) => {
        const key = `${a.table_cible}_${a.record_id}`
        return (
          <div key={i} className="flex items-center gap-3 p-3 border rounded-lg bg-yellow-50/30">
            <Badge variant="outline">{a.table_cible}</Badge>
            <span className="font-mono text-xs">#{a.record_id}</span>
            <span className="text-muted-foreground text-sm truncate flex-1">{a.detail}</span>
            <span className="text-xs text-yellow-700">{a.motif}</span>
            <Input
              className="w-28 h-8 text-sm"
              placeholder="Valeur"
              aria-label={`Correction pour ${a.table_cible} #${a.record_id}`}
              value={corrections[key] ?? ""}
              onChange={(e) => setCorrections((c) => ({ ...c, [key]: e.target.value }))}
            />
            <Button size="sm" onClick={() => approve(a.table_cible, a.record_id, key)}>
              Approuver
            </Button>
          </div>
        )
      })}
    </div>
  )
}

export default function DataPage() {
  const [tab, setTab] = useState("users")
  const [page, setPage] = useState(0)
  const [data, setData] = useState<any>({ data: [], total: 0 })
  const [loading, setLoading] = useState(false)

  const configs: Record<string, { cols: string[]; fetch: (p: number) => Promise<any>; del?: (id: number) => Promise<any> }> = {
    users: {
      cols: ["id", "nom", "prenom", "email", "sexe", "poids_initial_kg", "taille_cm", "abonnement", "actif"],
      fetch: adminApi.users,
      del: adminApi.deleteUser,
    },
    foods: {
      cols: ["id", "nom", "categorie", "calories_100g", "proteines_g", "glucides_g", "lipides_g", "fibres_g"],
      fetch: adminApi.foods,
      del: adminApi.deleteFood,
    },
    exercises: {
      cols: ["id", "nom", "type", "niveau", "equipement", "source_dataset"],
      fetch: adminApi.exercises,
      del: adminApi.deleteEx,
    },
    metrics: {
      cols: ["id", "utilisateur_id", "date_mesure", "poids_kg", "bpm_repos", "bpm_max", "calories_brulees"],
      fetch: (p) => adminApi.users(p), // remplacé ci-dessous
    },
  }

  // Metrics utilise un fetch différent
  configs.metrics.fetch = async (p) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_JARMY_API_URL ?? "http://localhost:8000"}/admin/metrics?limit=50&offset=${p * 50}`)
    return res.json()
  }

  useEffect(() => {
    setPage(0)
  }, [tab])

  useEffect(() => {
    const cfg = configs[tab]
    if (!cfg) return
    setLoading(true)
    cfg.fetch(page).then(setData).catch(() => setData({ data: [], total: 0 })).finally(() => setLoading(false))
  }, [tab, page])

  async function handleDelete(id: number) {
    const cfg = configs[tab]
    if (!cfg.del) return
    try { await cfg.del(id); const r = await cfg.fetch(page); setData(r) } catch {}
  }

  const cfg = configs[tab]

  return (
    <main className="min-h-screen bg-background">
      <header className="flex items-center gap-4 px-6 py-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <Link href="/admin" aria-label="Retour">
          <ArrowLeft className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
        </Link>
        <nav className="flex gap-4 text-sm" aria-label="Navigation admin">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">Vue d'ensemble</Link>
          <span className="font-semibold text-foreground" aria-current="page">Données</span>
          <Link href="/admin/analytics" className="text-muted-foreground hover:text-foreground transition-colors">Analytics</Link>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="Tables de données">
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="foods">Aliments</TabsTrigger>
            <TabsTrigger value="exercises">Exercices</TabsTrigger>
            <TabsTrigger value="metrics">Métriques</TabsTrigger>
            <TabsTrigger value="approvals">Anomalies</TabsTrigger>
          </TabsList>

          {["users", "foods", "exercises", "metrics"].map((t) => (
            <TabsContent key={t} value={t} className="mt-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {t} — {data.total ?? 0} enregistrements
                  </CardTitle>
                  <div className="flex gap-2">
                    <a href={adminApi.exportUrl(
                      t === "users" ? "utilisateurs" : t === "foods" ? "aliments" : t === "exercises" ? "exercices" : "metriques",
                      "csv"
                    )} download aria-label={`Exporter ${t} en CSV`}>
                      <Button variant="outline" size="sm">CSV</Button>
                    </a>
                    <a href={adminApi.exportUrl(
                      t === "users" ? "utilisateurs" : t === "foods" ? "aliments" : t === "exercises" ? "exercices" : "metriques",
                      "json"
                    )} download aria-label={`Exporter ${t} en JSON`}>
                      <Button variant="outline" size="sm">JSON</Button>
                    </a>
                  </div>
                </CardHeader>
                <CardContent>
                  <DataTable
                    columns={configs[t].cols}
                    rows={data.data ?? []}
                    onDelete={configs[t].del ? handleDelete : undefined}
                    loading={loading}
                  />
                  <Pagination page={page} total={data.total ?? 0} perPage={50} onChange={setPage} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          <TabsContent value="approvals" className="mt-4">
            <Card>
              <CardHeader><CardTitle className="text-sm font-medium">Anomalies — workflow de validation</CardTitle></CardHeader>
              <CardContent><ApprovalPanel /></CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
