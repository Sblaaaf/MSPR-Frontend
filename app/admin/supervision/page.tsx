"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ExternalLink, RefreshCw, Activity, Database,
  CheckCircle2, AlertTriangle, PlayCircle,
} from "lucide-react"
import { AdminNav } from "@/components/admin/admin-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { adminApi } from "@/lib/admin-api"

// URL de Grafana (provisionné par docker-compose, port hôte 3001). Surchargée via .env.local.
const GRAFANA_URL = process.env.NEXT_PUBLIC_GRAFANA_URL ?? "http://localhost:3001"
// Dashboard provisionné (uid figé dans healthai-overview.json) en mode kiosk pour l'embed.
const DASHBOARD_UID = "healthai-overview"

export default function SupervisionPage() {
  const router = useRouter()
  const [reloadKey, setReloadKey] = useState(0)
  const [etl, setEtl] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [runningEtl, setRunningEtl] = useState(false)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (localStorage.getItem("user_role") !== "admin") {
      router.push("/login")
      return
    }
    loadEtl()
    return () => { if (pollingRef.current) clearInterval(pollingRef.current) }
  }, [router])

  async function loadEtl() {
    try {
      const [status, hist] = await Promise.all([
        adminApi.etlStatus(),
        adminApi.etlHistory(10),
      ])
      setEtl(status)
      setHistory(hist.runs ?? hist.history ?? (Array.isArray(hist) ? hist : []))
    } catch { /* service non dispo hors Docker */ }
  }

  function startEtlPolling() {
    if (pollingRef.current) clearInterval(pollingRef.current)
    setRunningEtl(true)
    pollingRef.current = setInterval(async () => {
      try {
        const status = await adminApi.etlStatus()
        setEtl(status)
        if (!status.en_cours) {
          clearInterval(pollingRef.current!)
          pollingRef.current = null
          setRunningEtl(false)
          await loadEtl()
        }
      } catch {
        clearInterval(pollingRef.current!)
        pollingRef.current = null
        setRunningEtl(false)
      }
    }, 3000)
  }

  async function triggerEtl() {
    try { await adminApi.etlRun() } catch {}
    startEtlPolling()
  }

  const embedUrl = `${GRAFANA_URL}/d/${DASHBOARD_UID}?kiosk&theme=light&refresh=10s`

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <AdminNav current="supervision" />

      <section className="flex-1 px-4 py-4" aria-label="Supervision : ETL et Grafana">
        <div className="max-w-[1600px] mx-auto">
          <Tabs defaultValue="grafana" className="w-full">
            <TabsList>
              <TabsTrigger value="grafana" className="gap-1"><Activity className="w-4 h-4" /> Grafana</TabsTrigger>
              <TabsTrigger value="etl" className="gap-1"><Database className="w-4 h-4" /> ETL</TabsTrigger>
            </TabsList>

            {/* ─────────────── Onglet Grafana ─────────────── */}
            <TabsContent value="grafana" className="mt-4">
              <div className="flex justify-end gap-2 mb-3">
                <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)} aria-label="Recharger le dashboard">
                  <RefreshCw className="w-4 h-4 mr-1" /> Recharger
                </Button>
                <a href={`${GRAFANA_URL}/d/${DASHBOARD_UID}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="sm" aria-label="Ouvrir Grafana dans un nouvel onglet">
                    <ExternalLink className="w-4 h-4 mr-1" /> Ouvrir Grafana
                  </Button>
                </a>
              </div>
              <iframe
                key={reloadKey}
                title="Supervision HealthAI — Grafana"
                src={embedUrl}
                className="w-full rounded-xl border bg-card"
                style={{ height: "calc(100vh - 200px)", minHeight: 560 }}
                loading="lazy"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Métriques (Prometheus) et logs (Loki) en temps réel des microservices HealthAI.
                Si le cadre reste vide, vérifiez que la stack est démarrée
                (<code>make up</code>) et que Grafana est joignable sur{" "}
                <a href={GRAFANA_URL} target="_blank" rel="noopener noreferrer" className="underline">{GRAFANA_URL}</a>.
              </p>
            </TabsContent>

            {/* ─────────────── Onglet ETL ─────────────── */}
            <TabsContent value="etl" className="mt-4 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Pipeline ETL</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={loadEtl} aria-label="Actualiser l'état ETL">
                    <RefreshCw className="w-4 h-4 mr-1" /> Actualiser
                  </Button>
                  <Button variant="outline" size="sm" onClick={triggerEtl} disabled={runningEtl} aria-label="Lancer le pipeline ETL">
                    <PlayCircle className="w-4 h-4 mr-1" />
                    {runningEtl ? "En cours…" : "Lancer ETL"}
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader><CardTitle className="text-base">Dernier run</CardTitle></CardHeader>
                <CardContent>
                  {etl ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Statut</p>
                        <div className="flex items-center gap-1 mt-1">
                          {etl.statut === "succes"
                            ? <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden />
                            : <AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden />}
                          <span className="font-medium capitalize">{etl.statut ?? "—"}</span>
                          {etl.en_cours && <Badge variant="secondary" className="ml-2">En cours</Badge>}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Déclencheur</p>
                        <p className="font-medium mt-1 capitalize">{etl.declencheur ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Durée</p>
                        <p className="font-medium mt-1">{etl.duree_secondes ? `${etl.duree_secondes}s` : "—"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">ETL réussis / erreurs</p>
                        <p className="font-medium mt-1">
                          <span className="text-green-600">{etl.nb_etl_succes ?? 0}</span>
                          {" / "}
                          <span className="text-red-500">{etl.nb_etl_erreur ?? 0}</span>
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Démarré le</p>
                        <p className="font-medium mt-1">{etl.started_at ? new Date(etl.started_at).toLocaleString("fr-FR") : "—"}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">Aucun run enregistré ou service non disponible.</p>
                  )}
                </CardContent>
              </Card>

              {history.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Historique des runs</CardTitle></CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm" aria-label="Historique des runs ETL">
                        <thead>
                          <tr className="border-b text-muted-foreground">
                            <th scope="col" className="text-left py-2 pr-4">Démarré le</th>
                            <th scope="col" className="text-left py-2 pr-4">Statut</th>
                            <th scope="col" className="text-left py-2 pr-4">Déclencheur</th>
                            <th scope="col" className="text-left py-2">Durée</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.slice(0, 10).map((r, i) => (
                            <tr key={i} className="border-b last:border-0">
                              <td className="py-2 pr-4">{r.started_at ? new Date(r.started_at).toLocaleString("fr-FR") : "—"}</td>
                              <td className="py-2 pr-4">
                                <Badge variant={r.statut === "succes" ? "default" : "destructive"}>{r.statut ?? "—"}</Badge>
                              </td>
                              <td className="py-2 pr-4 capitalize">{r.declencheur ?? "—"}</td>
                              <td className="py-2">{r.duree_secondes ? `${r.duree_secondes}s` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              <p className="text-xs text-muted-foreground">
                Le pipeline ETL tourne aussi automatiquement chaque nuit (planifié dans le service <code>etl</code>).
                Les métriques HTTP du service ETL sont visibles dans l'onglet Grafana.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </main>
  )
}
